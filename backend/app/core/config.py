"""
Configuration settings for Blinderfit Backend
"""

import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    """Application settings"""

    # Environment
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")

    # Server settings
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")

    # CORS settings
    ALLOWED_ORIGINS: List[str] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8080",
            "https://blinderfit.vercel.app",
            "https://blinderfit.blinder.live",
        ],
        env="ALLOWED_ORIGINS"
    )

    # Database (Neon PostgreSQL)
    DATABASE_URL: str = Field(..., env="DATABASE_URL")

    # Clerk Authentication
    CLERK_SECRET_KEY: str = Field(..., env="CLERK_SECRET_KEY")
    CLERK_PUBLISHABLE_KEY: str = Field(default="", env="CLERK_PUBLISHABLE_KEY")
    CLERK_JWT_PUBLIC_KEY: str = Field(default="", env="CLERK_JWT_PUBLIC_KEY")
    CLERK_ISSUER: str = Field(default="", env="CLERK_ISSUER")

    # Google AI (Gemini) settings
    GOOGLE_AI_API_KEY: str = Field(..., env="GOOGLE_AI_API_KEY")
    GEMINI_MODEL: str = Field(default="gemini-2.5-flash", env="GEMINI_MODEL")

    # API settings
    API_V1_PREFIX: str = "/api/v1"

    # Rate limiting
    RATE_LIMIT_REQUESTS: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    RATE_LIMIT_WINDOW: int = Field(default=60, env="RATE_LIMIT_WINDOW")

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

# Create settings instance
settings = Settings()