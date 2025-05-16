/**
 * AI Personalization Schema
 */
const aiPersonalizationSchema = {
  // Identifiers
  userId: "string",
  
  // Derived user patterns
  activityPatterns: {
    preferredTimeOfDay: "string",
    weekdayVsWeekend: "string",
    consistencyScore: "number",
    streakLongest: "number"
  },
  
  // Nutrition patterns
  nutritionPatterns: {
    calorieAdherence: "number", // percentage
    proteinPreference: "number", // scale 1-10
    carbPreference: "number",
    fatPreference: "number",
    sugarConsumption: "number",
    mealSizePreference: "string" // few large meals vs many small meals
  },
  
  // Behavioral insights
  behavioralInsights: {
    planAdherenceRate: "number", // percentage
    quittingTriggers: ["string"],
    motivationalFactors: ["string"],
    responseToPositiveReinforcement: "number", // 1-10 scale
    responseToNegativeFeedback: "number", // 1-10 scale
    timeOfDayEffectiveness: {
      morning: "number",
      afternoon: "number",
      evening: "number"
    }
  },
  
  // Learning preferences
  learningStyle: {
    visual: "number", // 1-10 scale
    auditory: "number",
    reading: "number",
    kinesthetic: "number"
  },
  
  // AI model parameters
  modelParameters: {
    difficultyProgression: "number", // how quickly to increase difficulty
    varietyPreference: "number", // how much variety to include
    explainabilityNeed: "number", // how detailed explanations should be
    autonomyPreference: "number" // how much freedom vs guidance
  },
  
  // System fields
  lastUpdated: "timestamp",
  confidenceScore: "number" // AI confidence in these insights
}