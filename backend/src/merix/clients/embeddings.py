"""Embedding client implementations.

Provider-agnostic: callers depend on the EmbeddingClient protocol
(clients/base.py). Default provider for v1 is Google Gemini
gemini-embedding-001 (free tier, hosted, lean backend). OpenAI and local
sentence-transformers are drop-in alternatives behind the same interface.
"""

import logging

from google import genai
from google.genai import types as genai_types
from openai import AsyncOpenAI

logger = logging.getLogger("merix.clients.embeddings")

# Output dimensionality for Gemini embeddings (compact + cheap; pgvector-safe).
GEMINI_EMBEDDING_DIM = 768


class GeminiEmbeddingClient:
    """Google Gemini-hosted embedding client. Implements EmbeddingClient."""

    def __init__(self, api_key: str, model: str, dim: int = GEMINI_EMBEDDING_DIM) -> None:
        self._client = genai.Client(api_key=api_key)
        self._model = model
        self._dim = dim

    async def embed(self, text: str) -> list[float]:
        result = await self.embed_batch([text])
        return result[0]

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        response = await self._client.aio.models.embed_content(
            model=self._model,
            contents=texts,
            config=genai_types.EmbedContentConfig(
                output_dimensionality=self._dim,
            ),
        )
        logger.info("embedding_call provider=gemini model=%s texts=%d", self._model, len(texts))
        return [list(e.values) for e in response.embeddings]


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
        response = await self._client.embeddings.create(model=self._model, input=texts)
        ordered = sorted(response.data, key=lambda d: d.index)
        if response.usage:
            logger.info(
                "embedding_call provider=openai model=%s texts=%d total_tokens=%d",
                self._model,
                len(texts),
                response.usage.total_tokens,
            )
        return [list(d.embedding) for d in ordered]


def get_embedding_client(provider: str, api_key: str, model: str):
    """Factory for the configured embedding provider.

    provider: "google" (Gemini, default) | "openai"
    """
    provider = (provider or "").strip().lower()
    if provider in ("google", "gemini"):
        return GeminiEmbeddingClient(api_key=api_key, model=model)
    if provider == "openai":
        return OpenAIEmbeddingClient(api_key=api_key, model=model)
    raise ValueError(f"Unsupported embedding provider: {provider!r}")