"""Provider-agnostic client protocols."""

from typing import Protocol, runtime_checkable


@runtime_checkable
class LLMClient(Protocol):
    """Protocol for LLM providers."""

    async def generate(self, prompt: str, **kwargs) -> str:
        """Generate text from a prompt."""
        ...


@runtime_checkable
class EmbeddingClient(Protocol):
    """Protocol for embedding providers."""

    async def embed(self, texts: list[str]) -> list[list[float]]:
        """Embed a list of texts."""
        ...


@runtime_checkable
class StorageClient(Protocol):
    """Protocol for storage providers."""

    async def upload(self, key: str, data: bytes) -> str:
        """Upload bytes and return a public URL."""
        ...
