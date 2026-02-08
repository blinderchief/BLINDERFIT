"""
Plans routes for generating and managing personalized health plans
"""

from fastapi import APIRouter, Depends, HTTPException, status
import logging
from datetime import datetime, date, timedelta
from typing import Dict, Any, List
import uuid

from app.core.database import db_service
from app.models import (
    PersonalizedPlan,
    DailyPlan,
    WeeklyPlan,
    Meal,
    Exercise,
    NutritionItem,
    PlanRequest,
    PlanResponse,
    APIResponse
)
from app.routes.auth import get_current_user
from app.services.gemini_service import gemini_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/generate", response_model=APIResponse)
async def generate_personalized_plan(
    request: PlanRequest,
    user_id: str = Depends(get_current_user)
):
    """Generate a personalized health plan using AI"""
    try:
        user_data = await get_user_data_for_plan(user_id)
        plan_content = await generate_plan_with_ai(user_data, request)

        plan_id = str(uuid.uuid4())
        weekly_plans = await create_weekly_plans(user_data, request.duration_weeks)

        plan_dict = {
            "id": plan_id,
            "user_id": user_id,
            "plan_name": f"Personalized Plan - {datetime.utcnow().strftime('%B %Y')}",
            "duration_weeks": request.duration_weeks,
            "weekly_plans": weekly_plans,
            "overall_goals": user_data.get('goals', {}),
            "generated_by": "ai",
            "version": 1,
            "is_active": True,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

        # Save plan
        db_service.set_user_doc(user_id, "plans", plan_id, plan_dict)

        # Deactivate previous active plans
        previous_plans = db_service.query_user_docs(user_id, "plans", filters={"is_active": True})
        for plan in previous_plans:
            pid = plan.get("_id") or plan.get("id")
            if pid and pid != plan_id:
                db_service.update_user_doc(user_id, "plans", pid, {"is_active": False})

        return APIResponse(
            success=True,
            message="Personalized plan generated successfully",
            data={
                "plan_id": plan_id,
                "plan_name": plan_dict["plan_name"],
                "duration_weeks": request.duration_weeks,
                "generated_at": datetime.utcnow().isoformat(),
                "estimated_success_rate": 0.75,
                "disclaimer": "This is not medical advice. Consult healthcare professionals."
            }
        )
    except Exception as e:
        logger.error(f"Plan generation error: {e}")
        raise HTTPException(status_code=500, detail="Plan generation failed")

@router.get("/current", response_model=APIResponse)
async def get_current_plan(user_id: str = Depends(get_current_user)):
    """Get user's current active plan"""
    try:
        active_plans = db_service.query_user_docs(user_id, "plans", filters={"is_active": True}, limit_count=1)
        if not active_plans:
            return APIResponse(success=True, message="No active plan found", data=None)
        return APIResponse(success=True, message="Current plan retrieved successfully", data=active_plans[0])
    except Exception as e:
        logger.error(f"Error getting current plan: {e}")
        raise HTTPException(status_code=500, detail="Failed to get current plan")

@router.get("/history", response_model=APIResponse)
async def get_plan_history(limit: int = 5, user_id: str = Depends(get_current_user)):
    """Get user's plan history"""
    try:
        plans = db_service.query_user_docs(user_id, "plans", order_by="created_at", order_dir="DESC", limit_count=limit)
        plan_history = [{
            "plan_id": p.get("_id") or p.get("id"),
            "plan_name": p.get("plan_name"),
            "created_at": p.get("created_at"),
            "is_active": p.get("is_active"),
            "duration_weeks": p.get("duration_weeks")
        } for p in plans]

        return APIResponse(success=True, message="Plan history retrieved successfully", data={"plans": plan_history, "total": len(plan_history)})
    except Exception as e:
        logger.error(f"Error getting plan history: {e}")
        raise HTTPException(status_code=500, detail="Failed to get plan history")

@router.get("/{plan_id}", response_model=APIResponse)
async def get_plan_details(plan_id: str, user_id: str = Depends(get_current_user)):
    """Get detailed plan information"""
    try:
        plan_data = db_service.get_user_doc(user_id, "plans", plan_id)
        if not plan_data:
            raise HTTPException(status_code=404, detail="Plan not found")
        return APIResponse(success=True, message="Plan details retrieved successfully", data=plan_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting plan details: {e}")
        raise HTTPException(status_code=500, detail="Failed to get plan details")

@router.put("/{plan_id}/activate", response_model=APIResponse)
async def activate_plan(plan_id: str, user_id: str = Depends(get_current_user)):
    """Activate a specific plan"""
    try:
        plan_data = db_service.get_user_doc(user_id, "plans", plan_id)
        if not plan_data:
            raise HTTPException(status_code=404, detail="Plan not found")

        # Deactivate all plans
        all_plans = db_service.query_user_docs(user_id, "plans")
        for plan in all_plans:
            pid = plan.get("_id") or plan.get("id")
            if pid:
                db_service.update_user_doc(user_id, "plans", pid, {"is_active": False, "updated_at": datetime.utcnow().isoformat()})

        # Activate selected
        db_service.update_user_doc(user_id, "plans", plan_id, {"is_active": True, "updated_at": datetime.utcnow().isoformat()})

        return APIResponse(success=True, message="Plan activated successfully")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error activating plan: {e}")
        raise HTTPException(status_code=500, detail="Failed to activate plan")

@router.delete("/{plan_id}", response_model=APIResponse)
async def delete_plan(plan_id: str, user_id: str = Depends(get_current_user)):
    """Delete a plan"""
    try:
        plan_data = db_service.get_user_doc(user_id, "plans", plan_id)
        if plan_data and plan_data.get("is_active"):
            raise HTTPException(status_code=400, detail="Cannot delete active plan")
        db_service.delete_user_doc(user_id, "plans", plan_id)
        return APIResponse(success=True, message="Plan deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting plan: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete plan")

@router.get("/daily/{date}", response_model=APIResponse)
async def get_daily_plan(date: date, user_id: str = Depends(get_current_user)):
    """Get plan for a specific date"""
    try:
        active_plans = db_service.query_user_docs(user_id, "plans", filters={"is_active": True}, limit_count=1)
        if not active_plans:
            raise HTTPException(status_code=404, detail="No active plan found")

        plan_data = active_plans[0]
        weekly_plans = plan_data.get('weekly_plans', [])

        target_daily_plan = None
        for weekly_plan in weekly_plans:
            for daily_plan in weekly_plan.get('daily_plans', []):
                if daily_plan.get('date') == date.isoformat():
                    target_daily_plan = daily_plan
                    break
            if target_daily_plan:
                break

        if not target_daily_plan:
            target_daily_plan = await generate_daily_plan(date, plan_data)

        return APIResponse(success=True, message="Daily plan retrieved successfully", data=target_daily_plan)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting daily plan: {e}")
        raise HTTPException(status_code=500, detail="Failed to get daily plan")

async def get_user_data_for_plan(user_id: str) -> Dict[str, Any]:
    """Get comprehensive user data for plan generation"""
    try:
        user_data = db_service.get_user(user_id) or {}
        onboarding_data = db_service.get_user_doc(user_id, "onboarding", "data") or {}
        tracking_history = db_service.query_user_docs(user_id, "tracking", order_by="date", order_dir="DESC", limit_count=30)

        return {
            "profile": user_data,
            "onboarding": onboarding_data,
            "tracking_history": tracking_history,
            "preferences": onboarding_data.get('dietary_preferences', {}),
            "goals": onboarding_data.get('goals', {}),
            "medical_conditions": onboarding_data.get('medical_conditions', {})
        }
    except Exception as e:
        logger.error(f"Error getting user data for plan: {e}")
        return {}

async def generate_plan_with_ai(user_data: Dict[str, Any], request: PlanRequest) -> Dict[str, Any]:
    """Generate plan content using Gemini AI"""
    try:
        system_prompt = """
        You are FitMentor, an expert AI health coach creating personalized fitness and nutrition plans.
        Create evidence-based, sustainable plans that consider the user's medical conditions, preferences,
        and goals. Always include safety precautions and recommend consulting healthcare professionals.
        """

        prompt = f"""
        Create a comprehensive {request.duration_weeks}-week health plan for:

        User Profile:
        - Age: {user_data.get('profile', {}).get('age')}
        - Gender: {user_data.get('profile', {}).get('gender')}
        - BMI: {user_data.get('profile', {}).get('bmi')}
        - Activity Level: {user_data.get('profile', {}).get('activity_level')}

        Goals: {user_data.get('goals', {})}
        Medical Conditions: {user_data.get('medical_conditions', {})}
        Dietary Preferences: {user_data.get('preferences', {})}

        Include:
        1. Weekly progression strategy
        2. Nutrition guidelines
        3. Exercise recommendations
        4. Monitoring and adjustments
        5. Motivation strategies
        """

        response = await gemini_service.generate_response(
            prompt=prompt, system_prompt=system_prompt, temperature=0.3, max_tokens=2000
        )
        return {"plan_content": response, "generated_at": datetime.utcnow().isoformat()}
    except Exception as e:
        logger.error(f"Error generating plan with AI: {e}")
        return {"plan_content": "Basic plan generated due to technical issues.", "generated_at": datetime.utcnow().isoformat()}

async def create_weekly_plans(user_data: Dict[str, Any], duration_weeks: int) -> List[Dict[str, Any]]:
    """Create structured weekly plans"""
    weekly_plans = []
    for week in range(1, duration_weeks + 1):
        week_start = datetime.utcnow() + timedelta(weeks=week-1)
        week_end = week_start + timedelta(days=6)
        daily_plans = []
        for day in range(7):
            plan_date = week_start + timedelta(days=day)
            daily_plan = await generate_daily_plan(plan_date.date(), user_data)
            daily_plans.append(daily_plan)

        weekly_plans.append({
            "week_number": week,
            "week_start": week_start.date().isoformat(),
            "week_end": week_end.date().isoformat(),
            "daily_plans": daily_plans,
            "weekly_goals": {
                "weight_target": "Maintain healthy weight",
                "activity_target": f"{week * 150} minutes moderate activity",
                "nutrition_target": "Balanced macronutrients"
            },
            "adjustments": []
        })
    return weekly_plans

async def generate_daily_plan(plan_date: date, user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate a daily plan"""
    meals = [
        {"type": "breakfast", "time": "08:00", "items": [{"name": "Oatmeal", "quantity": "1 cup", "calories": 150, "protein_g": 5, "carbs_g": 27, "fat_g": 3}], "total_calories": 150, "total_protein": 5, "total_carbs": 27, "total_fat": 3},
        {"type": "lunch", "time": "13:00", "items": [{"name": "Grilled chicken salad", "quantity": "1 serving", "calories": 350, "protein_g": 30, "carbs_g": 15, "fat_g": 15}], "total_calories": 350, "total_protein": 30, "total_carbs": 15, "total_fat": 15},
        {"type": "dinner", "time": "19:00", "items": [{"name": "Baked salmon", "quantity": "150g", "calories": 300, "protein_g": 25, "carbs_g": 0, "fat_g": 20}], "total_calories": 300, "total_protein": 25, "total_carbs": 0, "total_fat": 20}
    ]
    exercises = [
        {"name": "Walking", "type": "cardio", "duration_minutes": 30, "intensity": "moderate", "calories_burned": 150},
        {"name": "Strength training", "type": "strength", "duration_minutes": 20, "intensity": "moderate", "calories_burned": 100}
    ]
    return {
        "date": plan_date.isoformat(), "meals": meals, "exercises": exercises,
        "water_target_ml": 2000, "steps_target": 8000,
        "total_calories": sum(m["total_calories"] for m in meals),
        "total_protein": sum(m["total_protein"] for m in meals),
        "total_carbs": sum(m["total_carbs"] for m in meals),
        "total_fat": sum(m["total_fat"] for m in meals)
    }
