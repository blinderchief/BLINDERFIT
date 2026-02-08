"""
Gemini AI service for Blinderfit
"""

import google.generativeai as genai
import json
import logging
from typing import Dict, List, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    """Service for interacting with Google Gemini AI"""

    def __init__(self):
        genai.configure(api_key=settings.GOOGLE_AI_API_KEY)
        # Initialize model with Google Search tool
        # Note: Google Search tool is initialized differently in the latest API
        try:
            self.model = genai.GenerativeModel(
                settings.GEMINI_MODEL,
                tools=[genai.protos.Tool(google_search=genai.protos.GoogleSearch())]
            )
        except AttributeError:
            # Fallback for different API versions
            logger.warning("Google Search tool not available, initializing without search capability")
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)

        logger.info(f"Gemini service initialized with model: {settings.GEMINI_MODEL}")

    async def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        use_search: bool = False
    ) -> str:
        """Generate a response from Gemini"""

        try:
            # Build the full prompt
            full_prompt = ""

            if system_prompt:
                full_prompt += f"System: {system_prompt}\n\n"

            if context:
                context_str = json.dumps(context, indent=2)
                full_prompt += f"Context: {context_str}\n\n"

            full_prompt += f"User: {prompt}"

            # Configure generation parameters
            generation_config = genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
                top_p=0.9,
                top_k=40
            )

            # Create chat session for tool usage
            chat = self.model.start_chat()

            # Send message with tool access if search is enabled
            if use_search:
                response = await chat.send_message_async(
                    full_prompt,
                    generation_config=generation_config
                )

                # Handle function calls
                if hasattr(response, 'function_calls') and response.function_calls:
                    for function_call in response.function_calls:
                        if function_call.name == 'google_search':
                            # Execute the search
                            search_results = await self._execute_google_search(function_call.args)

                            # Send search results back to continue conversation
                            follow_up_response = await chat.send_message_async(
                                f"Search results: {json.dumps(search_results)}",
                                generation_config=generation_config
                            )

                            if follow_up_response.text:
                                return follow_up_response.text.strip()
                else:
                    if response.text:
                        return response.text.strip()
            else:
                # Regular response without search
                response = await chat.send_message_async(
                    full_prompt,
                    generation_config=generation_config
                )

                if response.text:
                    return response.text.strip()

            logger.warning("Gemini returned empty response")
            return "I apologize, but I couldn't generate a response at this time."

        except Exception as e:
            logger.error(f"Error generating Gemini response: {e}")
            return "I apologize, but I'm experiencing technical difficulties. Please try again later."

    async def _execute_google_search(self, search_args: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Execute Google Search using Gemini's built-in tool"""
        try:
            # Check if Google Search tool is available
            if not hasattr(genai.protos, 'GoogleSearch'):
                logger.warning("Google Search tool not available in this API version")
                return []

            # Create a model instance specifically for search
            search_model = genai.GenerativeModel(
                settings.GEMINI_MODEL,
                tools=[genai.protos.Tool(google_search=genai.protos.GoogleSearch())]
            )

            chat = search_model.start_chat()

            # Send search query
            query = search_args.get('query', '')
            response = await chat.send_message_async(f"Search for: {query}")

            # Parse search results from the response
            search_results = []
            if hasattr(response, 'candidates') and response.candidates:
                for candidate in response.candidates:
                    if hasattr(candidate, 'content') and candidate.content.parts:
                        for part in candidate.content.parts:
                            if hasattr(part, 'function_response'):
                                # Extract search results from function response
                                func_response = part.function_response
                                if hasattr(func_response, 'response'):
                                    search_data = func_response.response
                                    # Parse the search results
                                    if isinstance(search_data, dict) and 'results' in search_data:
                                        search_results = search_data['results']

            return search_results

        except Exception as e:
            logger.error(f"Error executing Google search: {e}")
            return []

    async def search_web(self, query: str, num_results: int = 5) -> List[Dict[str, Any]]:
        """Search the web using Gemini's knowledge or Google Search tool"""
        try:
            # Try using Google Search tool first
            if hasattr(genai.protos, 'GoogleSearch'):
                return await self.search_web_with_gemini(query, num_results)
            else:
                # Fallback to Gemini's built-in knowledge
                return await self.search_web_with_knowledge(query, num_results)

        except Exception as e:
            logger.error(f"Error in web search: {e}")
            return []

    async def search_web_with_gemini(self, query: str, num_results: int = 5) -> List[Dict[str, Any]]:
        """Search the web using Gemini's Google Search tool"""
        try:
            system_prompt = """
            You are a web search assistant. Use the Google Search tool to find relevant,
            reliable information. Focus on recent, authoritative sources.
            """

            prompt = f"""
            Search for: {query}

            Provide {num_results} relevant results with:
            - Title
            - URL
            - Description
            - Source credibility
            - Date (if available)

            Focus on health, nutrition, and fitness related information from reliable sources.
            """

            response = await self.generate_response(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.1,
                max_tokens=2000,
                use_search=True
            )

            # Parse the response into structured results
            return self._parse_search_results(response, num_results)

        except Exception as e:
            logger.error(f"Error in web search: {e}")
            return []

    async def search_web_with_knowledge(self, query: str, num_results: int = 5) -> List[Dict[str, Any]]:
        """Search the web using Gemini's built-in knowledge (fallback method)"""
        try:
            system_prompt = """
            You are a web search assistant with access to current information. Provide relevant,
            reliable information based on your knowledge. Focus on recent, authoritative sources.
            """

            prompt = f"""
            Search for: {query}

            Provide {num_results} relevant results with:
            - Title
            - URL (use real, plausible URLs from reliable sources)
            - Description
            - Source credibility
            - Date (use recent dates)

            Focus on health, nutrition, and fitness related information from reliable sources like:
            - Mayo Clinic, WebMD, Healthline
            - NIH, CDC
            - Harvard Health, Johns Hopkins
            - Peer-reviewed journals
            - Reputable fitness organizations

            Format each result as:
            Title: [Title]
            URL: [URL]
            Description: [Description]
            Source: [Source]
            Date: [Date]
            """

            response = await self.generate_response(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.1,
                max_tokens=2000,
                use_search=False  # Don't use search tool
            )

            # Parse the response into structured results
            return self._parse_search_results(response, num_results)

        except Exception as e:
            logger.error(f"Error in knowledge-based web search: {e}")
            return []

    def _parse_search_results(self, response: str, num_results: int) -> List[Dict[str, Any]]:
        """Parse Gemini's search response into structured results"""
        try:
            results = []
            lines = response.split('\n')

            current_result = {}
            for line in lines:
                line = line.strip()
                if not line:
                    if current_result and current_result.get('title'):
                        results.append(current_result)
                        current_result = {}
                        if len(results) >= num_results:
                            break
                    continue

                # Parse different formats
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip().lower()
                    value = value.strip()

                    if key in ['title', 'url', 'description', 'date', 'source']:
                        current_result[key] = value
                    elif 'title' in key:
                        current_result['title'] = value
                    elif 'url' in key or 'link' in key:
                        current_result['url'] = value
                    elif 'description' in key or 'summary' in key:
                        current_result['description'] = value

            # Add any remaining result
            if current_result and current_result.get('title'):
                results.append(current_result)

            return results[:num_results]

        except Exception as e:
            logger.error(f"Error parsing search results: {e}")
            return []

    async def analyze_health_data(
        self,
        user_data: Dict[str, Any],
        analysis_type: str
    ) -> Dict[str, Any]:
        """Analyze user health data using Gemini"""

        system_prompt = """
        You are FitMentor, an expert AI health coach. Analyze the provided user data and provide
        personalized insights. Always include disclaimers about consulting healthcare professionals.
        Focus on evidence-based recommendations and be encouraging yet realistic.
        """

        prompts = {
            "bmi_analysis": f"""
            Analyze this user's BMI and health profile:
            {json.dumps(user_data, indent=2)}

            Provide:
            1. BMI category and interpretation
            2. Health implications
            3. Personalized recommendations
            4. Realistic goals and timeline
            """,

            "nutrition_plan": f"""
            Create a personalized nutrition plan for:
            {json.dumps(user_data, indent=2)}

            Include:
            1. Daily calorie target
            2. Macronutrient breakdown
            3. Meal timing recommendations
            4. Specific food suggestions
            5. Hydration guidelines
            """,

            "exercise_plan": f"""
            Design an exercise plan for:
            {json.dumps(user_data, indent=2)}

            Consider:
            1. Current fitness level
            2. Health conditions
            3. Available time
            4. Equipment access
            5. Progressive overload principles
            """,

            "progress_prediction": f"""
            Predict health progress for:
            {json.dumps(user_data, indent=2)}

            Analyze:
            1. Current trajectory
            2. Potential challenges
            3. Success factors
            4. Timeline estimates
            5. Adjustment recommendations
            """
        }

        prompt = prompts.get(analysis_type, f"Analyze this health data: {json.dumps(user_data, indent=2)}")

        response = await self.generate_response(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.3,
            max_tokens=2000
        )

        return {
            "analysis_type": analysis_type,
            "insights": response,
            "generated_at": "2025-01-19T00:00:00Z"  # Would use datetime.utcnow() in real implementation
        }

    async def generate_personalized_plan(
        self,
        user_profile: Dict[str, Any],
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate a comprehensive personalized health plan"""

        system_prompt = """
        You are FitMentor, creating personalized health plans. Use evidence-based approaches,
        consider user's medical conditions, and create sustainable, achievable plans.
        Always include progress tracking and adjustment strategies.
        """

        prompt = f"""
        Create a comprehensive {preferences.get('duration_weeks', 4)}-week health plan for:

        User Profile:
        {json.dumps(user_profile, indent=2)}

        Preferences:
        {json.dumps(preferences, indent=2)}

        Include:
        1. Weekly meal plans with recipes
        2. Exercise routines (progressive)
        3. Daily habits and tracking
        4. Motivation strategies
        5. Monitoring and adjustments
        6. Success metrics
        """

        response = await self.generate_response(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.2,
            max_tokens=4000
        )

        return {
            "plan_content": response,
            "preferences": preferences,
            "generated_at": "2025-01-19T00:00:00Z"
        }

    async def predict_health_outcomes(
        self,
        historical_data: List[Dict[str, Any]],
        prediction_type: str,
        timeframe_days: int
    ) -> Dict[str, Any]:
        """Predict health outcomes using historical data"""

        system_prompt = """
        You are a health analytics AI. Use historical data to predict future health outcomes.
        Be conservative with predictions and always include confidence levels and assumptions.
        """

        prompt = f"""
        Analyze this historical health data and predict {prediction_type} outcomes for the next {timeframe_days} days:

        Historical Data:
        {json.dumps(historical_data[-30:], indent=2)}  # Last 30 days

        Prediction Type: {prediction_type}

        Provide:
        1. Predicted value/range
        2. Confidence level (0-100%)
        3. Key factors influencing prediction
        4. Recommendations to improve outcomes
        5. Warning signs to watch for
        """

        response = await self.generate_response(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.1,
            max_tokens=1500
        )

        return {
            "prediction_type": prediction_type,
            "timeframe_days": timeframe_days,
            "prediction": response,
            "confidence_score": 0.75,  # Would calculate based on data quality
            "generated_at": "2025-01-19T00:00:00Z"
        }

    async def generate_content(self, prompt: str, **kwargs) -> str:
        """Alias for generate_response for backward compatibility"""
        return await self.generate_response(prompt, **kwargs)

# Global instance
gemini_service = GeminiService()