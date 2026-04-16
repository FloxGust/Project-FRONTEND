from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "SOC-Agentic-API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-me"

    HOST: str = "0.0.0.0"
    PORT: int = 8181

    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    DATABASE_URL: str = "sqlite:///./soc.db"
    REDIS_URL: str = "redis://localhost:6379/0"

    JWT_SECRET: str = "jwt-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    AGENT_MAX_CONCURRENT: int = 5
    AGENT_TIMEOUT_SECONDS: int = 300

    PUBLIC_DOMAIN: bool = True
    PAIAC_PUBLIC_BASE_URL: str = "https://db.paiac.store"
    PAIAC_LOCAL_BASE_URL: str = "http://host.docker.internal:8000"
    PAIAC_API_PREFIX: str = ""
    PAIAC_TIMEOUT_SECONDS: int = 20

    VIRUSTOTAL_API_KEY: str = ""
    SHODAN_API_KEY: str = ""

    @property
    def PAIAC_BASE_URL(self) -> str:
        return self.PAIAC_PUBLIC_BASE_URL if self.PUBLIC_DOMAIN else self.PAIAC_LOCAL_BASE_URL

    class Config:
        env_file = ".env"

settings = Settings()
