"""
Authentication routes for Blinderfit Backend
"""

import firebase_admin
from firebase_admin import auth
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
import jwt
import logging
from typing import Optional

from app.core.config import settings
from app.core.database import get_firestore_client
from app.models import (
    UserProfile,
    RegisterRequest,
    LoginRequest,
    TokenData,
    APIResponse
)

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)

# JWT token functions (kept for backward compatibility with backend-issued tokens)
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def verify_firebase_token(token: str) -> str:
    """Verify Firebase ID token and return user uid"""
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token.get("uid")
        if not uid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Firebase token: no uid",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return uid
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase ID token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.RevokedIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase token has been revoked",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Firebase token verification error: {e}")
        # Fallback: try legacy PyJWT verification for backward compatibility
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            return user_id
        except (jwt.ExpiredSignatureError, jwt.JWTError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Dependency to get current authenticated user - supports Firebase ID tokens (primary) and legacy JWTs (fallback)"""
    return verify_firebase_token(credentials.credentials)

async def get_current_user_profile(user_id: str = Depends(get_current_user)) -> UserProfile:
    """Get current user profile from Firestore"""
    try:
        db = get_firestore_client()
        user_doc = db.collection('users').document(user_id).get()

        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )

        user_data = user_doc.to_dict()
        return UserProfile(**user_data)
    except Exception as e:
        logger.error(f"Error fetching user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching user profile"
        )

@router.post("/register", response_model=APIResponse)
async def register_user(request: RegisterRequest):
    """Register a new user with Firebase Auth"""
    try:
        # Create user in Firebase Auth
        user = auth.create_user(
            email=request.email,
            password=request.password,
            display_name=request.display_name,
            phone_number=request.phone_number
        )

        # Create user profile in Firestore
        db = get_firestore_client()
        user_profile = UserProfile(
            uid=user.uid,
            email=request.email,
            display_name=request.display_name,
            phone_number=request.phone_number,
            email_verified=False,
            created_at=datetime.utcnow(),
            last_login=None
        )

        # Save to Firestore
        db.collection('users').document(user.uid).set(user_profile.dict())

        # Create access token
        access_token = create_access_token(data={"sub": user.uid})

        return APIResponse(
            success=True,
            message="User registered successfully",
            data={
                "user_id": user.uid,
                "access_token": access_token,
                "token_type": "bearer"
            }
        )

    except auth.EmailAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=APIResponse)
async def login_user(request: LoginRequest):
    """Authenticate user and return access token"""
    try:
        # Verify user credentials with Firebase Auth
        user = auth.get_user_by_email(request.email)

        # For simplicity, we're assuming Firebase Auth handles password verification
        # In production, you might want to use Firebase Auth REST API or custom authentication

        # Update last login
        db = get_firestore_client()
        db.collection('users').document(user.uid).update({
            'last_login': datetime.utcnow()
        })

        # Create access token
        access_token = create_access_token(data={"sub": user.uid})

        return APIResponse(
            success=True,
            message="Login successful",
            data={
                "user_id": user.uid,
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
            }
        )

    except auth.UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.post("/verify-token", response_model=APIResponse)
async def verify_user_token(user_id: str = Depends(get_current_user)):
    """Verify if the provided token is valid"""
    try:
        # Get user profile to confirm user exists
        db = get_firestore_client()
        user_doc = db.collection('users').document(user_id).get()

        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        user_data = user_doc.to_dict()
        return APIResponse(
            success=True,
            message="Token is valid",
            data={
                "user_id": user_id,
                "email": user_data.get('email'),
                "display_name": user_data.get('display_name')
            }
        )

    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token verification failed"
        )

@router.post("/refresh-token", response_model=APIResponse)
async def refresh_access_token(user_id: str = Depends(get_current_user)):
    """Refresh access token for authenticated user"""
    try:
        # Create new access token
        access_token = create_access_token(data={"sub": user_id})

        return APIResponse(
            success=True,
            message="Token refreshed successfully",
            data={
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
            }
        )

    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )

@router.delete("/delete-account", response_model=APIResponse)
async def delete_user_account(user_id: str = Depends(get_current_user)):
    """Delete user account and all associated data"""
    try:
        # Delete from Firebase Auth
        auth.delete_user(user_id)

        # Delete from Firestore (this will cascade delete subcollections)
        db = get_firestore_client()
        db.collection('users').document(user_id).delete()

        return APIResponse(
            success=True,
            message="Account deleted successfully"
        )

    except Exception as e:
        logger.error(f"Account deletion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Account deletion failed"
        )

@router.get("/profile", response_model=APIResponse)
async def get_user_profile(user_profile: UserProfile = Depends(get_current_user_profile)):
    """Get current user profile"""
    return APIResponse(
        success=True,
        message="Profile retrieved successfully",
        data=user_profile.dict()
    )

@router.put("/profile", response_model=APIResponse)
async def update_user_profile(
    updates: dict,
    user_id: str = Depends(get_current_user)
):
    """Update user profile"""
    try:
        db = get_firestore_client()

        # Validate allowed fields
        allowed_fields = ['display_name', 'phone_number', 'photo_url']
        filtered_updates = {k: v for k, v in updates.items() if k in allowed_fields}

        if not filtered_updates:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields to update"
            )

        # Add updated_at timestamp
        filtered_updates['updated_at'] = datetime.utcnow()

        # Update in Firestore
        db.collection('users').document(user_id).update(filtered_updates)

        return APIResponse(
            success=True,
            message="Profile updated successfully"
        )

    except Exception as e:
        logger.error(f"Profile update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile update failed"
        )