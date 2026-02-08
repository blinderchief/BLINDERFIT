"""
Onboarding routes for Blinderfit Backend
"""

from fastapi import APIRouter, Depends, HTTPException, status
import logging
from datetime import datetime
from typing import Dict, Any

from app.core.database import db_service
from app.models import (
    UserOnboarding,
    OnboardingRequest,
    HealthAnalysisResponse,
    APIResponse,
    UserProfile
)
from app.routes.auth import get_current_user
from app.services.gemini_service import gemini_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/complete", response_model=APIResponse)
async def complete_onboarding(request: OnboardingRequest, user_id: str = Depends(get_current_user)):
    """Complete user onboarding with health data and preferences"""
    try:
        onboarding_data = {
            "user_id": user_id,
            "health_data": request.health_data.dict() if hasattr(request.health_data, 'dict') else request.health_data,
            "medical_conditions": request.medical_conditions.dict() if hasattr(request.medical_conditions, 'dict') else request.medical_conditions,
            "dietary_preferences": request.dietary_preferences.dict() if hasattr(request.dietary_preferences, 'dict') else request.dietary_preferences,
            "goals": request.goals.dict() if hasattr(request.goals, 'dict') else request.goals,
            "consent_given": request.consent_given,
            "consent_timestamp": datetime.utcnow().isoformat(),
            "completed_at": datetime.utcnow().isoformat()
        }

        db_service.set_user_doc(user_id, "onboarding", "data", onboarding_data)

        # Update main user document with health data
        user_updates = {
            'height_cm': request.health_data.height_cm,
            'weight_kg': request.health_data.weight_kg,
            'age': request.health_data.age,
            'gender': request.health_data.gender,
            'activity_level': request.health_data.activity_level,
            'bmi': request.health_data.bmi,
            'bmi_category': request.health_data.bmi_category,
            'onboarding_completed': True,
            'updated_at': datetime.utcnow().isoformat()
        }
        db_service.update_user(user_id, user_updates)

        analysis = await generate_health_analysis(user_id, request.health_data.dict() if hasattr(request.health_data, 'dict') else request.health_data)

        return APIResponse(
            success=True,
            message="Onboarding completed successfully",
            data={
                "onboarding_id": "data",
                "health_analysis": analysis,
                "next_steps": [
                    "Complete your first daily tracking",
                    "Chat with FitMentor for personalized advice",
                    "Set up notifications for meal reminders"
                ]
            }
        )
    except Exception as e:
        logger.error(f"Onboarding completion error: {e}")
        raise HTTPException(status_code=500, detail="Onboarding completion failed")

@router.get("/status", response_model=APIResponse)
async def get_onboarding_status(user_id: str = Depends(get_current_user)):
    """Get user's onboarding status"""
    try:
        user_data = db_service.get_user(user_id)
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        if user_data.get('onboarding_completed', False):
            onboarding_data = db_service.get_user_doc(user_id, "onboarding", "data")
            if onboarding_data:
                return APIResponse(success=True, message="Onboarding completed", data={"status": "completed", "onboarding_data": onboarding_data})

        return APIResponse(
            success=True, message="Onboarding not completed",
            data={"status": "pending", "required_steps": ["Health data collection", "Medical conditions", "Dietary preferences", "Goal setting", "Consent agreement"]}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting onboarding status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get onboarding status")

@router.get("/health-analysis", response_model=APIResponse)
async def get_health_analysis(user_id: str = Depends(get_current_user)):
    """Get user's health analysis based on onboarding data"""
    try:
        user_data = db_service.get_user(user_id)
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        if not user_data.get('onboarding_completed'):
            raise HTTPException(status_code=400, detail="Onboarding not completed")

        health_data = {k: user_data.get(k) for k in ('height_cm', 'weight_kg', 'age', 'gender', 'activity_level', 'bmi', 'bmi_category')}
        analysis = await generate_health_analysis(user_id, health_data)
        return APIResponse(success=True, message="Health analysis retrieved successfully", data=analysis)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting health analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to get health analysis")

@router.put("/update", response_model=APIResponse)
async def update_onboarding_data(updates: Dict[str, Any], user_id: str = Depends(get_current_user)):
    """Update user's onboarding data"""
    try:
        allowed_sections = ['health_data', 'medical_conditions', 'dietary_preferences', 'goals']
        filtered_updates = {k: v for k, v in updates.items() if k in allowed_sections}
        if not filtered_updates:
            raise HTTPException(status_code=400, detail="No valid sections to update")

        filtered_updates['updated_at'] = datetime.utcnow().isoformat()
        db_service.update_user_doc(user_id, "onboarding", "data", filtered_updates)

        if 'health_data' in filtered_updates:
            health_data = filtered_updates['health_data']
            health_updates = {k: health_data[k] for k in ('height_cm', 'weight_kg', 'age', 'gender', 'activity_level') if k in health_data}
            if health_updates:
                health_updates['updated_at'] = datetime.utcnow().isoformat()
                db_service.update_user(user_id, health_updates)

        return APIResponse(success=True, message="Onboarding data updated successfully")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating onboarding data: {e}")
        raise HTTPException(status_code=500, detail="Failed to update onboarding data")

async def generate_health_analysis(user_id: str, health_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate health analysis using Gemini AI"""
    try:
        analysis_result = await gemini_service.analyze_health_data(user_data=health_data, analysis_type="bmi_analysis")
        insights = analysis_result.get('insights', '')
        bmi_category = health_data.get('bmi_category', 'normal')
        bmi_value = health_data.get('bmi', 22.0)

        recommendations = ["Maintain a balanced diet with adequate protein", "Stay hydrated", "Get regular exercise", "Monitor your weight regularly", "Consult healthcare professionals"]
        risk_factors = []
        if bmi_category == 'obese':
            risk_factors = ["Increased risk of cardiovascular diseases", "Higher chance of type 2 diabetes", "Joint problems"]
        elif bmi_category == 'underweight':
            risk_factors = ["Nutrient deficiencies", "Weakened immune system", "Osteoporosis risk"]

        return {
            "bmi_category": bmi_category, "bmi_value": bmi_value, "insights": insights,
            "recommendations": recommendations, "risk_factors": risk_factors,
            "next_steps": ["Complete daily health tracking", "Set specific goals", "Consult healthcare professionals", "Start with small changes"]
        }
    except Exception as e:
        logger.error(f"Error generating health analysis: {e}")
        return {
            "bmi_category": health_data.get('bmi_category', 'normal'), "bmi_value": health_data.get('bmi', 22.0),
            "insights": "Basic analysis completed. Consult healthcare professionals for detailed assessment.",
            "recommendations": ["Maintain healthy lifestyle", "Regular exercise", "Balanced nutrition"],
            "risk_factors": [], "next_steps": ["Complete onboarding", "Start tracking", "Set goals"]
        }
