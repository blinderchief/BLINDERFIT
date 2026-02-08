"""
Authentication middleware for Blinderfit Backend
Uses Clerk JWT verification instead of Firebase.
"""

from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging
from typing import Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class AuthMiddleware:
    """Middleware for handling Clerk authentication"""

    def __init__(self):
        self.security = HTTPBearer(auto_error=False)

    async def __call__(self, request: Request):
        """Middleware to verify Clerk JWT tokens"""
        public_paths = [
            "/health", "/docs", "/redoc", "/openapi.json",
            "/auth/login", "/auth/register", "/auth/refresh"
        ]

        if any(request.url.path.startswith(path) for path in public_paths):
            return None

        credentials: Optional[HTTPAuthorizationCredentials] = await self.security(request)

        if not credentials:
            raise HTTPException(status_code=401, detail="Authorization header missing")

        try:
            from app.routes.auth import verify_clerk_token
            decoded_token = verify_clerk_token(credentials.credentials)

            request.state.user = {
                "uid": decoded_token["sub"],
                "token_exp": datetime.fromtimestamp(decoded_token["exp"]),
                "token_iat": datetime.fromtimestamp(decoded_token["iat"])
            }

            if datetime.utcnow() > request.state.user["token_exp"]:
                raise HTTPException(status_code=401, detail="Token expired")

            logger.info(f"Authenticated user: {request.state.user['uid']}")

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            raise HTTPException(status_code=401, detail="Authentication failed")

        return request.state.user


# Global instance
auth_middleware = AuthMiddleware()
