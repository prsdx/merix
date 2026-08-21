"""LLM client implementations.

Provider-agnostic: callers depend on the LLMClient protocol (clients/base.py),
never on a concrete provider. Default provider for v1 is Groq (fast/cheap).
"""

import logging
from dataclasses import dataclass

from groq import AsyncGroq

logger = logging.getLogger("merix.clients.llm")


@dataclass
class LLMResult:
    """Result of an LLM call, including token usage for cost tracking."""

    text: str
    prompt_tokens: int = 0
    completion_tokens: int = 0


class GroqLLMClient:
    """Groq-hosted LLM client. Implements the LLMClient protocol."""

    def __init__(self, api_key: str, model: str) -> None:
        self._client = AsyncGroq(api_key=api_key)
        self._model = model

    async def generate(
        self,
        prompt: str,
        *,
        system: str | None = None,
        temperature: float = 0.0,
        max_tokens: int = 1024,
    ) -> LLMResult:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        response = await self._client.chat.completions.create(
            model=self._model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        usage = response.usage
        result = LLMResult(
            text=response.choices[0].message.content or "",
            prompt_tokens=usage.prompt_tokens if usage else 0,
            completion_tokens=usage.completion_tokens if usage else 0,
        )
        logger.info(
            "llm_call model=%s prompt_tokens=%d completion_tokens=%d",
            self._model,
            result.prompt_tokens,
            result.completion_tokens,
        )
        return result


def get_llm_client(api_key: str, model: str) -> GroqLLMClient:
    """Factory for the configured LLM provider. v1: Groq only."""
    return GroqLLMClient(api_key=api_key, model=model)