from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "SOC-Agentic-API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-me"

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    DATABASE_URL: str = "sqlite:///./soc.db"
    REDIS_URL: str = "redis://localhost:6379/0"

    JWT_SECRET: str = "jwt-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    AGENT_MAX_CONCURRENT: int = 5
    AGENT_TIMEOUT_SECONDS: int = 300

    VIRUSTOTAL_API_KEY: str = ""
    SHODAN_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
