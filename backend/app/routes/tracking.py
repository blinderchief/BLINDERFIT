"""
Tracking routes for daily health monitoring
"""

from fastapi import APIRouter, Depends, HTTPException, status
import logging
from datetime import datetime, date, timedelta
from typing import Dict, Any, List
import uuid

from app.core.database import db_service
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
        compliance_score = calculate_compliance_score(request)

        tracking_data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "date": request.date.isoformat(),
            "weight_kg": request.weight_kg,
            "meals": [m.dict() if hasattr(m, 'dict') else m for m in (request.meals or [])],
            "exercises": [e.dict() if hasattr(e, 'dict') else e for e in (request.exercises or [])],
            "water_intake_ml": request.water_intake_ml,
            "steps_count": request.steps_count,
            "sleep_hours": request.sleep_hours,
            "mood_rating": request.mood_rating,
            "energy_level": request.energy_level,
            "compliance_score": compliance_score,
            "notes": request.notes,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

        db_service.set_user_doc(user_id, "tracking", request.date.isoformat(), tracking_data)

        insights = None
        if compliance_score < 70:
            insights = await generate_tracking_insights(user_id, tracking_data)

        return APIResponse(
            success=True,
            message="Daily tracking submitted successfully",
            data={
                "tracking_id": tracking_data["id"],
                "date": request.date.isoformat(),
                "compliance_score": compliance_score,
                "insights": insights,
                "next_steps": generate_next_steps(compliance_score)
            }
        )
    except Exception as e:
        logger.error(f"Daily tracking submission error: {e}")
        raise HTTPException(status_code=500, detail="Daily tracking submission failed")

@router.get("/daily/{date}", response_model=APIResponse)
async def get_daily_tracking(date: date, user_id: str = Depends(get_current_user)):
    """Get daily tracking data for a specific date"""
    try:
        tracking_data = db_service.get_user_doc(user_id, "tracking", date.isoformat())
        if not tracking_data:
            return APIResponse(success=True, message="No tracking data found for this date", data=None)
        return APIResponse(success=True, message="Daily tracking data retrieved successfully", data=tracking_data)
    except Exception as e:
        logger.error(f"Error getting daily tracking: {e}")
        raise HTTPException(status_code=500, detail="Failed to get daily tracking data")

@router.put("/daily/{date}", response_model=APIResponse)
async def update_daily_tracking(date: date, updates: Dict[str, Any], user_id: str = Depends(get_current_user)):
    """Update daily tracking data"""
    try:
        updates['updated_at'] = datetime.utcnow().isoformat()

        if any(k in updates for k in ('meals', 'exercises', 'water_intake_ml', 'steps_count')):
            current_data = db_service.get_user_doc(user_id, "tracking", date.isoformat())
            if current_data:
                for key, value in updates.items():
                    current_data[key] = value
                try:
                    mock_request = TrackingRequest(**current_data)
                    updates['compliance_score'] = calculate_compliance_score(mock_request)
                except Exception:
                    pass

        db_service.update_user_doc(user_id, "tracking", date.isoformat(), updates)
        return APIResponse(success=True, message="Daily tracking updated successfully")
    except Exception as e:
        logger.error(f"Error updating daily tracking: {e}")
        raise HTTPException(status_code=500, detail="Failed to update daily tracking")

@router.get("/history", response_model=APIResponse)
async def get_tracking_history(days: int = 7, user_id: str = Depends(get_current_user)):
    """Get tracking history for the last N days"""
    try:
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=days-1)

        tracking_history = []
        current_date = start_date
        while current_date <= end_date:
            tracking_data = db_service.get_user_doc(user_id, "tracking", current_date.isoformat())
            if tracking_data:
                tracking_history.append(tracking_data)
            else:
                tracking_history.append({
                    "date": current_date.isoformat(),
                    "compliance_score": 0,
                    "meals": [], "exercises": [],
                    "water_intake_ml": 0, "steps_count": 0
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
        raise HTTPException(status_code=500, detail="Failed to get tracking history")

@router.get("/stats", response_model=APIResponse)
async def get_tracking_stats(period: str = "week", user_id: str = Depends(get_current_user)):
    """Get tracking statistics for a period"""
    try:
        end_date = datetime.utcnow().date()
        days_map = {"week": 6, "month": 29, "quarter": 89}
        start_date = end_date - timedelta(days=days_map.get(period, 6))

        tracking_data = []
        current_date = start_date
        while current_date <= end_date:
            doc = db_service.get_user_doc(user_id, "tracking", current_date.isoformat())
            if doc:
                tracking_data.append(doc)
            current_date += timedelta(days=1)

        stats = calculate_tracking_stats(tracking_data)

        return APIResponse(
            success=True,
            message="Tracking statistics retrieved successfully",
            data={"period": period, "start_date": start_date.isoformat(), "end_date": end_date.isoformat(), "stats": stats}
        )
    except Exception as e:
        logger.error(f"Error getting tracking stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get tracking statistics")

@router.post("/meal", response_model=APIResponse)
async def log_meal(meal_log: MealLog, user_id: str = Depends(get_current_user)):
    """Log a meal entry"""
    try:
        today = datetime.utcnow().date()
        current_data = db_service.get_user_doc(user_id, "tracking", today.isoformat())
        current_meals = current_data.get('meals', []) if current_data else []
        current_meals.append(meal_log.dict())

        db_service.set_user_doc(user_id, "tracking", today.isoformat(), {
            'user_id': user_id,
            'date': today.isoformat(),
            'meals': current_meals,
            'updated_at': datetime.utcnow().isoformat(),
            **(current_data or {})
        })

        return APIResponse(success=True, message="Meal logged successfully", data={"meal_logged": meal_log.dict(), "total_meals_today": len(current_meals)})
    except Exception as e:
        logger.error(f"Error logging meal: {e}")
        raise HTTPException(status_code=500, detail="Failed to log meal")

@router.post("/exercise", response_model=APIResponse)
async def log_exercise(exercise_log: ExerciseLog, user_id: str = Depends(get_current_user)):
    """Log an exercise entry"""
    try:
        today = datetime.utcnow().date()
        current_data = db_service.get_user_doc(user_id, "tracking", today.isoformat())
        current_exercises = current_data.get('exercises', []) if current_data else []
        current_exercises.append(exercise_log.dict())

        db_service.set_user_doc(user_id, "tracking", today.isoformat(), {
            'user_id': user_id,
            'date': today.isoformat(),
            'exercises': current_exercises,
            'updated_at': datetime.utcnow().isoformat(),
            **(current_data or {})
        })

        return APIResponse(success=True, message="Exercise logged successfully", data={"exercise_logged": exercise_log.dict(), "total_exercises_today": len(current_exercises)})
    except Exception as e:
        logger.error(f"Error logging exercise: {e}")
        raise HTTPException(status_code=500, detail="Failed to log exercise")

def calculate_compliance_score(request: TrackingRequest) -> float:
    """Calculate compliance score based on tracking data"""
    score = 0.0
    if request.meals:
        meals_logged = len(request.meals)
        score += 40 if meals_logged >= 3 else (30 if meals_logged >= 2 else (20 if meals_logged >= 1 else 0))
    if request.exercises:
        exercise_minutes = sum(ex.duration_minutes for ex in request.exercises)
        score += 30 if exercise_minutes >= 60 else (20 if exercise_minutes >= 30 else (10 if exercise_minutes >= 15 else 0))
    if request.water_intake_ml >= 2000:
        score += 15
    elif request.water_intake_ml >= 1500:
        score += 10
    elif request.water_intake_ml >= 1000:
        score += 5
    if request.steps_count >= 8000:
        score += 15
    elif request.steps_count >= 6000:
        score += 10
    elif request.steps_count >= 4000:
        score += 5
    return min(score, 100.0)

def calculate_average_compliance(tracking_history: List[Dict[str, Any]]) -> float:
    if not tracking_history:
        return 0.0
    scores = [e.get('compliance_score', 0) for e in tracking_history if e.get('compliance_score', 0) > 0]
    return sum(scores) / len(scores) if scores else 0.0

def calculate_tracking_stats(tracking_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not tracking_data:
        return {}
    total_days = len(tracking_data)
    tracked_days = len([d for d in tracking_data if d.get('compliance_score', 0) > 0])
    total_meals = sum(len(d.get('meals', [])) for d in tracking_data)
    total_exercises = sum(len(d.get('exercises', [])) for d in tracking_data)
    total_water = sum(d.get('water_intake_ml', 0) for d in tracking_data)
    total_steps = sum(d.get('steps_count', 0) for d in tracking_data)
    weights = [d.get('weight_kg') for d in tracking_data if d.get('weight_kg')]
    weight_change = (weights[-1] - weights[0]) if len(weights) >= 2 and weights[0] else 0.0

    return {
        "total_days": total_days, "tracked_days": tracked_days,
        "tracking_percentage": (tracked_days / total_days) * 100 if total_days > 0 else 0,
        "average_meals_per_day": total_meals / total_days if total_days > 0 else 0,
        "average_exercises_per_day": total_exercises / total_days if total_days > 0 else 0,
        "average_water_intake_ml": total_water / total_days if total_days > 0 else 0,
        "average_steps_per_day": total_steps / total_days if total_days > 0 else 0,
        "weight_change_kg": weight_change,
        "average_compliance_score": calculate_average_compliance(tracking_data)
    }

async def generate_tracking_insights(user_id: str, tracking_data: Dict[str, Any]) -> Dict[str, Any]:
    try:
        prompt = f"""Analyze this daily tracking data and provide insights:
        Compliance Score: {tracking_data.get('compliance_score', 0)}%
        Meals Logged: {len(tracking_data.get('meals', []))}
        Exercises Logged: {len(tracking_data.get('exercises', []))}
        Water Intake: {tracking_data.get('water_intake_ml', 0)}ml
        Steps: {tracking_data.get('steps_count', 0)}
        Provide: 1. What's working well 2. Areas for improvement 3. Suggestions for tomorrow"""

        response = await gemini_service.generate_response(
            prompt=prompt,
            system_prompt="You are FitMentor analyzing a user's daily tracking data. Provide encouraging, actionable insights.",
            temperature=0.6, max_tokens=500
        )
        return {"insights": response, "generated_at": datetime.utcnow().isoformat()}
    except Exception as e:
        logger.error(f"Error generating tracking insights: {e}")
        return {"insights": "Keep up the good work! Every step counts.", "generated_at": datetime.utcnow().isoformat()}

def generate_next_steps(compliance_score: float) -> List[str]:
    if compliance_score >= 90:
        return ["Great job! Maintain this consistency.", "Consider adding variety to your meals.", "Try a new exercise routine."]
    elif compliance_score >= 70:
        return ["Good progress! Focus on consistency.", "Try logging meals right after eating.", "Set reminders for exercise sessions."]
    else:
        return ["Start small - log one meal today.", "Take a 10-minute walk.", "Set a specific time for daily tracking.", "Progress over perfection!"]
