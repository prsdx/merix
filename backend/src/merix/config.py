"""Application settings."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    APP_NAME: str = "Merix"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    DATABASE_URL: str = "postgresql+asyncpg://localhost:5432/merix"

    LLM_PROVIDER: str = "groq"
    LLM_MODEL: str = "openai/gpt-oss-120b"
    LLM_API_KEY: str = ""
    LLM_BASE_URL: str = ""

    EMBEDDING_PROVIDER: str = "google"
    EMBEDDING_MODEL: str = "gemini-embedding-001"
    EMBEDDING_API_KEY: str = ""
    EMBEDDING_BASE_URL: str = ""

    STORAGE_PROVIDER: str = "supabase"
    STORAGE_BUCKET: str = "resumes"
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # Auth: Supabase Auth (GoTrue) issues tokens; we verify them locally with
    # the project JWT secret (Project Settings -> API -> JWT Secret).
    SUPABASE_JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"

    # Shared token gating POST /api/admin/retention-sweep. Empty (dev default):
    # any authenticated user may trigger the sweep. Set in production to
    # restrict it to operators holding the token (X-Admin-Token header).
    ADMIN_API_TOKEN: str = ""

    # Retention is per-org (organisations.retention_days, default 90) since Task 3.

    # Comma-separated list of allowed CORS origins. Default: "*" in
    # development (convenient), but must be set explicitly in production.
    # Example: "https://app.merix.dev,https://admin.merix.dev"
    ALLOWED_ORIGINS: str = "*"

    # JD-from-URL fetching. Known career-board hosts (greenhouse.io, lever.co,
    # ashbyhq.com) are always allowed; arbitrary domains additionally require
    # this flag — SSRF surface stays closed by default.
    JD_FETCH_ALLOW_ANY_DOMAIN: bool = False

    # Link verification (authenticity layer): HEAD/GET liveness probes plus
    # GitHub profile existence checks on resume links, stored as advisory
    # flags in Resume.parsed["link_verification"]. Disable to skip network calls.
    LINK_VERIFY_ENABLED: bool = True

    # Resolve .env relative to the backend/ dir (this file is at backend/src/merix/config.py),
    # so settings load correctly regardless of the process working directory.
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parents[2] / ".env"),
        extra="ignore",
    )


settings = Settings()
