"""Application configuration via environment variables."""

from pydantic_settings import BaseSettings
from typing import Optional
import json


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite+aiosqlite:///./flightdeck.db"

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
    smtp_from_name: str = "FlightDeck"

    # API Keys
    aviationstack_api_key: str = ""
    opensky_username: str = ""
    opensky_password: str = ""
    kiwi_tequila_api_key: str = ""

    # Application
    app_name: str = "FlightDeck"
    app_env: str = "development"
    app_debug: bool = True
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"
    cors_origins: str = '["http://localhost:5173"]'

    # Scraper settings
    scraper_default_timeout: int = 30
    scraper_cache_ttl_live: int = 60
    scraper_cache_ttl_historical: int = 86400
    scraper_max_retries: int = 3

    # AdSense
    adsense_client_id: str = ""
    adsense_slot_sidebar: str = ""
    adsense_slot_banner: str = ""

    @property
    def cors_origins_list(self) -> list[str]:
        return json.loads(self.cors_origins)

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
