"""Embedding client implementations.

Provider-agnostic: callers depend on the EmbeddingClient protocol
(clients/base.py). Default provider for v1 is OpenAI text-embedding-3-small
(hosted, keeps the backend lean vs. a local torch/sentence-transformers dep).
"""

import logging

from openai import AsyncOpenAI

logger = logging.getLogger("merix.clients.embeddings")


class OpenAIEmbeddingClient:
    """OpenAI-hosted embedding client. Implements the EmbeddingClient protocol."""

    def __init__(self, api_key: str, model: str) -> None:
        self._client = AsyncOpenAI(api_key=api_key)
        self._model = model

    async def embed(self, text: str) -> list[float]:
        result = await self.embed_batch([text])
        return result[0]

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        response = await self._client.embeddings.create(
            model=self._model,
            input=texts,
        )
        # OpenAI returns results ordered by index; sort defensively.
        ordered = sorted(response.data, key=lambda d: d.index)
        if response.usage:
            logger.info(
                "embedding_call model=%s texts=%d total_tokens=%d",
                self._model,
                len(texts),
                response.usage.total_tokens,
            )
        return [list(d.embedding) for d in ordered]


def get_embedding_client(api_key: str, model: str) -> OpenAIEmbeddingClient:
    """Factory for the configured embedding provider. v1: OpenAI only."""
    return OpenAIEmbeddingClient(api_key=api_key, model=model)