"""
Notifications service for Blinderfit Backend
"""

from typing import Dict, Any, List, Optional
import firebase_admin
from firebase_admin import messaging
import logging
from datetime import datetime, timedelta
import json

from app.core.database import get_firestore_client

logger = logging.getLogger(__name__)

class NotificationService:
    """Service for handling push notifications"""

    def __init__(self):
        self._db = None

    @property
    def db(self):
        if self._db is None:
            self._db = get_firestore_client()
        return self._db

    async def send_notification(
        self,
        user_id: str,
        title: str,
        message: str,
        notification_type: str = "general",
        data: Optional[Dict[str, Any]] = None,
        scheduled_at: Optional[datetime] = None
    ) -> str:
        """Send a notification to a user"""
        try:
            # Get user's FCM token
            user_doc = self.db.collection('users').document(user_id).get()
            if not user_doc.exists:
                raise ValueError(f"User {user_id} not found")

            user_data = user_doc.to_dict()
            fcm_token = user_data.get('fcm_token')

            if not fcm_token:
                logger.warning(f"No FCM token found for user {user_id}")
                return ""

            # Create notification data
            notification_data = {
                "user_id": user_id,
                "type": notification_type,
                "title": title,
                "message": message,
                "scheduled_at": scheduled_at or datetime.utcnow(),
                "sent_at": None,
                "read_at": None,
                "data": data or {},
                "created_at": datetime.utcnow()
            }

            # Save to Firestore
            notification_ref = self.db.collection('users').document(user_id).collection('notifications').document()
            notification_ref.set(notification_data)

            # Send immediate notification if not scheduled
            if not scheduled_at or scheduled_at <= datetime.utcnow():
                await self._send_fcm_notification(fcm_token, title, message, data)
                notification_ref.update({"sent_at": datetime.utcnow()})

            return notification_ref.id

        except Exception as e:
            logger.error(f"Error sending notification: {e}")
            raise

    async def send_meal_reminder(self, user_id: str, meal_type: str) -> str:
        """Send meal reminder notification"""
        meal_names = {
            "breakfast": "Breakfast",
            "lunch": "Lunch",
            "dinner": "Dinner",
            "snack": "Snack"
        }

        title = f"Time for {meal_names.get(meal_type, 'a meal')}!"
        message = "Don't forget to log your meal and stay on track with your nutrition goals."

        return await self.send_notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type="meal_reminder",
            data={"meal_type": meal_type}
        )

    async def send_exercise_reminder(self, user_id: str) -> str:
        """Send exercise reminder notification"""
        title = "Time to move!"
        message = "A quick workout can boost your energy and help you reach your fitness goals."

        return await self.send_notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type="exercise_reminder"
        )

    async def send_motivational_message(self, user_id: str, streak: int = 0) -> str:
        """Send motivational notification"""
        if streak > 0:
            title = f"🔥 {streak} Day Streak!"
            message = "You're on fire! Keep up the amazing work!"
        else:
            title = "You've Got This!"
            message = "Every healthy choice brings you closer to your goals. Stay strong!"

        return await self.send_notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type="motivational"
        )

    async def send_progress_update(self, user_id: str, progress_data: Dict[str, Any]) -> str:
        """Send progress update notification"""
        weight_change = progress_data.get('weight_change', 0)
        compliance_avg = progress_data.get('compliance_avg', 0)

        if weight_change < 0:
            title = "Great Progress! 📉"
            message = f"You've lost {abs(weight_change):.1f}kg this week. Keep it up!"
        elif compliance_avg >= 80:
            title = "Consistency Champion! 🏆"
            message = f"Your average compliance is {compliance_avg:.1f}%. You're doing amazing!"
        else:
            title = "Weekly Check-in 📊"
            message = "Here's your weekly progress update. Every step counts!"

        return await self.send_notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type="progress_update",
            data=progress_data
        )

    async def send_insight_notification(self, user_id: str, insight_data: Dict[str, Any]) -> str:
        """Send ML insight notification"""
        insight_type = insight_data.get('insight_type', 'general')

        if insight_type == 'prediction':
            title = "🔮 Health Prediction Available"
            message = "Check out your personalized health prediction in the dashboard!"
        elif insight_type == 'recommendation':
            title = "💡 New Recommendation"
            message = "We have a personalized recommendation for you based on your data."
        else:
            title = "📈 Health Insight"
            message = "New insights available to help you optimize your health journey."

        return await self.send_notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type="insight",
            data=insight_data
        )

    async def schedule_daily_notifications(self, user_id: str) -> List[str]:
        """Schedule daily notifications for a user"""
        notification_ids = []

        # Get user preferences
        user_doc = self.db.collection('users').document(user_id).get()
        if not user_doc.exists:
            return []

        user_data = user_doc.to_dict()
        preferences = user_data.get('notification_preferences', {})

        # Schedule meal reminders
        if preferences.get('meal_reminders', True):
            # Breakfast reminder
            breakfast_time = datetime.utcnow().replace(hour=8, minute=0, second=0, microsecond=0)
            if breakfast_time > datetime.utcnow():
                notification_ids.append(await self.send_notification(
                    user_id=user_id,
                    title="Good morning! 🌅",
                    message="Start your day with a healthy breakfast.",
                    notification_type="meal_reminder",
                    data={"meal_type": "breakfast"},
                    scheduled_at=breakfast_time
                ))

            # Lunch reminder
            lunch_time = datetime.utcnow().replace(hour=13, minute=0, second=0, microsecond=0)
            if lunch_time > datetime.utcnow():
                notification_ids.append(await self.send_notification(
                    user_id=user_id,
                    title="Lunch time! 🥗",
                    message="Fuel your body with a nutritious lunch.",
                    notification_type="meal_reminder",
                    data={"meal_type": "lunch"},
                    scheduled_at=lunch_time
                ))

            # Dinner reminder
            dinner_time = datetime.utcnow().replace(hour=19, minute=0, second=0, microsecond=0)
            if dinner_time > datetime.utcnow():
                notification_ids.append(await self.send_notification(
                    user_id=user_id,
                    title="Dinner time! 🍽️",
                    message="End your day with a balanced dinner.",
                    notification_type="meal_reminder",
                    data={"meal_type": "dinner"},
                    scheduled_at=dinner_time
                ))

        # Schedule exercise reminder
        if preferences.get('exercise_reminders', True):
            exercise_time = datetime.utcnow().replace(hour=18, minute=0, second=0, microsecond=0)
            if exercise_time > datetime.utcnow():
                notification_ids.append(await self.send_notification(
                    user_id=user_id,
                    title="Exercise time! 💪",
                    message="Time for your daily workout!",
                    notification_type="exercise_reminder",
                    scheduled_at=exercise_time
                ))

        # Schedule motivational message
        if preferences.get('motivational_messages', True):
            motivation_time = datetime.utcnow().replace(hour=20, minute=0, second=0, microsecond=0)
            if motivation_time > datetime.utcnow():
                notification_ids.append(await self.send_notification(
                    user_id=user_id,
                    title="Evening motivation 🌙",
                    message="Reflect on your healthy choices today. Tomorrow is another opportunity!",
                    notification_type="motivational",
                    scheduled_at=motivation_time
                ))

        return notification_ids

    async def update_fcm_token(self, user_id: str, fcm_token: str) -> bool:
        """Update user's FCM token"""
        try:
            self.db.collection('users').document(user_id).update({
                'fcm_token': fcm_token,
                'fcm_token_updated_at': datetime.utcnow()
            })
            return True
        except Exception as e:
            logger.error(f"Error updating FCM token: {e}")
            return False

    async def mark_notification_read(self, user_id: str, notification_id: str) -> bool:
        """Mark notification as read"""
        try:
            notification_ref = self.db.collection('users').document(user_id).collection('notifications').document(notification_id)
            notification_ref.update({
                'read_at': datetime.utcnow()
            })
            return True
        except Exception as e:
            logger.error(f"Error marking notification as read: {e}")
            return False

    async def get_unread_notifications(self, user_id: str) -> List[Dict[str, Any]]:
        """Get unread notifications for user"""
        try:
            notifications_ref = self.db.collection('users').document(user_id).collection('notifications')
            unread = notifications_ref.where('read_at', '==', None).order_by('created_at', direction='DESCENDING').get()

            return [doc.to_dict() for doc in unread]
        except Exception as e:
            logger.error(f"Error getting unread notifications: {e}")
            return []

    async def _send_fcm_notification(
        self,
        fcm_token: str,
        title: str,
        message: str,
        data: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Send FCM notification"""
        try:
            # Create the message
            fcm_message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=message,
                ),
                data=data or {},
                token=fcm_token,
            )

            # Send the message
            response = messaging.send(fcm_message)
            logger.info(f"Successfully sent FCM message: {response}")
            return True

        except Exception as e:
            logger.error(f"Error sending FCM notification: {e}")
            return False

    async def send_bulk_notifications(
        self,
        user_ids: List[str],
        title: str,
        message: str,
        notification_type: str = "bulk"
    ) -> Dict[str, int]:
        """Send notification to multiple users"""
        results = {"successful": 0, "failed": 0}

        for user_id in user_ids:
            try:
                await self.send_notification(
                    user_id=user_id,
                    title=title,
                    message=message,
                    notification_type=notification_type
                )
                results["successful"] += 1
            except Exception as e:
                logger.error(f"Failed to send notification to {user_id}: {e}")
                results["failed"] += 1

        return results

# Global instance
notification_service = NotificationService()