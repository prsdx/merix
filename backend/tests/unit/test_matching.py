"""Unit tests for the matching service (deterministic logic + fake LLM)."""

import pytest

from merix.clients.base import LLMResult
from merix.services import matching


class FakeLLM:
    """Fake LLMClient that returns canned JSON based on the prompt."""

    def __init__(self, jd_json: str = "", resume_json: str = "", rationale: str = "ok"):
        self._jd = jd_json
        self._resume = resume_json
        self._rationale = rationale

    async def generate(self, prompt, *, system=None, temperature=0.0, max_tokens=1024):
        if "job description" in prompt.lower():
            return LLMResult(text=self._jd, prompt_tokens=10, completion_tokens=5)
        if "resume" in prompt.lower() and "rationale" not in prompt.lower():
            return LLMResult(text=self._resume, prompt_tokens=10, completion_tokens=5)
        return LLMResult(text=self._rationale, prompt_tokens=5, completion_tokens=5)


# --- compute_match (deterministic) ---

def test_compute_match_full_match():
    jd = {"required_skills": ["Python", "SQL"], "preferred_skills": ["AWS"], "min_experience_years": 3}
    res = {
        "skills": [
            {"skill": "Python", "evidence": "built APIs"},
            {"skill": "SQL", "evidence": "queries"},
            {"skill": "AWS", "evidence": "deployed on AWS"},
        ],
        "experience_years": 4,
    }
    mc = matching.compute_match(jd, res)
    assert mc.score == 100.0
    assert len(mc.matched_skills) == 3
    assert mc.missing_skills == []


def test_compute_match_partial():
    jd = {"required_skills": ["Python", "SQL", "Docker"], "preferred_skills": [], "min_experience_years": 5}
    res = {"skills": [{"skill": "Python", "evidence": "x"}], "experience_years": 2}
    mc = matching.compute_match(jd, res)
    # required coverage 1/3, preferred 1.0 (none), experience 2/5
    expected = round(100 * (0.70 * (1 / 3) + 0.20 * 1.0 + 0.10 * 0.4), 1)
    assert mc.score == expected
    assert {m["skill"] for m in mc.missing_skills} == {"sql", "docker"}


def test_compute_match_case_insensitive_and_evidence():
    jd = {"required_skills": ["python"], "preferred_skills": [], "min_experience_years": 0}
    res = {"skills": [{"skill": "PYTHON", "evidence": "10 yrs Python"}], "experience_years": 10}
    mc = matching.compute_match(jd, res)
    assert mc.score == 100.0
    assert mc.matched_skills[0]["evidence"] == "10 yrs Python"


def test_compute_match_no_required_skills_is_full_coverage():
    jd = {"required_skills": [], "preferred_skills": [], "min_experience_years": 0}
    res = {"skills": [], "experience_years": 0}
    assert matching.compute_match(jd, res).score == 100.0


# --- JSON parsing tolerance ---

def test_parse_json_strips_markdown_fences():
    assert matching._parse_json('```json\n{"a": 1}\n```') == {"a": 1}


# --- LLM extraction (fake) ---

@pytest.mark.asyncio
async def test_extract_jd_uses_fake_llm():
    llm = FakeLLM(jd_json='{"required_skills": ["Go"], "preferred_skills": [], "min_experience_years": 2, "education": ""}')
    out = await matching.extract_jd(llm, "We need a Go engineer")
    assert out["required_skills"] == ["Go"]


@pytest.mark.asyncio
async def test_generate_rationale_returns_text():
    llm = FakeLLM(rationale="Strong match on Python.")
    mc = matching.MatchComputation(score=90.0, matched_skills=[{"skill": "Python", "required": True}], missing_skills=[])
    text = await matching.generate_rationale(llm, {"min_experience_years": 1}, {"experience_years": 2}, mc)
    assert text == "Strong match on Python."
