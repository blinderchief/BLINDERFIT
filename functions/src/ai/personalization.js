const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Get config from Firebase environment
const perplexityApiKey = functions.config().perplexity?.apikey || process.env.PERPLEXITY_API_KEY;
const aiModel = functions.config().app?.model || process.env.AI_MODEL_VERSION || 'sonar-pro';

/**
 * Generate personalized nutrition plan
 */
exports.generateNutritionPlan = functions.https.onCall(async (data, context) => {
  // Ensure authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const userId = context.auth.uid;
  
  try {
    // Get user profile
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User profile not found');
    }
    const userProfile = userDoc.data();
    
    // Get personalization data
    const personalizationDoc = await admin.firestore()
      .collection('ai_personalization')
      .doc(userId)
      .get();
    const personalization = personalizationDoc.exists ? personalizationDoc.data() : {};
    
    // Get recent interactions
    const recentInteractions = await admin.firestore()
      .collection('interactions')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    
    const interactions = [];
    recentInteractions.forEach(doc => {
      interactions.push(doc.data());
    });
    
    // Prepare AI prompt
    const prompt = constructNutritionPlanPrompt(userProfile, personalization, interactions, data.requestParameters);
    
    // Call Perplexity API
    const response = await axios({
      method: 'post',
      url: 'https://api.perplexity.ai/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${perplexityApiKey}`
      },
      data: {
        model: aiModel,
        messages: [
          {
            role: "system",
            content: "You are a professional nutritionist and fitness expert specializing in creating personalized meal plans."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }
    });
    
    // Parse AI response
    const plan = parseNutritionPlanResponse(response.data.choices[0].message.content);
    
    // Store the generated plan
    await admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('plans')
      .add({
        type: 'nutrition',
        plan: plan,
        weekNumber: data.weekNumber || 1,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        aiGenerated: true,
        aiPrompt: prompt,
        aiResponse: response.data.choices[0].message.content
      });
    
    // Log this AI interaction
    await admin.firestore()
      .collection('ai_queries')
      .add({
        userId: userId,
        type: 'nutrition_plan_generation',
        parameters: data.requestParameters,
        prompt: prompt,
        response: plan,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    
    return { success: true, plan: plan };
  } catch (error) {
    console.error('Error generating nutrition plan:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate nutrition plan', error);
  }
});

// Helper functions
function constructNutritionPlanPrompt(userProfile, personalization, interactions, requestParams) {
  return `Generate a personalized nutrition plan for the following user:
  
User Profile:
- Age: ${userProfile.age}
- Gender: ${userProfile.gender}
- Weight: ${userProfile.weight}kg
- Height: ${userProfile.height}cm
- BMI: ${userProfile.bodyMassIndex}
- Allergies: ${userProfile.allergies.join(', ')}
- Dietary restrictions: ${userProfile.dietaryRestrictions.join(', ')}
- Nutritional deficiencies: ${userProfile.deficiencies.join(', ')}
- Preferred cuisines: ${userProfile.cuisine.join(', ')}
- Preferred meal complexity: ${userProfile.mealComplexity}
- Available cooking time: ${userProfile.cookingTime} minutes
- Primary goal: ${userProfile.primaryGoal}

Personalization Insights:
- Meal size preference: ${personalization.nutritionPatterns?.mealSizePreference || 'Balanced'}
- Protein preference level (1-10): ${personalization.nutritionPatterns?.proteinPreference || 5}
- Carb preference level (1-10): ${personalization.nutritionPatterns?.carbPreference || 5}
- Plan adherence rate: ${personalization.behavioralInsights?.planAdherenceRate || '85%'}
- Response to variety (1-10): ${personalization.modelParameters?.varietyPreference || 5}

Plan Parameters:
- Week number: ${requestParams.weekNumber || 1}
- Daily calorie target: ${requestParams.calorieTarget || 'appropriate for goals'}
- Number of meals per day: ${requestParams.mealsPerDay || 3}
- Include snacks: ${requestParams.includeSnacks ? 'yes' : 'no'}
- Focus areas: ${requestParams.focusAreas || 'balanced nutrition'}

Based on the user's recent behavior, they tend to prefer ${extractRecentPreferences(interactions)}.

Create a 7-day meal plan with breakfast, lunch, dinner${requestParams.includeSnacks ? ', and snacks' : ''} for each day. 
For each meal, include:
1. Meal name
2. Brief description
3. Key ingredients
4. Approximate macros (protein, carbs, fat)
5. Preparation time
6. Cooking difficulty (1-5)

Also include:
- Weekly shopping list
- Meal prep recommendations
- 2-3 alternative options for each day for flexibility

The plan should be tailored to the user's specific needs, preferences, and goals.`;
}

function extractRecentPreferences(interactions) {
  // Implementation to analyze interactions and extract preferences
  // This would include logic to identify patterns in the user's behavior
  
  // Simplified example:
  const cuisines = interactions
    .filter(i => i.type === 'recipe_view' || i.type === 'recipe_favorite')
    .map(i => i.details.cuisineType)
    .filter(Boolean);
  
  const cuisineCounts = {};
  cuisines.forEach(c => {
    cuisineCounts[c] = (cuisineCounts[c] || 0) + 1;
  });
  
  const preferredCuisines = Object.keys(cuisineCounts)
    .sort((a, b) => cuisineCounts[b] - cuisineCounts[a])
    .slice(0, 2);
  
  const mealTimes = interactions
    .filter(i => i.type === 'meal_logged')
    .map(i => new Date(i.timestamp._seconds * 1000).getHours());
  
  // Simplified analysis
  if (preferredCuisines.length > 0) {
    return `${preferredCuisines.join(' and ')} cuisine, and typically eats their main meal between 
    ${Math.min(...mealTimes)}:00 and ${Math.max(...mealTimes)}:00`;
  }
  
  return 'balanced meals with moderate variety';
}

function parseNutritionPlanResponse(responseText) {
  // In a real implementation, this would parse the structured response
  // from the AI into a format that's easy to work with in the frontend
  
  // For demonstration, we're returning a simplified structure
  // A more robust implementation would use regex or other parsing techniques
  
  // Example structure:
  return {
    days: [
      {
        day: 'Monday',
        meals: {
          breakfast: {
            name: 'Vegetable Omelette with Toast',
            description: 'Fluffy omelette with mixed vegetables and whole grain toast',
            ingredients: ['eggs', 'bell peppers', 'spinach', 'whole grain bread'],
            macros: {
              protein: '20g',
              carbs: '25g',
              fat: '15g'
            },
            prepTime: 15,
            difficulty: 2
          },
          // lunch, dinner, snacks would be similar objects
        }
      },
      // Other days would be similar objects
    ],
    shoppingList: [
      { category: 'Proteins', items: ['eggs', 'chicken breast', 'tofu'] },
      { category: 'Vegetables', items: ['spinach', 'bell peppers', 'carrots'] }
      // etc.
    ],
    mealPrepTips: [
      'Prepare vegetable portions for the entire week on Sunday',
      'Cook rice and quinoa in batches and refrigerate'
    ],
    alternatives: [
      {
        dayIndex: 0,
        mealType: 'breakfast',
        alternative: {
          name: 'Greek Yogurt with Berries and Granola',
          // similar structure as regular meals
        }
      }
      // more alternatives
    ]
  };
}

// Additional Cloud Functions would follow similar patterns for:
// - Generate workout plans
// - Generate sleep schedules
// - Provide personalized recommendations
// - Answer health and wellness queries