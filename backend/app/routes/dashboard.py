"""
Dashboard routes for PulseHub - comprehensive health dashboard
"""

from fastapi import APIRouter, Depends, HTTPException, status
import logging
from datetime import datetime, date, timedelta
from typing import Dict, Any, List
import json

from app.core.database import db_service
from app.models import (
    DashboardData,
    UserStats,
    DailyTracking,
    PersonalizedPlan,
    MLInsight,
    NotificationData,
    APIResponse
)
from app.routes.auth import get_current_user
from app.services.gemini_service import gemini_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=APIResponse)
async def get_dashboard_data(days: int = 7, user_id: str = Depends(get_current_user)):
    """Get comprehensive dashboard data"""
    try:
        user_stats = await get_user_stats(user_id)
        recent_tracking = await get_recent_tracking(user_id, days)
        current_plan = await get_current_plan_data(user_id)
        upcoming_meals, upcoming_exercises = await get_upcoming_schedule(user_id)
        ml_insights = await get_recent_insights(user_id)
        notifications = await get_recent_notifications(user_id)
        progress_charts = await generate_progress_charts(user_id, days)

        dashboard_data = {
            "user_stats": user_stats,
            "recent_tracking": recent_tracking,
            "current_plan": current_plan,
            "upcoming_meals": upcoming_meals,
            "upcoming_exercises": upcoming_exercises,
            "ml_insights": ml_insights,
            "notifications": notifications,
            "progress_charts": progress_charts
        }

        return APIResponse(success=True, message="Dashboard data retrieved successfully", data=dashboard_data)
    except Exception as e:
        logger.error(f"Error getting dashboard data: {e}")
        raise HTTPException(status_code=500, detail="Failed to get dashboard data")

@router.get("/stats", response_model=APIResponse)
async def get_user_statistics(user_id: str = Depends(get_current_user)):
    """Get detailed user statistics"""
    try:
        user_stats = await get_user_stats(user_id)
        return APIResponse(success=True, message="User statistics retrieved successfully", data=user_stats)
    except Exception as e:
        logger.error(f"Error getting user statistics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user statistics")

@router.get("/progress", response_model=APIResponse)
async def get_progress_data(period: str = "month", user_id: str = Depends(get_current_user)):
    """Get progress data for charts and visualizations"""
    try:
        end_date = datetime.utcnow().date()
        days_map = {"week": 6, "month": 29, "quarter": 89}
        start_date = end_date - timedelta(days=days_map.get(period, 29))

        progress_data = await generate_progress_charts(user_id, (end_date - start_date).days + 1)

        return APIResponse(
            success=True, message="Progress data retrieved successfully",
            data={"period": period, "start_date": start_date.isoformat(), "end_date": end_date.isoformat(), "progress_data": progress_data}
        )
    except Exception as e:
        logger.error(f"Error getting progress data: {e}")
        raise HTTPException(status_code=500, detail="Failed to get progress data")

@router.get("/insights", response_model=APIResponse)
async def get_ml_insights(limit: int = 5, user_id: str = Depends(get_current_user)):
    """Get ML-generated insights"""
    try:
        insights = await get_recent_insights(user_id, limit)
        return APIResponse(success=True, message="ML insights retrieved successfully", data={"insights": insights, "total": len(insights)})
    except Exception as e:
        logger.error(f"Error getting ML insights: {e}")
        raise HTTPException(status_code=500, detail="Failed to get ML insights")

@router.get("/achievements", response_model=APIResponse)
async def get_user_achievements(user_id: str = Depends(get_current_user)):
    """Get user's achievements and badges"""
    try:
        user_stats = await get_user_stats(user_id)
        achievements = calculate_achievements(user_stats)
        return APIResponse(
            success=True, message="Achievements retrieved successfully",
            data={"achievements": achievements, "total_achievements": len(achievements), "next_milestone": get_next_milestone(user_stats)}
        )
    except Exception as e:
        logger.error(f"Error getting achievements: {e}")
        raise HTTPException(status_code=500, detail="Failed to get achievements")

@router.get("/recommendations", response_model=APIResponse)
async def get_personalized_recommendations(user_id: str = Depends(get_current_user)):
    """Get personalized recommendations based on user data"""
    try:
        user_context = await get_user_context_for_recommendations(user_id)
        recommendations = await generate_recommendations(user_context)
        return APIResponse(
            success=True, message="Personalized recommendations retrieved successfully",
            data={"recommendations": recommendations, "generated_at": datetime.utcnow().isoformat()}
        )
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        raise HTTPException(status_code=500, detail="Failed to get recommendations")

# ── Helper Functions ────────────────────────────────────────

async def get_user_stats(user_id: str) -> Dict[str, Any]:
    """Calculate comprehensive user statistics"""
    try:
        all_tracking = db_service.query_user_docs(user_id, "tracking")
        tracking_data = all_tracking

        total_days_tracked = len(tracking_data)
        current_streak = calculate_current_streak(tracking_data)
        longest_streak = calculate_longest_streak(tracking_data)

        total_calories_burned = sum(
            sum(ex.get('calories_burned', 0) for ex in entry.get('exercises', []))
            for entry in tracking_data
        )
        total_meals_logged = sum(len(entry.get('meals', [])) for entry in tracking_data)
        total_exercises_completed = sum(len(entry.get('exercises', [])) for entry in tracking_data)

        level = min(total_days_tracked // 7 + 1, 50)
        experience_points = total_days_tracked * 10 + total_meals_logged * 5 + total_exercises_completed * 15

        return {
            "user_id": user_id,
            "total_days_tracked": total_days_tracked,
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "total_calories_burned": total_calories_burned,
            "total_meals_logged": total_meals_logged,
            "total_exercises_completed": total_exercises_completed,
            "achievements": [],
            "level": level,
            "experience_points": experience_points
        }
    except Exception as e:
        logger.error(f"Error calculating user stats: {e}")
        return {
            "user_id": user_id, "total_days_tracked": 0, "current_streak": 0,
            "longest_streak": 0, "total_calories_burned": 0, "total_meals_logged": 0,
            "total_exercises_completed": 0, "achievements": [], "level": 1, "experience_points": 0
        }

async def get_recent_tracking(user_id: str, days: int) -> List[Dict[str, Any]]:
    """Get recent tracking data"""
    try:
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=days-1)
        tracking_data = []
        current_date = start_date
        while current_date <= end_date:
            doc = db_service.get_user_doc(user_id, "tracking", current_date.isoformat())
            if doc:
                tracking_data.append(doc)
            current_date += timedelta(days=1)
        return tracking_data
    except Exception as e:
        logger.error(f"Error getting recent tracking: {e}")
        return []

async def get_current_plan_data(user_id: str) -> Dict[str, Any]:
    """Get user's current active plan"""
    try:
        active_plans = db_service.query_user_docs(user_id, "plans", filters={"is_active": True}, limit_count=1)
        return active_plans[0] if active_plans else None
    except Exception as e:
        logger.error(f"Error getting current plan: {e}")
        return None

async def get_upcoming_schedule(user_id: str) -> tuple:
    """Get upcoming meals and exercises"""
    try:
        today = datetime.utcnow().date()
        current_plan = await get_current_plan_data(user_id)
        if not current_plan:
            return [], []

        for weekly_plan in current_plan.get('weekly_plans', []):
            for daily_plan in weekly_plan.get('daily_plans', []):
                if daily_plan.get('date') == today.isoformat():
                    return daily_plan.get('meals', []), daily_plan.get('exercises', [])
        return [], []
    except Exception as e:
        logger.error(f"Error getting upcoming schedule: {e}")
        return [], []

async def get_recent_insights(user_id: str, limit: int = 5) -> List[Dict[str, Any]]:
    """Get recent ML insights"""
    try:
        return db_service.query_user_docs(user_id, "ml_insights", order_by="generated_at", order_dir="DESC", limit_count=limit)
    except Exception as e:
        logger.error(f"Error getting recent insights: {e}")
        return []

async def get_recent_notifications(user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Get recent notifications"""
    try:
        return db_service.query_user_docs(user_id, "notifications", order_by="scheduled_at", order_dir="DESC", limit_count=limit)
    except Exception as e:
        logger.error(f"Error getting recent notifications: {e}")
        return []

async def generate_progress_charts(user_id: str, days: int) -> Dict[str, Any]:
    """Generate progress charts data"""
    try:
        recent_tracking = await get_recent_tracking(user_id, days)

        weight_data = [{"date": e.get("date"), "weight": e.get("weight_kg")} for e in recent_tracking if e.get("weight_kg")]
        compliance_data = [{"date": e.get("date"), "compliance_score": e.get("compliance_score", 0), "meals_logged": len(e.get("meals", [])), "exercises_logged": len(e.get("exercises", []))} for e in recent_tracking]
        nutrient_data = [{"date": e.get("date"), "calories": sum(m.get("total_calories", 0) for m in e.get("meals", [])), "protein": sum(m.get("total_protein", 0) for m in e.get("meals", [])), "carbs": sum(m.get("total_carbs", 0) for m in e.get("meals", [])), "fat": sum(m.get("total_fat", 0) for m in e.get("meals", []))} for e in recent_tracking]

        return {"weight_progress": weight_data, "compliance_progress": compliance_data, "nutrient_intake": nutrient_data, "period_days": days}
    except Exception as e:
        logger.error(f"Error generating progress charts: {e}")
        return {}

def calculate_current_streak(tracking_data: List[Dict[str, Any]]) -> int:
    if not tracking_data:
        return 0
    sorted_data = sorted(tracking_data, key=lambda x: x.get('date', ''), reverse=True)
    streak = 0
    for entry in sorted_data:
        if entry.get('compliance_score', 0) > 50:
            streak += 1
        else:
            break
    return streak

def calculate_longest_streak(tracking_data: List[Dict[str, Any]]) -> int:
    if not tracking_data:
        return 0
    sorted_data = sorted(tracking_data, key=lambda x: x.get('date', ''))
    longest, current = 0, 0
    for entry in sorted_data:
        if entry.get('compliance_score', 0) > 50:
            current += 1
            longest = max(longest, current)
        else:
            current = 0
    return longest

def calculate_achievements(user_stats: Dict[str, Any]) -> List[Dict[str, Any]]:
    achievements = []
    if user_stats.get("current_streak", 0) >= 7:
        achievements.append({"id": "week_streak", "name": "Week Warrior", "description": "7-day tracking streak", "icon": "🔥", "points": 100})
    if user_stats.get("longest_streak", 0) >= 30:
        achievements.append({"id": "month_streak", "name": "Monthly Master", "description": "30-day tracking streak", "icon": "👑", "points": 500})
    if user_stats.get("total_days_tracked", 0) >= 100:
        achievements.append({"id": "century_tracker", "name": "Century Tracker", "description": "100 days tracked", "icon": "💯", "points": 200})
    return achievements

def get_next_milestone(user_stats: Dict[str, Any]) -> Dict[str, Any]:
    milestones = [
        {"name": "First Week", "target": 7, "current": user_stats.get("current_streak", 0), "type": "streak"},
        {"name": "Century Club", "target": 100, "current": user_stats.get("total_days_tracked", 0), "type": "days"},
        {"name": "Consistency King", "target": 30, "current": user_stats.get("longest_streak", 0), "type": "longest_streak"}
    ]
    for m in milestones:
        if m["current"] < m["target"]:
            return {"name": m["name"], "target": m["target"], "current": m["current"], "remaining": m["target"] - m["current"], "type": m["type"]}
    return {"name": "All Milestones Achieved", "target": 0, "current": 0, "remaining": 0, "type": "complete"}

async def get_user_context_for_recommendations(user_id: str) -> Dict[str, Any]:
    try:
        user_data = db_service.get_user(user_id) or {}
        recent_tracking = await get_recent_tracking(user_id, 7)
        current_plan = await get_current_plan_data(user_id)
        stats = await get_user_stats(user_id)
        return {"profile": user_data, "recent_tracking": recent_tracking, "current_plan": current_plan, "stats": stats}
    except Exception as e:
        logger.error(f"Error getting user context for recommendations: {e}")
        return {}

async def generate_recommendations(user_context: Dict[str, Any]) -> List[Dict[str, Any]]:
    try:
        prompt = f"""Based on this user data, provide 3-5 personalized recommendations:
        Profile: {json.dumps(user_context.get('profile', {}), default=str)}
        Stats: {json.dumps(user_context.get('stats', {}), default=str)}
        Categories: Nutrition, Exercise, Lifestyle, Motivation, Health monitoring"""

        response = await gemini_service.generate_response(
            prompt=prompt,
            system_prompt="You are FitMentor providing personalized recommendations based on user data.",
            temperature=0.7, max_tokens=600
        )

        recommendations = []
        for line in response.split('\n'):
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith(('•', '-'))):
                recommendations.append({"text": line.lstrip('123456789•- ').strip(), "category": "general", "priority": "medium"})
        return recommendations[:5]
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        return [
            {"text": "Continue tracking your daily meals and exercises consistently", "category": "general", "priority": "high"},
            {"text": "Focus on drinking at least 2 liters of water daily", "category": "lifestyle", "priority": "medium"}
        ]
