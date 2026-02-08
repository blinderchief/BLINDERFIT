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
            "https://blinderfit.blinder.live",
            "https://blinderfit.web.app",
            "https://blinderfit.firebaseapp.com"
        ],
        env="ALLOWED_ORIGINS"
    )

    # Firebase settings
    FIREBASE_PROJECT_ID: str = Field(..., env="FIREBASE_PROJECT_ID")
    FIREBASE_PRIVATE_KEY: str = Field(..., env="FIREBASE_PRIVATE_KEY")
    FIREBASE_CLIENT_EMAIL: str = Field(..., env="FIREBASE_CLIENT_EMAIL")

    # Google AI (Gemini) settings
    GOOGLE_AI_API_KEY: str = Field(..., env="GOOGLE_AI_API_KEY")
    GEMINI_MODEL: str = Field(default="gemini-2.5-flash", env="GEMINI_MODEL")

    # JWT settings
    JWT_SECRET_KEY: str = Field(..., env="JWT_SECRET_KEY")
    JWT_ALGORITHM: str = Field(default="HS256", env="JWT_ALGORITHM")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")

    # Database settings
    FIRESTORE_EMULATOR_HOST: str = Field(default="", env="FIRESTORE_EMULATOR_HOST")

    # API settings
    API_V1_PREFIX: str = "/api/v1"

    # Rate limiting
    RATE_LIMIT_REQUESTS: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    RATE_LIMIT_WINDOW: int = Field(default=60, env="RATE_LIMIT_WINDOW")

    # reCAPTCHA settings (for frontend compatibility)
    VITE_RECAPTCHA_SITE_KEY: str = Field(default="", env="VITE_RECAPTCHA_SITE_KEY")

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Allow extra environment variables

# Create settings instance
settings = Settings()