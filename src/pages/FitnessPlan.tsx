
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useHealthData } from '@/contexts/HealthDataContext';
import { FitnessService } from '@/services/FitnessService';
import { Dumbbell, Calendar, Clock, RefreshCw, Heart, Utensils, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const FitnessPlan = () => {
  const { user } = useAuth();
  const { healthData, hasSubmittedHealthData } = useHealthData();
  const [fitnessPlan, setFitnessPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authCheckDone, setAuthCheckDone] = useState(false);
  const navigate = useNavigate();
  
  // Day name formatting
  const formatDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };
  
  // Get today's day
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  // First check if authentication is established
  useEffect(() => {
    // Try to check cached auth first
    const cachedAuthState = localStorage.getItem('blinderfit_auth_state');
    let cachedAuth = null;
    
    if (cachedAuthState) {
      try {
        cachedAuth = JSON.parse(cachedAuthState);
        const isRecent = Date.now() - cachedAuth.timestamp < 60 * 60 * 1000; // Within the last hour
        
        if (isRecent && cachedAuth.isAuthenticated) {
          console.log('Using cached authentication state in FitnessPlan while checking auth');
          // Don't set isAuthChecking to false immediately as we still need to wait for Firebase
        }
      } catch (e) {
        console.error('Error parsing cached auth state:', e);
      }
    }

    const checkAuth = setTimeout(() => {
      // If we have both cached auth and Firebase user, or just Firebase user
      if ((cachedAuth && user) || user) {
        setIsAuthChecking(false);
        setAuthCheckDone(true);
      } 
      // If we have cached auth but no Firebase user yet (still loading)
      else if (cachedAuth && !user) {
        // Keep waiting for Firebase, but with a longer timeout
        setTimeout(() => {
          setIsAuthChecking(false);
          setAuthCheckDone(true);
        }, 2000);
      } 
      // No auth at all
      else {
        setIsAuthChecking(false);
        setAuthCheckDone(true);
      }
    }, 1000); // Give Firebase auth a moment to initialize
    
    return () => clearTimeout(checkAuth);
  }, [user]);
  
  // Store authentication status in localStorage to persist across refreshes
  useEffect(() => {
    if (user) {
      // Save auth state to localStorage
      localStorage.setItem('blinderfit_auth_state', JSON.stringify({
        isAuthenticated: true,
        userId: user.uid || user.id,
        timestamp: Date.now()
      }));
    }
  }, [user]);
  
  useEffect(() => {
    const loadFitnessPlan = async () => {
      // Check if user has submitted health data
      if (!hasSubmittedHealthData) {
        setLoading(false);
        return;
      }
      
      if (healthData) {
        try {
          // Try to load from localStorage first
          const storedPlan = localStorage.getItem(`gofit_fitness_plan_${user?.id}`);
          
          if (storedPlan) {
            setFitnessPlan(JSON.parse(storedPlan));
          } else {
            // Generate a new plan
            const plan = await FitnessService.generateFitnessPlan(healthData);
            setFitnessPlan(plan);
            localStorage.setItem(`gofit_fitness_plan_${user?.id}`, JSON.stringify(plan));
          }
          
          // Expand today's workout by default
          setExpandedDay(today);
        } catch (error) {
          console.error('Error loading fitness plan:', error);
          toast.error('Failed to load your fitness plan');
        }
      }
      
      setLoading(false);
    };
    
    loadFitnessPlan();
  }, [user, healthData, hasSubmittedHealthData, today]);
  
  const handleRegeneratePlan = async () => {
    if (!healthData) return;
    
    setRegenerating(true);
    
    try {
      const newPlan = await FitnessService.generateFitnessPlan(healthData);
      setFitnessPlan(newPlan);
      localStorage.setItem(`gofit_fitness_plan_${user?.id}`, JSON.stringify(newPlan));
      toast.success('Your fitness plan has been regenerated');
      setExpandedDay(today);
    } catch (error) {
      console.error('Error regenerating fitness plan:', error);
      toast.error('Failed to regenerate your fitness plan');
    }
    
    setRegenerating(false);
  };
  
  const toggleDayExpand = (day: string) => {
    if (expandedDay === day) {
      setExpandedDay(null);
    } else {
      setExpandedDay(day);
    }
  };
  
  // Show loading while checking auth - prevents flash of login screen on refresh
  if (isAuthChecking) {
    return (
      <div className="min-h-[calc(100vh-96px)] flex items-center justify-center bg-black">
        <div className="animate-pulse text-gold text-xl">Loading your fitness plan...</div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-96px)] flex items-center justify-center">
        <div className="animate-pulse text-gofit-gold">Loading your fitness plan...</div>
      </div>
    );
  }
  
  // If user hasn't completed the health form
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
              We need some information about your health and fitness goals to create your personalized fitness plan.
            </p>
            <Link to="/health-form" className="gofit-button inline-flex items-center">
              Start Health Assessment
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-96px)] py-12">
      <div className="gofit-container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-light tracking-wider text-gofit-offwhite">
              Your <span className="text-gofit-gold">Fitness Plan</span>
            </h1>
            <p className="text-gofit-silver mt-2">AI-generated plan tailored to your goals and preferences</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={handleRegeneratePlan}
              disabled={regenerating}
              className={`gofit-button-outline inline-flex items-center text-sm ${
                regenerating ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
              {regenerating ? 'Regenerating...' : 'Regenerate Plan'}
            </button>
          </div>
        </div>
        
        {/* Weekly Plan */}
        <div className="mb-10">
          <h2 className="text-xl font-light text-gofit-offwhite mb-6 flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-gofit-gold" /> Weekly Schedule
          </h2>
          
          <div className="space-y-4">
            {fitnessPlan?.weeklyPlan.map((dayPlan: any) => (
              <div 
                key={dayPlan.day} 
                className={`bg-gofit-charcoal border ${
                  dayPlan.day === today 
                    ? 'border-gofit-gold' 
                    : 'border-gofit-charcoal/50'
                }`}
              >
                {/* Day Header */}
                <div 
                  className={`flex items-center justify-between p-4 cursor-pointer ${
                    dayPlan.day === today ? 'bg-gofit-gold/10' : ''
                  }`}
                  onClick={() => toggleDayExpand(dayPlan.day)}
                >
                  <div className="flex items-center">
                    <span className="font-medium text-gofit-offwhite mr-3">
                      {formatDayName(dayPlan.day)}
                    </span>
                    {dayPlan.day === today && (
                      <span className="bg-gofit-gold text-gofit-black text-xs px-2 py-1">
                        Today
                      </span>
                    )}
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
                    
                    {expandedDay === dayPlan.day ? (
                      <ChevronUp className="h-5 w-5 text-gofit-silver" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gofit-silver" />
                    )}
                  </div>
                </div>
                
                {/* Expanded Day Content */}
                {expandedDay === dayPlan.day && (
                  <div className="p-4 border-t border-gofit-charcoal/50 animate-fade-in">
                    {dayPlan.isWorkoutDay ? (
                      <div>
                        <div className="mb-4 flex items-center">
                          <Clock className="h-4 w-4 text-gofit-silver mr-2" />
                          <span className="text-gofit-silver text-sm">
                            Duration: {dayPlan.duration} minutes
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-light text-gofit-gold mb-3 capitalize">
                          {dayPlan.workoutType} Workout
                        </h3>
                        
                        <div className="space-y-4">
                          {dayPlan.exercises.map((exercise: any, index: number) => (
                            <div 
                              key={index}
                              className="bg-gofit-black p-3 border border-gofit-charcoal/50"
                            >
                              <div className="font-medium text-gofit-offwhite mb-1">
                                {exercise.name}
                              </div>
                              
                              <div className="text-gofit-silver text-sm">
                                {exercise.sets && exercise.reps ? (
                                  <span>{exercise.sets} sets × {exercise.reps} reps</span>
                                ) : exercise.duration ? (
                                  <span>{typeof exercise.duration === 'number' ? `${exercise.duration} minutes` : exercise.duration}</span>
                                ) : null}
                                
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
                        <h3 className="text-lg font-light text-gofit-gold mb-3">
                          Rest Day Activities
                        </h3>
                        
                        <div className="space-y-2">
                          {dayPlan.restActivities.map((activity: string, index: number) => (
                            <div 
                              key={index}
                              className="flex items-center text-gofit-silver"
                            >
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
        <div className="bg-gofit-charcoal p-6 mb-10 border border-gofit-charcoal/50">
          <h2 className="text-xl font-light text-gofit-offwhite mb-4 flex items-center">
            <Utensils className="mr-2 h-5 w-5 text-gofit-gold" /> Nutrition Tips
          </h2>
          
          <div className="space-y-3">
            {fitnessPlan?.nutritionTips.map((tip: string, index: number) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="h-4 w-4 text-gofit-gold mt-1 mr-3 flex-shrink-0" />
                <p className="text-gofit-silver">{tip}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Rest Day Activities */}
        <div className="bg-gofit-charcoal p-6 border border-gofit-charcoal/50">
          <h2 className="text-xl font-light text-gofit-offwhite mb-4 flex items-center">
            <Heart className="mr-2 h-5 w-5 text-gofit-gold" /> Rest Day Recommendations
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fitnessPlan?.restDayActivities.map((activity: string, index: number) => (
              <div 
                key={index}
                className="bg-gofit-black p-3 border border-gofit-charcoal/50 flex items-center"
              >
                <CheckCircle className="h-4 w-4 text-gofit-gold mr-3 flex-shrink-0" />
                <span className="text-gofit-silver">{activity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FitnessPlan;
