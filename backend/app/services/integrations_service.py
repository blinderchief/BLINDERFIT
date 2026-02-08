"""
Integrations service for Blinderfit Backend
Handles external integrations like wearables, web search, and third-party APIs.
Uses PostgreSQL (via db_service) instead of Firestore.
"""

from typing import Dict, Any, List, Optional
import httpx
import json
import logging
from datetime import datetime, timedelta
import uuid

from app.core.database import db_service
from app.services.gemini_service import gemini_service

logger = logging.getLogger(__name__)


class IntegrationsService:
    """Service for handling external integrations"""

    def __init__(self):
        self.http_client = httpx.AsyncClient(timeout=30.0)

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.http_client.aclose()

    async def search_web(self, query: str, num_results: int = 5) -> List[Dict[str, Any]]:
        try:
            return await gemini_service.search_web_with_gemini(query, num_results)
        except Exception as e:
            logger.error(f"Error searching web: {e}")
            return []

    async def get_nutrition_info(self, food_item: str) -> Dict[str, Any]:
        try:
            search_results = await self.search_web(f"nutrition facts for {food_item} per 100g", num_results=3)
            prompt = f"""Based on search results about {food_item}, extract nutrition per 100g:
            {json.dumps(search_results, indent=2)}
            Provide: Calories, Protein, Carbs, Fat, Fiber, Sugar. Format as JSON."""
            response = await gemini_service.generate_content(prompt)
            try:
                nutrition_data = json.loads(response)
            except json.JSONDecodeError:
                nutrition_data = {"raw_data": response}
            return {"food_item": food_item, "nutrition": nutrition_data, "source": "web_search", "timestamp": datetime.utcnow().isoformat()}
        except Exception as e:
            logger.error(f"Error getting nutrition info: {e}")
            return {}

    async def get_exercise_info(self, exercise_name: str) -> Dict[str, Any]:
        try:
            search_results = await self.search_web(f"how to do {exercise_name} exercise properly", num_results=3)
            prompt = f"""Based on info about {exercise_name}, provide: form, target muscles, common mistakes, variations, benefits.
            {json.dumps(search_results, indent=2)}"""
            response = await gemini_service.generate_content(prompt)
            return {"exercise": exercise_name, "information": response, "source": "web_search", "timestamp": datetime.utcnow().isoformat()}
        except Exception as e:
            logger.error(f"Error getting exercise info: {e}")
            return {}

    async def sync_fitbit_data(self, user_id: str, access_token: str) -> Dict[str, Any]:
        try:
            base_url = "https://api.fitbit.com/1/user/-/"
            headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/json"}
            today = datetime.utcnow().date().isoformat()

            async with httpx.AsyncClient() as client:
                activities_resp = await client.get(f"{base_url}activities/date/{today}.json", headers=headers)
                activities_resp.raise_for_status()
                activities = activities_resp.json()

                sleep_resp = await client.get(f"{base_url}sleep/date/{today}.json", headers=headers)
                sleep_resp.raise_for_status()
                sleep = sleep_resp.json()

                hr_resp = await client.get(f"{base_url}activities/heart/date/{today}/1d.json", headers=headers)
                hr_resp.raise_for_status()
                hr = hr_resp.json()

            processed_data = {
                "steps": activities.get("summary", {}).get("steps", 0),
                "calories": activities.get("summary", {}).get("caloriesOut", 0),
                "distance": activities.get("summary", {}).get("distances", [{}])[0].get("distance", 0),
                "active_minutes": activities.get("summary", {}).get("veryActiveMinutes", 0),
                "sleep_hours": sleep.get("summary", {}).get("totalMinutesAsleep", 0) / 60,
                "heart_rate_zones": hr.get("activities-heart", [{}])[0].get("value", {}).get("heartRateZones", []),
                "sync_timestamp": datetime.utcnow().isoformat()
            }

            doc_id = str(uuid.uuid4())
            db_service.set_user_doc(user_id, "wearable_data", doc_id, {"source": "fitbit", "data": processed_data, "date": today, "created_at": datetime.utcnow().isoformat()})
            return processed_data
        except Exception as e:
            logger.error(f"Error syncing Fitbit data: {e}")
            return {}

    async def sync_garmin_data(self, user_id: str, access_token: str) -> Dict[str, Any]:
        try:
            base_url = "https://apis.garmin.com/wellness-api/rest/"
            headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/json"}
            today = datetime.utcnow().date().isoformat()

            async with httpx.AsyncClient() as client:
                response = await client.get(f"{base_url}dailySummary/{today}", headers=headers)
                response.raise_for_status()
                summary = response.json()

            processed_data = {
                "steps": summary.get("steps", 0), "calories": summary.get("calories", 0),
                "distance": summary.get("distance", 0), "active_time": summary.get("activeTime", 0),
                "sleep_score": summary.get("sleepScore", 0), "sync_timestamp": datetime.utcnow().isoformat()
            }

            doc_id = str(uuid.uuid4())
            db_service.set_user_doc(user_id, "wearable_data", doc_id, {"source": "garmin", "data": processed_data, "date": today, "created_at": datetime.utcnow().isoformat()})
            return processed_data
        except Exception as e:
            logger.error(f"Error syncing Garmin data: {e}")
            return {}

    async def get_weather_data(self, latitude: float, longitude: float) -> Dict[str, Any]:
        try:
            import os
            api_key = os.getenv("OPENWEATHERMAP_API_KEY", "")
            if not api_key:
                return {"error": "Weather API key not configured"}
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={api_key}&units=metric"
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                response.raise_for_status()
                data = response.json()
            return {
                "temperature": data.get("main", {}).get("temp"),
                "humidity": data.get("main", {}).get("humidity"),
                "description": data.get("weather", [{}])[0].get("description"),
                "wind_speed": data.get("wind", {}).get("speed"),
                "location": data.get("name"),
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Error getting weather data: {e}")
            return {}

    async def get_health_news(self, limit: int = 5) -> List[Dict[str, Any]]:
        try:
            results = await self.search_web("latest health and fitness news", num_results=limit)
            return [{"title": r.get("title", ""), "url": r.get("url", ""), "description": r.get("description", ""), "source": "web_search", "timestamp": datetime.utcnow().isoformat()} for r in results]
        except Exception as e:
            logger.error(f"Error getting health news: {e}")
            return []

    async def analyze_trends(self, user_id: str, data_type: str = "weight") -> Dict[str, Any]:
        try:
            tracking_data = db_service.query_user_docs(user_id, "tracking", order_by="date", order_dir="DESC", limit_count=30)
            data_points = [{"date": d.get("date"), "value": d.get(data_type)} for d in tracking_data if data_type in d]
            if not data_points:
                return {"error": "No data available for analysis"}

            prompt = f"""Analyze the following {data_type} data points for health trends:
            {json.dumps(data_points, indent=2)}
            Provide: overall trend, key insights, recommendations, concerns."""
            analysis = await gemini_service.generate_content(prompt)
            return {"data_type": data_type, "data_points": len(data_points), "analysis": analysis, "timestamp": datetime.utcnow().isoformat()}
        except Exception as e:
            logger.error(f"Error analyzing trends: {e}")
            return {"error": str(e)}

    async def get_research_papers(self, topic: str, limit: int = 3) -> List[Dict[str, Any]]:
        try:
            results = await self.search_web(f"scientific research papers on {topic} health", num_results=limit)
            return [{"title": r.get("title", ""), "url": r.get("url", ""), "abstract": r.get("description", ""), "topic": topic, "timestamp": datetime.utcnow().isoformat()} for r in results]
        except Exception as e:
            logger.error(f"Error getting research papers: {e}")
            return []

    async def store_integration_data(self, user_id: str, integration_type: str, data: Dict[str, Any]) -> str:
        try:
            doc_id = str(uuid.uuid4())
            db_service.set_user_doc(user_id, "integrations", doc_id, {"type": integration_type, "data": data, "created_at": datetime.utcnow().isoformat()})
            return doc_id
        except Exception as e:
            logger.error(f"Error storing integration data: {e}")
            return ""

    async def get_integration_history(self, user_id: str, integration_type: str = None, limit: int = 10) -> List[Dict[str, Any]]:
        try:
            filters = {"type": integration_type} if integration_type else None
            return db_service.query_user_docs(user_id, "integrations", filters=filters, order_by="created_at", order_dir="DESC", limit_count=limit)
        except Exception as e:
            logger.error(f"Error getting integration history: {e}")
            return []


# Global instance
integrations_service = IntegrationsService()
