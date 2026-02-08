"""
Authentication routes for Blinderfit Backend
Uses Clerk for authentication (JWT verification)
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime
import jwt
import httpx
import logging
from typing import Optional, Dict, Any

from app.core.config import settings
from app.core.database import db_service
from app.models import (
    UserProfile,
    APIResponse
)

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)

# Cache for JWKS keys
_jwks_cache: Dict[str, Any] = {}
_jwks_cache_time: Optional[datetime] = None


async def _get_clerk_jwks() -> Dict[str, Any]:
    """Fetch Clerk's JWKS for token verification"""
    global _jwks_cache, _jwks_cache_time
    from datetime import timedelta

    # Cache JWKS for 1 hour
    if _jwks_cache and _jwks_cache_time and (datetime.utcnow() - _jwks_cache_time) < timedelta(hours=1):
        return _jwks_cache

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.clerk.com/v1/jwks",
                headers={"Authorization": f"Bearer {settings.CLERK_SECRET_KEY}"},
            )
            resp.raise_for_status()
            _jwks_cache = resp.json()
            _jwks_cache_time = datetime.utcnow()
            return _jwks_cache
    except Exception as e:
        logger.error(f"Failed to fetch Clerk JWKS: {e}")
        if _jwks_cache:
            return _jwks_cache
        raise HTTPException(status_code=500, detail="Authentication service unavailable")


def _get_public_key_from_jwks(jwks: Dict[str, Any], kid: str):
    """Extract the correct public key from JWKS"""
    from jwt.algorithms import RSAAlgorithm
    for key_data in jwks.get("keys", []):
        if key_data.get("kid") == kid:
            return RSAAlgorithm.from_jwk(key_data)
    return None


async def verify_clerk_token(token: str) -> str:
    """Verify Clerk session token and return user ID"""
    try:
        # If we have a PEM public key configured, use it directly (networkless)
        if settings.CLERK_JWT_PUBLIC_KEY:
            pem_key = settings.CLERK_JWT_PUBLIC_KEY.replace("\\n", "\n")
            payload = jwt.decode(token, pem_key, algorithms=["RS256"])
        else:
            # Decode header to get kid
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get("kid")
            if not kid:
                raise HTTPException(status_code=401, detail="Invalid token header")

            # Fetch JWKS and get public key
            jwks = await _get_clerk_jwks()
            public_key = _get_public_key_from_jwks(jwks, kid)
            if not public_key:
                # Force refresh JWKS
                global _jwks_cache_time
                _jwks_cache_time = None
                jwks = await _get_clerk_jwks()
                public_key = _get_public_key_from_jwks(jwks, kid)
                if not public_key:
                    raise HTTPException(status_code=401, detail="Unknown signing key")

            payload = jwt.decode(token, public_key, algorithms=["RS256"])

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: no sub claim")

        return user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Dependency to get current authenticated user from Clerk JWT"""
    return await verify_clerk_token(credentials.credentials)


@router.post("/register", response_model=APIResponse)
async def register_user(request: Request):
    """
    Sync Clerk user to backend database.
    Called after Clerk handles registration on the frontend.
    """
    try:
        body = await request.json()
        user_id = body.get("user_id")
        email = body.get("email")
        display_name = body.get("display_name")
        phone_number = body.get("phone_number")

        if not user_id or not email:
            raise HTTPException(status_code=400, detail="user_id and email required")

        # Create user profile in database
        user_data = {
            "uid": user_id,
            "email": email,
            "display_name": display_name,
            "phone_number": phone_number,
            "email_verified": True,
            "created_at": datetime.utcnow().isoformat(),
        }
        db_service.set_user(user_id, user_data)

        return APIResponse(
            success=True,
            message="User registered successfully",
            data={"user_id": user_id}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")


@router.post("/verify-token", response_model=APIResponse)
async def verify_user_token(user_id: str = Depends(get_current_user)):
    """Verify if the provided token is valid"""
    try:
        user_data = db_service.get_user(user_id)
        if not user_data:
            # Auto-create user profile on first verify
            db_service.set_user(user_id, {"uid": user_id, "created_at": datetime.utcnow().isoformat()})
            user_data = {"uid": user_id}

        return APIResponse(
            success=True,
            message="Token is valid",
            data={
                "user_id": user_id,
                "email": user_data.get("email"),
                "display_name": user_data.get("display_name"),
            }
        )
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(status_code=500, detail="Token verification failed")


@router.delete("/delete-account", response_model=APIResponse)
async def delete_user_account(user_id: str = Depends(get_current_user)):
    """Delete user account and all associated data"""
    try:
        db_service.delete_user(user_id)
        return APIResponse(success=True, message="Account deleted successfully")
    except Exception as e:
        logger.error(f"Account deletion error: {e}")
        raise HTTPException(status_code=500, detail="Account deletion failed")


@router.get("/profile", response_model=APIResponse)
async def get_user_profile(user_id: str = Depends(get_current_user)):
    """Get current user profile"""
    try:
        user_data = db_service.get_user(user_id)
        if not user_data:
            # Auto-create minimal profile
            db_service.set_user(user_id, {"uid": user_id, "created_at": datetime.utcnow().isoformat()})
            user_data = db_service.get_user(user_id)

        return APIResponse(success=True, message="Profile retrieved", data=user_data)
    except Exception as e:
        logger.error(f"Profile fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get profile")


@router.put("/profile", response_model=APIResponse)
async def update_user_profile(updates: dict, user_id: str = Depends(get_current_user)):
    """Update user profile"""
    try:
        allowed_fields = ["display_name", "phone_number", "photo_url"]
        filtered = {k: v for k, v in updates.items() if k in allowed_fields}
        if not filtered:
            raise HTTPException(status_code=400, detail="No valid fields to update")

        filtered["updated_at"] = datetime.utcnow().isoformat()
        db_service.update_user(user_id, filtered)
        return APIResponse(success=True, message="Profile updated successfully")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile update error: {e}")
        raise HTTPException(status_code=500, detail="Profile update failed")