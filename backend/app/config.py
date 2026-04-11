from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://studiary:studiary@db:5432/studiary"
    JWT_SECRET_KEY: str = "your-secret-key-change-in-production-min-32-chars"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    CORS_ORIGINS: str = "*"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
