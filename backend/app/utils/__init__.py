"""
Utility functions for Blinderfit Backend
"""

import re
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import json
import logging

logger = logging.getLogger(__name__)

def calculate_bmi(weight_kg: float, height_cm: float) -> float:
    """Calculate BMI from weight and height"""
    if height_cm <= 0 or weight_kg <= 0:
        raise ValueError("Height and weight must be positive values")

    height_m = height_cm / 100
    bmi = weight_kg / (height_m ** 2)
    return round(bmi, 2)

def get_bmi_category(bmi: float) -> str:
    """Get BMI category based on BMI value"""
    if bmi < 18.5:
        return "underweight"
    elif bmi < 25:
        return "normal"
    elif bmi < 30:
        return "overweight"
    else:
        return "obese"

def calculate_daily_calorie_needs(
    weight_kg: float,
    height_cm: float,
    age: int,
    gender: str,
    activity_level: str
) -> int:
    """Calculate daily calorie needs using Mifflin-St Jeor equation"""
    # Calculate BMR
    height_m = height_cm / 100

    if gender.lower() == "male":
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161

    # Activity multipliers
    activity_multipliers = {
        "sedentary": 1.2,
        "lightly_active": 1.375,
        "moderately_active": 1.55,
        "very_active": 1.725,
        "extremely_active": 1.9
    }

    multiplier = activity_multipliers.get(activity_level, 1.2)
    return int(bmr * multiplier)

def calculate_macronutrient_split(
    total_calories: int,
    goal_type: str
) -> Dict[str, float]:
    """Calculate macronutrient split based on goal"""
    if goal_type == "weight_loss":
        # Higher protein, moderate carbs, lower fat
        protein_calories = total_calories * 0.35
        carb_calories = total_calories * 0.40
        fat_calories = total_calories * 0.25
    elif goal_type == "muscle_building":
        # High protein, moderate carbs, moderate fat
        protein_calories = total_calories * 0.30
        carb_calories = total_calories * 0.45
        fat_calories = total_calories * 0.25
    else:
        # Maintenance/balance
        protein_calories = total_calories * 0.25
        carb_calories = total_calories * 0.50
        fat_calories = total_calories * 0.25

    # Convert to grams (4 cal/g for protein/carbs, 9 cal/g for fat)
    protein_g = protein_calories / 4
    carbs_g = carb_calories / 4
    fat_g = fat_calories / 9

    return {
        "protein_g": round(protein_g, 1),
        "carbs_g": round(carbs_g, 1),
        "fat_g": round(fat_g, 1),
        "protein_percentage": round((protein_calories / total_calories) * 100, 1),
        "carbs_percentage": round((carb_calories / total_calories) * 100, 1),
        "fat_percentage": round((fat_calories / total_calories) * 100, 1)
    }

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def generate_secure_token(length: int = 32) -> str:
    """Generate a secure random token"""
    return secrets.token_urlsafe(length)

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def calculate_compliance_score(
    meals_logged: int,
    exercises_logged: int,
    water_intake_ml: int,
    steps_count: int
) -> float:
    """Calculate compliance score out of 100"""
    score = 0

    # Meals (40 points max)
    if meals_logged >= 3:
        score += 40
    elif meals_logged == 2:
        score += 30
    elif meals_logged == 1:
        score += 20

    # Exercises (30 points max)
    if exercises_logged >= 2:
        score += 30
    elif exercises_logged == 1:
        score += 20

    # Water intake (15 points max)
    if water_intake_ml >= 2000:
        score += 15
    elif water_intake_ml >= 1500:
        score += 10
    elif water_intake_ml >= 1000:
        score += 5

    # Steps (15 points max)
    if steps_count >= 8000:
        score += 15
    elif steps_count >= 6000:
        score += 10
    elif steps_count >= 4000:
        score += 5

    return min(score, 100.0)

def calculate_streak(tracking_data: List[Dict[str, Any]]) -> int:
    """Calculate current tracking streak"""
    if not tracking_data:
        return 0

    # Sort by date descending
    sorted_data = sorted(tracking_data, key=lambda x: x.get('date', ''), reverse=True)

    streak = 0
    for entry in sorted_data:
        compliance = entry.get('compliance_score', 0)
        if compliance >= 50:  # Consider it a tracked day
            streak += 1
        else:
            break

    return streak

def format_datetime(dt: datetime) -> str:
    """Format datetime to ISO string"""
    return dt.isoformat()

def parse_datetime(dt_str: str) -> datetime:
    """Parse ISO datetime string"""
    return datetime.fromisoformat(dt_str.replace('Z', '+00:00'))

def calculate_age(birth_date: datetime) -> int:
    """Calculate age from birth date"""
    today = datetime.utcnow()
    age = today.year - birth_date.year
    if today.month < birth_date.month or (today.month == birth_date.month and today.day < birth_date.day):
        age -= 1
    return age

def sanitize_input(text: str) -> str:
    """Sanitize user input to prevent injection attacks"""
    if not text:
        return ""

    # Remove potentially dangerous characters
    sanitized = re.sub(r'[<>]', '', text)

    # Limit length
    return sanitized[:1000] if len(sanitized) > 1000 else sanitized

def generate_meal_recommendations(
    user_profile: Dict[str, Any],
    meal_type: str
) -> List[Dict[str, Any]]:
    """Generate meal recommendations based on user profile"""
    # This is a simplified version - in production, use AI for better recommendations
    recommendations = []

    preferences = user_profile.get('dietary_preferences', {})
    restrictions = preferences.get('dietary_restrictions', [])

    if meal_type == "breakfast":
        if "vegetarian" in restrictions:
            recommendations = [
                {"name": "Oatmeal with fruits", "calories": 300, "protein": 10},
                {"name": "Greek yogurt parfait", "calories": 250, "protein": 15},
                {"name": "Smoothie bowl", "calories": 350, "protein": 12}
            ]
        else:
            recommendations = [
                {"name": "Eggs with whole grain toast", "calories": 400, "protein": 20},
                {"name": "Oatmeal with nuts", "calories": 350, "protein": 12},
                {"name": "Greek yogurt with granola", "calories": 300, "protein": 18}
            ]

    elif meal_type == "lunch":
        recommendations = [
            {"name": "Grilled chicken salad", "calories": 400, "protein": 30},
            {"name": "Quinoa bowl with vegetables", "calories": 450, "protein": 15},
            {"name": "Turkey wrap", "calories": 350, "protein": 25}
        ]

    elif meal_type == "dinner":
        recommendations = [
            {"name": "Baked salmon with vegetables", "calories": 500, "protein": 35},
            {"name": "Stir-fried tofu with rice", "calories": 450, "protein": 20},
            {"name": "Lean beef stir-fry", "calories": 480, "protein": 32}
        ]

    return recommendations

def calculate_progress_percentage(
    start_value: float,
    current_value: float,
    target_value: float
) -> float:
    """Calculate progress percentage towards goal"""
    if start_value == target_value:
        return 100.0

    if target_value > start_value:
        # Weight gain scenario
        progress = ((current_value - start_value) / (target_value - start_value)) * 100
    else:
        # Weight loss scenario
        progress = ((start_value - current_value) / (start_value - target_value)) * 100

    return max(0, min(100, progress))

def validate_nutrition_data(nutrition: Dict[str, Any]) -> bool:
    """Validate nutrition data"""
    required_fields = ['calories', 'protein_g', 'carbs_g', 'fat_g']

    for field in required_fields:
        if field not in nutrition:
            return False
        if not isinstance(nutrition[field], (int, float)) or nutrition[field] < 0:
            return False

    return True

def format_nutrition_summary(meals: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Format nutrition summary from meals"""
    total_calories = 0
    total_protein = 0
    total_carbs = 0
    total_fat = 0

    for meal in meals:
        total_calories += meal.get('total_calories', 0)
        total_protein += meal.get('total_protein', 0)
        total_carbs += meal.get('total_carbs', 0)
        total_fat += meal.get('total_fat', 0)

    return {
        "total_calories": total_calories,
        "total_protein_g": round(total_protein, 1),
        "total_carbs_g": round(total_carbs, 1),
        "total_fat_g": round(total_fat, 1),
        "meals_count": len(meals)
    }

def generate_motivational_message(
    compliance_score: float,
    streak: int,
    achievements: List[str]
) -> str:
    """Generate personalized motivational message"""
    if compliance_score >= 90:
        messages = [
            "Excellent work! You're crushing your health goals!",
            "Outstanding consistency! Keep up the amazing work!",
            "You're a health champion! This streak is incredible!"
        ]
    elif compliance_score >= 70:
        messages = [
            "Great progress! Stay consistent and you'll reach your goals!",
            "Good job today! Every healthy choice counts!",
            "You're building great habits. Keep it up!"
        ]
    else:
        messages = [
            "Every journey starts with a single step. You've got this!",
            "Tomorrow is a new opportunity to build healthy habits!",
            "Small changes lead to big results. Start with one meal today!"
        ]

    # Add streak-specific message
    if streak >= 7:
        messages.append(f"🔥 {streak}-day streak! You're on fire!")

    # Add achievement message
    if achievements:
        messages.append(f"🏆 Achievement unlocked: {achievements[0]}")

    return messages[0] if messages else "Keep moving forward!"

def calculate_weekly_average(data_points: List[float]) -> float:
    """Calculate weekly average from data points"""
    if not data_points:
        return 0.0

    return sum(data_points) / len(data_points)

def detect_trend(data_points: List[float]) -> str:
    """Detect trend in data points"""
    if len(data_points) < 3:
        return "insufficient_data"

    # Simple trend detection
    recent_avg = sum(data_points[-3:]) / 3
    earlier_avg = sum(data_points[:-3]) / len(data_points[:-3]) if len(data_points) > 3 else recent_avg

    if recent_avg > earlier_avg * 1.05:
        return "increasing"
    elif recent_avg < earlier_avg * 0.95:
        return "decreasing"
    else:
        return "stable"

def generate_health_insights(
    weight_trend: str,
    compliance_trend: str,
    current_bmi: float
) -> List[str]:
    """Generate health insights based on trends"""
    insights = []

    if weight_trend == "decreasing" and current_bmi > 25:
        insights.append("Great progress on weight loss! Continue with your current approach.")
    elif weight_trend == "increasing" and current_bmi < 18.5:
        insights.append("Focus on nutrient-dense foods to support healthy weight gain.")

    if compliance_trend == "increasing":
        insights.append("Your consistency is improving! This is key to long-term success.")
    elif compliance_trend == "decreasing":
        insights.append("Consider simplifying your routine to maintain consistency.")

    if current_bmi >= 30:
        insights.append("Consider consulting a healthcare professional for comprehensive weight management.")
    elif current_bmi < 18.5:
        insights.append("Focus on balanced nutrition to support healthy weight restoration.")

    return insights