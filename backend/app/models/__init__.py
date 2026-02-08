"""
Pydantic models for Blinderfit Backend
"""

from typing import Optional, List, Dict, Any, Union
from datetime import datetime, date
from pydantic import BaseModel, Field, EmailStr, validator
from enum import Enum

# Enums
class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"

class ActivityLevel(str, Enum):
    SEDENTARY = "sedentary"
    LIGHTLY_ACTIVE = "lightly_active"
    MODERATELY_ACTIVE = "moderately_active"
    VERY_ACTIVE = "very_active"
    EXTREMELY_ACTIVE = "extremely_active"

class GoalType(str, Enum):
    WEIGHT_LOSS = "weight_loss"
    WEIGHT_GAIN = "weight_gain"
    MAINTAIN_WEIGHT = "maintain_weight"
    MUSCLE_BUILDING = "muscle_building"
    IMPROVE_FITNESS = "improve_fitness"
    HEALTH_IMPROVEMENT = "health_improvement"

class BMICategory(str, Enum):
    UNDERWEIGHT = "underweight"
    NORMAL = "normal"
    OVERWEIGHT = "overweight"
    OBESE = "obese"

class MealType(str, Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"

class ExerciseType(str, Enum):
    CARDIO = "cardio"
    STRENGTH = "strength"
    FLEXIBILITY = "flexibility"
    BALANCE = "balance"
    SPORT = "sport"

class ComplianceStatus(str, Enum):
    COMPLETED = "completed"
    PARTIAL = "partial"
    MISSED = "missed"
    NOT_STARTED = "not_started"

# Base models
class BaseDBModel(BaseModel):
    """Base model with common database fields"""
    id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# User models
class UserProfile(BaseModel):
    """User profile information"""
    uid: str
    email: EmailStr
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    phone_number: Optional[str] = None
    email_verified: bool = False
    created_at: datetime
    last_login: Optional[datetime] = None

class HealthData(BaseModel):
    """User health data"""
    height_cm: float = Field(..., gt=0, le=300)
    weight_kg: float = Field(..., gt=0, le=500)
    age: int = Field(..., gt=0, le=120)
    gender: Gender
    activity_level: ActivityLevel
    bmi: Optional[float] = None
    bmi_category: Optional[BMICategory] = None

    @validator('bmi', 'bmi_category', pre=True, always=True)
    def calculate_bmi(cls, v, values):
        if 'height_cm' in values and 'weight_kg' in values:
            height_m = values['height_cm'] / 100
            bmi = values['weight_kg'] / (height_m ** 2)
            if v is None:
                return round(bmi, 2)
        return v

    @validator('bmi_category', pre=True, always=True)
    def calculate_bmi_category(cls, v, values):
        if 'bmi' in values:
            bmi = values['bmi']
            if bmi < 18.5:
                return BMICategory.UNDERWEIGHT
            elif bmi < 25:
                return BMICategory.NORMAL
            elif bmi < 30:
                return BMICategory.OVERWEIGHT
            else:
                return BMICategory.OBESE
        return v

class MedicalConditions(BaseModel):
    """User medical conditions"""
    diabetes: bool = False
    hypertension: bool = False
    heart_disease: bool = False
    thyroid_issues: bool = False
    pcos: bool = False
    other_conditions: List[str] = []
    allergies: List[str] = []
    medications: List[str] = []
    restrictions: List[str] = []

class DietaryPreferences(BaseModel):
    """User dietary preferences"""
    vegetarian: bool = False
    vegan: bool = False
    gluten_free: bool = False
    dairy_free: bool = False
    keto: bool = False
    paleo: bool = False
    low_carb: bool = False
    high_protein: bool = False
    cultural_restrictions: List[str] = []
    disliked_foods: List[str] = []
    preferred_cuisines: List[str] = []

class UserGoals(BaseModel):
    """User health goals"""
    primary_goal: GoalType
    target_weight_kg: Optional[float] = None
    target_bmi: Optional[float] = None
    timeline_weeks: int = Field(..., gt=0, le=52)
    specific_targets: List[str] = []
    motivation_level: int = Field(..., ge=1, le=10)

class UserOnboarding(BaseDBModel):
    """Complete user onboarding data"""
    user_id: str
    profile: UserProfile
    health_data: HealthData
    medical_conditions: MedicalConditions
    dietary_preferences: DietaryPreferences
    goals: UserGoals
    consent_given: bool = True
    consent_timestamp: datetime
    completed_at: Optional[datetime] = None

# Plan models
class NutritionItem(BaseModel):
    """Individual nutrition item"""
    name: str
    quantity: str
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: Optional[float] = None
    vitamins: Optional[Dict[str, float]] = None

class Meal(BaseModel):
    """Meal structure"""
    type: MealType
    time: str  # e.g., "08:00"
    items: List[NutritionItem]
    total_calories: int
    total_protein: float
    total_carbs: float
    total_fat: float
    preparation_time: Optional[int] = None  # minutes
    instructions: Optional[str] = None

class Exercise(BaseModel):
    """Exercise structure"""
    name: str
    type: ExerciseType
    duration_minutes: int
    sets: Optional[int] = None
    reps: Optional[int] = None
    intensity: str  # low, medium, high
    equipment: List[str] = []
    instructions: str
    calories_burned: Optional[int] = None

class DailyPlan(BaseModel):
    """Daily health plan"""
    date: date
    meals: List[Meal]
    exercises: List[Exercise]
    water_target_ml: int = 2000
    steps_target: int = 8000
    notes: Optional[str] = None
    total_calories: int
    total_protein: float
    total_carbs: float
    total_fat: float

class WeeklyPlan(BaseModel):
    """Weekly health plan"""
    week_start: date
    week_end: date
    daily_plans: List[DailyPlan]
    weekly_goals: Dict[str, Any]
    adjustments: List[str] = []

class PersonalizedPlan(BaseDBModel):
    """Complete personalized health plan"""
    user_id: str
    plan_name: str
    duration_weeks: int
    weekly_plans: List[WeeklyPlan]
    overall_goals: Dict[str, Any]
    generated_by: str  # "ai" or "manual"
    version: int = 1
    is_active: bool = True

# Tracking models
class MealLog(BaseModel):
    """Logged meal data"""
    meal_type: MealType
    logged_at: datetime
    items: List[NutritionItem]
    total_calories: int
    photos: List[str] = []  # URLs to uploaded photos
    notes: Optional[str] = None

class ExerciseLog(BaseModel):
    """Logged exercise data"""
    exercise_name: str
    logged_at: datetime
    duration_minutes: int
    calories_burned: Optional[int] = None
    heart_rate_avg: Optional[int] = None
    notes: Optional[str] = None

class DailyTracking(BaseDBModel):
    """Daily health tracking"""
    user_id: str
    date: date
    weight_kg: Optional[float] = None
    meals: List[MealLog] = []
    exercises: List[ExerciseLog] = []
    water_intake_ml: int = 0
    steps_count: int = 0
    sleep_hours: Optional[float] = None
    mood_rating: Optional[int] = None  # 1-10
    energy_level: Optional[int] = None  # 1-10
    compliance_score: float = 0.0  # 0-100
    notes: Optional[str] = None

class ComplianceData(BaseModel):
    """Compliance tracking data"""
    date: date
    meals_completed: int
    meals_total: int
    exercises_completed: int
    exercises_total: int
    water_target_achieved: bool
    steps_target_achieved: bool
    overall_compliance: float  # percentage

# ML and AI models
class MLInsight(BaseDBModel):
    """ML-generated insights"""
    user_id: str
    insight_type: str  # "prediction", "recommendation", "analysis"
    technique_used: str  # "predictive_analytics", "collaborative_filtering", etc.
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    confidence_score: float
    generated_at: datetime

class PredictionData(BaseModel):
    """Health prediction data"""
    prediction_type: str
    predicted_value: Union[float, str, Dict[str, Any]]
    confidence_interval: Optional[Dict[str, float]] = None
    timeframe_days: int
    factors_considered: List[str]
    recommendations: List[str]

class ChatMessage(BaseModel):
    """AI chat message"""
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime
    attachments: List[Dict[str, Any]] = []  # photos, voice, etc.

class ChatSession(BaseDBModel):
    """AI chat session"""
    user_id: str
    session_id: str
    messages: List[ChatMessage]
    context: Dict[str, Any]
    summary: Optional[str] = None
    ended_at: Optional[datetime] = None

# Notification models
class NotificationData(BaseModel):
    """Notification data"""
    user_id: str
    type: str  # "meal_reminder", "exercise_reminder", "motivational", "insight"
    title: str
    message: str
    scheduled_at: datetime
    sent_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    action_url: Optional[str] = None
    metadata: Dict[str, Any] = {}

# Gamification models
class Achievement(BaseModel):
    """User achievement"""
    id: str
    name: str
    description: str
    icon: str
    unlocked_at: datetime
    points: int

class UserStats(BaseModel):
    """User statistics for gamification"""
    user_id: str
    total_days_tracked: int
    current_streak: int
    longest_streak: int
    total_calories_burned: int
    total_meals_logged: int
    total_exercises_completed: int
    achievements: List[Achievement]
    level: int
    experience_points: int

# API request/response models
class TokenData(BaseModel):
    """JWT token data"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: str

class LoginRequest(BaseModel):
    """Login request"""
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    """Registration request"""
    email: EmailStr
    password: str
    display_name: str
    phone_number: Optional[str] = None

class OnboardingRequest(BaseModel):
    """Onboarding data submission"""
    health_data: HealthData
    medical_conditions: MedicalConditions
    dietary_preferences: DietaryPreferences
    goals: UserGoals
    consent_given: bool = True

class ChatRequest(BaseModel):
    """AI chat request"""
    message: str
    context: Optional[Dict[str, Any]] = None
    attachments: List[Dict[str, Any]] = []

class PlanRequest(BaseModel):
    """Plan generation request"""
    duration_weeks: int = 4
    preferences: Dict[str, Any] = {}

class TrackingRequest(BaseModel):
    """Daily tracking submission"""
    date: date
    weight_kg: Optional[float] = None
    meals: List[MealLog] = []
    exercises: List[ExerciseLog] = []
    water_intake_ml: int = 0
    steps_count: int = 0
    sleep_hours: Optional[float] = None
    mood_rating: Optional[int] = None
    energy_level: Optional[int] = None
    notes: Optional[str] = None

class PredictionRequest(BaseModel):
    """ML prediction request"""
    prediction_type: str
    timeframe_days: int = 30
    historical_data: Optional[List[Dict[str, Any]]] = None

# Response models
class APIResponse(BaseModel):
    """Generic API response"""
    success: bool
    message: str
    data: Optional[Any] = None
    errors: Optional[List[str]] = None

class HealthAnalysisResponse(BaseModel):
    """Health analysis response"""
    bmi_category: BMICategory
    bmi_value: float
    insights: str
    recommendations: List[str]
    risk_factors: List[str]
    next_steps: List[str]

class PlanResponse(BaseModel):
    """Plan generation response"""
    plan_id: str
    plan_content: Dict[str, Any]
    generated_at: datetime
    estimated_success_rate: float
    disclaimer: str = "This is not medical advice. Consult healthcare professionals."

class DashboardData(BaseModel):
    """Dashboard data response"""
    user_stats: UserStats
    recent_tracking: List[DailyTracking]
    current_plan: Optional[PersonalizedPlan]
    upcoming_meals: List[Meal]
    upcoming_exercises: List[Exercise]
    ml_insights: List[MLInsight]
    notifications: List[NotificationData]
    progress_charts: Dict[str, Any]