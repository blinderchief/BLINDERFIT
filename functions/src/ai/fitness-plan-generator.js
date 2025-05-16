/**
 * Personalized fitness and nutrition plan generator using Genkit
 * Creates dynamic plans based on user data, goals and preferences
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { getGenkitInstance } = require('./genkit-modern-service');
const { getUserPersonalizationData, logAIInteraction, personalizeResponse } = require('./realtime-personalization');
const { enableFirebaseTelemetry } = require('@genkit-ai/firebase');

// Check if Firebase app is initialized
try {
  admin.app();
} catch (e) {
  admin.initializeApp();
}

// Enable Firebase telemetry
enableFirebaseTelemetry();

// System prompt for the Fitness Plan Generator
const FITNESS_PLAN_SYSTEM_PROMPT = `You are BlinderFit AI, a fitness and nutrition expert. Generate personalized fitness and nutrition plans based on user data, goals and preferences. Create practical, science-backed plans that are tailored to the individual's needs.

For each plan, include:
1) Introduction with personalized motivation
2) Weekly workout schedule with specific exercises (sets, reps, duration)
3) Nutrition plan with meal suggestions and macronutrient targets
4) Progress tracking metrics
5) Adaptation guidelines based on progress

Be specific, actionable, and accommodating of any health conditions or limitations the user has mentioned.`;

// Define the fitness plan generator flow
const defineFitnessPlanFlow = (ai) => {
  return ai.defineFlow('generateFitnessPlan', async (userProfile, healthData, goals, preferences) => {
    // Create the detailed prompt with all user data
    const prompt = `
Generate a personalized fitness and nutrition plan for this user:

USER PROFILE:
${JSON.stringify(userProfile)}

HEALTH DATA:
${JSON.stringify(healthData)}

GOALS:
${JSON.stringify(goals)}

PREFERENCES:
${JSON.stringify(preferences)}

Create a 4-week progressive plan that will help them achieve their goals while considering their current fitness level, any health conditions, and preferences.
    `;
    
    const { text: plan } = await ai.generate(prompt, {
      systemPrompt: FITNESS_PLAN_SYSTEM_PROMPT,
      temperature: 0.3, // Lower temperature for more consistent output
      maxOutputTokens: 2000, // Allow longer output for comprehensive plans
    });
    
    return {
      plan: plan,
      metadata: {
        generatedAt: new Date().toISOString(),
        duration: '4 weeks',
        difficulty: calculateDifficulty(healthData),
        focusAreas: determineMainFocusAreas(goals)
      }
    };
  });
};

/**
 * Generate a personalized fitness and nutrition plan
 */
exports.generatePersonalizedPlan = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be logged in to generate a personalized plan'
    );
  }
  
  const userId = context.auth.uid;
  
  try {
    // Get comprehensive user data
    const userData = await getUserPersonalizationData(userId);
    
    if (!userData || !userData.profile) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'User profile data not found. Please complete your profile first.'
      );
    }
    
    // Extract preferences from request or use defaults from profile
    const preferences = data?.preferences || userData.profile.preferences || {};
    
    // Initialize Genkit instance
    const ai = getGenkitInstance();
    const fitnessPlanFlow = defineFitnessPlanFlow(ai);
    
    // Execute the flow
    const planResult = await fitnessPlanFlow(
      userData.profile,
      userData.healthData,
      userData.goals,
      preferences
    );
    
    // Save the generated plan to Firestore
    const planRef = await admin.firestore().collection('fitnessPlans').add({
      userId,
      plan: planResult.plan,
      metadata: planResult.metadata,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active'
    });
    
    // Log the interaction
    await logAIInteraction(userId, {
      prompt: 'generate fitness plan',
      responseType: 'fitness_plan',
      metadata: {
        planId: planRef.id,
        planType: planResult.metadata.focusAreas.join(', ')
      }
    });
    
    // Return the plan and its ID
    return {
      planId: planRef.id,
      ...planResult,
      success: true
    };
    
  } catch (error) {
    console.error('Error generating fitness plan:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to generate fitness plan. Please try again later.',
      { originalError: error.toString() }
    );
  }
});

/**
 * Update an existing fitness plan based on feedback and progress
 */
exports.updateFitnessPlan = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be logged in to update a plan'
    );
  }
  
  const userId = context.auth.uid;
  const { planId, feedback, progressData } = data;
  
  if (!planId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Plan ID is required'
    );
  }
  
  try {
    // Get the existing plan
    const planDoc = await admin.firestore().collection('fitnessPlans').doc(planId).get();
    
    if (!planDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Fitness plan not found'
      );
    }
    
    const planData = planDoc.data();
    
    // Verify this plan belongs to the user
    if (planData.userId !== userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to update this plan'
      );
    }
    
    // Get current user data
    const userData = await getUserPersonalizationData(userId);
    
    // Initialize Genkit instance
    const ai = getGenkitInstance();
    
    // Create the adaptation prompt
    const adaptationPrompt = `
Based on the original fitness plan and the user's feedback and progress, update the plan:

ORIGINAL PLAN:
${planData.plan}

USER FEEDBACK:
${feedback || 'No specific feedback provided'}

PROGRESS DATA:
${JSON.stringify(progressData || {})}

UPDATED USER DATA:
${JSON.stringify(userData)}

Create an updated version of this plan that addresses any issues, builds on progress, and adjusts difficulty as needed.
    `;
    
    // Generate updated plan
    const { text: updatedPlan } = await ai.generate(adaptationPrompt, {
      systemPrompt: FITNESS_PLAN_SYSTEM_PROMPT,
      temperature: 0.3,
      maxOutputTokens: 2000,
    });
    
    // Save the updated plan
    await admin.firestore().collection('fitnessPlans').doc(planId).update({
      plan: updatedPlan,
      lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updateHistory: admin.firestore.FieldValue.arrayUnion({
        previousPlan: planData.plan,
        feedback,
        progressData,
        timestamp: new Date().toISOString()
      })
    });
    
    // Log the interaction
    await logAIInteraction(userId, {
      prompt: 'update fitness plan',
      responseType: 'fitness_plan_update',
      metadata: {
        planId,
        updateReason: feedback ? 'user feedback' : 'progress data'
      }
    });
    
    return {
      planId,
      plan: updatedPlan,
      success: true
    };
    
  } catch (error) {
    console.error('Error updating fitness plan:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to update fitness plan. Please try again later.',
      { originalError: error.toString() }
    );
  }
});

/**
 * Calculate difficulty level based on health data
 */
function calculateDifficulty(healthData) {
  if (!healthData || !healthData.fitnessLevel) return 'intermediate';
  
  const fitnessLevel = healthData.fitnessLevel.toLowerCase();
  
  if (fitnessLevel.includes('beginner')) {
    return 'beginner';
  } else if (fitnessLevel.includes('intermediate')) {
    return 'intermediate';
  } else if (fitnessLevel.includes('advanced')) {
    return 'advanced';
  }
  
  // Default to intermediate if no clear match
  return 'intermediate';
}

/**
 * Determine main focus areas from goals
 */
function determineMainFocusAreas(goals) {
  if (!goals || !goals.length) return ['general fitness'];
  
  const focusAreas = new Set();
  
  goals.forEach(goal => {
    if (goal.type === 'weight' && goal.direction === 'lose') {
      focusAreas.add('weight loss');
    } else if (goal.type === 'weight' && goal.direction === 'gain') {
      focusAreas.add('muscle building');
    } else if (goal.type === 'strength') {
      focusAreas.add('strength training');
    } else if (goal.type === 'endurance') {
      focusAreas.add('cardio endurance');
    } else if (goal.type === 'flexibility') {
      focusAreas.add('flexibility');
    } else if (goal.type === 'health') {
      focusAreas.add('general health');
    }
  });
  
  return Array.from(focusAreas).length ? Array.from(focusAreas) : ['general fitness'];
}
