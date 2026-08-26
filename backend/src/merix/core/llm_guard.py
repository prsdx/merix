"""Shared reliability wrapper around LLMClient.generate().

Every LLM call in the app goes through this module instead of calling the
client directly, so truncation/malformed-output handling exists exactly once:

- ``generate_json`` — for calls that must return well-formed JSON. Validates
  parseability (markdown-fence tolerant) and completeness; on failure retries
  once with a doubled token budget, then raises the typed ``ExtractionError``
  domain error. A raw JSONDecodeError can never propagate from here.
- ``generate_text`` — for plain-text calls. Detects truncation via the
  provider finish reason plus a mid-sentence heuristic, and applies the same
  retry-once / typed-error policy so silently clipped output never reaches
  users.

Every failed attempt is logged with the call name, token usage, finish
reason and a head of the raw response so production incidents are diagnosable
from logs alone.
"""

from __future__ import annotations

import json
import logging

from merix.clients.base import LLMClient, LLMResult
from merix.core.exceptions import ExtractionError

logger = logging.getLogger("merix.core.llm_guard")

# Initial attempt runs at the caller's budget; the single retry doubles it.
_MAX_ATTEMPTS = 2

# Characters that plausibly terminate a complete generation. Used only as a
# secondary truncation signal when the provider doesn't report finish_reason.
_TERMINAL_CHARS = tuple(".!?'\"})]")


def _parse_json(text: str) -> dict:
    """Parse JSON from an LLM response, tolerating markdown fences."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        # strip ```json ... ``` fences
        lines = cleaned.splitlines()
        lines = [ln for ln in lines if not ln.strip().startswith("```")]
        cleaned = "\n".join(lines).strip()
    return json.loads(cleaned)


def _looks_truncated(result: LLMResult, *, requested_tokens: int) -> bool:
    """True when the response appears cut off by the token cap."""
    if result.truncated:  # provider-reported stop reason == "length"
        return True
    # Heuristic for providers that don't report a reliable finish reason:
    # we received every token we paid for but the text stops mid-sentence.
    return result.completion_tokens >= requested_tokens and not result.text.rstrip().endswith(_TERMINAL_CHARS)


def _log_invalid_response(call_name: str, attempt: int, result: LLMResult, reason: str) -> None:
    """Structured log at the point of any LLM output failure.

    completion_tokens hitting the requested cap exactly is the signature of a
    truncated response; keep a raw-text head around for debugging.
    """
    logger.error(
        "llm_response_invalid call=%s attempt=%d/%d reason=%s completion_tokens=%d "
        "finish_reason=%s provider_truncated=%s raw_head=%.500r",
        call_name,
        attempt,
        _MAX_ATTEMPTS,
        reason,
        result.completion_tokens,
        result.finish_reason,
        result.truncated,
        result.text,
    )


def _exhausted(call_name: str) -> ExtractionError:
    return ExtractionError(
        f"{call_name} failed: LLM returned incomplete or malformed output after {_MAX_ATTEMPTS} attempts, please retry"
    )


async def generate_json(
    llm: LLMClient,
    *,
    call_name: str,
    prompt: str,
    system: str | None = None,
    temperature: float = 0.0,
    max_tokens: int,
) -> dict:
    """Run an LLM call that must produce valid JSON and return it parsed.

    Retries once with a doubled token budget when the response is truncated
    or fails to parse; raises ExtractionError (never JSONDecodeError) when
    both attempts fail.
    """
    last_reason = "unknown"
    for attempt in range(1, _MAX_ATTEMPTS + 1):
        budget = max_tokens * attempt
        result = await llm.generate(prompt, system=system, temperature=temperature, max_tokens=budget)
        try:
            parsed = _parse_json(result.text)
        except json.JSONDecodeError:
            last_reason = "malformed_json"
            _log_invalid_response(call_name, attempt, result, last_reason)
            continue
        if _looks_truncated(result, requested_tokens=budget):
            # Parseable but hit the cap: content may be complete by luck, but
            # treat every capped extraction as untrusted and retry with more room.
            last_reason = "truncated"
            _log_invalid_response(call_name, attempt, result, last_reason)
            continue
        return parsed
    raise _exhausted(call_name) from None


async def generate_text(
    llm: LLMClient,
    *,
    call_name: str,
    prompt: str,
    system: str | None = None,
    temperature: float = 0.0,
    max_tokens: int,
) -> str:
    """Run a plain-text LLM call, guarding against silent truncation.

    Same policy as generate_json: one retry at a doubled budget, then a typed
    ExtractionError — a clipped rationale served to recruiters is a quality
    failure even though it cannot crash downstream parsing.
    """
    for attempt in range(1, _MAX_ATTEMPTS + 1):
        budget = max_tokens * attempt
        result = await llm.generate(prompt, system=system, temperature=temperature, max_tokens=budget)
        if not _looks_truncated(result, requested_tokens=budget):
            return result.text.strip()
        _log_invalid_response(call_name, attempt, result, "truncated")
    raise _exhausted(call_name) from None
