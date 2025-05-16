/**
 * User Interaction Schema for AI Personalization
 */
const userInteractionSchema = {
  // Interaction metadata
  interactionId: "string", 
  userId: "string",
  timestamp: "timestamp",
  sessionId: "string",
  
  // Interaction types
  type: "string", // recipe_view, workout_completed, plan_modified, etc.
  
  // Contextual data
  context: {
    location: "string", // part of the app
    duration: "number", // seconds spent on this interaction
    referrer: "string", // what led to this interaction
    deviceType: "string" // mobile, desktop, etc.
  },
  
  // Content-specific data
  details: {
    // For recipe interactions
    recipeId: "string",
    recipeComplexity: "number",
    cookingTime: "number",
    ingredients: ["string"],
    cuisineType: "string",
    
    // For workout interactions
    workoutId: "string",
    workoutType: "string",
    durationMinutes: "number",
    intensity: "string",
    completionRate: "number", // 0-1 representing percentage
    
    // For plan adjustments
    planId: "string",
    adjustmentType: "string", // replace, modify, skip
    reason: "string" // user-provided reason
  },
  
  // User feedback
  feedback: {
    rating: "number", // 1-5 stars
    comments: "string",
    difficulty: "number", // 1-5 scale
    enjoymentLevel: "number" // 1-5 scale
  }
}