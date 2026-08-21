"""Application settings."""

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

    EMBEDDING_PROVIDER: str = "sentence-transformers"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    EMBEDDING_API_KEY: str = ""
    EMBEDDING_BASE_URL: str = ""

    STORAGE_PROVIDER: str = "supabase"
    STORAGE_BUCKET: str = "resumes"
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    DATA_RETENTION_DAYS: int = 90

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
