"""
Firebase initialization and configuration
"""

import firebase_admin
from firebase_admin import credentials, firestore, auth
import json
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

async def init_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        # Check if Firebase is already initialized
        if not firebase_admin._apps:
            # Create credentials from environment variables
            service_account_info = {
                "type": "service_account",
                "project_id": settings.FIREBASE_PROJECT_ID,
                "private_key": settings.FIREBASE_PRIVATE_KEY.replace('\\n', '\n'),
                "client_email": settings.FIREBASE_CLIENT_EMAIL,
                "token_uri": "https://oauth2.googleapis.com/token"
            }

            cred = credentials.Certificate(service_account_info)
            firebase_admin.initialize_app(cred)

            logger.info("Firebase Admin SDK initialized successfully")
        else:
            logger.info("Firebase Admin SDK already initialized")

    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        raise

# Get Firestore client
def get_firestore_client():
    """Get Firestore client instance"""
    return firestore.client()

# Get Auth client
def get_auth_client():
    """Get Firebase Auth client"""
    return auth