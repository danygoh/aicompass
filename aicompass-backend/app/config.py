"""AI Compass Backend - Configuration"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str
    anthropic_api_key: str
    resend_api_key: str = ""
    tavily_api_key: str = ""
    secret_key: str = "dev-secret-change-in-production"
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
