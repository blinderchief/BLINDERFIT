"""
Tracking routes for daily health monitoring
"""

from fastapi import APIRouter, Depends, HTTPException, status
import logging
from datetime import datetime, date, timedelta
from typing import Dict, Any, List
import uuid

from app.core.database import get_firestore_client
from app.models import (
    DailyTracking,
    MealLog,
    ExerciseLog,
    TrackingRequest,
    ComplianceData,
    APIResponse
)
from app.routes.auth import get_current_user
from app.services.gemini_service import gemini_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/daily", response_model=APIResponse)
async def submit_daily_tracking(
    request: TrackingRequest,
    user_id: str = Depends(get_current_user)
):
    """Submit daily health tracking data"""
    try:
        db = get_firestore_client()

        # Calculate compliance score
        compliance_score = calculate_compliance_score(request)

        # Create tracking entry
        tracking_data = DailyTracking(
            id=str(uuid.uuid4()),
            user_id=user_id,
            date=request.date,
            weight_kg=request.weight_kg,
            meals=request.meals,
            exercises=request.exercises,
            water_intake_ml=request.water_intake_ml,
            steps_count=request.steps_count,
            sleep_hours=request.sleep_hours,
            mood_rating=request.mood_rating,
            energy_level=request.energy_level,
            compliance_score=compliance_score,
            notes=request.notes,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        # Save to Firestore
        doc_ref = db.collection('users').document(user_id).collection('tracking').document(request.date.isoformat())
        doc_ref.set(tracking_data.dict())

        # Generate insights if compliance is low
        insights = None
        if compliance_score < 70:
            insights = await generate_tracking_insights(user_id, tracking_data.dict())

        return APIResponse(
            success=True,
            message="Daily tracking submitted successfully",
            data={
                "tracking_id": tracking_data.id,
                "date": request.date.isoformat(),
                "compliance_score": compliance_score,
                "insights": insights,
                "next_steps": generate_next_steps(compliance_score)
            }
        )

    except Exception as e:
        logger.error(f"Daily tracking submission error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Daily tracking submission failed"
        )

@router.get("/daily/{date}", response_model=APIResponse)
async def get_daily_tracking(
    date: date,
    user_id: str = Depends(get_current_user)
):
    """Get daily tracking data for a specific date"""
    try:
        db = get_firestore_client()

        tracking_doc = db.collection('users').document(user_id).collection('tracking').document(date.isoformat()).get()

        if not tracking_doc.exists:
            return APIResponse(
                success=True,
                message="No tracking data found for this date",
                data=None
            )

        tracking_data = tracking_doc.to_dict()

        return APIResponse(
            success=True,
            message="Daily tracking data retrieved successfully",
            data=tracking_data
        )

    except Exception as e:
        logger.error(f"Error getting daily tracking: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get daily tracking data"
        )

@router.put("/daily/{date}", response_model=APIResponse)
async def update_daily_tracking(
    date: date,
    updates: Dict[str, Any],
    user_id: str = Depends(get_current_user)
):
    """Update daily tracking data"""
    try:
        db = get_firestore_client()

        tracking_ref = db.collection('users').document(user_id).collection('tracking').document(date.isoformat())

        # Add timestamp
        updates['updated_at'] = datetime.utcnow()

        # If meals or exercises are being updated, recalculate compliance
        if 'meals' in updates or 'exercises' in updates or 'water_intake_ml' in updates or 'steps_count' in updates:
            # Get current data
            current_doc = tracking_ref.get()
            if current_doc.exists:
                current_data = current_doc.to_dict()
                # Merge updates
                for key, value in updates.items():
                    current_data[key] = value
                # Recalculate compliance
                mock_request = TrackingRequest(**current_data)
                updates['compliance_score'] = calculate_compliance_score(mock_request)

        tracking_ref.update(updates)

        return APIResponse(
            success=True,
            message="Daily tracking updated successfully"
        )

    except Exception as e:
        logger.error(f"Error updating daily tracking: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update daily tracking"
        )

@router.get("/history", response_model=APIResponse)
async def get_tracking_history(
    days: int = 7,
    user_id: str = Depends(get_current_user)
):
    """Get tracking history for the last N days"""
    try:
        db = get_firestore_client()

        # Calculate date range
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=days-1)

        tracking_history = []

        # Get tracking data for each date in range
        current_date = start_date
        while current_date <= end_date:
            tracking_doc = db.collection('users').document(user_id).collection('tracking').document(current_date.isoformat()).get()

            if tracking_doc.exists:
                tracking_data = tracking_doc.to_dict()
                tracking_history.append(tracking_data)
            else:
                # Add empty entry for missing dates
                tracking_history.append({
                    "date": current_date.isoformat(),
                    "compliance_score": 0,
                    "meals": [],
                    "exercises": [],
                    "water_intake_ml": 0,
                    "steps_count": 0
                })

            current_date += timedelta(days=1)

        return APIResponse(
            success=True,
            message="Tracking history retrieved successfully",
            data={
                "tracking_history": tracking_history,
                "total_days": len(tracking_history),
                "average_compliance": calculate_average_compliance(tracking_history)
            }
        )

    except Exception as e:
        logger.error(f"Error getting tracking history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get tracking history"
        )

@router.get("/stats", response_model=APIResponse)
async def get_tracking_stats(
    period: str = "week",  # week, month, quarter
    user_id: str = Depends(get_current_user)
):
    """Get tracking statistics for a period"""
    try:
        db = get_firestore_client()

        # Determine date range
        end_date = datetime.utcnow().date()
        if period == "week":
            start_date = end_date - timedelta(days=6)
        elif period == "month":
            start_date = end_date - timedelta(days=29)
        elif period == "quarter":
            start_date = end_date - timedelta(days=89)
        else:
            start_date = end_date - timedelta(days=6)  # Default to week

        # Get tracking data
        tracking_data = []
        current_date = start_date
        while current_date <= end_date:
            tracking_doc = db.collection('users').document(user_id).collection('tracking').document(current_date.isoformat()).get()
            if tracking_doc.exists:
                tracking_data.append(tracking_doc.to_dict())
            current_date += timedelta(days=1)

        # Calculate statistics
        stats = calculate_tracking_stats(tracking_data)

        return APIResponse(
            success=True,
            message="Tracking statistics retrieved successfully",
            data={
                "period": period,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "stats": stats
            }
        )

    except Exception as e:
        logger.error(f"Error getting tracking stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get tracking statistics"
        )

@router.post("/meal", response_model=APIResponse)
async def log_meal(
    meal_log: MealLog,
    user_id: str = Depends(get_current_user)
):
    """Log a meal entry"""
    try:
        db = get_firestore_client()

        # Get today's tracking document
        today = datetime.utcnow().date()
        tracking_ref = db.collection('users').document(user_id).collection('tracking').document(today.isoformat())

        # Get current tracking data
        tracking_doc = tracking_ref.get()
        if tracking_doc.exists:
            current_data = tracking_doc.to_dict()
            current_meals = current_data.get('meals', [])
        else:
            current_meals = []

        # Add new meal
        current_meals.append(meal_log.dict())

        # Update tracking document
        tracking_ref.set({
            'user_id': user_id,
            'date': today.isoformat(),
            'meals': current_meals,
            'updated_at': datetime.utcnow()
        }, merge=True)

        return APIResponse(
            success=True,
            message="Meal logged successfully",
            data={
                "meal_logged": meal_log.dict(),
                "total_meals_today": len(current_meals)
            }
        )

    except Exception as e:
        logger.error(f"Error logging meal: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to log meal"
        )

@router.post("/exercise", response_model=APIResponse)
async def log_exercise(
    exercise_log: ExerciseLog,
    user_id: str = Depends(get_current_user)
):
    """Log an exercise entry"""
    try:
        db = get_firestore_client()

        # Get today's tracking document
        today = datetime.utcnow().date()
        tracking_ref = db.collection('users').document(user_id).collection('tracking').document(today.isoformat())

        # Get current tracking data
        tracking_doc = tracking_ref.get()
        if tracking_doc.exists:
            current_data = tracking_doc.to_dict()
            current_exercises = current_data.get('exercises', [])
        else:
            current_exercises = []

        # Add new exercise
        current_exercises.append(exercise_log.dict())

        # Update tracking document
        tracking_ref.set({
            'user_id': user_id,
            'date': today.isoformat(),
            'exercises': current_exercises,
            'updated_at': datetime.utcnow()
        }, merge=True)

        return APIResponse(
            success=True,
            message="Exercise logged successfully",
            data={
                "exercise_logged": exercise_log.dict(),
                "total_exercises_today": len(current_exercises)
            }
        )

    except Exception as e:
        logger.error(f"Error logging exercise: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to log exercise"
        )

def calculate_compliance_score(request: TrackingRequest) -> float:
    """Calculate compliance score based on tracking data"""
    score = 0.0
    max_score = 100.0

    # Meals compliance (40 points)
    if request.meals:
        meals_logged = len(request.meals)
        if meals_logged >= 3:
            score += 40
        elif meals_logged >= 2:
            score += 30
        elif meals_logged >= 1:
            score += 20

    # Exercise compliance (30 points)
    if request.exercises:
        exercise_minutes = sum(ex.duration_minutes for ex in request.exercises)
        if exercise_minutes >= 60:
            score += 30
        elif exercise_minutes >= 30:
            score += 20
        elif exercise_minutes >= 15:
            score += 10

    # Water intake compliance (15 points)
    if request.water_intake_ml >= 2000:
        score += 15
    elif request.water_intake_ml >= 1500:
        score += 10
    elif request.water_intake_ml >= 1000:
        score += 5

    # Steps compliance (15 points)
    if request.steps_count >= 8000:
        score += 15
    elif request.steps_count >= 6000:
        score += 10
    elif request.steps_count >= 4000:
        score += 5

    return min(score, max_score)

def calculate_average_compliance(tracking_history: List[Dict[str, Any]]) -> float:
    """Calculate average compliance score"""
    if not tracking_history:
        return 0.0

    total_score = 0.0
    count = 0

    for entry in tracking_history:
        score = entry.get('compliance_score', 0)
        if score > 0:
            total_score += score
            count += 1

    return total_score / count if count > 0 else 0.0

def calculate_tracking_stats(tracking_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calculate comprehensive tracking statistics"""
    if not tracking_data:
        return {}

    total_days = len(tracking_data)
    tracked_days = len([d for d in tracking_data if d.get('compliance_score', 0) > 0])

    # Calculate averages
    total_meals = sum(len(d.get('meals', [])) for d in tracking_data)
    total_exercises = sum(len(d.get('exercises', [])) for d in tracking_data)
    total_water = sum(d.get('water_intake_ml', 0) for d in tracking_data)
    total_steps = sum(d.get('steps_count', 0) for d in tracking_data)

    # Weight change
    weights = [d.get('weight_kg') for d in tracking_data if d.get('weight_kg')]
    weight_change = 0.0
    if len(weights) >= 2:
        weight_change = weights[-1] - weights[0] if weights[0] else 0.0

    return {
        "total_days": total_days,
        "tracked_days": tracked_days,
        "tracking_percentage": (tracked_days / total_days) * 100 if total_days > 0 else 0,
        "average_meals_per_day": total_meals / total_days if total_days > 0 else 0,
        "average_exercises_per_day": total_exercises / total_days if total_days > 0 else 0,
        "average_water_intake_ml": total_water / total_days if total_days > 0 else 0,
        "average_steps_per_day": total_steps / total_days if total_days > 0 else 0,
        "weight_change_kg": weight_change,
        "average_compliance_score": calculate_average_compliance(tracking_data)
    }

async def generate_tracking_insights(user_id: str, tracking_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate insights for low compliance days"""
    try:
        system_prompt = """
        You are FitMentor analyzing a user's daily tracking data. Provide encouraging,
        actionable insights to help improve compliance and health outcomes.
        """

        prompt = f"""
        Analyze this daily tracking data and provide insights:

        Compliance Score: {tracking_data.get('compliance_score', 0)}%
        Meals Logged: {len(tracking_data.get('meals', []))}
        Exercises Logged: {len(tracking_data.get('exercises', []))}
        Water Intake: {tracking_data.get('water_intake_ml', 0)}ml
        Steps: {tracking_data.get('steps_count', 0)}
        Mood Rating: {tracking_data.get('mood_rating', 'Not provided')}
        Energy Level: {tracking_data.get('energy_level', 'Not provided')}

        Provide:
        1. What's working well
        2. Areas for improvement
        3. Specific suggestions for tomorrow
        4. Encouraging message
        """

        response = await gemini_service.generate_response(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.6,
            max_tokens=500
        )

        return {
            "insights": response,
            "generated_at": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Error generating tracking insights: {e}")
        return {
            "insights": "Keep up the good work! Every step counts towards your health goals.",
            "generated_at": datetime.utcnow().isoformat()
        }

def generate_next_steps(compliance_score: float) -> List[str]:
    """Generate next steps based on compliance score"""
    if compliance_score >= 90:
        return [
            "Great job! Maintain this consistency.",
            "Consider adding variety to your meals.",
            "Try a new exercise routine."
        ]
    elif compliance_score >= 70:
        return [
            "Good progress! Focus on consistency.",
            "Try logging meals right after eating.",
            "Set reminders for exercise sessions."
        ]
    else:
        return [
            "Start small - log one meal today.",
            "Take a 10-minute walk to build momentum.",
            "Set a specific time for daily tracking.",
            "Remember: progress over perfection!"
        ]