"""FastAPI dependencies."""

from merix.clients.base import EmbeddingClient, LLMClient
from merix.clients.embeddings import get_embedding_client
from merix.clients.llm import get_llm_client
from merix.config import settings
from merix.db import get_db

__all__ = ["get_db", "get_llm", "get_embedder"]


def get_llm() -> LLMClient:
    """LLM client dependency (provider from settings; v1: Groq)."""
    return get_llm_client(api_key=settings.LLM_API_KEY, model=settings.LLM_MODEL)


def get_embedder() -> EmbeddingClient:
    """Embedding client dependency (provider from settings; v1: OpenAI)."""
    return get_embedding_client(
        api_key=settings.EMBEDDING_API_KEY, model=settings.EMBEDDING_MODEL
    )