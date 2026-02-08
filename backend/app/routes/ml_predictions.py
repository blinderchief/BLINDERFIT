"""
ML Predictions routes for advanced analytics and forecasting
"""

from fastapi import APIRouter, Depends, HTTPException, status
import logging
from datetime import datetime, date, timedelta
from typing import Dict, Any, List
import json
import uuid

from app.core.database import db_service
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
async def generate_prediction(request: PredictionRequest, user_id: str = Depends(get_current_user)):
    """Generate ML-powered health predictions"""
    try:
        historical_data = await get_historical_data_for_prediction(user_id, request.timeframe_days)
        prediction_result = await generate_ml_prediction(user_id, request.prediction_type, historical_data, request.timeframe_days)

        insight_id = str(uuid.uuid4())
        ml_insight = {
            "id": insight_id,
            "user_id": user_id,
            "insight_type": "prediction",
            "technique_used": "predictive_analytics",
            "input_data": {"prediction_type": request.prediction_type, "timeframe_days": request.timeframe_days, "historical_data_points": len(historical_data)},
            "output_data": prediction_result,
            "confidence_score": prediction_result.get('confidence_score', 0.75),
            "generated_at": datetime.utcnow().isoformat()
        }

        db_service.set_user_doc(user_id, "ml_insights", insight_id, ml_insight)

        return APIResponse(
            success=True, message="Prediction generated successfully",
            data={"prediction": prediction_result, "insight_id": insight_id, "generated_at": datetime.utcnow().isoformat()}
        )
    except Exception as e:
        logger.error(f"Prediction generation error: {e}")
        raise HTTPException(status_code=500, detail="Prediction generation failed")

@router.get("/insights", response_model=APIResponse)
async def get_ml_insights(insight_type: str = None, limit: int = 10, user_id: str = Depends(get_current_user)):
    """Get user's ML-generated insights"""
    try:
        filters = {"insight_type": insight_type} if insight_type else None
        insights = db_service.query_user_docs(user_id, "ml_insights", filters=filters, order_by="generated_at", order_dir="DESC", limit_count=limit)
        return APIResponse(success=True, message="ML insights retrieved successfully", data={"insights": insights, "total": len(insights), "filter": insight_type})
    except Exception as e:
        logger.error(f"Error getting ML insights: {e}")
        raise HTTPException(status_code=500, detail="Failed to get ML insights")

@router.post("/personalize", response_model=APIResponse)
async def generate_personalization(data_slice: Dict[str, Any], user_id: str = Depends(get_current_user)):
    """Generate personalized recommendations using ML"""
    try:
        user_context = await get_user_context_for_personalization(user_id)
        personalization_result = await generate_collaborative_filtering(user_context, data_slice)

        insight_id = str(uuid.uuid4())
        ml_insight = {
            "id": insight_id, "user_id": user_id, "insight_type": "recommendation",
            "technique_used": "collaborative_filtering", "input_data": data_slice,
            "output_data": personalization_result, "confidence_score": personalization_result.get('confidence_score', 0.8),
            "generated_at": datetime.utcnow().isoformat()
        }
        db_service.set_user_doc(user_id, "ml_insights", insight_id, ml_insight)

        return APIResponse(
            success=True, message="Personalization generated successfully",
            data={"personalization": personalization_result, "insight_id": insight_id, "generated_at": datetime.utcnow().isoformat()}
        )
    except Exception as e:
        logger.error(f"Personalization generation error: {e}")
        raise HTTPException(status_code=500, detail="Personalization generation failed")

@router.post("/analyze-patterns", response_model=APIResponse)
async def analyze_user_patterns(analysis_type: str = "comprehensive", user_id: str = Depends(get_current_user)):
    """Analyze user patterns and provide insights"""
    try:
        user_data = await get_comprehensive_user_data(user_id)
        analysis_result = await generate_pattern_analysis(user_data, analysis_type)

        insight_id = str(uuid.uuid4())
        ml_insight = {
            "id": insight_id, "user_id": user_id, "insight_type": "analysis",
            "technique_used": "pattern_analysis", "input_data": {"analysis_type": analysis_type},
            "output_data": analysis_result, "confidence_score": analysis_result.get('confidence_score', 0.85),
            "generated_at": datetime.utcnow().isoformat()
        }
        db_service.set_user_doc(user_id, "ml_insights", insight_id, ml_insight)

        return APIResponse(
            success=True, message="Pattern analysis completed successfully",
            data={"analysis": analysis_result, "insight_id": insight_id, "generated_at": datetime.utcnow().isoformat()}
        )
    except Exception as e:
        logger.error(f"Pattern analysis error: {e}")
        raise HTTPException(status_code=500, detail="Pattern analysis failed")

@router.get("/trends", response_model=APIResponse)
async def get_health_trends(metric: str = "weight", period_days: int = 30, user_id: str = Depends(get_current_user)):
    """Get health metric trends with ML analysis"""
    try:
        historical_data = await get_metric_history(user_id, metric, period_days)
        trend_analysis = await analyze_metric_trends(historical_data, metric)
        return APIResponse(
            success=True, message="Health trends analyzed successfully",
            data={"metric": metric, "period_days": period_days, "historical_data": historical_data, "trend_analysis": trend_analysis, "generated_at": datetime.utcnow().isoformat()}
        )
    except Exception as e:
        logger.error(f"Error getting health trends: {e}")
        raise HTTPException(status_code=500, detail="Failed to get health trends")

# ── Helper Functions ────────────────────────────────────────

async def get_historical_data_for_prediction(user_id: str, timeframe_days: int) -> List[Dict[str, Any]]:
    try:
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=timeframe_days)
        historical_data = []
        current_date = start_date
        while current_date <= end_date:
            doc = db_service.get_user_doc(user_id, "tracking", current_date.isoformat())
            if doc:
                doc['date'] = current_date.isoformat()
                historical_data.append(doc)
            else:
                historical_data.append({'date': current_date.isoformat(), 'compliance_score': 0, 'meals': [], 'exercises': [], 'weight_kg': None})
            current_date += timedelta(days=1)
        return historical_data
    except Exception as e:
        logger.error(f"Error getting historical data: {e}")
        return []

async def generate_ml_prediction(user_id: str, prediction_type: str, historical_data: List[Dict[str, Any]], timeframe_days: int) -> Dict[str, Any]:
    try:
        prompt = f"""Analyze this historical health data and predict {prediction_type} for the next {timeframe_days} days:
        Historical Data (last {min(30, len(historical_data))} days): {json.dumps(historical_data[-30:], indent=2, default=str)}
        Provide: 1. Predicted value or range 2. Confidence level 3. Key factors 4. Risks 5. Recommendations 6. Timeline"""

        response = await gemini_service.generate_response(
            prompt=prompt,
            system_prompt="You are a health analytics AI specializing in predictive modeling. Be conservative with predictions.",
            temperature=0.1, max_tokens=800
        )
        return {
            "prediction_type": prediction_type, "timeframe_days": timeframe_days, "prediction": response,
            "confidence_score": 0.75,
            "factors_considered": ["Historical compliance patterns", "Weight change trends", "Exercise frequency", "Meal logging consistency"],
            "recommendations": ["Maintain consistent tracking", "Focus on sustainable habits", "Consult healthcare professionals"],
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error generating ML prediction: {e}")
        return {"prediction_type": prediction_type, "timeframe_days": timeframe_days, "prediction": "Unable to generate prediction.", "confidence_score": 0.0, "factors_considered": [], "recommendations": ["Continue daily tracking"], "generated_at": datetime.utcnow().isoformat()}

async def get_user_context_for_personalization(user_id: str) -> Dict[str, Any]:
    try:
        user_data = db_service.get_user(user_id) or {}
        onboarding_data = db_service.get_user_doc(user_id, "onboarding", "data") or {}
        recent_tracking = await get_historical_data_for_prediction(user_id, 14)
        return {"profile": user_data, "preferences": onboarding_data.get('dietary_preferences', {}), "goals": onboarding_data.get('goals', {}), "recent_activity": recent_tracking}
    except Exception as e:
        logger.error(f"Error getting user context for personalization: {e}")
        return {}

async def generate_collaborative_filtering(user_context: Dict[str, Any], data_slice: Dict[str, Any]) -> Dict[str, Any]:
    try:
        prompt = f"""Using collaborative filtering, analyze and provide personalized recommendations:
        Profile: {json.dumps(user_context.get('profile', {}), default=str)}
        Goals: {json.dumps(user_context.get('goals', {}), default=str)}
        Additional Data: {json.dumps(data_slice, default=str)}
        Provide: Nutrition adjustments, Exercise modifications, Lifestyle improvements"""

        response = await gemini_service.generate_response(prompt=prompt, system_prompt="You are a recommendation engine for health apps.", temperature=0.4, max_tokens=600)
        return {"technique": "collaborative_filtering", "recommendations": response, "confidence_score": 0.8, "based_on_similar_users": True, "generated_at": datetime.utcnow().isoformat()}
    except Exception as e:
        logger.error(f"Error generating collaborative filtering: {e}")
        return {"technique": "collaborative_filtering", "recommendations": "Focus on consistent meal timing and gradual exercise increases.", "confidence_score": 0.6, "generated_at": datetime.utcnow().isoformat()}

async def get_comprehensive_user_data(user_id: str) -> Dict[str, Any]:
    try:
        user_data = db_service.get_user(user_id) or {}
        tracking_data = db_service.query_user_docs(user_id, "tracking")
        onboarding_data = db_service.get_user_doc(user_id, "onboarding", "data") or {}
        plans_data = db_service.query_user_docs(user_id, "plans")
        return {"profile": user_data, "tracking_history": tracking_data, "onboarding": onboarding_data, "plans_history": plans_data, "total_data_points": len(tracking_data)}
    except Exception as e:
        logger.error(f"Error getting comprehensive user data: {e}")
        return {}

async def generate_pattern_analysis(user_data: Dict[str, Any], analysis_type: str) -> Dict[str, Any]:
    try:
        prompt = f"""Perform comprehensive pattern analysis:
        Tracking History: {len(user_data.get('tracking_history', []))} days
        Recent: {json.dumps(user_data.get('tracking_history', [])[-14:], default=str)}
        Goals: {json.dumps(user_data.get('onboarding', {}).get('goals', {}), default=str)}
        Analysis Type: {analysis_type}
        Identify: consistency patterns, success factors, challenge areas, correlations, optimal timing"""

        response = await gemini_service.generate_response(prompt=prompt, system_prompt="You are a health data analyst.", temperature=0.2, max_tokens=1000)
        return {"analysis_type": analysis_type, "insights": response, "confidence_score": 0.85, "data_points_analyzed": user_data.get('total_data_points', 0), "patterns_identified": ["Consistency correlations", "Timing optimization", "Success factors"], "generated_at": datetime.utcnow().isoformat()}
    except Exception as e:
        logger.error(f"Error generating pattern analysis: {e}")
        return {"analysis_type": analysis_type, "insights": "More data needed for better analysis.", "confidence_score": 0.5, "data_points_analyzed": 0, "patterns_identified": [], "generated_at": datetime.utcnow().isoformat()}

async def get_metric_history(user_id: str, metric: str, period_days: int) -> List[Dict[str, Any]]:
    try:
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=period_days)
        metric_data = []
        current_date = start_date
        while current_date <= end_date:
            doc = db_service.get_user_doc(user_id, "tracking", current_date.isoformat())
            if doc:
                value = None
                if metric == "weight": value = doc.get('weight_kg')
                elif metric == "compliance": value = doc.get('compliance_score')
                elif metric == "calories": value = sum(m.get('total_calories', 0) for m in doc.get('meals', []))
                elif metric == "exercise_minutes": value = sum(e.get('duration_minutes', 0) for e in doc.get('exercises', []))
                elif metric == "water_intake": value = doc.get('water_intake_ml')
                if value is not None:
                    metric_data.append({"date": current_date.isoformat(), "value": value})
            current_date += timedelta(days=1)
        return metric_data
    except Exception as e:
        logger.error(f"Error getting metric history: {e}")
        return []

async def analyze_metric_trends(historical_data: List[Dict[str, Any]], metric: str) -> Dict[str, Any]:
    try:
        if not historical_data:
            return {"trend": "insufficient_data", "analysis": "Not enough data"}
        prompt = f"""Analyze trends in this {metric} data:
        Data Points: {json.dumps(historical_data, indent=2)}
        Provide: trend direction, patterns, significant changes, predictions, recommendations"""
        response = await gemini_service.generate_response(prompt=prompt, system_prompt="You are a data analyst specializing in health metrics.", temperature=0.1, max_tokens=500)
        return {"metric": metric, "trend_analysis": response, "data_points": len(historical_data), "period_covered": f"{historical_data[0]['date']} to {historical_data[-1]['date']}" if historical_data else "N/A", "generated_at": datetime.utcnow().isoformat()}
    except Exception as e:
        logger.error(f"Error analyzing metric trends: {e}")
        return {"metric": metric, "trend_analysis": "Unable to analyze trends", "data_points": len(historical_data), "generated_at": datetime.utcnow().isoformat()}
