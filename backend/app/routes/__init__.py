"""
Routes package for Blinderfit Backend
"""

from .auth import router as auth_router
from .onboarding import router as onboarding_router
from .ai_chat import router as ai_chat_router
from .plans import router as plans_router
from .tracking import router as tracking_router
from .dashboard import router as dashboard_router
from .ml_predictions import router as ml_predictions_router
from .notifications import router as notifications_router
from .integrations import router as integrations_router

# Re-export routers for main.py
auth = auth_router
onboarding = onboarding_router
ai_chat = ai_chat_router
plans = plans_router
tracking = tracking_router
dashboard = dashboard_router
ml_predictions = ml_predictions_router
notifications = notifications_router
integrations = integrations_router