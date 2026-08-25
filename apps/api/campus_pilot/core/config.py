from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="CAMPUS_", extra="ignore")

    environment: str = "development"
    database_url: str = "sqlite+aiosqlite:///./campus_pilot.sqlite3"
    redis_url: str = "redis://localhost:6379/0"
    jwt_secret: str = Field(default="dev-only-change-me-at-least-32-characters")
    jwt_issuer: str = "campus-pilot-api"
    access_token_minutes: int = 30
    cookie_secure: bool = False
    allowed_origins: list[str] = ["http://localhost:3000"]
    upload_max_bytes: int = 20 * 1024 * 1024
    upload_dir: str = "./uploads/quarantine"
    object_storage_endpoint: str | None = None
    object_storage_bucket: str = "campus-pilot-documents"
    object_storage_access_key: str | None = None
    object_storage_secret_key: str | None = None
    ai_provider: str = "mock"
    ai_endpoint: str | None = None
    ai_api_key: str | None = None
    otlp_endpoint: str | None = None
    auto_create_schema: bool = True


@lru_cache
def get_settings() -> Settings:
    return Settings()
