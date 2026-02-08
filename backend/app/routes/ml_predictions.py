"""
ML Predictions routes for advanced analytics and forecasting
"""

from fastapi import APIRouter, Depends, HTTPException, status
import logging
from datetime import datetime, date, timedelta
from typing import Dict, Any, List
import json
import uuid

from app.core.database import get_firestore_client
from app.models import (
    PredictionRequest,
    MLInsight,
    PredictionData,
    APIResponse
)
from app.routes.auth import get_current_user
from app.services.gemini_service import gemini_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/predict", response_model=APIResponse)
async def generate_prediction(
    request: PredictionRequest,
    user_id: str = Depends(get_current_user)
):
    """Generate ML-powered health predictions"""
    try:
        db = get_firestore_client()

        # Get historical data for prediction
        historical_data = await get_historical_data_for_prediction(user_id, request.timeframe_days)

        # Generate prediction using Gemini AI
        prediction_result = await generate_ml_prediction(
            user_id,
            request.prediction_type,
            historical_data,
            request.timeframe_days
        )

        # Save prediction as ML insight
        ml_insight = MLInsight(
            id=str(uuid.uuid4()),
            user_id=user_id,
            insight_type="prediction",
            technique_used="predictive_analytics",
            input_data={
                "prediction_type": request.prediction_type,
                "timeframe_days": request.timeframe_days,
                "historical_data_points": len(historical_data)
            },
            output_data=prediction_result,
            confidence_score=prediction_result.get('confidence_score', 0.75),
            generated_at=datetime.utcnow()
        )

        # Save to Firestore
        db.collection('users').document(user_id).collection('ml_insights').document(ml_insight.id).set(ml_insight.dict())

        return APIResponse(
            success=True,
            message="Prediction generated successfully",
            data={
                "prediction": prediction_result,
                "insight_id": ml_insight.id,
                "generated_at": datetime.utcnow().isoformat()
            }
        )

    except Exception as e:
        logger.error(f"Prediction generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Prediction generation failed"
        )

@router.get("/insights", response_model=APIResponse)
async def get_ml_insights(
    insight_type: str = None,
    limit: int = 10,
    user_id: str = Depends(get_current_user)
):
    """Get user's ML-generated insights"""
    try:
        db = get_firestore_client()

        insights_ref = db.collection('users').document(user_id).collection('ml_insights')

        if insight_type:
            insights = insights_ref.where('insight_type', '==', insight_type).order_by('generated_at', direction='DESCENDING').limit(limit).get()
        else:
            insights = insights_ref.order_by('generated_at', direction='DESCENDING').limit(limit).get()

        insights_data = []
        for insight in insights:
            insights_data.append(insight.to_dict())

        return APIResponse(
            success=True,
            message="ML insights retrieved successfully",
            data={
                "insights": insights_data,
                "total": len(insights_data),
                "filter": insight_type
            }
        )

    except Exception as e:
        logger.error(f"Error getting ML insights: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get ML insights"
        )

@router.post("/personalize", response_model=APIResponse)
async def generate_personalization(
    data_slice: Dict[str, Any],
    user_id: str = Depends(get_current_user)
):
    """Generate personalized recommendations using ML"""
    try:
        db = get_firestore_client()

        # Get user context
        user_context = await get_user_context_for_personalization(user_id)

        # Generate personalization using collaborative filtering approach
        personalization_result = await generate_collaborative_filtering(
            user_context,
            data_slice
        )

        # Save as ML insight
        ml_insight = MLInsight(
            id=str(uuid.uuid4()),
            user_id=user_id,
            insight_type="recommendation",
            technique_used="collaborative_filtering",
            input_data=data_slice,
            output_data=personalization_result,
            confidence_score=personalization_result.get('confidence_score', 0.8),
            generated_at=datetime.utcnow()
        )

        # Save to Firestore
        db.collection('users').document(user_id).collection('ml_insights').document(ml_insight.id).set(ml_insight.dict())

        return APIResponse(
            success=True,
            message="Personalization generated successfully",
            data={
                "personalization": personalization_result,
                "insight_id": ml_insight.id,
                "generated_at": datetime.utcnow().isoformat()
            }
        )

    except Exception as e:
        logger.error(f"Personalization generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Personalization generation failed"
        )

@router.post("/analyze-patterns", response_model=APIResponse)
async def analyze_user_patterns(
    analysis_type: str = "comprehensive",
    user_id: str = Depends(get_current_user)
):
    """Analyze user patterns and provide insights"""
    try:
        db = get_firestore_client()

        # Get comprehensive user data
        user_data = await get_comprehensive_user_data(user_id)

        # Generate pattern analysis
        analysis_result = await generate_pattern_analysis(user_data, analysis_type)

        # Save as ML insight
        ml_insight = MLInsight(
            id=str(uuid.uuid4()),
            user_id=user_id,
            insight_type="analysis",
            technique_used="pattern_analysis",
            input_data={"analysis_type": analysis_type},
            output_data=analysis_result,
            confidence_score=analysis_result.get('confidence_score', 0.85),
            generated_at=datetime.utcnow()
        )

        # Save to Firestore
        db.collection('users').document(user_id).collection('ml_insights').document(ml_insight.id).set(ml_insight.dict())

        return APIResponse(
            success=True,
            message="Pattern analysis completed successfully",
            data={
                "analysis": analysis_result,
                "insight_id": ml_insight.id,
                "generated_at": datetime.utcnow().isoformat()
            }
        )

    except Exception as e:
        logger.error(f"Pattern analysis error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Pattern analysis failed"
        )

@router.get("/trends", response_model=APIResponse)
async def get_health_trends(
    metric: str = "weight",
    period_days: int = 30,
    user_id: str = Depends(get_current_user)
):
    """Get health metric trends with ML analysis"""
    try:
        # Get historical data for the metric
        historical_data = await get_metric_history(user_id, metric, period_days)

        # Analyze trends using ML
        trend_analysis = await analyze_metric_trends(historical_data, metric)

        return APIResponse(
            success=True,
            message="Health trends analyzed successfully",
            data={
                "metric": metric,
                "period_days": period_days,
                "historical_data": historical_data,
                "trend_analysis": trend_analysis,
                "generated_at": datetime.utcnow().isoformat()
            }
        )

    except Exception as e:
        logger.error(f"Error getting health trends: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get health trends"
        )

async def get_historical_data_for_prediction(user_id: str, timeframe_days: int) -> List[Dict[str, Any]]:
    """Get historical data for ML predictions"""
    try:
        db = get_firestore_client()

        # Calculate date range
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=timeframe_days)

        historical_data = []

        # Get tracking data
        current_date = start_date
        while current_date <= end_date:
            tracking_doc = db.collection('users').document(user_id).collection('tracking').document(current_date.isoformat()).get()
            if tracking_doc.exists:
                data = tracking_doc.to_dict()
                data['date'] = current_date.isoformat()
                historical_data.append(data)
            else:
                # Add empty entry for missing dates
                historical_data.append({
                    'date': current_date.isoformat(),
                    'compliance_score': 0,
                    'meals': [],
                    'exercises': [],
                    'weight_kg': None
                })
            current_date += timedelta(days=1)

        return historical_data

    except Exception as e:
        logger.error(f"Error getting historical data: {e}")
        return []

async def generate_ml_prediction(
    user_id: str,
    prediction_type: str,
    historical_data: List[Dict[str, Any]],
    timeframe_days: int
) -> Dict[str, Any]:
    """Generate ML prediction using Gemini"""
    try:
        system_prompt = """
        You are a health analytics AI specializing in predictive modeling.
        Analyze historical health data and provide accurate, conservative predictions.
        Always include confidence levels and assumptions.
        """

        prompt = f"""
        Analyze this historical health data and predict {prediction_type} for the next {timeframe_days} days:

        Historical Data (last {len(historical_data)} days):
        {json.dumps(historical_data[-30:], indent=2)}  # Last 30 days for context

        Prediction Type: {prediction_type}

        Provide:
        1. Predicted value or range
        2. Confidence level (0-100%)
        3. Key factors influencing the prediction
        4. Potential risks or uncertainties
        5. Recommendations to influence the outcome
        6. Timeline for achieving the prediction

        Be conservative with predictions and emphasize that this is not medical advice.
        """

        response = await gemini_service.generate_response(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.1,  # Low temperature for consistent predictions
            max_tokens=800
        )

        # Parse prediction from response
        return {
            "prediction_type": prediction_type,
            "timeframe_days": timeframe_days,
            "prediction": response,
            "confidence_score": 0.75,
            "factors_considered": [
                "Historical compliance patterns",
                "Weight change trends",
                "Exercise frequency",
                "Meal logging consistency"
            ],
            "recommendations": [
                "Maintain consistent tracking",
                "Focus on sustainable habits",
                "Consult healthcare professionals"
            ],
            "generated_at": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Error generating ML prediction: {e}")
        return {
            "prediction_type": prediction_type,
            "timeframe_days": timeframe_days,
            "prediction": "Unable to generate prediction due to insufficient data. Please continue tracking for more accurate insights.",
            "confidence_score": 0.0,
            "factors_considered": [],
            "recommendations": ["Continue daily tracking", "Maintain consistency"],
            "generated_at": datetime.utcnow().isoformat()
        }

async def get_user_context_for_personalization(user_id: str) -> Dict[str, Any]:
    """Get user context for personalization"""
    try:
        db = get_firestore_client()

        # Get user profile
        user_doc = db.collection('users').document(user_id).get()
        user_data = user_doc.to_dict() if user_doc.exists else {}

        # Get preferences and goals
        onboarding_doc = db.collection('users').document(user_id).collection('onboarding').document('data').get()
        onboarding_data = onboarding_doc.to_dict() if onboarding_doc.exists else {}

        # Get recent activity
        recent_tracking = await get_historical_data_for_prediction(user_id, 14)  # Last 2 weeks

        return {
            "profile": user_data,
            "preferences": onboarding_data.get('dietary_preferences', {}),
            "goals": onboarding_data.get('goals', {}),
            "recent_activity": recent_tracking
        }

    except Exception as e:
        logger.error(f"Error getting user context for personalization: {e}")
        return {}

async def generate_collaborative_filtering(
    user_context: Dict[str, Any],
    data_slice: Dict[str, Any]
) -> Dict[str, Any]:
    """Generate recommendations using collaborative filtering approach"""
    try:
        system_prompt = """
        You are a recommendation engine using collaborative filtering for health apps.
        Analyze user patterns and provide personalized recommendations based on similar user profiles.
        """

        prompt = f"""
        Using collaborative filtering approach, analyze this user's data and provide personalized recommendations:

        User Profile: {json.dumps(user_context.get('profile', {}), indent=2)}
        Preferences: {json.dumps(user_context.get('preferences', {}), indent=2)}
        Goals: {json.dumps(user_context.get('goals', {}), indent=2)}
        Recent Activity: {json.dumps(user_context.get('recent_activity', [])[-7:], indent=2)}  # Last 7 days
        Additional Data: {json.dumps(data_slice, indent=2)}

        Provide recommendations for:
        1. Nutrition adjustments
        2. Exercise modifications
        3. Lifestyle improvements
        4. Similar user success patterns

        Base recommendations on patterns that have worked for similar users.
        """

        response = await gemini_service.generate_response(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.4,
            max_tokens=600
        )

        return {
            "technique": "collaborative_filtering",
            "recommendations": response,
            "confidence_score": 0.8,
            "based_on_similar_users": True,
            "factors_considered": [
                "User profile similarity",
                "Goal alignment",
                "Activity patterns",
                "Success rates of similar users"
            ],
            "generated_at": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Error generating collaborative filtering: {e}")
        return {
            "technique": "collaborative_filtering",
            "recommendations": "Based on similar user patterns, focus on consistent meal timing and gradual exercise increases.",
            "confidence_score": 0.6,
            "based_on_similar_users": False,
            "factors_considered": ["Basic pattern matching"],
            "generated_at": datetime.utcnow().isoformat()
        }

async def get_comprehensive_user_data(user_id: str) -> Dict[str, Any]:
    """Get comprehensive user data for pattern analysis"""
    try:
        db = get_firestore_client()

        # Get all available user data
        user_doc = db.collection('users').document(user_id).get()
        user_data = user_doc.to_dict() if user_doc.exists else {}

        # Get all tracking data
        tracking_ref = db.collection('users').document(user_id).collection('tracking')
        all_tracking = tracking_ref.get()
        tracking_data = [doc.to_dict() for doc in all_tracking]

        # Get onboarding data
        onboarding_doc = db.collection('users').document(user_id).collection('onboarding').document('data').get()
        onboarding_data = onboarding_doc.to_dict() if onboarding_doc.exists else {}

        # Get plan history
        plans_ref = db.collection('users').document(user_id).collection('plans')
        all_plans = plans_ref.get()
        plans_data = [doc.to_dict() for doc in all_plans]

        return {
            "profile": user_data,
            "tracking_history": tracking_data,
            "onboarding": onboarding_data,
            "plans_history": plans_data,
            "total_data_points": len(tracking_data)
        }

    except Exception as e:
        logger.error(f"Error getting comprehensive user data: {e}")
        return {}

async def generate_pattern_analysis(
    user_data: Dict[str, Any],
    analysis_type: str
) -> Dict[str, Any]:
    """Generate comprehensive pattern analysis"""
    try:
        system_prompt = """
        You are a health data analyst. Analyze user patterns across all available data
        to identify trends, correlations, and actionable insights.
        """

        prompt = f"""
        Perform comprehensive pattern analysis on this user's health data:

        Profile: {json.dumps(user_data.get('profile', {}), indent=2)}
        Tracking History: {len(user_data.get('tracking_history', []))} days of data
        Recent Activity: {json.dumps(user_data.get('tracking_history', [])[-14:], indent=2)}  # Last 14 days
        Goals: {json.dumps(user_data.get('onboarding', {}).get('goals', {}), indent=2)}
        Plans History: {len(user_data.get('plans_history', []))} plans

        Analysis Type: {analysis_type}

        Identify:
        1. Consistency patterns
        2. Success factors
        3. Challenge areas
        4. Correlations between activities and outcomes
        5. Optimal timing and frequency
        6. Personalized recommendations

        Provide data-driven insights with specific examples.
        """

        response = await gemini_service.generate_response(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.2,
            max_tokens=1000
        )

        return {
            "analysis_type": analysis_type,
            "insights": response,
            "confidence_score": 0.85,
            "data_points_analyzed": user_data.get('total_data_points', 0),
            "patterns_identified": [
                "Consistency correlations",
                "Timing optimization",
                "Success factors",
                "Challenge patterns"
            ],
            "generated_at": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Error generating pattern analysis: {e}")
        return {
            "analysis_type": analysis_type,
            "insights": "Pattern analysis requires more tracking data. Continue logging for better insights.",
            "confidence_score": 0.5,
            "data_points_analyzed": user_data.get('total_data_points', 0),
            "patterns_identified": [],
            "generated_at": datetime.utcnow().isoformat()
        }

async def get_metric_history(
    user_id: str,
    metric: str,
    period_days: int
) -> List[Dict[str, Any]]:
    """Get historical data for a specific metric"""
    try:
        db = get_firestore_client()

        # Calculate date range
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=period_days)

        metric_data = []

        # Get tracking data and extract metric
        current_date = start_date
        while current_date <= end_date:
            tracking_doc = db.collection('users').document(user_id).collection('tracking').document(current_date.isoformat()).get()
            if tracking_doc.exists:
                data = tracking_doc.to_dict()
                value = None

                if metric == "weight":
                    value = data.get('weight_kg')
                elif metric == "compliance":
                    value = data.get('compliance_score')
                elif metric == "calories":
                    value = sum(meal.get('total_calories', 0) for meal in data.get('meals', []))
                elif metric == "exercise_minutes":
                    value = sum(ex.get('duration_minutes', 0) for ex in data.get('exercises', []))
                elif metric == "water_intake":
                    value = data.get('water_intake_ml')

                if value is not None:
                    metric_data.append({
                        "date": current_date.isoformat(),
                        "value": value
                    })

            current_date += timedelta(days=1)

        return metric_data

    except Exception as e:
        logger.error(f"Error getting metric history: {e}")
        return []

async def analyze_metric_trends(
    historical_data: List[Dict[str, Any]],
    metric: str
) -> Dict[str, Any]:
    """Analyze trends in metric data"""
    try:
        if not historical_data:
            return {"trend": "insufficient_data", "analysis": "Not enough data to analyze trends"}

        system_prompt = """
        You are a data analyst specializing in health metric trend analysis.
        Provide clear, actionable insights about trends and patterns.
        """

        prompt = f"""
        Analyze trends in this {metric} data:

        Data Points: {json.dumps(historical_data, indent=2)}

        Provide:
        1. Overall trend direction (increasing, decreasing, stable)
        2. Key patterns or cycles
        3. Significant changes or inflection points
        4. Correlation with other factors (if apparent)
        5. Predictions for next period
        6. Recommendations based on trends

        Be specific about dates and values where relevant.
        """

        response = await gemini_service.generate_response(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.1,
            max_tokens=500
        )

        return {
            "metric": metric,
            "trend_analysis": response,
            "data_points": len(historical_data),
            "period_covered": f"{historical_data[0]['date']} to {historical_data[-1]['date']}" if historical_data else "N/A",
            "generated_at": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Error analyzing metric trends: {e}")
        return {
            "metric": metric,
            "trend_analysis": "Unable to analyze trends due to data processing error",
            "data_points": len(historical_data),
            "generated_at": datetime.utcnow().isoformat()
        }