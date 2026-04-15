"""
Application Configuration
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://hearldev:hearldev123@localhost:5432/hearldev"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # JWT
    JWT_SECRET: str = "hearlink-dev-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 60

    # TossPay
    TOSSPAY_CLIENT_KEY: str = ""
    TOSSPAY_SECRET_KEY: str = ""
    TOSSPAY_API_URL: str = "https://api-sandbox.tosspayments.com"

    # Barobill
    BAROBILL_CERT_PATH: str = ""
    BAROBILL_CERT_PWD: str = ""
    BAROBILL_API_URL: str = "https://test.barobill.kr"

    # KakaoTalk
    KAKAO_API_KEY: str = ""
    KAKAO_TEMPLATE_CODE: str = ""

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
