"""
Notifications API routes for Blinderfit Backend
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from app.core.database import db_service
from app.routes.auth import get_current_user

router = APIRouter(tags=["notifications"])


def _get_svc():
    """Lazy import notification service"""
    from app.services.notification_service import notification_service
    return notification_service


class NotificationRequest(BaseModel):
    title: str = Field(..., description="Notification title")
    message: str = Field(..., description="Notification message")
    notification_type: str = Field("general", description="Type of notification")
    data: Optional[Dict[str, Any]] = Field(None, description="Additional data")
    scheduled_at: Optional[datetime] = Field(None, description="Scheduled time")


class NotificationPreferences(BaseModel):
    meal_reminders: bool = Field(True)
    exercise_reminders: bool = Field(True)
    motivational_messages: bool = Field(True)
    progress_updates: bool = Field(True)
    insights: bool = Field(True)


class BulkNotificationRequest(BaseModel):
    user_ids: List[str] = Field(...)
    title: str = Field(...)
    message: str = Field(...)
    notification_type: str = Field("bulk")


@router.post("/send")
async def send_notification(request: NotificationRequest, current_user: str = Depends(get_current_user)):
    try:
        svc = _get_svc()
        nid = await svc.send_notification(
            user_id=current_user, title=request.title, message=request.message,
            notification_type=request.notification_type, data=request.data, scheduled_at=request.scheduled_at
        )
        return {"notification_id": nid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/meal-reminder/{meal_type}")
async def send_meal_reminder(meal_type: str, current_user: str = Depends(get_current_user)):
    try:
        if meal_type not in ["breakfast", "lunch", "dinner", "snack"]:
            raise HTTPException(status_code=400, detail="Invalid meal type")
        svc = _get_svc()
        nid = await svc.send_meal_reminder(user_id=current_user, meal_type=meal_type)
        return {"notification_id": nid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/exercise-reminder")
async def send_exercise_reminder(current_user: str = Depends(get_current_user)):
    try:
        svc = _get_svc()
        nid = await svc.send_exercise_reminder(user_id=current_user)
        return {"notification_id": nid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/motivational")
async def send_motivational_message(current_user: str = Depends(get_current_user)):
    try:
        user_data = db_service.get_user(current_user)
        streak = user_data.get('current_streak', 0) if user_data else 0
        svc = _get_svc()
        nid = await svc.send_motivational_message(user_id=current_user, streak=streak)
        return {"notification_id": nid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/progress-update")
async def send_progress_update(progress_data: Dict[str, Any], current_user: str = Depends(get_current_user)):
    try:
        svc = _get_svc()
        nid = await svc.send_progress_update(user_id=current_user, progress_data=progress_data)
        return {"notification_id": nid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/insight")
async def send_insight_notification(insight_data: Dict[str, Any], current_user: str = Depends(get_current_user)):
    try:
        svc = _get_svc()
        nid = await svc.send_insight_notification(user_id=current_user, insight_data=insight_data)
        return {"notification_id": nid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/schedule-daily")
async def schedule_daily_notifications(background_tasks: BackgroundTasks, current_user: str = Depends(get_current_user)):
    try:
        svc = _get_svc()
        background_tasks.add_task(svc.schedule_daily_notifications, user_id=current_user)
        return {"message": "Daily notifications scheduled successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/preferences")
async def update_notification_preferences(preferences: NotificationPreferences, current_user: str = Depends(get_current_user)):
    try:
        db_service.update_user(current_user, {
            'notification_preferences': preferences.dict(),
            'preferences_updated_at': datetime.utcnow().isoformat()
        })
        return {"message": "Notification preferences updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: str = Depends(get_current_user)):
    try:
        svc = _get_svc()
        success = await svc.mark_notification_read(user_id=current_user, notification_id=notification_id)
        if not success:
            raise HTTPException(status_code=404, detail="Notification not found")
        return {"message": "Notification marked as read"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/unread")
async def get_unread_notifications(current_user: str = Depends(get_current_user)):
    try:
        svc = _get_svc()
        return await svc.get_unread_notifications(user_id=current_user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_notification_history(limit: int = 50, current_user: str = Depends(get_current_user)):
    try:
        return db_service.query_user_docs(current_user, "notifications", order_by="created_at", order_dir="DESC", limit_count=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/bulk")
async def send_bulk_notifications(request: BulkNotificationRequest, current_user: str = Depends(get_current_user)):
    try:
        svc = _get_svc()
        return await svc.send_bulk_notifications(
            user_ids=request.user_ids, title=request.title,
            message=request.message, notification_type=request.notification_type
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{notification_id}")
async def delete_notification(notification_id: str, current_user: str = Depends(get_current_user)):
    try:
        db_service.delete_user_doc(current_user, "notifications", notification_id)
        return {"message": "Notification deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_notification_stats(current_user: str = Depends(get_current_user)):
    try:
        all_notifs = db_service.query_user_docs(current_user, "notifications")
        total = len(all_notifs)
        unread = sum(1 for n in all_notifs if n.get('read_at') is None)
        types_count = {}
        for n in all_notifs:
            t = n.get('type', 'general')
            types_count[t] = types_count.get(t, 0) + 1
        return {"total_notifications": total, "unread_count": unread, "notifications_by_type": types_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
