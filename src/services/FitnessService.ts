
import { HealthData } from "../contexts/HealthDataContext";

// Mock service for fitness plan generation
// In a real application, this would call an API with Gemini AI integration
export const FitnessService = {
  
  generateFitnessPlan: async (healthData: HealthData): Promise<any> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate Gemini AI response based on user health data
    const workoutTypes = determineWorkoutTypes(healthData);
    const weekPlan = generateWeeklyPlan(healthData, workoutTypes);
    
    return {
      userId: '1', // Would be the actual user ID in a real app
      generatedDate: new Date().toISOString(),
      weeklyPlan: weekPlan,
      nutritionTips: generateNutritionTips(healthData),
      restDayActivities: generateRestDayActivities(healthData)
    };
  },
  
  // Generate educational content based on health data
  generateEducationalContent: async (healthData: HealthData): Promise<any> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate educational content based on user's health data
    const articles = generateEducationalArticles(healthData);
    
    return {
      articles: articles,
      lastUpdated: new Date().toISOString()
    };
  }
};

// Helper functions to generate mock data

function determineWorkoutTypes(data: HealthData): string[] {
  const types = [];
  
  // Based on goals
  if (data.goals.includes('weight_loss')) {
    types.push('cardio', 'hiit');
  }
  if (data.goals.includes('muscle_gain')) {
    types.push('strength', 'hypertrophy');
  }
  if (data.goals.includes('endurance')) {
    types.push('cardio', 'endurance');
  }
  if (data.goals.includes('flexibility')) {
    types.push('yoga', 'stretching');
  }
  
  // If no specific goals, add general fitness
  if (types.length === 0) {
    types.push('strength', 'cardio');
  }
  
  // Add recovery for everyone
  types.push('recovery');
  
  return Array.from(new Set(types)); // Remove duplicates
}

function generateWeeklyPlan(data: HealthData, workoutTypes: string[]): any[] {
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const weekPlan = [];
  
  // Determine workout frequency based on fitness level and available time
  let workoutDays = data.preferredWorkoutDays.length;
  if (workoutDays === 0) {
    // If no preferred days, default based on fitness level
    workoutDays = data.fitnessLevel === 'beginner' ? 3 : 
                 data.fitnessLevel === 'intermediate' ? 4 : 5;
  }
  
  // Generate plan for each day of the week
  daysOfWeek.forEach(day => {
    const isWorkoutDay = data.preferredWorkoutDays.includes(day) || 
                        (data.preferredWorkoutDays.length === 0 && weekPlan.filter(d => d.isWorkoutDay).length < workoutDays);
    
    if (isWorkoutDay && weekPlan.filter(d => d.isWorkoutDay).length < workoutDays) {
      // Select a workout type for this day
      const typeIndex = weekPlan.filter(d => d.isWorkoutDay).length % workoutTypes.length;
      const workoutType = workoutTypes[typeIndex];
      
      const exercises = generateExercisesForType(workoutType, data);
      
      weekPlan.push({
        day: day,
        isWorkoutDay: true,
        workoutType: workoutType,
        duration: data.availableTime,
        exercises: exercises
      });
    } else {
      // Rest day
      weekPlan.push({
        day: day,
        isWorkoutDay: false,
        restActivities: ["Light stretching", "Walking", "Foam rolling"]
      });
    }
  });
  
  return weekPlan;
}

function generateExercisesForType(type: string, data: HealthData): any[] {
  const exercisesByType: Record<string, any[]> = {
    cardio: [
      { name: "Running", duration: 20, intensity: "Moderate" },
      { name: "Cycling", duration: 25, intensity: "Moderate to High" },
      { name: "Rowing", duration: 15, intensity: "High" },
      { name: "Jumping Rope", duration: 10, intensity: "High" },
      { name: "Swimming", duration: 30, intensity: "Moderate" }
    ],
    strength: [
      { name: "Squats", sets: 3, reps: 12, rest: "60 seconds" },
      { name: "Deadlifts", sets: 3, reps: 10, rest: "90 seconds" },
      { name: "Bench Press", sets: 3, reps: 12, rest: "60 seconds" },
      { name: "Rows", sets: 3, reps: 12, rest: "60 seconds" },
      { name: "Shoulder Press", sets: 3, reps: 10, rest: "60 seconds" }
    ],
    hiit: [
      { name: "Burpees", duration: "30 seconds", rest: "15 seconds" },
      { name: "Mountain Climbers", duration: "30 seconds", rest: "15 seconds" },
      { name: "High Knees", duration: "30 seconds", rest: "15 seconds" },
      { name: "Jump Squats", duration: "30 seconds", rest: "15 seconds" },
      { name: "Plank Jacks", duration: "30 seconds", rest: "15 seconds" }
    ],
    yoga: [
      { name: "Sun Salutation", duration: 10, focus: "Full body" },
      { name: "Warrior Poses", duration: 15, focus: "Balance and strength" },
      { name: "Hip Openers", duration: 10, focus: "Flexibility" },
      { name: "Spinal Twists", duration: 10, focus: "Core and spine" },
      { name: "Savasana", duration: 5, focus: "Relaxation" }
    ],
    hypertrophy: [
      { name: "Chest Flyes", sets: 4, reps: 12, rest: "60 seconds" },
      { name: "Bicep Curls", sets: 4, reps: 12, rest: "60 seconds" },
      { name: "Tricep Extensions", sets: 4, reps: 12, rest: "60 seconds" },
      { name: "Leg Extensions", sets: 4, reps: 12, rest: "60 seconds" },
      { name: "Calf Raises", sets: 4, reps: 15, rest: "45 seconds" }
    ],
    endurance: [
      { name: "Long Distance Run", duration: 45, intensity: "Moderate" },
      { name: "Circuit Training", duration: 30, intensity: "Moderate" },
      { name: "Boxing", duration: 20, intensity: "High" },
      { name: "Stair Climbing", duration: 20, intensity: "Moderate to High" },
      { name: "Plyometrics", duration: 15, intensity: "High" }
    ],
    stretching: [
      { name: "Hamstring Stretch", duration: 5, holds: "30 seconds" },
      { name: "Quad Stretch", duration: 5, holds: "30 seconds" },
      { name: "Chest Stretch", duration: 5, holds: "30 seconds" },
      { name: "Shoulder Stretch", duration: 5, holds: "30 seconds" },
      { name: "Hip Flexor Stretch", duration: 5, holds: "30 seconds" }
    ],
    recovery: [
      { name: "Foam Rolling", duration: 15, focus: "Full body" },
      { name: "Light Walking", duration: 20, intensity: "Low" },
      { name: "Gentle Yoga", duration: 20, focus: "Relaxation" },
      { name: "Meditation", duration: 10, focus: "Mental recovery" },
      { name: "Mobility Exercises", duration: 15, focus: "Joint health" }
    ]
  };
  
  // Adjust exercise selection based on fitness level
  let exercises = [...exercisesByType[type]];
  if (data.fitnessLevel === 'beginner') {
    exercises = exercises.slice(0, 3); // Fewer exercises for beginners
  } else if (data.fitnessLevel === 'advanced') {
    // For advanced, duplicate some exercises to increase volume
    const extraExercises = exercises.slice(0, 2);
    exercises = [...exercises, ...extraExercises];
  }
  
  return exercises;
}

function generateNutritionTips(data: HealthData): string[] {
  const generalTips = [
    "Stay hydrated by drinking at least 8 glasses of water daily.",
    "Include protein with every meal to support muscle recovery.",
    "Consume a variety of colorful fruits and vegetables for essential vitamins and minerals.",
    "Limit processed foods and added sugars.",
    "Consider eating smaller, more frequent meals to maintain energy levels."
  ];
  
  const goalSpecificTips = [];
  
  // Add goal-specific tips
  if (data.goals.includes('weight_loss')) {
    goalSpecificTips.push(
      "Create a moderate calorie deficit of 300-500 calories per day for sustainable weight loss.",
      "Focus on high-fiber foods to increase satiety and reduce hunger.",
      "Consider intermittent fasting approaches if they align with your lifestyle."
    );
  }
  
  if (data.goals.includes('muscle_gain')) {
    goalSpecificTips.push(
      "Consume 1.6-2.2g of protein per kg of bodyweight daily to support muscle growth.",
      "Ensure a caloric surplus of approximately 250-500 calories per day.",
      "Consider a post-workout meal with protein and carbohydrates within 30-60 minutes after training."
    );
  }
  
  return [...generalTips, ...goalSpecificTips];
}

function generateRestDayActivities(data: HealthData): string[] {
  return [
    "Light walking (20-30 minutes)",
    "Gentle yoga or stretching",
    "Foam rolling for muscle recovery",
    "Meditation for mental recovery",
    "Light swimming",
    "Mobility exercises"
  ];
}

function generateEducationalArticles(data: HealthData): any[] {
  const generalArticles = [
    {
      title: "The Science of Recovery: Why Rest Days Matter",
      summary: "Learn about the physiological processes that occur during rest and why adequate recovery is essential for progress.",
      readTime: "4 min read"
    },
    {
      title: "Nutrition Fundamentals for Fitness Success",
      summary: "Understand macronutrients, micronutrients, and how to structure your diet to complement your training.",
      readTime: "6 min read"
    },
    {
      title: "Sleep and Fitness: The Crucial Connection",
      summary: "Discover how sleep quality impacts your fitness results and strategies to improve your sleep.",
      readTime: "5 min read"
    }
  ];
  
  const goalSpecificArticles = [];
  
  // Add articles based on user goals
  if (data.goals.includes('weight_loss')) {
    goalSpecificArticles.push({
      title: "Sustainable Weight Loss Strategies That Actually Work",
      summary: "Evidence-based approaches to weight loss that focus on long-term success rather than quick fixes.",
      readTime: "7 min read"
    });
  }
  
  if (data.goals.includes('muscle_gain')) {
    goalSpecificArticles.push({
      title: "Hypertrophy Training: Optimizing Your Workouts for Muscle Growth",
      summary: "Learn the principles of effective strength training for maximum muscle development.",
      readTime: "8 min read"
    });
  }
  
  if (data.goals.includes('flexibility')) {
    goalSpecificArticles.push({
      title: "Beyond Static Stretching: Modern Approaches to Flexibility",
      summary: "Discover dynamic flexibility techniques and mobility practices to improve your range of motion.",
      readTime: "5 min read"
    });
  }
  
  // Add articles based on health issues if present
  if (data.healthIssues.length > 0) {
    goalSpecificArticles.push({
      title: "Exercising Safely with Health Considerations",
      summary: "Guidelines for adapting your fitness routine to work with rather than against your body's needs.",
      readTime: "6 min read"
    });
  }
  
  return [...generalArticles, ...goalSpecificArticles];
}
