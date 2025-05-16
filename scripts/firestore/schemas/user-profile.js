/**
 * Enhanced User Profile Schema for AI Personalization
 */
const userProfileSchema = {
  // Basic information
  uid: "string", // Firebase Auth UID
  email: "string",
  displayName: "string",
  
  // Physical attributes
  age: "number",
  gender: "string",
  weight: "number", // in kg
  height: "number", // in cm
  bodyMassIndex: "number", // calculated field
  
  // Health information
  allergies: ["string"], // array of allergens
  deficiencies: ["string"], // nutritional deficiencies
  medicalConditions: ["string"], // health conditions
  dietaryRestrictions: ["string"], // vegan, vegetarian, etc.
  
  // Preferences
  cuisine: ["string"], // preferred cuisines
  mealComplexity: "string", // simple, moderate, complex
  cookingTime: "number", // minutes willing to spend cooking
  activityPreferences: ["string"], // yoga, running, weights
  sleepPattern: {
    typicalBedtime: "string", // "HH:MM" format
    typicalWakeTime: "string", // "HH:MM" format
    sleepIssues: ["string"] // insomnia, etc.
  },
  
  // Goals
  primaryGoal: "string", // weight loss, muscle gain, etc.
  secondaryGoals: ["string"],
  targetWeight: "number", // if weight-related goal
  weeklyActivityTarget: "number", // hours per week
  
  // AI personalization fields
  personalityTraits: {
    conscientiousness: "number", // 1-10 scale
    openness: "number",
    extraversion: "number",
    agreeableness: "number",
    neuroticism: "number"
  },
  motivationalFactors: ["string"], // what motivates this user
  adherenceHistory: "number", // 1-10 scale of plan adherence
  
  // System fields
  createdAt: "timestamp",
  updatedAt: "timestamp",
  profileCompleteness: "number" // percentage complete
}