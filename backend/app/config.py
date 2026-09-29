"""Application configuration management using Pydantic Settings."""

from typing import List, Union

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings read from environment variables or .env file."""

    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "Smart Internship Management Backend"
    API_V1_STR: str = "/api"

    # Database connection string.
    # Local development can use SQLite.
    # Production should provide DATABASE_URL through Render/Supabase.
    DATABASE_URL: str = "sqlite:///./sql_app.db"

    # Allowed CORS origins for frontend communication.
    # Production frontend URL must be supplied through the
    # CORS_ORIGINS environment variable.
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(
        cls,
        value: Union[str, List[str]],
    ) -> List[str]:
        """Parse comma-separated CORS origins into a list."""

        if isinstance(value, str):
            value = value.strip()

            if not value:
                return []

            # Support JSON-style list if supplied.
            if value.startswith("["):
                import json

                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return [
                        str(origin).strip()
                        for origin in parsed
                        if str(origin).strip()
                    ]

            # Support comma-separated origins.
            return [
                origin.strip()
                for origin in value.split(",")
                if origin.strip()
            ]

        return value

    # JWT Authentication Configuration
    #
    # Local development fallback.
    # Production should provide JWT_SECRET_KEY through Render.
    JWT_SECRET_KEY: str = "dev-secret-key-change-in-production-only"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
