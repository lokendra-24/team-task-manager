from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    APP_NAME: str = "Team Task Manager API"
    DEBUG: bool = False
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    DATABASE_URL: str
    CORS_ORIGINS: List[str] | str = ["http://localhost:5173"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, value):
        if isinstance(value, str):
            if value == "*":
                return ["*"]
            if value.startswith("[") and value.endswith("]"):
                import json
                try:
                    return json.loads(value)
                except json.JSONDecodeError:
                    pass
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()

