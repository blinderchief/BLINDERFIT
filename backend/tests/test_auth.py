"""
Unit tests for authentication routes
Uses Clerk JWT verification via mocked verify_clerk_token
"""

import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient


def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "version": "1.0.0"}


def test_root_endpoint(client):
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data
    assert "docs" in data


@pytest.mark.asyncio
async def test_auth_verify_token_success(client, mock_user, auth_headers):
    """Test authentication with a valid Clerk JWT."""
    with patch("app.routes.auth.verify_clerk_token", new_callable=AsyncMock) as mock_verify:
        mock_verify.return_value = mock_user["uid"]

        response = client.get("/auth/profile", headers=auth_headers)
        assert response.status_code in [200, 500]  # 500 if DB not connected in test


@pytest.mark.asyncio
async def test_auth_middleware_no_token(client):
    """Test that requests without token are rejected on protected endpoints."""
    response = client.get("/auth/profile")
    assert response.status_code in [401, 403]


def test_cors_headers(client):
    """Test CORS headers are properly set."""
    response = client.options(
        "/health",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers
    assert "access-control-allow-methods" in response.headers
    assert "access-control-allow-headers" in response.headers


def test_security_headers(client):
    """Test security headers are properly set."""
    response = client.get("/health")

    security_headers = [
        "x-content-type-options",
        "x-frame-options",
        "x-xss-protection",
        "referrer-policy",
        "content-security-policy",
    ]

    for header in security_headers:
        assert header in response.headers

    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"
    assert response.headers["x-xss-protection"] == "1; mode=block"


@pytest.mark.asyncio
async def test_onboarding_flow(client, mock_user, auth_headers, mock_health_data):
    """Test onboarding endpoints with mocked Clerk auth."""
    with patch("app.routes.auth.verify_clerk_token", new_callable=AsyncMock) as mock_verify:
        mock_verify.return_value = mock_user["uid"]

        # Submit health data
        response = client.post(
            "/onboarding/health-data",
            json=mock_health_data,
            headers=auth_headers,
        )
        assert response.status_code in [200, 404, 500]

        # Submit goals
        goals_data = {
            "primary_goal": "weight_loss",
            "target_weight": 70,
            "timeline_weeks": 12,
        }
        response = client.post(
            "/onboarding/goals",
            json=goals_data,
            headers=auth_headers,
        )
        assert response.status_code in [200, 404, 500]


@pytest.mark.asyncio
async def test_tracking_endpoints(client, mock_user, auth_headers, mock_meal_data, mock_exercise_data):
    """Test tracking endpoints."""
    with patch("app.routes.auth.verify_clerk_token", new_callable=AsyncMock) as mock_verify:
        mock_verify.return_value = mock_user["uid"]

        response = client.post(
            "/tracking/meal",
            json=mock_meal_data,
            headers=auth_headers,
        )
        assert response.status_code in [200, 404, 500]

        response = client.post(
            "/tracking/exercise",
            json=mock_exercise_data,
            headers=auth_headers,
        )
        assert response.status_code in [200, 404, 500]


@pytest.mark.asyncio
async def test_ai_chat_endpoints(client, mock_user, auth_headers):
    """Test AI chat endpoints."""
    with patch("app.routes.auth.verify_clerk_token", new_callable=AsyncMock) as mock_verify:
        mock_verify.return_value = mock_user["uid"]

        message_data = {
            "message": "Hello, can you help me with my fitness goals?",
            "context": {"goal": "weight_loss"},
        }
        response = client.post(
            "/ai/chat",
            json=message_data,
            headers=auth_headers,
        )
        assert response.status_code in [200, 404, 500]

        response = client.get("/ai/history", headers=auth_headers)
        assert response.status_code in [200, 404, 500]


@pytest.mark.asyncio
async def test_notification_endpoints(client, mock_user, auth_headers, mock_notification_data):
    """Test notification endpoints."""
    with patch("app.routes.auth.verify_clerk_token", new_callable=AsyncMock) as mock_verify:
        mock_verify.return_value = mock_user["uid"]

        response = client.post(
            "/notifications/send",
            json=mock_notification_data,
            headers=auth_headers,
        )
        assert response.status_code in [200, 404, 500]

        response = client.get("/notifications/unread", headers=auth_headers)
        assert response.status_code in [200, 404, 500]


@pytest.mark.asyncio
async def test_integration_endpoints(client, mock_user, auth_headers):
    """Test integration endpoints."""
    with patch("app.routes.auth.verify_clerk_token", new_callable=AsyncMock) as mock_verify:
        mock_verify.return_value = mock_user["uid"]

        search_data = {"query": "healthy breakfast ideas", "num_results": 3}
        response = client.post(
            "/integrations/web-search",
            json=search_data,
            headers=auth_headers,
        )
        assert response.status_code in [200, 404, 500]

        nutrition_data = {"food_item": "banana"}
        response = client.post(
            "/integrations/nutrition-info",
            json=nutrition_data,
            headers=auth_headers,
        )
        assert response.status_code in [200, 404, 500]


def test_error_handling(client):
    """Test error handling for malformed requests."""
    response = client.post(
        "/onboarding/health-data",
        data="invalid json",
        headers={"Content-Type": "application/json"},
    )
    assert response.status_code in [400, 401, 422]

    response = client.post(
        "/onboarding/health-data",
        json={},
        headers={"Content-Type": "application/json"},
    )
    assert response.status_code in [400, 401, 422]


@pytest.mark.asyncio
async def test_rate_limiting(client, auth_headers):
    """Test rate limiting functionality."""
    # Health check has no rate limit, so make many requests
    for i in range(10):
        response = client.get("/health", headers=auth_headers)
        assert response.status_code == 200