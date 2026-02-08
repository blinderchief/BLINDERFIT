"""
Authentication middleware for Blinderfit Backend
"""

from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
import logging
from typing import Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class AuthMiddleware:
    """Middleware for handling Firebase authentication"""

    def __init__(self):
        self.security = HTTPBearer(auto_error=False)

    async def __call__(self, request: Request):
        """Middleware to verify Firebase authentication tokens"""
        # Skip authentication for certain endpoints
        public_paths = [
            "/health",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/auth/login",
            "/auth/register",
            "/auth/refresh"
        ]

        if any(request.url.path.startswith(path) for path in public_paths):
            return None

        # Extract token from Authorization header
        credentials: Optional[HTTPAuthorizationCredentials] = await self.security(request)

        if not credentials:
            raise HTTPException(
                status_code=401,
                detail="Authorization header missing"
            )

        try:
            # Verify Firebase token
            decoded_token = auth.verify_id_token(credentials.credentials)

            # Add user info to request state
            request.state.user = {
                "uid": decoded_token["uid"],
                "email": decoded_token.get("email"),
                "email_verified": decoded_token.get("email_verified", False),
                "name": decoded_token.get("name"),
                "picture": decoded_token.get("picture"),
                "token_exp": datetime.fromtimestamp(decoded_token["exp"]),
                "token_iat": datetime.fromtimestamp(decoded_token["iat"])
            }

            # Check if token is expired
            if datetime.utcnow() > request.state.user["token_exp"]:
                raise HTTPException(
                    status_code=401,
                    detail="Token expired"
                )

            logger.info(f"Authenticated user: {request.state.user['uid']}")

        except auth.ExpiredIdTokenError:
            raise HTTPException(
                status_code=401,
                detail="Token expired"
            )
        except auth.InvalidIdTokenError:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )
        except auth.RevokedIdTokenError:
            raise HTTPException(
                status_code=401,
                detail="Token revoked"
            )
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            raise HTTPException(
                status_code=401,
                detail="Authentication failed"
            )

        return request.state.user

# Global instance
auth_middleware = AuthMiddleware()