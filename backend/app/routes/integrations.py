"""
Integrations API routes for Blinderfit Backend
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field
import json

from app.core.database import db_service
from app.routes.auth import get_current_user

router = APIRouter(tags=["integrations"])


def _get_svc():
    """Lazy import integrations service"""
    from app.services.integrations_service import integrations_service
    return integrations_service


class WebSearchRequest(BaseModel):
    query: str = Field(..., description="Search query")
    num_results: int = Field(5, ge=1, le=20)


class NutritionRequest(BaseModel):
    food_item: str = Field(..., description="Food item to search for")


class ExerciseRequest(BaseModel):
    exercise_name: str = Field(..., description="Exercise name to search for")


class WearableSyncRequest(BaseModel):
    access_token: str = Field(..., description="OAuth access token")
    provider: str = Field(..., description="Wearable provider (fitbit, garmin)")


class WeatherRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class TrendAnalysisRequest(BaseModel):
    data_type: str = Field(..., description="Type of data to analyze")


class ResearchRequest(BaseModel):
    topic: str = Field(..., description="Research topic")
    limit: int = Field(5, ge=1, le=10)


@router.post("/web-search")
async def search_web(request: WebSearchRequest, current_user: str = Depends(get_current_user)):
    try:
        svc = _get_svc()
        return await svc.search_web(query=request.query, num_results=request.num_results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/nutrition-info")
async def get_nutrition_info(request: NutritionRequest, current_user: str = Depends(get_current_user)):
    try:
        svc = _get_svc()
        return await svc.get_nutrition_info(food_item=request.food_item)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/exercise-info")
async def get_exercise_info(request: ExerciseRequest, current_user: str = Depends(get_current_user)):
    try:
        svc = _get_svc()
        return await svc.get_exercise_info(exercise_name=request.exercise_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/wearable-sync")
async def sync_wearable_data(request: WearableSyncRequest, current_user: str = Depends(get_current_user)):
    try:
        svc = _get_svc()
        if request.provider.lower() == "fitbit":
            data = await svc.sync_fitbit_data(user_id=current_user, access_token=request.access_token)
        elif request.provider.lower() == "garmin":
            data = await svc.sync_garmin_data(user_id=current_user, access_token=request.access_token)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported provider: {request.provider}")
        if not data:
            raise HTTPException(status_code=500, detail="Failed to sync wearable data")
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/weather")
async def get_weather_data(request: WeatherRequest, current_user: str = Depends(get_current_user)):
    try:
        svc = _get_svc()
        return await svc.get_weather_data(latitude=request.latitude, longitude=request.longitude)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health-news")
async def get_health_news(limit: int = Query(5, ge=1, le=20), current_user: str = Depends(get_current_user)):
    try:
        svc = _get_svc()
        return await svc.get_health_news(limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-trends")
async def analyze_trends(request: TrendAnalysisRequest, current_user: str = Depends(get_current_user)):
    try:
        svc = _get_svc()
        return await svc.analyze_trends(user_id=current_user, data_type=request.data_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/research-papers")
async def get_research_papers(request: ResearchRequest, current_user: str = Depends(get_current_user)):
    try:
        svc = _get_svc()
        return await svc.get_research_papers(topic=request.topic, limit=request.limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/wearable-history")
async def get_wearable_history(provider: Optional[str] = Query(None), limit: int = Query(10, ge=1, le=100), current_user: str = Depends(get_current_user)):
    try:
        svc = _get_svc()
        return await svc.get_integration_history(user_id=current_user, integration_type=f"wearable_{provider}" if provider else None, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/integration-history")
async def get_integration_history(integration_type: Optional[str] = Query(None), limit: int = Query(10, ge=1, le=100), current_user: str = Depends(get_current_user)):
    try:
        svc = _get_svc()
        return await svc.get_integration_history(user_id=current_user, integration_type=integration_type, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/meal-suggestions")
async def get_meal_suggestions(preferences: Dict[str, Any], current_user: str = Depends(get_current_user)):
    try:
        user_data = db_service.get_user(current_user) or {}
        dietary_restrictions = user_data.get('dietary_restrictions', [])
        allergies = user_data.get('allergies', [])
        cuisine_preferences = user_data.get('cuisine_preferences', [])

        from app.services.gemini_service import gemini_service
        prompt = f"""Generate 3 meal suggestions based on:
        Dietary Restrictions: {', '.join(dietary_restrictions) if dietary_restrictions else 'None'}
        Allergies: {', '.join(allergies) if allergies else 'None'}
        Cuisine Preferences: {', '.join(cuisine_preferences) if cuisine_preferences else 'Any'}
        Additional Preferences: {json.dumps(preferences)}
        Each with: name, ingredients, instructions, calories/macros, and why it fits."""

        suggestions = await gemini_service.generate_content(prompt)
        return {"suggestions": suggestions, "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/workout-plan")
async def generate_workout_plan(goals: Dict[str, Any], current_user: str = Depends(get_current_user)):
    try:
        user_data = db_service.get_user(current_user) or {}

        from app.services.gemini_service import gemini_service
        prompt = f"""Create a personalized workout plan:
        Fitness Level: {user_data.get('fitness_level', 'beginner')}
        Goals: {', '.join(user_data.get('fitness_goals', ['General fitness']))}
        Equipment: {', '.join(user_data.get('available_equipment', ['Bodyweight only']))}
        Additional: {json.dumps(goals)}
        Include weekly schedule, exercises, sets/reps, warm-up/cool-down."""

        plan = await gemini_service.generate_content(prompt)
        return {"workout_plan": plan, "fitness_level": user_data.get('fitness_level', 'beginner'), "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/health-assessment")
async def comprehensive_health_assessment(current_user: str = Depends(get_current_user)):
    try:
        user_data = db_service.get_user(current_user) or {}
        tracking_data = db_service.query_user_docs(current_user, "tracking", order_by="date", order_dir="DESC", limit_count=7)

        from app.services.gemini_service import gemini_service
        prompt = f"""Comprehensive health assessment:
        Age: {user_data.get('age', 'Unknown')}, Gender: {user_data.get('gender', 'Unknown')}
        Height: {user_data.get('height', 'Unknown')}, Weight: {user_data.get('weight', 'Unknown')}
        Activity: {user_data.get('activity_level', 'Unknown')}
        Conditions: {', '.join(user_data.get('health_conditions', []))}
        Recent tracking (7 days): {json.dumps(tracking_data, indent=2, default=str)}
        Provide: health score, strengths, recommendations, risk assessment, 30-day plan."""

        assessment = await gemini_service.generate_content(prompt)
        return {"assessment": assessment, "data_points_analyzed": len(tracking_data), "assessment_date": datetime.utcnow().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
