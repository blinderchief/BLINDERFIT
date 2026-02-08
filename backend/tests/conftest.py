"""
Test configuration and fixtures for Blinderfit Backend
"""

import pytest
import asyncio
from typing import Dict, Any
from unittest.mock import Mock, AsyncMock
from fastapi.testclient import TestClient
from firebase_admin import auth
import firebase_admin
from firebase_admin import credentials

from app.core.config import settings
from app.core.database import init_firebase
from app.services.gemini_service import gemini_service
from app.services.notification_service import notification_service
from app.services.integrations_service import integrations_service
from main import app

# Test Firebase credentials (mock)
test_cred = credentials.Certificate({
    "type": "service_account",
    "project_id": "test-project",
    "private_key_id": "test-key-id",
    "private_key": "-----BEGIN PRIVATE KEY-----\ntest-private-key\n-----END PRIVATE KEY-----\n",
    "client_email": "test@test-project.iam.gserviceaccount.com",
    "client_id": "test-client-id",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/test%40test-project.iam.gserviceaccount.com"
})

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
def test_app():
    """Create a test instance of the FastAPI app."""
    # Initialize Firebase with test credentials
    try:
        firebase_admin.get_app()
    except ValueError:
        firebase_admin.initialize_app(test_cred, name='test')

    return app

@pytest.fixture(scope="session")
def client(test_app):
    """Create a test client for the FastAPI app."""
    return TestClient(test_app)

@pytest.fixture
def mock_user():
    """Mock user data for testing."""
    return {
        "uid": "test-user-123",
        "email": "test@example.com",
        "email_verified": True,
        "display_name": "Test User",
        "photo_url": None,
        "phone_number": None
    }

@pytest.fixture
def mock_firebase_user(mock_user):
    """Mock Firebase user object."""
    user = Mock()
    user.uid = mock_user["uid"]
    user.email = mock_user["email"]
    user.email_verified = mock_user["email_verified"]
    user.display_name = mock_user["display_name"]
    user.photo_url = mock_user["photo_url"]
    user.phone_number = mock_user["phone_number"]
    user.get_id_token = AsyncMock(return_value="mock-token")
    return user

@pytest.fixture
def auth_headers(mock_user):
    """Generate authorization headers for authenticated requests."""
    return {"Authorization": f"Bearer mock-token-{mock_user['uid']}"}

@pytest.fixture
def mock_gemini_response():
    """Mock response from Gemini service."""
    return {
        "response": "This is a mock AI response for testing.",
        "confidence": 0.95,
        "tokens_used": 150
    }

@pytest.fixture
def mock_health_data():
    """Mock health data for testing."""
    return {
        "age": 30,
        "gender": "male",
        "height": 175,
        "weight": 75,
        "activity_level": "moderately_active",
        "dietary_restrictions": ["vegetarian"],
        "allergies": ["nuts"],
        "health_conditions": [],
        "fitness_goals": ["weight_loss", "muscle_gain"],
        "preferred_exercises": ["running", "weightlifting"]
    }

@pytest.fixture
def mock_meal_data():
    """Mock meal data for testing."""
    return {
        "meal_type": "breakfast",
        "food_items": [
            {
                "name": "Oatmeal",
                "quantity": 100,
                "unit": "g",
                "calories": 150,
                "protein": 5,
                "carbs": 27,
                "fat": 3
            }
        ],
        "total_calories": 150,
        "total_protein": 5,
        "total_carbs": 27,
        "total_fat": 3,
        "timestamp": "2024-01-15T08:00:00Z"
    }

@pytest.fixture
def mock_exercise_data():
    """Mock exercise data for testing."""
    return {
        "exercise_name": "Running",
        "duration": 30,
        "distance": 5.0,
        "calories_burned": 300,
        "heart_rate_avg": 140,
        "notes": "Morning run in the park",
        "timestamp": "2024-01-15T07:00:00Z"
    }

@pytest.fixture
def mock_plan_data():
    """Mock personalized plan data for testing."""
    return {
        "user_id": "test-user-123",
        "plan_type": "weight_loss",
        "duration_weeks": 12,
        "daily_calories": 2200,
        "macro_split": {
            "protein": 30,
            "carbs": 40,
            "fat": 30
        },
        "meal_plan": [
            {
                "day": "Monday",
                "meals": {
                    "breakfast": ["Oatmeal with berries"],
                    "lunch": ["Grilled chicken salad"],
                    "dinner": ["Baked salmon with vegetables"]
                }
            }
        ],
        "workout_plan": [
            {
                "day": "Monday",
                "exercises": [
                    {"name": "Squats", "sets": 3, "reps": 12},
                    {"name": "Push-ups", "sets": 3, "reps": 10}
                ]
            }
        ],
        "created_at": "2024-01-15T00:00:00Z"
    }

@pytest.fixture
def mock_notification_data():
    """Mock notification data for testing."""
    return {
        "title": "Test Notification",
        "message": "This is a test notification",
        "notification_type": "test",
        "data": {"test_key": "test_value"}
    }

@pytest.fixture
def mock_fcm_token():
    """Mock FCM token for testing."""
    return "mock-fcm-token-12345"

# Service mocks
@pytest.fixture
def mock_gemini_service():
    """Mock Gemini service for testing."""
    service = Mock()
    service.generate_content = AsyncMock(return_value="Mock AI response")
    service.analyze_image = AsyncMock(return_value={"description": "Mock image analysis"})
    return service

@pytest.fixture
def mock_notification_service():
    """Mock notification service for testing."""
    service = Mock()
    service.send_notification = AsyncMock(return_value="mock-notification-id")
    service.get_unread_notifications = AsyncMock(return_value=[])
    service.update_fcm_token = AsyncMock(return_value=True)
    return service

@pytest.fixture
def mock_integrations_service():
    """Mock integrations service for testing."""
    service = Mock()
    service.search_web = AsyncMock(return_value=[{"title": "Test Result", "url": "https://test.com"}])
    service.get_nutrition_info = AsyncMock(return_value={"food_item": "Apple", "calories": 95})
    service.sync_fitbit_data = AsyncMock(return_value={"steps": 10000, "calories": 500})
    return service

# Database mock fixtures
@pytest.fixture
def mock_firestore_client():
    """Mock Firestore client for testing."""
    client = Mock()
    client.collection = Mock(return_value=Mock())
    return client

@pytest.fixture
def mock_db_operations():
    """Mock database operations."""
    return {
        "get_user": Mock(return_value={"uid": "test-user-123", "email": "test@example.com"}),
        "create_user": Mock(return_value="test-user-123"),
        "update_user": Mock(return_value=True),
        "delete_user": Mock(return_value=True),
        "get_health_data": Mock(return_value={"weight": 75, "height": 175}),
        "save_health_data": Mock(return_value=True),
        "get_tracking_data": Mock(return_value=[{"date": "2024-01-15", "calories": 2200}]),
        "save_tracking_data": Mock(return_value=True)
    }

# Utility fixtures
@pytest.fixture
def sample_dates():
    """Sample dates for testing."""
    return {
        "today": "2024-01-15",
        "yesterday": "2024-01-14",
        "week_ago": "2024-01-08",
        "month_ago": "2023-12-15"
    }

@pytest.fixture
def sample_metrics():
    """Sample health metrics for testing."""
    return {
        "weight": 75.5,
        "bmi": 24.6,
        "body_fat": 15.2,
        "muscle_mass": 65.3,
        "bmr": 1800,
        "tdee": 2400
    }

@pytest.fixture
def sample_goals():
    """Sample fitness goals for testing."""
    return {
        "primary_goal": "weight_loss",
        "target_weight": 70,
        "timeline_weeks": 12,
        "activity_level": "moderately_active",
        "workouts_per_week": 4,
        "preferred_activities": ["running", "cycling", "strength_training"]
    }