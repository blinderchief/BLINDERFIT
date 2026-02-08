"""
Integrations service for Blinderfit Backend
Handles external integrations like wearables, web search, and third-party APIs
"""

from typing import Dict, Any, List, Optional, Union
import httpx
import json
import logging
from datetime import datetime, timedelta
import asyncio
from urllib.parse import urlencode

from app.core.database import get_firestore_client
from app.services.gemini_service import gemini_service

logger = logging.getLogger(__name__)

class IntegrationsService:
    """Service for handling external integrations"""

    def __init__(self):
        self._db = None
        self.http_client = httpx.AsyncClient(timeout=30.0)

    @property
    def db(self):
        if self._db is None:
            self._db = get_firestore_client()
        return self._db

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.http_client.aclose()

    async def search_web(self, query: str, num_results: int = 5) -> List[Dict[str, Any]]:
        """Search the web using Gemini's Google Search tool"""
        try:
            return await gemini_service.search_web_with_gemini(query, num_results)

        except Exception as e:
            logger.error(f"Error searching web: {e}")
            return []

    async def get_nutrition_info(self, food_item: str) -> Dict[str, Any]:
        """Get nutrition information for a food item"""
        try:
            # Using web search to get nutrition info
            search_query = f"nutrition facts for {food_item} per 100g"
            search_results = await self.search_web(search_query, num_results=3)

            # Use Gemini to extract and structure nutrition data
            nutrition_prompt = f"""
            Based on the following search results about {food_item}, extract the nutrition information per 100g:

            {json.dumps(search_results, indent=2)}

            Please provide:
            - Calories
            - Protein (g)
            - Carbohydrates (g)
            - Fat (g)
            - Fiber (g)
            - Sugar (g)
            - Other relevant nutrients

            Format as JSON with numeric values.
            """

            response = await gemini_service.generate_content(nutrition_prompt)

            try:
                # Try to parse JSON response
                nutrition_data = json.loads(response)
                return {
                    "food_item": food_item,
                    "nutrition": nutrition_data,
                    "source": "web_search",
                    "timestamp": datetime.utcnow()
                }
            except json.JSONDecodeError:
                # Fallback to structured text parsing
                return {
                    "food_item": food_item,
                    "nutrition": {"raw_data": response},
                    "source": "web_search",
                    "timestamp": datetime.utcnow()
                }

        except Exception as e:
            logger.error(f"Error getting nutrition info: {e}")
            return {}

    async def get_exercise_info(self, exercise_name: str) -> Dict[str, Any]:
        """Get information about an exercise"""
        try:
            search_query = f"how to do {exercise_name} exercise properly"
            search_results = await self.search_web(search_query, num_results=3)

            exercise_prompt = f"""
            Based on the following information about {exercise_name}, provide:

            1. Proper form and technique
            2. Target muscles
            3. Common mistakes to avoid
            4. Variations or modifications
            5. Benefits

            {json.dumps(search_results, indent=2)}
            """

            response = await gemini_service.generate_content(exercise_prompt)

            return {
                "exercise": exercise_name,
                "information": response,
                "source": "web_search",
                "timestamp": datetime.utcnow()
            }

        except Exception as e:
            logger.error(f"Error getting exercise info: {e}")
            return {}

    async def sync_fitbit_data(self, user_id: str, access_token: str) -> Dict[str, Any]:
        """Sync data from Fitbit"""
        try:
            # Fitbit API endpoints
            base_url = "https://api.fitbit.com/1/user/-/"

            headers = {
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json"
            }

            # Get today's activities
            today = datetime.utcnow().date().isoformat()
            activities_url = f"{base_url}activities/date/{today}.json"

            async with httpx.AsyncClient() as client:
                response = await client.get(activities_url, headers=headers)
                response.raise_for_status()
                activities_data = response.json()

                # Get sleep data
                sleep_url = f"{base_url}sleep/date/{today}.json"
                sleep_response = await client.get(sleep_url, headers=headers)
                sleep_response.raise_for_status()
                sleep_data = sleep_response.json()

                # Get heart rate data
                hr_url = f"{base_url}activities/heart/date/{today}/1d.json"
                hr_response = await client.get(hr_url, headers=headers)
                hr_response.raise_for_status()
                hr_data = hr_response.json()

            # Process and store the data
            processed_data = {
                "steps": activities_data.get("summary", {}).get("steps", 0),
                "calories": activities_data.get("summary", {}).get("caloriesOut", 0),
                "distance": activities_data.get("summary", {}).get("distances", [{}])[0].get("distance", 0),
                "active_minutes": activities_data.get("summary", {}).get("veryActiveMinutes", 0),
                "sleep_hours": sleep_data.get("summary", {}).get("totalMinutesAsleep", 0) / 60,
                "heart_rate_zones": hr_data.get("activities-heart", [{}])[0].get("value", {}).get("heartRateZones", []),
                "sync_timestamp": datetime.utcnow()
            }

            # Store in Firestore
            self.db.collection('users').document(user_id).collection('wearable_data').add({
                "source": "fitbit",
                "data": processed_data,
                "date": today,
                "created_at": datetime.utcnow()
            })

            return processed_data

        except Exception as e:
            logger.error(f"Error syncing Fitbit data: {e}")
            return {}

    async def sync_garmin_data(self, user_id: str, access_token: str) -> Dict[str, Any]:
        """Sync data from Garmin"""
        try:
            # Garmin API endpoints (simplified)
            base_url = "https://apis.garmin.com/wellness-api/rest/"

            headers = {
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json"
            }

            # Get daily summary
            today = datetime.utcnow().date().isoformat()
            summary_url = f"{base_url}dailySummary/{today}"

            async with httpx.AsyncClient() as client:
                response = await client.get(summary_url, headers=headers)
                response.raise_for_status()
                summary_data = response.json()

            # Process Garmin data
            processed_data = {
                "steps": summary_data.get("steps", 0),
                "calories": summary_data.get("calories", 0),
                "distance": summary_data.get("distance", 0),
                "active_time": summary_data.get("activeTime", 0),
                "sleep_score": summary_data.get("sleepScore", 0),
                "sync_timestamp": datetime.utcnow()
            }

            # Store in Firestore
            self.db.collection('users').document(user_id).collection('wearable_data').add({
                "source": "garmin",
                "data": processed_data,
                "date": today,
                "created_at": datetime.utcnow()
            })

            return processed_data

        except Exception as e:
            logger.error(f"Error syncing Garmin data: {e}")
            return {}

    async def get_weather_data(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """Get weather data for location"""
        try:
            # Using OpenWeatherMap API (you'd need to get an API key)
            api_key = "YOUR_OPENWEATHERMAP_API_KEY"  # Should be in environment variables
            weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={api_key}&units=metric"

            async with httpx.AsyncClient() as client:
                response = await client.get(weather_url)
                response.raise_for_status()
                weather_data = response.json()

            return {
                "temperature": weather_data.get("main", {}).get("temp"),
                "humidity": weather_data.get("main", {}).get("humidity"),
                "description": weather_data.get("weather", [{}])[0].get("description"),
                "wind_speed": weather_data.get("wind", {}).get("speed"),
                "location": weather_data.get("name"),
                "timestamp": datetime.utcnow()
            }

        except Exception as e:
            logger.error(f"Error getting weather data: {e}")
            return {}

    async def get_health_news(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Get latest health and fitness news"""
        try:
            search_query = "latest health and fitness news"
            search_results = await self.search_web(search_query, num_results=limit)

            # Process and structure the news
            news_items = []
            for result in search_results:
                news_items.append({
                    "title": result.get("title", ""),
                    "url": result.get("url", ""),
                    "description": result.get("description", ""),
                    "date": result.get("date", ""),
                    "source": "web_search",
                    "timestamp": datetime.utcnow()
                })

            return news_items

        except Exception as e:
            logger.error(f"Error getting health news: {e}")
            return []

    async def analyze_trends(self, user_id: str, data_type: str = "weight") -> Dict[str, Any]:
        """Analyze health trends using user's historical data"""
        try:
            # Get user's historical data
            data_ref = self.db.collection('users').document(user_id).collection('tracking')
            data_docs = data_ref.order_by('date', direction='DESCENDING').limit(30).get()

            data_points = []
            for doc in data_docs:
                doc_data = doc.to_dict()
                if data_type in doc_data:
                    data_points.append({
                        "date": doc_data.get("date"),
                        "value": doc_data.get(data_type),
                        "timestamp": doc_data.get("created_at")
                    })

            if not data_points:
                return {"error": "No data available for analysis"}

            # Use Gemini to analyze trends
            analysis_prompt = f"""
            Analyze the following {data_type} data points for health trends:

            {json.dumps(data_points, indent=2)}

            Please provide:
            1. Overall trend (increasing, decreasing, stable)
            2. Key insights or patterns
            3. Recommendations based on the trend
            4. Any concerns or positive developments

            Keep the analysis concise but informative.
            """

            analysis = await gemini_service.generate_content(analysis_prompt)

            return {
                "data_type": data_type,
                "data_points": len(data_points),
                "analysis": analysis,
                "timestamp": datetime.utcnow()
            }

        except Exception as e:
            logger.error(f"Error analyzing trends: {e}")
            return {"error": str(e)}

    async def get_research_papers(self, topic: str, limit: int = 3) -> List[Dict[str, Any]]:
        """Get relevant research papers on a health topic"""
        try:
            search_query = f"scientific research papers on {topic} health"
            search_results = await self.search_web(search_query, num_results=limit)

            papers = []
            for result in search_results:
                papers.append({
                    "title": result.get("title", ""),
                    "url": result.get("url", ""),
                    "abstract": result.get("description", ""),
                    "topic": topic,
                    "source": "web_search",
                    "timestamp": datetime.utcnow()
                })

            return papers

        except Exception as e:
            logger.error(f"Error getting research papers: {e}")
            return []

    async def store_integration_data(self, user_id: str, integration_type: str, data: Dict[str, Any]) -> str:
        """Store integration data in Firestore"""
        try:
            doc_ref = self.db.collection('users').document(user_id).collection('integrations').document()
            doc_ref.set({
                "type": integration_type,
                "data": data,
                "created_at": datetime.utcnow()
            })
            return doc_ref.id
        except Exception as e:
            logger.error(f"Error storing integration data: {e}")
            return ""

    async def get_integration_history(self, user_id: str, integration_type: str = None, limit: int = 10) -> List[Dict[str, Any]]:
        """Get integration history for user"""
        try:
            query = self.db.collection('users').document(user_id).collection('integrations')

            if integration_type:
                query = query.where('type', '==', integration_type)

            docs = query.order_by('created_at', direction='DESCENDING').limit(limit).get()

            return [doc.to_dict() for doc in docs]
        except Exception as e:
            logger.error(f"Error getting integration history: {e}")
            return []

# Global instance
integrations_service = IntegrationsService()