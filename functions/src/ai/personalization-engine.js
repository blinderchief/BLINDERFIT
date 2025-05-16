const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Check if Firebase app is initialized
try {
  admin.app();
} catch (e) {
  admin.initializeApp();
}

/**
 * Scheduled function to update user personalization models
 * Runs daily to process new user data and update personalization models
 */
exports.updatePersonalizationModels = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    try {
      // Get all users
      const usersSnapshot = await admin.firestore().collection('users').get();
      
      const updatePromises = [];
      
      usersSnapshot.forEach(userDoc => {
        const userId = userDoc.id;
        updatePromises.push(updateUserModel(userId));
      });
      
      await Promise.all(updatePromises);
      
      console.log(`Updated personalization models for ${updatePromises.length} users`);
      return null;
    } catch (error) {
      console.error('Error updating personalization models:', error);
      return null;
    }
  });

/**
 * Function to update personalization model for a specific user
 */
async function updateUserModel(userId) {
  try {
    // Get user profile
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.log(`No user profile found for ${userId}`);
      return;
    }
    const userProfile = userDoc.data();
    
    // Get user interactions from last 30 days
    const thirtyDaysAgo = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    const interactionsSnapshot = await admin.firestore()
      .collection('interactions')
      .where('userId', '==', userId)
      .where('timestamp', '>=', thirtyDaysAgo)
      .get();
    
    const interactions = [];
    interactionsSnapshot.forEach(doc => {
      interactions.push(doc.data());
    });
    
    // Get user progress data
    const progressSnapshot = await admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('progress')
      .orderBy('date', 'desc')
      .limit(30)
      .get();
    
    const progressData = [];
    progressSnapshot.forEach(doc => {
      progressData.push(doc.data());
    });
    
    // Get current personalization data if it exists
    const personalizationDoc = await admin.firestore()
      .collection('ai_personalization')
      .doc(userId)
      .get();
    
    const currentPersonalization = personalizationDoc.exists 
      ? personalizationDoc.data() 
      : initialPersonalizationTemplate();
    
    // Process data to extract new insights
    const updatedPersonalization = generatePersonalizationInsights(
      userProfile, 
      interactions, 
      progressData, 
      currentPersonalization
    );
    
    // Update the personalization document
    await admin.firestore()
      .collection('ai_personalization')
      .doc(userId)
      .set(updatedPersonalization, { merge: true });
    
    console.log(`Updated personalization for user ${userId}`);
    
  } catch (error) {
    console.error(`Error updating personalization for user ${userId}:`, error);
  }
}

/**
 * Initial template for personalization data
 */
function initialPersonalizationTemplate() {
  return {
    activityPatterns: {
      preferredTimeOfDay: 'unknown',
      weekdayVsWeekend: 'unknown',
      consistencyScore: 5,
      streakLongest: 0
    },
    nutritionPatterns: {
      calorieAdherence: 80,
      proteinPreference: 5,
      carbPreference: 5,
      fatPreference: 5,
      sugarConsumption: 5,
      mealSizePreference: 'moderate'
    },
    behavioralInsights: {
      planAdherenceRate: 80,
      quittingTriggers: [],
      motivationalFactors: [],
      responseToPositiveReinforcement: 5,
      responseToNegativeFeedback: 5,
      timeOfDayEffectiveness: {
        morning: 5,
        afternoon: 5,
        evening: 5
      }
    },
    learningStyle: {
      visual: 5,
      auditory: 5,
      reading: 5,
      kinesthetic: 5
    },
    modelParameters: {
      difficultyProgression: 5,
      varietyPreference: 5,
      explainabilityNeed: 5,
      autonomyPreference: 5
    },
    confidenceScore: 0.2,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
  };
}

/**
 * Generate personalization insights from user data
 */
function generatePersonalizationInsights(userProfile, interactions, progressData, currentPersonalization) {
  // This is where the machine learning magic would happen
  // For this demonstration, we're using a simplified rule-based approach
  
  const updated = { ...currentPersonalization };
  
  // Update last updated timestamp
  updated.lastUpdated = admin.firestore.FieldValue.serverTimestamp();
  
  // Analyze activity patterns
  if (interactions.length > 0) {
    // Extract workout times
    const workoutInteractions = interactions.filter(i => 
      i.type === 'workout_started' || i.type === 'workout_completed'
    );
    
    if (workoutInteractions.length > 0) {
      const workoutHours = workoutInteractions.map(i => 
        new Date(i.timestamp._seconds * 1000).getHours()
      );
      
      // Determine preferred time of day
      const morningWorkouts = workoutHours.filter(h => h >= 5 && h < 12).length;
      const afternoonWorkouts = workoutHours.filter(h => h >= 12 && h < 17).length;
      const eveningWorkouts = workoutHours.filter(h => h >= 17 && h < 23).length;
      
      if (morningWorkouts > afternoonWorkouts && morningWorkouts > eveningWorkouts) {
        updated.activityPatterns.preferredTimeOfDay = 'morning';
      } else if (afternoonWorkouts > morningWorkouts && afternoonWorkouts > eveningWorkouts) {
        updated.activityPatterns.preferredTimeOfDay = 'afternoon';
      } else {
        updated.activityPatterns.preferredTimeOfDay = 'evening';
      }
      
      // Calculate consistency
      const daysWithWorkouts = new Set(
        workoutInteractions.map(i => 
          new Date(i.timestamp._seconds * 1000).toISOString().split('T')[0]
        )
      ).size;
      
      const totalDaysInRange = 30; // assuming 30 days of data
      const consistencyPercentage = (daysWithWorkouts / totalDaysInRange) * 100;
      updated.activityPatterns.consistencyScore = Math.min(10, Math.round(consistencyPercentage / 10));
    }
  }
  
  // Analyze nutrition patterns
  const mealInteractions = interactions.filter(i => 
    i.type === 'meal_logged' || i.type === 'recipe_prepared'
  );
  
  if (mealInteractions.length > 0) {
    // Analyze protein preference
    const proteinValues = mealInteractions
      .filter(i => i.details && i.details.macros && i.details.macros.protein)
      .map(i => parseFloat(i.details.macros.protein));
    
    if (proteinValues.length > 0) {
      const avgProtein = proteinValues.reduce((sum, val) => sum + val, 0) / proteinValues.length;
      // Scale to 1-10 based on some reference value (e.g., 100g as 10)
      updated.nutritionPatterns.proteinPreference = Math.min(10, Math.round((avgProtein / 10)));
    }
    
    // Similar analysis would be done for carbs, fats, etc.
  }
  
  // Analyze behavioral insights from progress data
  if (progressData.length > 0) {
    // Calculate plan adherence
    const taskCompletionRates = progressData
      .filter(p => p.tasks && Object.keys(p.tasks).length > 0)
      .map(p => {
        const tasks = Object.values(p.tasks);
        const completedTasks = tasks.filter(t => t.done).length;
        return completedTasks / tasks.length;
      });
    
    if (taskCompletionRates.length > 0) {
      const avgAdherence = taskCompletionRates.reduce((sum, rate) => sum + rate, 0) / 
        taskCompletionRates.length;
      updated.behavioralInsights.planAdherenceRate = Math.round(avgAdherence * 100);
    }
    
    // Extract motivational factors from feedback
    const feedbackResponses = progressData
      .filter(p => p.feedback && p.feedback.answer)
      .map(p => p.feedback.answer);
    
    if (feedbackResponses.length > 0) {
      // Simple keyword extraction (a real system would use NLP)
      const motivationalKeywords = ['achieve', 'goal', 'better', 'improve', 'health'];
      const extractedFactors = new Set();
      
      feedbackResponses.forEach(response => {
        motivationalKeywords.forEach(keyword => {
          if (response.toLowerCase().includes(keyword)) {
            extractedFactors.add(keyword);
          }
        });
      });
      
      if (extractedFactors.size > 0) {
        updated.behavioralInsights.motivationalFactors = 
          [...extractedFactors, ...updated.behavioralInsights.motivationalFactors]
            .slice(0, 5); // Keep top 5
      }
    }
  }
  
  // Update confidence score based on data quantity
  const dataPoints = interactions.length + progressData.length;
  updated.confidenceScore = Math.min(0.95, 0.2 + (dataPoints / 100) * 0.75);
  
  return updated;
}