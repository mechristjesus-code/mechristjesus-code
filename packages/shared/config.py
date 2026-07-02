"""
Shared configuration loaded from environment variables.
All services import from this module for consistent settings.
"""

from functools import lru_cache
from typing import List, Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ─── Application ──────────────────────────────────────────────────────────
    app_name: str = "Creator DNA OS"
    app_env: str = "development"
    debug: bool = False
    log_level: str = "INFO"

    # ─── Security ─────────────────────────────────────────────────────────────
    secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 30

    # ─── Database ─────────────────────────────────────────────────────────────
    database_url: str = "postgresql://cdna_user:cdna_secret@localhost:5432/creator_dna"

    # ─── Redis ────────────────────────────────────────────────────────────────
    redis_url: str = "redis://localhost:6379/0"

    # ─── OpenAI ───────────────────────────────────────────────────────────────
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"
    openai_max_tokens: int = 4096
    openai_temperature: float = 0.7

    # ─── Rate Limiting ────────────────────────────────────────────────────────
    rate_limit_per_minute: int = 60
    rate_limit_ai_per_minute: int = 10

    # ─── Media ────────────────────────────────────────────────────────────────
    upload_dir: str = "./uploads"
    max_upload_size_mb: int = 100
    allowed_media_types: List[str] = ["video/mp4", "audio/mpeg", "audio/wav"]

    # ─── YouTube ──────────────────────────────────────────────────────────────
    youtube_api_key: Optional[str] = None

    # ─── CORS ─────────────────────────────────────────────────────────────────
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    @field_validator("allowed_media_types", mode="before")
    @classmethod
    def parse_media_types(cls, v):
        if isinstance(v, str):
            return [t.strip() for t in v.split(",")]
        return v

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
