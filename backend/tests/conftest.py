"""
Test configuration and fixtures for Blinderfit Backend
Uses Clerk authentication (JWT) and Neon PostgreSQL
"""

import pytest
import asyncio
import os
from typing import Dict, Any
from unittest.mock import Mock, AsyncMock, patch
from fastapi.testclient import TestClient

# Set test environment variables before importing app
os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost:5432/blinderfit_test")
os.environ.setdefault("CLERK_SECRET_KEY", "sk_test_mock_key_for_testing")
os.environ.setdefault("GOOGLE_AI_API_KEY", "test_gemini_key")
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("PORT", "8000")

from main import app


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def test_app():
    """Create a test instance of the FastAPI app."""
    return app


@pytest.fixture(scope="session")
def client(test_app):
    """Create a test client for the FastAPI app."""
    return TestClient(test_app)


@pytest.fixture
def mock_user():
    """Mock user data for testing."""
    return {
        "uid": "user_test123",
        "email": "test@example.com",
        "email_verified": True,
        "display_name": "Test User",
        "photo_url": None,
        "phone_number": None,
    }


@pytest.fixture
def auth_headers():
    """Generate authorization headers for authenticated requests."""
    return {"Authorization": "Bearer mock-jwt-token-for-testing"}


@pytest.fixture
def mock_clerk_verify(mock_user):
    """Patch Clerk token verification to return mock user ID."""
    with patch("app.routes.auth.verify_clerk_token", new_callable=AsyncMock) as mock_verify:
        mock_verify.return_value = mock_user["uid"]
        yield mock_verify


@pytest.fixture
def mock_gemini_response():
    """Mock response from Gemini service."""
    return {
        "response": "This is a mock AI response for testing.",
        "confidence": 0.95,
        "tokens_used": 150,
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
        "preferred_exercises": ["running", "weightlifting"],
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
                "fat": 3,
            }
        ],
        "total_calories": 150,
        "total_protein": 5,
        "total_carbs": 27,
        "total_fat": 3,
        "timestamp": "2024-01-15T08:00:00Z",
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
        "timestamp": "2024-01-15T07:00:00Z",
    }


@pytest.fixture
def mock_plan_data():
    """Mock personalized plan data for testing."""
    return {
        "user_id": "user_test123",
        "plan_type": "weight_loss",
        "duration_weeks": 12,
        "daily_calories": 2200,
        "macro_split": {"protein": 30, "carbs": 40, "fat": 30},
        "meal_plan": [
            {
                "day": "Monday",
                "meals": {
                    "breakfast": ["Oatmeal with berries"],
                    "lunch": ["Grilled chicken salad"],
                    "dinner": ["Baked salmon with vegetables"],
                },
            }
        ],
        "workout_plan": [
            {
                "day": "Monday",
                "exercises": [
                    {"name": "Squats", "sets": 3, "reps": 12},
                    {"name": "Push-ups", "sets": 3, "reps": 10},
                ],
            }
        ],
        "created_at": "2024-01-15T00:00:00Z",
    }


@pytest.fixture
def mock_notification_data():
    """Mock notification data for testing."""
    return {
        "title": "Test Notification",
        "message": "This is a test notification",
        "notification_type": "test",
        "data": {"test_key": "test_value"},
    }


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
    return service


@pytest.fixture
def mock_integrations_service():
    """Mock integrations service for testing."""
    service = Mock()
    service.search_web = AsyncMock(
        return_value=[{"title": "Test Result", "url": "https://test.com"}]
    )
    service.get_nutrition_info = AsyncMock(
        return_value={"food_item": "Apple", "calories": 95}
    )
    return service


# Database mock fixtures
@pytest.fixture
def mock_db_service():
    """Mock database service for testing."""
    service = Mock()
    service.get_user = Mock(return_value={"uid": "user_test123", "email": "test@example.com"})
    service.set_user = Mock(return_value=None)
    service.update_user = Mock(return_value=None)
    service.delete_user = Mock(return_value=None)
    service.get_user_doc = Mock(return_value=None)
    service.set_user_doc = Mock(return_value="doc-id")
    service.query_user_docs = Mock(return_value=[])
    service.add_user_doc = Mock(return_value="new-doc-id")
    return service


# Utility fixtures
@pytest.fixture
def sample_dates():
    """Sample dates for testing."""
    return {
        "today": "2024-01-15",
        "yesterday": "2024-01-14",
        "week_ago": "2024-01-08",
        "month_ago": "2023-12-15",
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
        "tdee": 2400,
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
        "preferred_activities": ["running", "cycling", "strength_training"],
    }