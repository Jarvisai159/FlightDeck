"""Application configuration via environment variables."""

from pydantic_settings import BaseSettings
from typing import Optional
import json


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite+aiosqlite:///./wandr.db"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # JWT
    jwt_secret_key: str = "change-me-to-a-random-64-char-string"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 10080  # 7 days

    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:5173/auth/google/callback"

    # Email
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from_email: str = ""
    smtp_from_name: str = "Wandr"

    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""

    # Audio Storage
    audio_storage_path: str = "./audio_storage"
    max_recording_minutes: int = 120
    supported_languages: str = '["en","es","fr","de","ja"]'
    cdn_base_url: str = ""

    # Application
    app_name: str = "Wandr"
    app_env: str = "development"
    app_debug: bool = True
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"
    cors_origins: str = '["http://localhost:5173"]'

    @property
    def cors_origins_list(self) -> list[str]:
        return json.loads(self.cors_origins)

    @property
    def supported_languages_list(self) -> list[str]:
        return json.loads(self.supported_languages)

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
