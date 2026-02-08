"""
Notifications service for Blinderfit Backend
Uses PostgreSQL (via db_service) instead of Firebase Cloud Messaging.
"""

from typing import Dict, Any, List, Optional
import logging
from datetime import datetime, timedelta
import uuid

from app.core.database import db_service

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for handling notifications (stored in PostgreSQL)"""

    async def send_notification(
        self,
        user_id: str,
        title: str,
        message: str,
        notification_type: str = "general",
        data: Optional[Dict[str, Any]] = None,
        scheduled_at: Optional[datetime] = None
    ) -> str:
        """Create and store a notification for a user"""
        try:
            notification_id = str(uuid.uuid4())
            notification_data = {
                "id": notification_id,
                "user_id": user_id,
                "type": notification_type,
                "title": title,
                "message": message,
                "scheduled_at": (scheduled_at or datetime.utcnow()).isoformat(),
                "sent_at": datetime.utcnow().isoformat() if not scheduled_at or scheduled_at <= datetime.utcnow() else None,
                "read_at": None,
                "data": data or {},
                "created_at": datetime.utcnow().isoformat()
            }

            db_service.set_user_doc(user_id, "notifications", notification_id, notification_data)
            return notification_id

        except Exception as e:
            logger.error(f"Error sending notification: {e}")
            raise

    async def send_meal_reminder(self, user_id: str, meal_type: str) -> str:
        meal_names = {"breakfast": "Breakfast", "lunch": "Lunch", "dinner": "Dinner", "snack": "Snack"}
        return await self.send_notification(
            user_id=user_id,
            title=f"Time for {meal_names.get(meal_type, 'a meal')}!",
            message="Don't forget to log your meal and stay on track with your nutrition goals.",
            notification_type="meal_reminder",
            data={"meal_type": meal_type}
        )

    async def send_exercise_reminder(self, user_id: str) -> str:
        return await self.send_notification(
            user_id=user_id, title="Time to move!",
            message="A quick workout can boost your energy and help you reach your fitness goals.",
            notification_type="exercise_reminder"
        )

    async def send_motivational_message(self, user_id: str, streak: int = 0) -> str:
        if streak > 0:
            title, message = f"🔥 {streak} Day Streak!", "You're on fire! Keep up the amazing work!"
        else:
            title, message = "You've Got This!", "Every healthy choice brings you closer to your goals."
        return await self.send_notification(user_id=user_id, title=title, message=message, notification_type="motivational")

    async def send_progress_update(self, user_id: str, progress_data: Dict[str, Any]) -> str:
        weight_change = progress_data.get('weight_change', 0)
        compliance_avg = progress_data.get('compliance_avg', 0)
        if weight_change < 0:
            title, message = "Great Progress! 📉", f"You've lost {abs(weight_change):.1f}kg this week. Keep it up!"
        elif compliance_avg >= 80:
            title, message = "Consistency Champion! 🏆", f"Your average compliance is {compliance_avg:.1f}%."
        else:
            title, message = "Weekly Check-in 📊", "Here's your weekly progress update."
        return await self.send_notification(user_id=user_id, title=title, message=message, notification_type="progress_update", data=progress_data)

    async def send_insight_notification(self, user_id: str, insight_data: Dict[str, Any]) -> str:
        insight_type = insight_data.get('insight_type', 'general')
        titles = {"prediction": "🔮 Health Prediction Available", "recommendation": "💡 New Recommendation"}
        title = titles.get(insight_type, "📈 Health Insight")
        message = "New insights available to help you optimize your health journey."
        return await self.send_notification(user_id=user_id, title=title, message=message, notification_type="insight", data=insight_data)

    async def schedule_daily_notifications(self, user_id: str) -> List[str]:
        """Schedule daily notifications for a user"""
        notification_ids = []
        user_data = db_service.get_user(user_id)
        if not user_data:
            return []

        preferences = user_data.get('notification_preferences', {})
        now = datetime.utcnow()

        if preferences.get('meal_reminders', True):
            for meal, hour, emoji in [("breakfast", 8, "🌅"), ("lunch", 13, "🥗"), ("dinner", 19, "🍽️")]:
                t = now.replace(hour=hour, minute=0, second=0, microsecond=0)
                if t > now:
                    nid = await self.send_notification(
                        user_id=user_id, title=f"{meal.capitalize()} time! {emoji}",
                        message=f"Time for a healthy {meal}.", notification_type="meal_reminder",
                        data={"meal_type": meal}, scheduled_at=t
                    )
                    notification_ids.append(nid)

        if preferences.get('exercise_reminders', True):
            t = now.replace(hour=18, minute=0, second=0, microsecond=0)
            if t > now:
                nid = await self.send_notification(
                    user_id=user_id, title="Exercise time! 💪", message="Time for your daily workout!",
                    notification_type="exercise_reminder", scheduled_at=t
                )
                notification_ids.append(nid)

        if preferences.get('motivational_messages', True):
            t = now.replace(hour=20, minute=0, second=0, microsecond=0)
            if t > now:
                nid = await self.send_notification(
                    user_id=user_id, title="Evening motivation 🌙",
                    message="Reflect on your healthy choices today.", notification_type="motivational", scheduled_at=t
                )
                notification_ids.append(nid)

        return notification_ids

    async def mark_notification_read(self, user_id: str, notification_id: str) -> bool:
        try:
            db_service.update_user_doc(user_id, "notifications", notification_id, {"read_at": datetime.utcnow().isoformat()})
            return True
        except Exception as e:
            logger.error(f"Error marking notification as read: {e}")
            return False

    async def get_unread_notifications(self, user_id: str) -> List[Dict[str, Any]]:
        try:
            all_notifs = db_service.query_user_docs(user_id, "notifications", order_by="created_at", order_dir="DESC")
            return [n for n in all_notifs if n.get('read_at') is None]
        except Exception as e:
            logger.error(f"Error getting unread notifications: {e}")
            return []

    async def send_bulk_notifications(self, user_ids: List[str], title: str, message: str, notification_type: str = "bulk") -> Dict[str, int]:
        results = {"successful": 0, "failed": 0}
        for user_id in user_ids:
            try:
                await self.send_notification(user_id=user_id, title=title, message=message, notification_type=notification_type)
                results["successful"] += 1
            except Exception as e:
                logger.error(f"Failed to send notification to {user_id}: {e}")
                results["failed"] += 1
        return results


# Global instance
notification_service = NotificationService()
