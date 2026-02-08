
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useHealthData } from '@/contexts/HealthDataContext';
import apiService from '@/services/api';
import { FitnessService } from '@/services/FitnessService';
import {
  Dumbbell, Calendar, Clock, RefreshCw, Heart, Utensils,
  ChevronDown, ChevronUp, CheckCircle, Droplets, Footprints,
  Target, Brain, AlertCircle, Loader2, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface DailyPlanData {
  date: string;
  meals: Array<{
    type: string;
    time: string;
    items: Array<{ name: string; quantity: string; calories: number; protein_g: number; carbs_g: number; fat_g: number }>;
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fat: number;
  }>;
  exercises: Array<{
    name: string;
    type: string;
    duration_minutes: number;
    intensity: string;
    calories_burned?: number;
    sets?: number;
    reps?: number;
    instructions?: string;
  }>;
  water_target_ml: number;
  steps_target: number;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

interface WeeklyPlanData {
  week_number: number;
  week_start: string;
  week_end: string;
  daily_plans: DailyPlanData[];
  weekly_goals: Record<string, string>;
}

interface PlanData {
  plan_name: string;
  duration_weeks: number;
  weekly_plans: WeeklyPlanData[];
  is_active: boolean;
  created_at?: string;
  // Legacy mock format fields
  weeklyPlan?: any[];
  nutritionTips?: string[];
  restDayActivities?: string[];
}

const FitnessPlan = () => {
  const { user } = useAuth();
  const { healthData, hasSubmittedHealthData } = useHealthData();
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [activeWeek, setActiveWeek] = useState(0);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const [aiGenerated, setAiGenerated] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  // Load plan on mount
  useEffect(() => {
    loadPlan();
  }, [user, healthData, hasSubmittedHealthData]);

  const loadPlan = async () => {
    if (!user || !hasSubmittedHealthData) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Try backend first
    try {
      const response: any = await apiService.getCurrentPlan();
      if (response?.success && response?.data) {
        setPlan(response.data);
        setBackendAvailable(true);
        setAiGenerated(true);

        // Auto-expand today's plan
        const todayPlan = findTodayPlan(response.data);
        if (todayPlan) setExpandedDay(todayPlan.date);
      } else {
        // No active plan on backend
        setBackendAvailable(true);
        await loadLocalPlan();
      }
    } catch (error: any) {
      console.warn('Backend unavailable for plans, using local generation:', error.message);
      setBackendAvailable(false);
      await loadLocalPlan();
    }

    setLoading(false);
  };

  const loadLocalPlan = async () => {
    try {
      const storedPlan = localStorage.getItem(`gofit_fitness_plan_${user?.uid}`);
      if (storedPlan) {
        setPlan(JSON.parse(storedPlan));
        setExpandedDay(todayDayName);
      }
    } catch (e) {
      console.error('Error loading local plan:', e);
    }
  };

  const findTodayPlan = (planData: PlanData): DailyPlanData | null => {
    if (!planData.weekly_plans) return null;
    for (const week of planData.weekly_plans) {
      for (const day of week.daily_plans || []) {
        if (day.date === today) return day;
      }
    }
    return planData.weekly_plans[0]?.daily_plans?.[0] || null;
  };

  const handleGeneratePlan = async () => {
    if (!healthData) return;
    setGenerating(true);

    try {
      if (backendAvailable !== false) {
        // Try AI generation via backend
        const genResponse: any = await apiService.generatePlan({
          duration_weeks: 4,
          preferences: {
            age: healthData.age,
            weight_kg: healthData.weight,
            height_cm: healthData.height,
            gender: healthData.gender,
            activity_level: healthData.activityLevel,
            goals: healthData.goals,
            fitness_level: healthData.fitnessLevel,
            available_time: healthData.availableTime,
            preferred_workout_days: healthData.preferredWorkoutDays,
            health_issues: healthData.healthIssues
          }
        });

        if (genResponse?.success) {
          // Fetch the generated plan
          const currentResponse: any = await apiService.getCurrentPlan();
          if (currentResponse?.success && currentResponse?.data) {
            setPlan(currentResponse.data);
            setBackendAvailable(true);
            setAiGenerated(true);
            toast.success('Your AI-powered fitness plan is ready!');

            const todayPlan = findTodayPlan(currentResponse.data);
            if (todayPlan) setExpandedDay(todayPlan.date);
            setGenerating(false);
            return;
          }
        }
      }

      // Fallback to local mock generation
      const mockPlan = await FitnessService.generateFitnessPlan(healthData);
      setPlan(mockPlan);
      setAiGenerated(false);
      localStorage.setItem(`gofit_fitness_plan_${user?.uid}`, JSON.stringify(mockPlan));
      toast.success('Fitness plan generated!');
      setExpandedDay(todayDayName);

    } catch (error) {
      console.error('Error generating plan:', error);

      // Final fallback
      try {
        const mockPlan = await FitnessService.generateFitnessPlan(healthData);
        setPlan(mockPlan);
        setAiGenerated(false);
        localStorage.setItem(`gofit_fitness_plan_${user?.uid}`, JSON.stringify(mockPlan));
        toast.success('Fitness plan generated (offline mode)');
        setExpandedDay(todayDayName);
      } catch (fallbackError) {
        toast.error('Failed to generate plan. Please try again.');
      }
    }

    setGenerating(false);
  };

  const toggleDayExpand = (dayKey: string) => {
    setExpandedDay(expandedDay === dayKey ? null : dayKey);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const formatDayName = (day: string) => day.charAt(0).toUpperCase() + day.slice(1);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-96px)] flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-gold animate-spin" />
          <span className="text-gold text-lg">Loading your fitness plan...</span>
        </div>
      </div>
    );
  }

  // Not logged in or no health data
  if (!hasSubmittedHealthData) {
    return (
      <div className="min-h-[calc(100vh-96px)] py-12">
        <div className="gofit-container">
          <div className="max-w-3xl mx-auto bg-gofit-charcoal p-8 sm:p-10 border border-gofit-charcoal/50 text-center">
            <Dumbbell className="h-16 w-16 text-gofit-gold mx-auto mb-6" />
            <h2 className="text-3xl font-light tracking-wider text-gofit-offwhite mb-4">
              Complete Your Health Profile
            </h2>
            <p className="text-gofit-silver mb-8">
              We need some information about your health and fitness goals to create your AI-powered personalized plan.
            </p>
            <Link to="/health-form" className="gofit-button inline-flex items-center">
              Start Health Assessment
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // No plan yet - show generate button
  if (!plan) {
    return (
      <div className="min-h-[calc(100vh-96px)] py-12">
        <div className="gofit-container">
          <div className="max-w-3xl mx-auto bg-gofit-charcoal p-8 sm:p-10 border border-gold/20 text-center">
            <Sparkles className="h-16 w-16 text-gold mx-auto mb-6" />
            <h2 className="text-3xl font-light tracking-wider text-gofit-offwhite mb-4">
              Generate Your <span className="text-gold">AI Fitness Plan</span>
            </h2>
            <p className="text-gofit-silver mb-4">
              FitMentor AI will create a personalized 4-week plan based on your health profile, goals, and preferences.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8 text-sm text-gofit-silver">
              <span className="bg-gold/10 px-3 py-1 rounded-full border border-gold/20">Personalized meals</span>
              <span className="bg-gold/10 px-3 py-1 rounded-full border border-gold/20">Custom workouts</span>
              <span className="bg-gold/10 px-3 py-1 rounded-full border border-gold/20">Daily targets</span>
              <span className="bg-gold/10 px-3 py-1 rounded-full border border-gold/20">Weekly progression</span>
            </div>
            <button
              onClick={handleGeneratePlan}
              disabled={generating}
              className="gofit-button inline-flex items-center text-lg px-8 py-3"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-5 w-5" />
                  Generate My Plan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Determine rendering mode (backend AI plan vs mock plan)
  const isBackendPlan = !!(plan.weekly_plans && plan.weekly_plans.length > 0);
  const isLegacyPlan = !!(plan.weeklyPlan && plan.weeklyPlan.length > 0);

  return (
    <div className="min-h-[calc(100vh-96px)] py-12">
      <div className="gofit-container">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-light tracking-wider text-gofit-offwhite">
              Your <span className="text-gofit-gold">Fitness Plan</span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
              {aiGenerated ? (
                <span className="inline-flex items-center text-sm text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                  <Sparkles className="h-3 w-3 mr-1" /> AI-Generated
                </span>
              ) : (
                <span className="inline-flex items-center text-sm text-gofit-silver bg-white/5 px-2 py-0.5 rounded-full">
                  <AlertCircle className="h-3 w-3 mr-1" /> Offline Mode
                </span>
              )}
              <p className="text-gofit-silver text-sm">
                {plan.plan_name || 'Personalized plan tailored to your goals'}
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={handleGeneratePlan}
              disabled={generating}
              className={`gofit-button-outline inline-flex items-center text-sm ${generating ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Regenerating...' : 'Regenerate Plan'}
            </button>
          </div>
        </div>

        {/* === Backend AI Plan View === */}
        {isBackendPlan && (
          <>
            {/* Week Tabs */}
            {plan.weekly_plans.length > 1 && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {plan.weekly_plans.map((week, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveWeek(idx)}
                    className={`px-4 py-2 text-sm whitespace-nowrap border transition-colors ${
                      activeWeek === idx
                        ? 'bg-gold/20 border-gold text-gold'
                        : 'bg-gofit-charcoal border-gofit-charcoal/50 text-gofit-silver hover:border-gold/30'
                    }`}
                  >
                    Week {week.week_number}
                    <span className="ml-2 text-xs opacity-70">
                      {new Date(week.week_start + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Weekly Goals */}
            {plan.weekly_plans[activeWeek]?.weekly_goals && (
              <div className="bg-gofit-charcoal p-4 border border-gold/20 mb-6">
                <h3 className="text-sm font-medium text-gold mb-2 flex items-center">
                  <Target className="h-4 w-4 mr-1" /> Weekly Goals
                </h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(plan.weekly_plans[activeWeek].weekly_goals).map(([key, value]) => (
                    <span key={key} className="text-xs text-gofit-silver bg-white/5 px-3 py-1 rounded-full">
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Plans */}
            <div className="space-y-3">
              {plan.weekly_plans[activeWeek]?.daily_plans?.map((dayPlan) => {
                const isToday = dayPlan.date === today;
                const isExpanded = expandedDay === dayPlan.date;

                return (
                  <div
                    key={dayPlan.date}
                    className={`bg-gofit-charcoal border ${isToday ? 'border-gold' : 'border-gofit-charcoal/50'}`}
                  >
                    {/* Day Header */}
                    <div
                      className={`flex items-center justify-between p-4 cursor-pointer ${isToday ? 'bg-gold/10' : ''}`}
                      onClick={() => toggleDayExpand(dayPlan.date)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gofit-offwhite">{formatDate(dayPlan.date)}</span>
                        {isToday && <span className="bg-gold text-black text-xs px-2 py-0.5 font-medium">TODAY</span>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gofit-silver">
                        <span className="flex items-center"><Utensils className="h-3.5 w-3.5 mr-1 text-gold" />{dayPlan.total_calories} cal</span>
                        <span className="flex items-center"><Dumbbell className="h-3.5 w-3.5 mr-1 text-gold" />{dayPlan.exercises?.length || 0}</span>
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="p-4 border-t border-gofit-charcoal/50 space-y-6 animate-fade-in">
                        {/* Targets Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-black/30 p-3 text-center border border-gold/10">
                            <Utensils className="h-4 w-4 text-gold mx-auto mb-1" />
                            <div className="text-lg font-medium text-gofit-offwhite">{dayPlan.total_calories}</div>
                            <div className="text-xs text-gofit-silver">Calories</div>
                          </div>
                          <div className="bg-black/30 p-3 text-center border border-gold/10">
                            <Droplets className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                            <div className="text-lg font-medium text-gofit-offwhite">{dayPlan.water_target_ml}ml</div>
                            <div className="text-xs text-gofit-silver">Water</div>
                          </div>
                          <div className="bg-black/30 p-3 text-center border border-gold/10">
                            <Footprints className="h-4 w-4 text-green-400 mx-auto mb-1" />
                            <div className="text-lg font-medium text-gofit-offwhite">{dayPlan.steps_target?.toLocaleString()}</div>
                            <div className="text-xs text-gofit-silver">Steps</div>
                          </div>
                          <div className="bg-black/30 p-3 text-center border border-gold/10">
                            <Target className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                            <div className="text-lg font-medium text-gofit-offwhite">{dayPlan.total_protein}g</div>
                            <div className="text-xs text-gofit-silver">Protein</div>
                          </div>
                        </div>

                        {/* Meals */}
                        {dayPlan.meals && dayPlan.meals.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-gold mb-3 flex items-center">
                              <Utensils className="h-4 w-4 mr-1" /> Meals
                            </h3>
                            <div className="space-y-2">
                              {dayPlan.meals.map((meal, idx) => (
                                <div key={idx} className="bg-black/30 p-3 border border-gofit-charcoal/50">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="capitalize font-medium text-gofit-offwhite">{meal.type}</span>
                                    <span className="text-xs text-gofit-silver">{meal.time} • {meal.total_calories} cal</span>
                                  </div>
                                  <div className="space-y-1">
                                    {meal.items?.map((item, iIdx) => (
                                      <div key={iIdx} className="flex justify-between text-sm text-gofit-silver">
                                        <span>{item.name} ({item.quantity})</span>
                                        <span className="text-xs">P:{item.protein_g}g C:{item.carbs_g}g F:{item.fat_g}g</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Exercises */}
                        {dayPlan.exercises && dayPlan.exercises.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-gold mb-3 flex items-center">
                              <Dumbbell className="h-4 w-4 mr-1" /> Exercises
                            </h3>
                            <div className="space-y-2">
                              {dayPlan.exercises.map((exercise, idx) => (
                                <div key={idx} className="bg-black/30 p-3 border border-gofit-charcoal/50">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-gofit-offwhite">{exercise.name}</span>
                                    <span className="text-xs text-gold capitalize">{exercise.type}</span>
                                  </div>
                                  <div className="text-sm text-gofit-silver mt-1">
                                    <span>{exercise.duration_minutes} min</span>
                                    <span className="mx-2">•</span>
                                    <span className="capitalize">{exercise.intensity}</span>
                                    {exercise.sets && exercise.reps && (
                                      <><span className="mx-2">•</span><span>{exercise.sets}×{exercise.reps}</span></>
                                    )}
                                    {exercise.calories_burned && (
                                      <><span className="mx-2">•</span><span>{exercise.calories_burned} cal burned</span></>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Macros Summary */}
                        <div className="bg-black/20 p-3 border border-gold/10">
                          <h4 className="text-xs font-medium text-gold mb-2">Daily Macros</h4>
                          <div className="flex gap-4 text-sm">
                            <span className="text-gofit-silver">Protein: <span className="text-gofit-offwhite">{dayPlan.total_protein}g</span></span>
                            <span className="text-gofit-silver">Carbs: <span className="text-gofit-offwhite">{dayPlan.total_carbs}g</span></span>
                            <span className="text-gofit-silver">Fat: <span className="text-gofit-offwhite">{dayPlan.total_fat}g</span></span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* === Legacy Mock Plan View === */}
        {isLegacyPlan && (
          <>
            <div className="mb-10">
              <h2 className="text-xl font-light text-gofit-offwhite mb-6 flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-gofit-gold" /> Weekly Schedule
              </h2>

              <div className="space-y-4">
                {plan.weeklyPlan?.map((dayPlan: any) => (
                  <div
                    key={dayPlan.day}
                    className={`bg-gofit-charcoal border ${dayPlan.day === todayDayName ? 'border-gofit-gold' : 'border-gofit-charcoal/50'}`}
                  >
                    <div
                      className={`flex items-center justify-between p-4 cursor-pointer ${dayPlan.day === todayDayName ? 'bg-gofit-gold/10' : ''}`}
                      onClick={() => toggleDayExpand(dayPlan.day)}
                    >
                      <div className="flex items-center">
                        <span className="font-medium text-gofit-offwhite mr-3">{formatDayName(dayPlan.day)}</span>
                        {dayPlan.day === todayDayName && <span className="bg-gofit-gold text-gofit-black text-xs px-2 py-1">Today</span>}
                      </div>
                      <div className="flex items-center">
                        {dayPlan.isWorkoutDay ? (
                          <div className="flex items-center mr-4 text-gofit-gold">
                            <Dumbbell className="h-4 w-4 mr-1" />
                            <span className="text-sm capitalize">{dayPlan.workoutType}</span>
                          </div>
                        ) : (
                          <div className="flex items-center mr-4 text-gofit-silver">
                            <Heart className="h-4 w-4 mr-1" />
                            <span className="text-sm">Rest Day</span>
                          </div>
                        )}
                        {expandedDay === dayPlan.day ? <ChevronUp className="h-5 w-5 text-gofit-silver" /> : <ChevronDown className="h-5 w-5 text-gofit-silver" />}
                      </div>
                    </div>

                    {expandedDay === dayPlan.day && (
                      <div className="p-4 border-t border-gofit-charcoal/50 animate-fade-in">
                        {dayPlan.isWorkoutDay ? (
                          <div>
                            <div className="mb-4 flex items-center">
                              <Clock className="h-4 w-4 text-gofit-silver mr-2" />
                              <span className="text-gofit-silver text-sm">Duration: {dayPlan.duration} minutes</span>
                            </div>
                            <h3 className="text-lg font-light text-gofit-gold mb-3 capitalize">{dayPlan.workoutType} Workout</h3>
                            <div className="space-y-4">
                              {dayPlan.exercises?.map((exercise: any, index: number) => (
                                <div key={index} className="bg-gofit-black p-3 border border-gofit-charcoal/50">
                                  <div className="font-medium text-gofit-offwhite mb-1">{exercise.name}</div>
                                  <div className="text-gofit-silver text-sm">
                                    {exercise.sets && exercise.reps ? <span>{exercise.sets} sets × {exercise.reps} reps</span> : exercise.duration ? <span>{typeof exercise.duration === 'number' ? `${exercise.duration} minutes` : exercise.duration}</span> : null}
                                    {exercise.rest && <span> • Rest: {exercise.rest}</span>}
                                    {exercise.intensity && <span> • Intensity: {exercise.intensity}</span>}
                                    {exercise.focus && <span> • Focus: {exercise.focus}</span>}
                                    {exercise.holds && <span> • Hold: {exercise.holds}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h3 className="text-lg font-light text-gofit-gold mb-3">Rest Day Activities</h3>
                            <div className="space-y-2">
                              {dayPlan.restActivities?.map((activity: string, index: number) => (
                                <div key={index} className="flex items-center text-gofit-silver">
                                  <CheckCircle className="h-4 w-4 text-gofit-silver mr-2" />
                                  <span>{activity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Nutrition Tips */}
            {plan.nutritionTips && (
              <div className="bg-gofit-charcoal p-6 mb-10 border border-gofit-charcoal/50">
                <h2 className="text-xl font-light text-gofit-offwhite mb-4 flex items-center">
                  <Utensils className="mr-2 h-5 w-5 text-gofit-gold" /> Nutrition Tips
                </h2>
                <div className="space-y-3">
                  {plan.nutritionTips.map((tip: string, index: number) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-gofit-gold mt-1 mr-3 flex-shrink-0" />
                      <p className="text-gofit-silver">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rest Day Activities */}
            {plan.restDayActivities && (
              <div className="bg-gofit-charcoal p-6 border border-gofit-charcoal/50">
                <h2 className="text-xl font-light text-gofit-offwhite mb-4 flex items-center">
                  <Heart className="mr-2 h-5 w-5 text-gofit-gold" /> Rest Day Recommendations
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plan.restDayActivities.map((activity: string, index: number) => (
                    <div key={index} className="bg-gofit-black p-3 border border-gofit-charcoal/50 flex items-center">
                      <CheckCircle className="h-4 w-4 text-gofit-gold mr-3 flex-shrink-0" />
                      <span className="text-gofit-silver">{activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Disclaimer */}
        <div className="mt-8 bg-gofit-charcoal/50 p-4 border border-gofit-charcoal/30 text-center">
          <p className="text-xs text-gofit-silver">
            This plan is generated by AI and is not medical advice. Always consult healthcare professionals
            before starting a new fitness or nutrition program, especially with pre-existing conditions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FitnessPlan;
