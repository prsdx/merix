"""Unit tests for the shared LLM reliability wrapper (core.llm_guard).

These pin the pattern-level fix for the truncation -> JSONDecodeError bug
class: every JSON-expecting (and plain-text) LLM call gets completeness
validation, one automatic retry at a doubled token budget, structured failure
logging, and a typed domain error instead of leaked parsing exceptions.
"""

import json
import logging

import pytest

from merix.clients.base import LLMResult
from merix.core.exceptions import ExtractionError
from merix.core.llm_guard import _parse_json, generate_json, generate_text


class ScriptedLLM:
    """Fake LLMClient that replays scripted responses in order and records calls."""

    def __init__(self, *responses: LLMResult):
        self.responses = list(responses)
        self.calls: list[dict] = []

    async def generate(self, prompt, *, system=None, temperature=0.0, max_tokens=1024):
        self.calls.append({"prompt": prompt, "system": system, "temperature": temperature, "max_tokens": max_tokens})
        return self.responses.pop(0)


GOOD_JSON = '{"required_skills": ["Go"], "preferred_skills": [], "min_experience_years": 2}'


# --- JSON path ---


async def test_generate_json_returns_parsed_response():
    llm = ScriptedLLM(LLMResult(text=GOOD_JSON, prompt_tokens=10, completion_tokens=20))
    out = await generate_json(llm, call_name="jd_extraction", prompt="p", max_tokens=1024)
    assert out["required_skills"] == ["Go"]
    assert len(llm.calls) == 1


def test_parse_json_strips_markdown_fences():
    assert _parse_json('```json\n{"a": 1}\n```') == {"a": 1}


async def test_truncated_json_retries_once_with_doubled_budget():
    """The production bug shape: first attempt hits max_tokens mid-JSON."""
    llm = ScriptedLLM(
        LLMResult(text='{"required_skills": ["Go", ', finish_reason="length", completion_tokens=1024),
        LLMResult(text=GOOD_JSON, prompt_tokens=10, completion_tokens=25),
    )
    out = await generate_json(llm, call_name="jd_extraction", prompt="p", max_tokens=1024)
    assert out["min_experience_years"] == 2
    assert [c["max_tokens"] for c in llm.calls] == [1024, 2048]


async def test_parseable_but_capped_response_is_also_retried():
    """A capped response can parse by luck yet be incomplete — treat as untrusted."""
    llm = ScriptedLLM(
        LLMResult(text='{"required_skills": ["Go"], "x": 1}', finish_reason="length", completion_tokens=512),
        LLMResult(text=GOOD_JSON, prompt_tokens=10, completion_tokens=25),
    )
    await generate_json(llm, call_name="jd_extraction", prompt="p", max_tokens=512)
    assert len(llm.calls) == 2


async def test_persistent_truncation_raises_typed_error_not_jsondecode():
    llm = ScriptedLLM(
        LLMResult(text='{"skills": [{"skill": "Pyth', finish_reason="length", completion_tokens=4096),
        LLMResult(text='{"skills": [{"skill": "Pyth', finish_reason="length", completion_tokens=8192),
    )
    with pytest.raises(ExtractionError, match="resume_extraction"):
        await generate_json(llm, call_name="resume_extraction", prompt="p", max_tokens=4096)
    assert len(llm.calls) == 2  # exactly one retry, then give up


async def test_raised_error_is_never_a_jsondecodeerror():
    llm = ScriptedLLM(
        LLMResult(text="not json at all"),
        LLMResult(text='{"still": "broken'),
    )
    with pytest.raises(ExtractionError) as exc_info:
        await generate_json(llm, call_name="resume_extraction", prompt="p", max_tokens=1024)
    assert not isinstance(exc_info.value, json.JSONDecodeError)


async def test_failed_attempts_are_logged(caplog):
    llm = ScriptedLLM(
        LLMResult(text='{"broken": ', finish_reason="length", completion_tokens=1024),
        LLMResult(text=GOOD_JSON, completion_tokens=25),
    )
    with caplog.at_level(logging.ERROR, logger="merix.core.llm_guard"):
        await generate_json(llm, call_name="jd_extraction", prompt="p", max_tokens=1024)
    msgs = [r.getMessage() for r in caplog.records]
    assert any("llm_response_invalid" in m and "call=jd_extraction" in m and "reason=malformed_json" in m for m in msgs)
    assert any("finish_reason=length" in m for m in msgs)


# --- plain-text path (rationale) ---


async def test_generate_text_returns_complete_response_untouched():
    llm = ScriptedLLM(LLMResult(text=" Strong match on Python. ", prompt_tokens=10, completion_tokens=50))
    out = await generate_text(llm, call_name="rationale_generation", prompt="p", max_tokens=512)
    assert out == "Strong match on Python."


async def test_truncated_rationale_recovers_on_retry():
    llm = ScriptedLLM(
        LLMResult(text="Strong match on most required skil", finish_reason="length", completion_tokens=512),
        LLMResult(text="Strong match on most required skills.", prompt_tokens=10, completion_tokens=60),
    )
    out = await generate_text(llm, call_name="rationale_generation", prompt="p", max_tokens=512)
    assert out.endswith("skills.")
    assert [c["max_tokens"] for c in llm.calls] == [512, 1024]


async def test_mid_sentence_cap_hit_is_detected_without_finish_reason():
    """Heuristic path: provider gave no length stop reason but we got every
    token we paid for and the text stops mid-sentence."""
    llm = ScriptedLLM(
        LLMResult(text="Strong match on most required skil", completion_tokens=512),
        LLMResult(text="Strong match on most required skills.", prompt_tokens=10, completion_tokens=60),
    )
    out = await generate_text(llm, call_name="rationale_generation", prompt="p", max_tokens=512)
    assert len(llm.calls) == 2
    assert out.endswith("skills.")


async def test_persistently_truncated_rationale_raises_typed_error():
    llm = ScriptedLLM(
        LLMResult(text="Strong match on most required skil", finish_reason="length", completion_tokens=512),
        LLMResult(text="Strong match on most required skil", finish_reason="length", completion_tokens=1024),
    )
    with pytest.raises(ExtractionError, match="rationale_generation"):
        await generate_text(llm, call_name="rationale_generation", prompt="p", max_tokens=512)
    assert len(llm.calls) == 2
