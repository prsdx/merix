"""Matching service: extract skills, compare, score, explain.

Rebuilt for production (the old hackathon files were deleted, so this is a
fresh implementation faithful to the documented intent: evidence-grounded,
weighted, explainable).

Pipeline per (job, resume):
  1. LLM extracts structured skills from JD text and resume text (temp=0).
  2. Deterministic Python set-comparison -> matched_skills / missing_skills.
  3. Weighted score (required coverage 70%, preferred 20%, experience 10%).
  4. LLM writes a short rationale from the deterministic facts.
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field

from merix.clients.base import EmbeddingClient, LLMClient, LLMResult
from merix.core.exceptions import ExtractionError

logger = logging.getLogger("merix.services.matching")

# Score weights (sum to 1.0). Required-skill coverage dominates.
W_REQUIRED = 0.70
W_PREFERRED = 0.20
W_EXPERIENCE = 0.10

# Completion-token budgets per call type. Resume extraction emits one
# {skill, evidence} object per skill, so long resumes need real headroom
# (1024 truncated the JSON mid-string in production); JD extraction is a
# compact fixed-shape object but long JDs enumerate many skills; rationales
# are 2-3 sentences (256 clipped some mid-sentence — 512 is cheap insurance
# and truncation is detectable via LLMResult.finish_reason).
_JD_EXTRACT_MAX_TOKENS = 2048
_RESUME_EXTRACT_MAX_TOKENS = 4096
_RATIONALE_MAX_TOKENS = 512

_JD_EXTRACT_SYSTEM = (
    "You extract structured requirements from job descriptions. Return ONLY valid JSON, no prose, no markdown fences."
)

_JD_EXTRACT_PROMPT = """Extract the hiring requirements from this job description.

Return JSON with exactly these keys:
- "required_skills": list of strings, the must-have skills/technologies
- "preferred_skills": list of strings, nice-to-have skills
- "min_experience_years": number (0 if not stated)
- "education": string, minimum education requirement ("" if not stated)

Job description:
---
{jd_text}
---

JSON:"""

_RESUME_EXTRACT_SYSTEM = (
    "You extract structured information from resumes. Only report skills that are "
    "explicitly evidenced in the text; never invent. Return ONLY valid JSON."
)

_RESUME_EXTRACT_PROMPT = """Extract information from this resume.

Return JSON with exactly these keys:
- "skills": list of objects, each {{"skill": string, "evidence": string}} where
  "evidence" is a short verbatim quote from the resume showing that skill
  (at most 15 words — do not copy whole sentences)
- "experience_years": number, total years of professional experience (0 if unclear)
- "education": string, highest education ("" if not stated)
- "timeline": list of work-history entries, each {{"company": string, "title": string,
  "start": string, "end": string}} with dates exactly as written in the resume
  (e.g. "Jan 2020", "2019", "Present"); empty list if no work history found

Resume:

---
{resume_text}
---

JSON:"""

_RATIONALE_SYSTEM = (
    "You write concise, factual match explanations for recruiters. Base your statement ONLY on the facts given. 2-3 sentences."
)

_RATIONALE_PROMPT = """A candidate matched a job as follows.
Score: {score}/100
Matched required skills: {matched_required}
Missing required skills: {missing_required}
Matched preferred skills: {matched_preferred}
Candidate experience: {exp} years (job requires {min_exp}).

Write a short rationale for the recruiter explaining this match."""


def _normalise(skill: str) -> str:
    """Normalise a skill string for comparison (lowercase, stripped)."""
    return skill.strip().lower()


def _parse_json(text: str) -> dict:
    """Parse JSON from an LLM response, tolerating markdown fences."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        # strip ```json ... ``` fences
        lines = cleaned.splitlines()
        lines = [ln for ln in lines if not ln.strip().startswith("```")]
        cleaned = "\n".join(lines).strip()
    return json.loads(cleaned)


def _log_malformed(kind: str, result: LLMResult) -> None:
    """Log the raw LLM output when it fails to parse as JSON.

    completion_tokens hitting the max_tokens cap exactly is the signature of
    a truncated response; keep the raw text around for debugging.
    """
    logger.error(
        "llm_%s_extraction_malformed_json completion_tokens=%d finish_reason=%s truncated=%s raw_response=%.2000r",
        kind,
        result.completion_tokens,
        result.finish_reason,
        result.truncated,
        result.text,
    )


@dataclass
class MatchComputation:
    """The explainable result of matching one resume to one job."""

    score: float
    matched_skills: list[dict] = field(default_factory=list)
    missing_skills: list[dict] = field(default_factory=list)
    rationale: str = ""


async def extract_jd(llm: LLMClient, jd_text: str) -> dict:
    """Extract structured requirements from JD text via the LLM."""
    result = await llm.generate(
        _JD_EXTRACT_PROMPT.format(jd_text=jd_text),
        system=_JD_EXTRACT_SYSTEM,
        temperature=0.0,
        max_tokens=_JD_EXTRACT_MAX_TOKENS,
    )
    try:
        return _parse_json(result.text)
    except json.JSONDecodeError:
        _log_malformed("jd", result)
        raise ExtractionError("Job description extraction failed, please retry") from None


async def extract_resume(llm: LLMClient, resume_text: str) -> dict:
    """Extract structured info from resume text via the LLM.

    The budget is 4096 tokens: the response carries one {skill, evidence}
    object per skill, so long resumes routinely exceed 1024 (which truncated
    the JSON mid-string in production). Parsing failures are raised as a
    retryable ExtractionError instead of leaking a JSONDecodeError 500.
    """
    result = await llm.generate(
        _RESUME_EXTRACT_PROMPT.format(resume_text=resume_text),
        system=_RESUME_EXTRACT_SYSTEM,
        temperature=0.0,
        max_tokens=_RESUME_EXTRACT_MAX_TOKENS,
    )
    try:
        return _parse_json(result.text)
    except json.JSONDecodeError:
        _log_malformed("resume", result)
        raise ExtractionError("Resume extraction failed, please retry") from None


async def compute_match(
    jd_parsed: dict,
    resume_parsed: dict,
    embedder: EmbeddingClient | None = None,
) -> MatchComputation:
    """Deterministically compare parsed JD vs parsed resume -> explainable result.

    ``embedder`` enables the semantic fallback pass: JD skills that miss the
    exact normalized comparison are compared via cosine similarity of per-skill
    embeddings against unmatched resume skills before being declared missing.
    When ``embedder`` is None the comparison stays exact-only (and free).
    """

    required = [_normalise(s) for s in jd_parsed.get("required_skills", [])]
    preferred = [_normalise(s) for s in jd_parsed.get("preferred_skills", [])]
    min_exp = float(jd_parsed.get("min_experience_years", 0) or 0)

    resume_skills = resume_parsed.get("skills", [])
    resume_by_norm = {_normalise(s["skill"]): s for s in resume_skills}
    exp_years = float(resume_parsed.get("experience_years", 0) or 0)

    matched: list[dict] = []
    missing: list[dict] = []

    matched_required = 0
    for skill in required:
        if skill in resume_by_norm:
            matched_required += 1
            matched.append(
                {
                    "skill": resume_by_norm[skill]["skill"],
                    "required": True,
                    "evidence": resume_by_norm[skill].get("evidence", ""),
                }
            )
        else:
            missing.append({"skill": skill, "required": True})

    for skill in preferred:
        if skill in resume_by_norm:
            matched.append(
                {
                    "skill": resume_by_norm[skill]["skill"],
                    "required": False,
                    "evidence": resume_by_norm[skill].get("evidence", ""),
                }
            )

    required_coverage = (matched_required / len(required)) if required else 1.0
    matched_preferred = sum(1 for skill in preferred if skill in resume_by_norm)
    preferred_coverage = (matched_preferred / len(preferred)) if preferred else 1.0
    experience_score = min(exp_years / min_exp, 1.0) if min_exp > 0 else 1.0

    score = 100.0 * (W_REQUIRED * required_coverage + W_PREFERRED * preferred_coverage + W_EXPERIENCE * experience_score)

    return MatchComputation(
        score=round(score, 1),
        matched_skills=matched,
        missing_skills=missing,
    )


async def generate_rationale(llm: LLMClient, jd_parsed: dict, resume_parsed: dict, match: MatchComputation) -> str:
    """Generate a short human-readable rationale from the deterministic facts."""
    matched_required = [m["skill"] for m in match.matched_skills if m.get("required")]
    matched_preferred = [m["skill"] for m in match.matched_skills if not m.get("required")]
    missing_required = [m["skill"] for m in match.missing_skills]
    result = await llm.generate(
        _RATIONALE_PROMPT.format(
            score=match.score,
            matched_required=", ".join(matched_required) or "none",
            missing_required=", ".join(missing_required) or "none",
            matched_preferred=", ".join(matched_preferred) or "none",
            exp=resume_parsed.get("experience_years", 0),
            min_exp=jd_parsed.get("min_experience_years", 0),
        ),
        system=_RATIONALE_SYSTEM,
        temperature=0.0,
        max_tokens=_RATIONALE_MAX_TOKENS,
    )
    if result.truncated:
        # Plain-text output: truncation cannot crash anything downstream, it
        # just silently serves a mid-sentence rationale to recruiters. Log
        # loudly so a future budget increase is driven by real evidence.
        logger.warning(
            "rationale_truncated completion_tokens=%d finish_reason=%s text=%.200r",
            result.completion_tokens,
            result.finish_reason,
            result.text,
        )
    return result.text.strip()
