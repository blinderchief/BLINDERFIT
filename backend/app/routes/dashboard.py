"""
Dashboard routes for PulseHub - comprehensive health dashboard
"""

from fastapi import APIRouter, Depends, HTTPException, status
import logging
from datetime import datetime, date, timedelta
from typing import Dict, Any, List
import json

from app.core.database import get_firestore_client
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
async def get_dashboard_data(
    days: int = 7,
    user_id: str = Depends(get_current_user)
):
    """Get comprehensive dashboard data"""
    try:
        db = get_firestore_client()

        # Get user stats
        user_stats = await get_user_stats(user_id)

        # Get recent tracking data
        recent_tracking = await get_recent_tracking(user_id, days)

        # Get current plan
        current_plan = await get_current_plan(user_id)

        # Get upcoming meals and exercises
        upcoming_meals, upcoming_exercises = await get_upcoming_schedule(user_id)

        # Get ML insights
        ml_insights = await get_recent_insights(user_id)

        # Get notifications
        notifications = await get_recent_notifications(user_id)

        # Generate progress charts
        progress_charts = await generate_progress_charts(user_id, days)

        dashboard_data = DashboardData(
            user_stats=user_stats,
            recent_tracking=recent_tracking,
            current_plan=current_plan,
            upcoming_meals=upcoming_meals,
            upcoming_exercises=upcoming_exercises,
            ml_insights=ml_insights,
            notifications=notifications,
            progress_charts=progress_charts
        )

        return APIResponse(
            success=True,
            message="Dashboard data retrieved successfully",
            data=dashboard_data.dict()
        )

    except Exception as e:
        logger.error(f"Error getting dashboard data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get dashboard data"
        )

@router.get("/stats", response_model=APIResponse)
async def get_user_statistics(user_id: str = Depends(get_current_user)):
    """Get detailed user statistics"""
    try:
        user_stats = await get_user_stats(user_id)

        return APIResponse(
            success=True,
            message="User statistics retrieved successfully",
            data=user_stats.dict()
        )

    except Exception as e:
        logger.error(f"Error getting user statistics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user statistics"
        )

@router.get("/progress", response_model=APIResponse)
async def get_progress_data(
    period: str = "month",
    user_id: str = Depends(get_current_user)
):
    """Get progress data for charts and visualizations"""
    try:
        # Determine date range
        end_date = datetime.utcnow().date()
        if period == "week":
            start_date = end_date - timedelta(days=6)
        elif period == "month":
            start_date = end_date - timedelta(days=29)
        elif period == "quarter":
            start_date = end_date - timedelta(days=89)
        else:
            start_date = end_date - timedelta(days=29)  # Default to month

        progress_data = await generate_progress_charts(user_id, (end_date - start_date).days + 1)

        return APIResponse(
            success=True,
            message="Progress data retrieved successfully",
            data={
                "period": period,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "progress_data": progress_data
            }
        )

    except Exception as e:
        logger.error(f"Error getting progress data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get progress data"
        )

@router.get("/insights", response_model=APIResponse)
async def get_ml_insights(
    limit: int = 5,
    user_id: str = Depends(get_current_user)
):
    """Get ML-generated insights"""
    try:
        insights = await get_recent_insights(user_id, limit)

        return APIResponse(
            success=True,
            message="ML insights retrieved successfully",
            data={
                "insights": [insight.dict() for insight in insights],
                "total": len(insights)
            }
        )

    except Exception as e:
        logger.error(f"Error getting ML insights: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get ML insights"
        )

@router.get("/achievements", response_model=APIResponse)
async def get_user_achievements(user_id: str = Depends(get_current_user)):
    """Get user's achievements and badges"""
    try:
        db = get_firestore_client()

        # Get user stats for achievement calculation
        user_stats = await get_user_stats(user_id)

        # Calculate achievements based on stats
        achievements = calculate_achievements(user_stats)

        return APIResponse(
            success=True,
            message="Achievements retrieved successfully",
            data={
                "achievements": achievements,
                "total_achievements": len(achievements),
                "next_milestone": get_next_milestone(user_stats)
            }
        )

    except Exception as e:
        logger.error(f"Error getting achievements: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get achievements"
        )

@router.get("/recommendations", response_model=APIResponse)
async def get_personalized_recommendations(user_id: str = Depends(get_current_user)):
    """Get personalized recommendations based on user data"""
    try:
        # Get user context
        user_context = await get_user_context_for_recommendations(user_id)

        # Generate recommendations using AI
        recommendations = await generate_recommendations(user_context)

        return APIResponse(
            success=True,
            message="Personalized recommendations retrieved successfully",
            data={
                "recommendations": recommendations,
                "generated_at": datetime.utcnow().isoformat()
            }
        )

    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get recommendations"
        )

async def get_user_stats(user_id: str) -> UserStats:
    """Calculate comprehensive user statistics"""
    try:
        db = get_firestore_client()

        # Get all tracking data
        tracking_ref = db.collection('users').document(user_id).collection('tracking')
        all_tracking = tracking_ref.get()

        tracking_data = [doc.to_dict() for doc in all_tracking]

        # Calculate stats
        total_days_tracked = len(tracking_data)
        current_streak = calculate_current_streak(tracking_data)
        longest_streak = calculate_longest_streak(tracking_data)

        # Calculate totals
        total_calories_burned = sum(
            sum(ex.get('calories_burned', 0) for ex in entry.get('exercises', []))
            for entry in tracking_data
        )
        total_meals_logged = sum(len(entry.get('meals', [])) for entry in tracking_data)
        total_exercises_completed = sum(len(entry.get('exercises', [])) for entry in tracking_data)

        # Get achievements
        achievements = []  # Would be calculated based on milestones

        # Calculate level and XP
        level = min(total_days_tracked // 7 + 1, 50)  # Max level 50
        experience_points = total_days_tracked * 10 + total_meals_logged * 5 + total_exercises_completed * 15

        return UserStats(
            user_id=user_id,
            total_days_tracked=total_days_tracked,
            current_streak=current_streak,
            longest_streak=longest_streak,
            total_calories_burned=total_calories_burned,
            total_meals_logged=total_meals_logged,
            total_exercises_completed=total_exercises_completed,
            achievements=achievements,
            level=level,
            experience_points=experience_points
        )

    except Exception as e:
        logger.error(f"Error calculating user stats: {e}")
        return UserStats(
            user_id=user_id,
            total_days_tracked=0,
            current_streak=0,
            longest_streak=0,
            total_calories_burned=0,
            total_meals_logged=0,
            total_exercises_completed=0,
            achievements=[],
            level=1,
            experience_points=0
        )

async def get_recent_tracking(user_id: str, days: int) -> List[DailyTracking]:
    """Get recent tracking data"""
    try:
        db = get_firestore_client()

        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=days-1)

        tracking_data = []
        current_date = start_date

        while current_date <= end_date:
            doc = db.collection('users').document(user_id).collection('tracking').document(current_date.isoformat()).get()
            if doc.exists:
                tracking_data.append(DailyTracking(**doc.to_dict()))
            current_date += timedelta(days=1)

        return tracking_data

    except Exception as e:
        logger.error(f"Error getting recent tracking: {e}")
        return []

async def get_current_plan(user_id: str) -> PersonalizedPlan:
    """Get user's current active plan"""
    try:
        db = get_firestore_client()

        plans_ref = db.collection('users').document(user_id).collection('plans')
        active_plan = plans_ref.where('is_active', '==', True).limit(1).get()

        if active_plan:
            return PersonalizedPlan(**active_plan[0].to_dict())

        return None

    except Exception as e:
        logger.error(f"Error getting current plan: {e}")
        return None

async def get_upcoming_schedule(user_id: str) -> tuple:
    """Get upcoming meals and exercises"""
    try:
        # Get today's plan
        today = datetime.utcnow().date()
        current_plan = await get_current_plan(user_id)

        if not current_plan:
            return [], []

        # Find today's plan in weekly plans
        today_meals = []
        today_exercises = []

        for weekly_plan in current_plan.weekly_plans:
            for daily_plan in weekly_plan.get('daily_plans', []):
                if daily_plan.get('date') == today.isoformat():
                    today_meals = daily_plan.get('meals', [])
                    today_exercises = daily_plan.get('exercises', [])
                    break

        return today_meals, today_exercises

    except Exception as e:
        logger.error(f"Error getting upcoming schedule: {e}")
        return [], []

async def get_recent_insights(user_id: str, limit: int = 5) -> List[MLInsight]:
    """Get recent ML insights"""
    try:
        db = get_firestore_client()

        insights_ref = db.collection('users').document(user_id).collection('ml_insights')
        insights = insights_ref.order_by('generated_at', direction='DESCENDING').limit(limit).get()

        return [MLInsight(**doc.to_dict()) for doc in insights]

    except Exception as e:
        logger.error(f"Error getting recent insights: {e}")
        return []

async def get_recent_notifications(user_id: str, limit: int = 10) -> List[NotificationData]:
    """Get recent notifications"""
    try:
        db = get_firestore_client()

        notifications_ref = db.collection('users').document(user_id).collection('notifications')
        notifications = notifications_ref.order_by('scheduled_at', direction='DESCENDING').limit(limit).get()

        return [NotificationData(**doc.to_dict()) for doc in notifications]

    except Exception as e:
        logger.error(f"Error getting recent notifications: {e}")
        return []

async def generate_progress_charts(user_id: str, days: int) -> Dict[str, Any]:
    """Generate progress charts data"""
    try:
        recent_tracking = await get_recent_tracking(user_id, days)

        # Weight progress
        weight_data = [
            {
                "date": entry.date.isoformat(),
                "weight": entry.weight_kg,
                "bmi": calculate_bmi_from_tracking(entry)
            }
            for entry in recent_tracking
            if entry.weight_kg
        ]

        # Compliance progress
        compliance_data = [
            {
                "date": entry.date.isoformat(),
                "compliance_score": entry.compliance_score,
                "meals_logged": len(entry.meals),
                "exercises_logged": len(entry.exercises)
            }
            for entry in recent_tracking
        ]

        # Nutrient intake
        nutrient_data = [
            {
                "date": entry.date.isoformat(),
                "calories": sum(meal.total_calories for meal in entry.meals),
                "protein": sum(meal.total_protein for meal in entry.meals),
                "carbs": sum(meal.total_carbs for meal in entry.meals),
                "fat": sum(meal.total_fat for meal in entry.meals)
            }
            for entry in recent_tracking
        ]

        return {
            "weight_progress": weight_data,
            "compliance_progress": compliance_data,
            "nutrient_intake": nutrient_data,
            "period_days": days
        }

    except Exception as e:
        logger.error(f"Error generating progress charts: {e}")
        return {}

def calculate_current_streak(tracking_data: List[Dict[str, Any]]) -> int:
    """Calculate current tracking streak"""
    if not tracking_data:
        return 0

    # Sort by date
    sorted_data = sorted(tracking_data, key=lambda x: x.get('date', ''), reverse=True)

    streak = 0
    for entry in sorted_data:
        if entry.get('compliance_score', 0) > 50:  # Consider it a tracked day if compliance > 50%
            streak += 1
        else:
            break

    return streak

def calculate_longest_streak(tracking_data: List[Dict[str, Any]]) -> int:
    """Calculate longest tracking streak"""
    if not tracking_data:
        return 0

    # Sort by date
    sorted_data = sorted(tracking_data, key=lambda x: x.get('date', ''))

    longest_streak = 0
    current_streak = 0

    for entry in sorted_data:
        if entry.get('compliance_score', 0) > 50:
            current_streak += 1
            longest_streak = max(longest_streak, current_streak)
        else:
            current_streak = 0

    return longest_streak

def calculate_achievements(user_stats: UserStats) -> List[Dict[str, Any]]:
    """Calculate user achievements"""
    achievements = []

    # Streak achievements
    if user_stats.current_streak >= 7:
        achievements.append({
            "id": "week_streak",
            "name": "Week Warrior",
            "description": "7-day tracking streak",
            "icon": "🔥",
            "unlocked_at": datetime.utcnow().isoformat(),
            "points": 100
        })

    if user_stats.longest_streak >= 30:
        achievements.append({
            "id": "month_streak",
            "name": "Monthly Master",
            "description": "30-day tracking streak",
            "icon": "👑",
            "unlocked_at": datetime.utcnow().isoformat(),
            "points": 500
        })

    # Tracking achievements
    if user_stats.total_days_tracked >= 100:
        achievements.append({
            "id": "century_tracker",
            "name": "Century Tracker",
            "description": "100 days tracked",
            "icon": "💯",
            "unlocked_at": datetime.utcnow().isoformat(),
            "points": 200
        })

    return achievements

def get_next_milestone(user_stats: UserStats) -> Dict[str, Any]:
    """Get next achievement milestone"""
    milestones = [
        {"name": "First Week", "target": 7, "current": user_stats.current_streak, "type": "streak"},
        {"name": "Century Club", "target": 100, "current": user_stats.total_days_tracked, "type": "days"},
        {"name": "Consistency King", "target": 30, "current": user_stats.longest_streak, "type": "longest_streak"}
    ]

    for milestone in milestones:
        if milestone["current"] < milestone["target"]:
            return {
                "name": milestone["name"],
                "target": milestone["target"],
                "current": milestone["current"],
                "remaining": milestone["target"] - milestone["current"],
                "type": milestone["type"]
            }

    return {"name": "All Milestones Achieved", "target": 0, "current": 0, "remaining": 0, "type": "complete"}

async def get_user_context_for_recommendations(user_id: str) -> Dict[str, Any]:
    """Get user context for generating recommendations"""
    try:
        db = get_firestore_client()

        # Get user profile
        user_doc = db.collection('users').document(user_id).get()
        user_data = user_doc.to_dict() if user_doc.exists else {}

        # Get recent tracking
        recent_tracking = await get_recent_tracking(user_id, 7)

        # Get current plan
        current_plan = await get_current_plan(user_id)

        return {
            "profile": user_data,
            "recent_tracking": [t.dict() for t in recent_tracking],
            "current_plan": current_plan.dict() if current_plan else None,
            "stats": (await get_user_stats(user_id)).dict()
        }

    except Exception as e:
        logger.error(f"Error getting user context for recommendations: {e}")
        return {}

async def generate_recommendations(user_context: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate personalized recommendations using AI"""
    try:
        system_prompt = """
        You are FitMentor providing personalized recommendations based on user data.
        Focus on actionable, specific advice that helps the user progress towards their goals.
        """

        prompt = f"""
        Based on this user data, provide 3-5 personalized recommendations:

        User Profile: {json.dumps(user_context.get('profile', {}), indent=2)}
        Recent Activity: {json.dumps(user_context.get('recent_tracking', []), indent=2)}
        Current Plan: {json.dumps(user_context.get('current_plan'), indent=2)}
        Stats: {json.dumps(user_context.get('stats', {}), indent=2)}

        Provide recommendations in these categories:
        1. Nutrition improvements
        2. Exercise adjustments
        3. Lifestyle changes
        4. Motivation strategies
        5. Health monitoring

        Make each recommendation specific and actionable.
        """

        response = await gemini_service.generate_response(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.7,
            max_tokens=600
        )

        # Parse recommendations from response
        recommendations = []
        lines = response.split('\n')

        for line in lines:
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith('•') or line.startswith('-')):
                recommendations.append({
                    "text": line.lstrip('123456789•- ').strip(),
                    "category": "general",
                    "priority": "medium"
                })

        return recommendations[:5]  # Return up to 5 recommendations

    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        return [
            {
                "text": "Continue tracking your daily meals and exercises consistently",
                "category": "general",
                "priority": "high"
            },
            {
                "text": "Focus on drinking at least 2 liters of water daily",
                "category": "lifestyle",
                "priority": "medium"
            }
        ]

def calculate_bmi_from_tracking(entry: DailyTracking) -> float:
    """Calculate BMI from tracking entry"""
    if entry.weight_kg and hasattr(entry, 'height_cm'):
        height_m = entry.height_cm / 100
        return round(entry.weight_kg / (height_m ** 2), 2)
    return 0.0