"""
Unit tests for service classes
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime, timedelta

from app.services.gemini_service import gemini_service
from app.services.notification_service import notification_service
from app.services.integrations_service import integrations_service

@pytest.mark.asyncio
async def test_gemini_service_generate_content():
    """Test Gemini service content generation."""
    with patch('google.generativeai.GenerativeModel') as mock_model:
        mock_response = Mock()
        mock_response.text = "This is a test response from Gemini."
        mock_model.return_value.generate_content.return_value = mock_response

        result = await gemini_service.generate_content("Test prompt")

        assert result == "This is a test response from Gemini."
        mock_model.return_value.generate_content.assert_called_once()

@pytest.mark.asyncio
async def test_gemini_service_analyze_image():
    """Test Gemini service image analysis."""
    with patch('google.generativeai.GenerativeModel') as mock_model:
        mock_response = Mock()
        mock_response.text = '{"description": "A healthy meal", "calories": 450}'
        mock_model.return_value.generate_content.return_value = mock_response

        result = await gemini_service.analyze_image("base64_image_data")

        assert "description" in result
        assert "calories" in result

@pytest.mark.asyncio
async def test_notification_service_send_notification(mock_user, mock_fcm_token):
    """Test notification service send notification."""
    with patch('firebase_admin.messaging.send') as mock_send, \
         patch('app.services.notification_service.get_firestore_client') as mock_db:

        mock_send.return_value = "message_id_123"
        mock_db.return_value.collection.return_value.document.return_value.collection.return_value.document.return_value.set.return_value = None

        result = await notification_service.send_notification(
            user_id=mock_user["uid"],
            title="Test Notification",
            message="Test message",
            notification_type="test"
        )

        assert result is not None
        mock_send.assert_called_once()

@pytest.mark.asyncio
async def test_notification_service_meal_reminder(mock_user):
    """Test meal reminder notification."""
    with patch.object(notification_service, 'send_notification') as mock_send:
        mock_send.return_value = "notification_id_123"

        result = await notification_service.send_meal_reminder(
            user_id=mock_user["uid"],
            meal_type="breakfast"
        )

        assert result == "notification_id_123"
        mock_send.assert_called_once()
        call_args = mock_send.call_args
        assert "breakfast" in call_args[1]["title"].lower()

@pytest.mark.asyncio
async def test_notification_service_exercise_reminder(mock_user):
    """Test exercise reminder notification."""
    with patch.object(notification_service, 'send_notification') as mock_send:
        mock_send.return_value = "notification_id_123"

        result = await notification_service.send_exercise_reminder(mock_user["uid"])

        assert result == "notification_id_123"
        mock_send.assert_called_once()
        assert "exercise" in mock_send.call_args[1]["title"].lower()

@pytest.mark.asyncio
async def test_integrations_service_search_web():
    """Test web search functionality."""
    with patch.object(integrations_service, '_search_with_gemini') as mock_search:
        mock_search.return_value = [
            {
                "title": "Healthy Eating Guide",
                "url": "https://example.com/healthy-eating",
                "description": "A comprehensive guide to healthy eating habits.",
                "date": "2024-01-15"
            }
        ]

        results = await integrations_service.search_web("healthy eating", 1)

        assert len(results) == 1
        assert results[0]["title"] == "Healthy Eating Guide"
        assert results[0]["url"] == "https://example.com/healthy-eating"

@pytest.mark.asyncio
async def test_integrations_service_nutrition_info():
    """Test nutrition information retrieval."""
    with patch.object(integrations_service, 'search_web') as mock_search:
        mock_search.return_value = [
            {
                "title": "Apple Nutrition Facts",
                "description": "One medium apple contains 95 calories, 25g carbs, 4g fiber.",
                "url": "https://nutrition.example.com/apple"
            }
        ]

        result = await integrations_service.get_nutrition_info("apple")

        assert "food_item" in result
        assert result["food_item"] == "apple"
        assert "nutrition" in result

@pytest.mark.asyncio
async def test_integrations_service_exercise_info():
    """Test exercise information retrieval."""
    with patch.object(integrations_service, 'search_web') as mock_search:
        mock_search.return_value = [
            {
                "title": "How to Do Squats Properly",
                "description": "Squats target quadriceps, hamstrings, and glutes. Stand with feet shoulder-width apart...",
                "url": "https://fitness.example.com/squats"
            }
        ]

        result = await integrations_service.get_exercise_info("squats")

        assert "exercise" in result
        assert result["exercise"] == "squats"
        assert "information" in result

@pytest.mark.asyncio
async def test_integrations_service_fitbit_sync(mock_user):
    """Test Fitbit data synchronization."""
    with patch('httpx.AsyncClient') as mock_client:
        mock_response = Mock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {
            "summary": {
                "steps": 8500,
                "caloriesOut": 2100,
                "distances": [{"distance": 6.2}],
                "veryActiveMinutes": 45
            }
        }
        mock_client.return_value.__aenter__.return_value.get.return_value = mock_response

        with patch('app.services.integrations_service.get_firestore_client') as mock_db:
            result = await integrations_service.sync_fitbit_data(
                user_id=mock_user["uid"],
                access_token="mock_access_token"
            )

            assert "steps" in result
            assert "calories" in result
            assert result["steps"] == 8500
            assert result["calories"] == 2100

@pytest.mark.asyncio
async def test_integrations_service_weather_data():
    """Test weather data retrieval."""
    with patch('httpx.AsyncClient') as mock_client:
        mock_response = Mock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {
            "main": {"temp": 22.5, "humidity": 65},
            "weather": [{"description": "clear sky"}],
            "wind": {"speed": 3.2},
            "name": "New York"
        }
        mock_client.return_value.__aenter__.return_value.get.return_value = mock_response

        result = await integrations_service.get_weather_data(40.7128, -74.0060)

        assert "temperature" in result
        assert "humidity" in result
        assert result["temperature"] == 22.5
        assert result["location"] == "New York"

@pytest.mark.asyncio
async def test_integrations_service_health_news():
    """Test health news retrieval."""
    with patch.object(integrations_service, 'search_web') as mock_search:
        mock_search.return_value = [
            {
                "title": "New Study on Mediterranean Diet",
                "description": "Recent research shows benefits of Mediterranean diet for heart health.",
                "url": "https://health.example.com/mediterranean-diet-study",
                "date": "2024-01-15"
            }
        ]

        news = await integrations_service.get_health_news(1)

        assert len(news) == 1
        assert news[0]["title"] == "New Study on Mediterranean Diet"
        assert "timestamp" in news[0]

@pytest.mark.asyncio
async def test_integrations_service_trend_analysis(mock_user):
    """Test health trend analysis."""
    with patch('app.services.integrations_service.get_firestore_client') as mock_db, \
         patch.object(integrations_service, '_analyze_with_gemini') as mock_analyze:

        # Mock database query
        mock_docs = []
        for i in range(7):
            mock_doc = Mock()
            mock_doc.to_dict.return_value = {
                "date": f"2024-01-{15-i}",
                "weight": 75 - i * 0.2,
                "created_at": datetime.utcnow() - timedelta(days=i)
            }
            mock_docs.append(mock_doc)

        mock_db.return_value.collection.return_value.document.return_value.collection.return_value.order_by.return_value.limit.return_value.get.return_value = mock_docs

        mock_analyze.return_value = "Your weight has been trending downward by 0.2kg per day on average."

        result = await integrations_service.analyze_trends(
            user_id=mock_user["uid"],
            data_type="weight"
        )

        assert "data_type" in result
        assert "analysis" in result
        assert result["data_type"] == "weight"
        assert "trending downward" in result["analysis"]

@pytest.mark.asyncio
async def test_integrations_service_meal_suggestions(mock_user):
    """Test meal suggestions generation."""
    with patch('app.services.integrations_service.get_firestore_client') as mock_db, \
         patch.object(integrations_service, '_generate_with_gemini') as mock_generate:

        # Mock user data
        mock_user_doc = Mock()
        mock_user_doc.exists = True
        mock_user_doc.to_dict.return_value = {
            "dietary_restrictions": ["vegetarian"],
            "allergies": ["nuts"],
            "cuisine_preferences": ["mediterranean"]
        }
        mock_db.return_value.collection.return_value.document.return_value.get.return_value = mock_user_doc

        mock_generate.return_value = "Here are some vegetarian meal suggestions..."

        result = await integrations_service.get_meal_suggestions({
            "meal_type": "dinner",
            "calories": 600
        })

        assert "suggestions" in result
        assert "timestamp" in result

@pytest.mark.asyncio
async def test_integrations_service_workout_plan(mock_user):
    """Test workout plan generation."""
    with patch('app.services.integrations_service.get_firestore_client') as mock_db, \
         patch.object(integrations_service, '_generate_with_gemini') as mock_generate:

        # Mock user data
        mock_user_doc = Mock()
        mock_user_doc.exists = True
        mock_user_doc.to_dict.return_value = {
            "fitness_level": "intermediate",
            "fitness_goals": ["strength", "endurance"],
            "available_equipment": ["dumbbells", "resistance bands"]
        }
        mock_db.return_value.collection.return_value.document.return_value.get.return_value = mock_user_doc

        mock_generate.return_value = "Here's your personalized workout plan..."

        result = await integrations_service.generate_workout_plan({
            "duration_weeks": 8,
            "sessions_per_week": 4
        })

        assert "workout_plan" in result
        assert "fitness_level" in result
        assert result["fitness_level"] == "intermediate"

@pytest.mark.asyncio
async def test_integrations_service_health_assessment(mock_user):
    """Test comprehensive health assessment."""
    with patch('app.services.integrations_service.get_firestore_client') as mock_db, \
         patch.object(integrations_service, '_generate_with_gemini') as mock_generate:

        # Mock user data and tracking data
        mock_user_doc = Mock()
        mock_user_doc.exists = True
        mock_user_doc.to_dict.return_value = {
            "age": 30,
            "gender": "male",
            "height": 175,
            "weight": 75,
            "activity_level": "moderately_active"
        }
        mock_db.return_value.collection.return_value.document.return_value.get.return_value = mock_user_doc

        mock_tracking_docs = []
        for i in range(7):
            mock_doc = Mock()
            mock_doc.to_dict.return_value = {
                "date": f"2024-01-{15-i}",
                "calories": 2200,
                "steps": 8000 + i * 500,
                "created_at": datetime.utcnow() - timedelta(days=i)
            }
            mock_tracking_docs.append(mock_doc)

        mock_db.return_value.collection.return_value.document.return_value.collection.return_value.order_by.return_value.limit.return_value.get.return_value = mock_tracking_docs

        mock_generate.return_value = "Your overall health score is 85/100..."

        result = await integrations_service.get_health_assessment()

        assert "assessment" in result
        assert "data_points_analyzed" in result
        assert "assessment_date" in result
        assert result["data_points_analyzed"] == 7

def test_notification_service_fcm_token_update(mock_user, mock_fcm_token):
    """Test FCM token update."""
    with patch('app.services.notification_service.get_firestore_client') as mock_db:
        mock_db.return_value.collection.return_value.document.return_value.update.return_value = None

        import asyncio
        result = asyncio.run(notification_service.update_fcm_token(
            mock_user["uid"],
            mock_fcm_token
        ))

        assert result is True
        mock_db.return_value.collection.return_value.document.return_value.update.assert_called_once()

def test_notification_service_mark_read(mock_user):
    """Test marking notification as read."""
    with patch('app.services.notification_service.get_firestore_client') as mock_db:
        mock_db.return_value.collection.return_value.document.return_value.collection.return_value.document.return_value.update.return_value = None

        import asyncio
        result = asyncio.run(notification_service.mark_notification_read(
            mock_user["uid"],
            "notification_id_123"
        ))

        assert result is True

@pytest.mark.asyncio
async def test_notification_service_get_unread(mock_user):
    """Test getting unread notifications."""
    with patch('app.services.notification_service.get_firestore_client') as mock_db:
        mock_docs = [
            Mock(to_dict=Mock(return_value={
                "id": "notif_1",
                "title": "Test Notification",
                "read_at": None
            }))
        ]
        mock_db.return_value.collection.return_value.document.return_value.collection.return_value.where.return_value.order_by.return_value.get.return_value = mock_docs

        result = await notification_service.get_unread_notifications(mock_user["uid"])

        assert len(result) == 1
        assert result[0]["title"] == "Test Notification"

@pytest.mark.asyncio
async def test_integrations_service_research_papers():
    """Test research papers retrieval."""
    with patch.object(integrations_service, 'search_web') as mock_search:
        mock_search.return_value = [
            {
                "title": "Effects of HIIT on Cardiovascular Health",
                "description": "A systematic review of high-intensity interval training effects.",
                "url": "https://pubmed.ncbi.nlm.nih.gov/123456/"
            }
        ]

        papers = await integrations_service.get_research_papers(
            "HIIT cardiovascular benefits",
            1
        )

        assert len(papers) == 1
        assert papers[0]["title"] == "Effects of HIIT on Cardiovascular Health"
        assert "topic" in papers[0]