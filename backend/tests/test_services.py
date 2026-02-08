"""
Unit tests for service classes
Matches the actual Clerk/Neon/PostgreSQL service implementations.
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock, MagicMock
from datetime import datetime, timedelta

from app.services.gemini_service import gemini_service
from app.services.notification_service import notification_service
from app.services.integrations_service import integrations_service


# ── Gemini Service ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_gemini_service_generate_content():
    """Test Gemini service content generation via generate_content (alias)."""
    with patch.object(gemini_service, 'generate_response', new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = "This is a test response from Gemini."

        result = await gemini_service.generate_content("Test prompt")

        assert result == "This is a test response from Gemini."
        mock_gen.assert_called_once()


@pytest.mark.asyncio
async def test_gemini_service_generate_response():
    """Test Gemini service generate_response with chat API."""
    mock_chat = MagicMock()
    mock_response = Mock()
    mock_response.text = "Test AI response"
    mock_chat.send_message_async = AsyncMock(return_value=mock_response)

    with patch.object(gemini_service.model, 'start_chat', return_value=mock_chat):
        result = await gemini_service.generate_response("Hello")

        assert result == "Test AI response"
        mock_chat.send_message_async.assert_called_once()


@pytest.mark.asyncio
async def test_gemini_service_analyze_health_data():
    """Test Gemini service health data analysis."""
    with patch.object(gemini_service, 'generate_response', new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = "Your BMI is in the normal range."

        result = await gemini_service.analyze_health_data(
            user_data={"weight": 75, "height": 175},
            analysis_type="bmi_analysis"
        )

        assert "analysis_type" in result
        assert result["analysis_type"] == "bmi_analysis"
        assert "insights" in result


@pytest.mark.asyncio
async def test_gemini_service_search_web():
    """Test Gemini service web search."""
    with patch.object(gemini_service, 'search_web_with_gemini', new_callable=AsyncMock) as mock_gwg, \
         patch.object(gemini_service, 'search_web_with_knowledge', new_callable=AsyncMock) as mock_gwk:
        expected = [{"title": "Healthy Eating", "url": "https://example.com", "description": "Guide"}]
        mock_gwg.return_value = expected
        mock_gwk.return_value = expected

        results = await gemini_service.search_web("healthy eating", 1)

        assert len(results) == 1
        assert results[0]["title"] == "Healthy Eating"


# ── Notification Service ──────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_notification_service_send_notification(mock_user, mock_db_service):
    """Test notification service send notification."""
    with patch('app.services.notification_service.db_service', mock_db_service):
        result = await notification_service.send_notification(
            user_id=mock_user["uid"],
            title="Test Notification",
            message="Test message",
            notification_type="test"
        )

        assert result is not None
        assert isinstance(result, str)
        mock_db_service.set_user_doc.assert_called_once()


@pytest.mark.asyncio
async def test_notification_service_meal_reminder(mock_user, mock_db_service):
    """Test meal reminder notification."""
    with patch('app.services.notification_service.db_service', mock_db_service):
        result = await notification_service.send_meal_reminder(
            user_id=mock_user["uid"],
            meal_type="breakfast"
        )

        assert result is not None
        call_args = mock_db_service.set_user_doc.call_args
        notification_data = call_args[0][3]  # fourth positional arg is the data dict
        assert "Breakfast" in notification_data["title"]


@pytest.mark.asyncio
async def test_notification_service_exercise_reminder(mock_user, mock_db_service):
    """Test exercise reminder notification."""
    with patch('app.services.notification_service.db_service', mock_db_service):
        result = await notification_service.send_exercise_reminder(mock_user["uid"])

        assert result is not None
        call_args = mock_db_service.set_user_doc.call_args
        notification_data = call_args[0][3]
        assert notification_data["type"] == "exercise_reminder"


@pytest.mark.asyncio
async def test_notification_service_mark_read(mock_user, mock_db_service):
    """Test marking notification as read."""
    with patch('app.services.notification_service.db_service', mock_db_service):
        result = await notification_service.mark_notification_read(
            mock_user["uid"], "notification_id_123"
        )

        assert result is True
        mock_db_service.update_user_doc.assert_called_once()


@pytest.mark.asyncio
async def test_notification_service_get_unread(mock_user, mock_db_service):
    """Test getting unread notifications."""
    mock_db_service.query_user_docs.return_value = [
        {"id": "notif_1", "title": "Test", "read_at": None},
        {"id": "notif_2", "title": "Read", "read_at": "2024-01-15T10:00:00Z"},
    ]

    with patch('app.services.notification_service.db_service', mock_db_service):
        result = await notification_service.get_unread_notifications(mock_user["uid"])

        assert len(result) == 1
        assert result[0]["id"] == "notif_1"


@pytest.mark.asyncio
async def test_notification_service_schedule_daily(mock_user, mock_db_service):
    """Test scheduling daily notifications."""
    mock_db_service.get_user.return_value = {
        "uid": mock_user["uid"],
        "notification_preferences": {
            "meal_reminders": True,
            "exercise_reminders": True,
            "motivational_messages": True,
        },
    }

    with patch('app.services.notification_service.db_service', mock_db_service):
        result = await notification_service.schedule_daily_notifications(mock_user["uid"])

        assert isinstance(result, list)


# ── Integrations Service ──────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_integrations_service_search_web():
    """Test web search functionality."""
    with patch.object(gemini_service, 'search_web_with_gemini', new_callable=AsyncMock) as mock_search:
        mock_search.return_value = [
            {"title": "Healthy Eating Guide", "url": "https://example.com", "description": "Guide"}
        ]

        results = await integrations_service.search_web("healthy eating", 1)

        assert len(results) == 1
        assert results[0]["title"] == "Healthy Eating Guide"


@pytest.mark.asyncio
async def test_integrations_service_nutrition_info():
    """Test nutrition information retrieval."""
    with patch.object(integrations_service, 'search_web', new_callable=AsyncMock) as mock_search, \
         patch.object(gemini_service, 'generate_content', new_callable=AsyncMock) as mock_gen:
        mock_search.return_value = [{"title": "Apple Nutrition", "description": "95 cal"}]
        mock_gen.return_value = '{"calories": 95, "protein": 0.5}'

        result = await integrations_service.get_nutrition_info("apple")

        assert result["food_item"] == "apple"
        assert "nutrition" in result


@pytest.mark.asyncio
async def test_integrations_service_exercise_info():
    """Test exercise information retrieval."""
    with patch.object(integrations_service, 'search_web', new_callable=AsyncMock) as mock_search, \
         patch.object(gemini_service, 'generate_content', new_callable=AsyncMock) as mock_gen:
        mock_search.return_value = [{"title": "Squats Form", "description": "How to squat"}]
        mock_gen.return_value = "Squats target quads, hamstrings, and glutes."

        result = await integrations_service.get_exercise_info("squats")

        assert result["exercise"] == "squats"
        assert "information" in result


@pytest.mark.asyncio
async def test_integrations_service_fitbit_sync(mock_user):
    """Test Fitbit data synchronization."""
    mock_response = Mock()
    mock_response.raise_for_status.return_value = None

    # Different responses for different endpoints
    activities_data = {"summary": {"steps": 8500, "caloriesOut": 2100, "distances": [{"distance": 6.2}], "veryActiveMinutes": 45}}
    sleep_data = {"summary": {"totalMinutesAsleep": 420}}
    hr_data = {"activities-heart": [{"value": {"heartRateZones": []}}]}

    call_count = 0
    async def mock_get(*args, **kwargs):
        nonlocal call_count
        call_count += 1
        resp = Mock()
        resp.raise_for_status.return_value = None
        if call_count == 1:
            resp.json.return_value = activities_data
        elif call_count == 2:
            resp.json.return_value = sleep_data
        else:
            resp.json.return_value = hr_data
        return resp

    mock_client = AsyncMock()
    mock_client.__aenter__.return_value.get = mock_get

    with patch('app.services.integrations_service.httpx.AsyncClient', return_value=mock_client), \
         patch('app.services.integrations_service.db_service') as mock_db:
        result = await integrations_service.sync_fitbit_data(
            user_id=mock_user["uid"],
            access_token="mock_access_token"
        )

        assert result["steps"] == 8500
        assert result["calories"] == 2100


@pytest.mark.asyncio
async def test_integrations_service_weather_data():
    """Test weather data retrieval with API key set."""
    mock_response = Mock()
    mock_response.raise_for_status.return_value = None
    mock_response.json.return_value = {
        "main": {"temp": 22.5, "humidity": 65},
        "weather": [{"description": "clear sky"}],
        "wind": {"speed": 3.2},
        "name": "New York"
    }

    mock_client = AsyncMock()
    mock_client.__aenter__.return_value.get = AsyncMock(return_value=mock_response)

    with patch('app.services.integrations_service.httpx.AsyncClient', return_value=mock_client), \
         patch.dict('os.environ', {"OPENWEATHERMAP_API_KEY": "test_key"}):
        result = await integrations_service.get_weather_data(40.7128, -74.0060)

        assert result["temperature"] == 22.5
        assert result["location"] == "New York"


@pytest.mark.asyncio
async def test_integrations_service_health_news():
    """Test health news retrieval."""
    with patch.object(integrations_service, 'search_web', new_callable=AsyncMock) as mock_search:
        mock_search.return_value = [
            {"title": "Mediterranean Diet Study", "description": "Benefits for heart.", "url": "https://example.com"}
        ]

        news = await integrations_service.get_health_news(1)

        assert len(news) == 1
        assert news[0]["title"] == "Mediterranean Diet Study"
        assert "timestamp" in news[0]


@pytest.mark.asyncio
async def test_integrations_service_analyze_trends(mock_user):
    """Test health trend analysis."""
    with patch('app.services.integrations_service.db_service') as mock_db, \
         patch.object(gemini_service, 'generate_content', new_callable=AsyncMock) as mock_gen:
        mock_db.query_user_docs.return_value = [
            {"date": f"2024-01-{15-i}", "weight": 75 - i * 0.2} for i in range(7)
        ]
        mock_gen.return_value = "Weight trending downward by 0.2kg per day."

        result = await integrations_service.analyze_trends(
            user_id=mock_user["uid"],
            data_type="weight"
        )

        assert result["data_type"] == "weight"
        assert "analysis" in result


@pytest.mark.asyncio
async def test_integrations_service_research_papers():
    """Test research papers retrieval."""
    with patch.object(integrations_service, 'search_web', new_callable=AsyncMock) as mock_search:
        mock_search.return_value = [
            {"title": "HIIT Cardio Study", "description": "Review of HIIT.", "url": "https://pubmed.example.com"}
        ]

        papers = await integrations_service.get_research_papers("HIIT", 1)

        assert len(papers) == 1
        assert papers[0]["title"] == "HIIT Cardio Study"
        assert "topic" in papers[0]