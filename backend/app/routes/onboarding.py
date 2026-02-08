"""
Onboarding routes for Blinderfit Backend
"""

from fastapi import APIRouter, Depends, HTTPException, status
import logging
from datetime import datetime
from typing import Dict, Any

from app.core.database import get_firestore_client
from app.models import (
    UserOnboarding,
    OnboardingRequest,
    HealthAnalysisResponse,
    APIResponse,
    UserProfile
)
from app.routes.auth import get_current_user, get_current_user_profile
from app.services.gemini_service import gemini_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/complete", response_model=APIResponse)
async def complete_onboarding(
    request: OnboardingRequest,
    user_id: str = Depends(get_current_user)
):
    """Complete user onboarding with health data and preferences"""
    try:
        db = get_firestore_client()

        # Create onboarding data
        onboarding_data = UserOnboarding(
            user_id=user_id,
            profile=UserProfile(
                uid=user_id,
                email="",  # Will be filled from auth
                created_at=datetime.utcnow()
            ),
            health_data=request.health_data,
            medical_conditions=request.medical_conditions,
            dietary_preferences=request.dietary_preferences,
            goals=request.goals,
            consent_given=request.consent_given,
            consent_timestamp=datetime.utcnow(),
            completed_at=datetime.utcnow()
        )

        # Save to Firestore
        doc_ref = db.collection('users').document(user_id).collection('onboarding').document('data')
        doc_ref.set(onboarding_data.dict())

        # Also update main user document with health data
        user_updates = {
            'height_cm': request.health_data.height_cm,
            'weight_kg': request.health_data.weight_kg,
            'age': request.health_data.age,
            'gender': request.health_data.gender,
            'activity_level': request.health_data.activity_level,
            'bmi': request.health_data.bmi,
            'bmi_category': request.health_data.bmi_category,
            'onboarding_completed': True,
            'updated_at': datetime.utcnow()
        }
        db.collection('users').document(user_id).update(user_updates)

        # Generate initial health analysis
        analysis = await generate_health_analysis(user_id, request.health_data.dict())

        return APIResponse(
            success=True,
            message="Onboarding completed successfully",
            data={
                "onboarding_id": doc_ref.id,
                "health_analysis": analysis.dict(),
                "next_steps": [
                    "Complete your first daily tracking",
                    "Chat with FitMentor for personalized advice",
                    "Set up notifications for meal reminders"
                ]
            }
        )

    except Exception as e:
        logger.error(f"Onboarding completion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Onboarding completion failed"
        )

@router.get("/status", response_model=APIResponse)
async def get_onboarding_status(user_id: str = Depends(get_current_user)):
    """Get user's onboarding status"""
    try:
        db = get_firestore_client()

        # Check if onboarding is completed
        user_doc = db.collection('users').document(user_id).get()
        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        user_data = user_doc.to_dict()
        onboarding_completed = user_data.get('onboarding_completed', False)

        if onboarding_completed:
            # Get onboarding data
            onboarding_doc = db.collection('users').document(user_id).collection('onboarding').document('data').get()
            if onboarding_doc.exists:
                onboarding_data = onboarding_doc.to_dict()
                return APIResponse(
                    success=True,
                    message="Onboarding completed",
                    data={
                        "status": "completed",
                        "onboarding_data": onboarding_data
                    }
                )

        return APIResponse(
            success=True,
            message="Onboarding not completed",
            data={
                "status": "pending",
                "required_steps": [
                    "Health data collection",
                    "Medical conditions",
                    "Dietary preferences",
                    "Goal setting",
                    "Consent agreement"
                ]
            }
        )

    except Exception as e:
        logger.error(f"Error getting onboarding status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get onboarding status"
        )

@router.get("/health-analysis", response_model=APIResponse)
async def get_health_analysis(user_id: str = Depends(get_current_user)):
    """Get user's health analysis based on onboarding data"""
    try:
        db = get_firestore_client()

        # Get user health data
        user_doc = db.collection('users').document(user_id).get()
        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        user_data = user_doc.to_dict()

        if not user_data.get('onboarding_completed'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Onboarding not completed"
            )

        # Extract health data
        health_data = {
            'height_cm': user_data.get('height_cm'),
            'weight_kg': user_data.get('weight_kg'),
            'age': user_data.get('age'),
            'gender': user_data.get('gender'),
            'activity_level': user_data.get('activity_level'),
            'bmi': user_data.get('bmi'),
            'bmi_category': user_data.get('bmi_category')
        }

        # Generate analysis
        analysis = await generate_health_analysis(user_id, health_data)

        return APIResponse(
            success=True,
            message="Health analysis retrieved successfully",
            data=analysis.dict()
        )

    except Exception as e:
        logger.error(f"Error getting health analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get health analysis"
        )

@router.put("/update", response_model=APIResponse)
async def update_onboarding_data(
    updates: Dict[str, Any],
    user_id: str = Depends(get_current_user)
):
    """Update user's onboarding data"""
    try:
        db = get_firestore_client()

        # Validate updates
        allowed_sections = ['health_data', 'medical_conditions', 'dietary_preferences', 'goals']
        filtered_updates = {k: v for k, v in updates.items() if k in allowed_sections}

        if not filtered_updates:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid sections to update"
            )

        # Add timestamp
        filtered_updates['updated_at'] = datetime.utcnow()

        # Update onboarding document
        doc_ref = db.collection('users').document(user_id).collection('onboarding').document('data')
        doc_ref.update(filtered_updates)

        # Update main user document if health data changed
        if 'health_data' in filtered_updates:
            health_updates = {}
            health_data = filtered_updates['health_data']
            if 'height_cm' in health_data:
                health_updates['height_cm'] = health_data['height_cm']
            if 'weight_kg' in health_data:
                health_updates['weight_kg'] = health_data['weight_kg']
            if 'age' in health_data:
                health_updates['age'] = health_data['age']
            if 'gender' in health_data:
                health_updates['gender'] = health_data['gender']
            if 'activity_level' in health_data:
                health_updates['activity_level'] = health_data['activity_level']

            if health_updates:
                health_updates['updated_at'] = datetime.utcnow()
                db.collection('users').document(user_id).update(health_updates)

        return APIResponse(
            success=True,
            message="Onboarding data updated successfully"
        )

    except Exception as e:
        logger.error(f"Error updating onboarding data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update onboarding data"
        )

async def generate_health_analysis(user_id: str, health_data: Dict[str, Any]) -> HealthAnalysisResponse:
    """Generate health analysis using Gemini AI"""
    try:
        # Use Gemini service to analyze health data
        analysis_result = await gemini_service.analyze_health_data(
            user_data=health_data,
            analysis_type="bmi_analysis"
        )

        # Parse the response to extract structured data
        insights = analysis_result.get('insights', '')

        # Extract BMI category and recommendations from the response
        # This is a simplified parsing - in production, you'd want more sophisticated parsing
        bmi_category = health_data.get('bmi_category', 'normal')
        bmi_value = health_data.get('bmi', 22.0)

        recommendations = [
            "Maintain a balanced diet with adequate protein",
            "Stay hydrated throughout the day",
            "Get regular exercise appropriate for your fitness level",
            "Monitor your weight regularly",
            "Consult healthcare professionals for personalized advice"
        ]

        risk_factors = []
        if bmi_category == 'obese':
            risk_factors.extend([
                "Increased risk of cardiovascular diseases",
                "Higher chance of developing type 2 diabetes",
                "Joint problems and mobility issues"
            ])
        elif bmi_category == 'underweight':
            risk_factors.extend([
                "Nutrient deficiencies",
                "Weakened immune system",
                "Osteoporosis risk"
            ])

        next_steps = [
            "Complete daily health tracking",
            "Set specific, achievable goals",
            "Consult with healthcare professionals",
            "Start with small, sustainable changes"
        ]

        return HealthAnalysisResponse(
            bmi_category=bmi_category,
            bmi_value=bmi_value,
            insights=insights,
            recommendations=recommendations,
            risk_factors=risk_factors,
            next_steps=next_steps
        )

    except Exception as e:
        logger.error(f"Error generating health analysis: {e}")
        # Return basic analysis if AI fails
        return HealthAnalysisResponse(
            bmi_category=health_data.get('bmi_category', 'normal'),
            bmi_value=health_data.get('bmi', 22.0),
            insights="Basic health analysis completed. Please consult healthcare professionals for detailed assessment.",
            recommendations=["Maintain healthy lifestyle", "Regular exercise", "Balanced nutrition"],
            risk_factors=[],
            next_steps=["Complete onboarding", "Start tracking", "Set goals"]
        )