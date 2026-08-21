"""Provider-agnostic client protocols.

These are the contracts the rest of the app depends on. Concrete providers
(Groq, OpenAI, ...) implement these; services depend only on the protocol, so
providers can be swapped without touching business logic.
"""

from dataclasses import dataclass
from typing import Protocol, runtime_checkable


@dataclass
class LLMResult:
    """Result of an LLM call, including token usage for cost tracking."""

    text: str
    prompt_tokens: int = 0
    completion_tokens: int = 0


@runtime_checkable
class LLMClient(Protocol):
    """Protocol for LLM providers."""

    async def generate(
        self,
        prompt: str,
        *,
        system: str | None = None,
        temperature: float = 0.0,
        max_tokens: int = 1024,
    ) -> LLMResult:
        """Generate text from a prompt."""
        ...


@runtime_checkable
class EmbeddingClient(Protocol):
    """Protocol for embedding providers."""

    async def embed(self, text: str) -> list[float]:
        """Embed a single text."""
        ...

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Embed a list of texts (one provider call)."""
        ...


@runtime_checkable
class StorageClient(Protocol):
    """Protocol for storage providers."""

    async def upload(self, key: str, data: bytes) -> str:
        """Upload bytes and return a public URL."""
        ...