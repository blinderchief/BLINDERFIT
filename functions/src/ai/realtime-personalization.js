/**
 * Real-time personalization service for the BlinderFit AI
 * Enhances AI responses with user data and context for personalized experiences
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { enableFirebaseTelemetry } = require('@genkit-ai/firebase');

// Check if Firebase app is initialized
try {
  admin.app();
} catch (e) {
  admin.initializeApp();
}

// Enable Firebase telemetry
enableFirebaseTelemetry();

// Database references
const db = admin.firestore();

/**
 * Get comprehensive user profile data for AI personalization
 * Includes user profile, health metrics, activity logs, and goals
 */
exports.getUserPersonalizationData = async (userId) => {
  if (!userId) return null;
  
  try {
    // Get basic user data
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.log(`No user found with ID: ${userId}`);
      return null;
    }
    
    // Get health data
    const healthDataDoc = await db.collection('healthData').doc(userId).get();
    
    // Get user activity logs (last 10)
    const activitySnapshot = await db.collection('activityLogs')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();
    
    // Get user goals
    const goalsSnapshot = await db.collection('goals')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .get();
      
    // Compile all data
    const userData = {
      profile: userDoc.data(),
      healthData: healthDataDoc.exists ? healthDataDoc.data() : {},
      activities: activitySnapshot.docs.map(doc => doc.data()),
      goals: goalsSnapshot.docs.map(doc => doc.data())
    };
    
    return userData;
  } catch (error) {
    console.error('Error fetching user personalization data:', error);
    return null;
  }
};

/**
 * Log user AI interaction for continuous improvement
 */
exports.logAIInteraction = async (userId, data) => {
  if (!userId) return false;
  
  try {
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    
    await db.collection('aiInteractions').add({
      userId,
      prompt: data.prompt,
      responseType: data.responseType || 'text',
      timestamp,
      metadata: data.metadata || {}
    });
    
    // Update user's last interaction timestamp
    await db.collection('users').doc(userId).update({
      lastAiInteraction: timestamp
    });
    
    return true;
  } catch (error) {
    console.error('Error logging AI interaction:', error);
    return false;
  }
};

/**
 * Personalize AI response based on user data
 */
exports.personalizeResponse = async (response, userData) => {
  if (!userData) return response;
  
  try {
    // Add user-specific information to the response
    let personalizedResponse = response;
    
    // Add name personalization if available
    if (userData.profile && userData.profile.name) {
      personalizedResponse = personalizedResponse.replace(
        /^(MAIN ANSWER:)/,
        `Hi ${userData.profile.name}, \n\n$1`
      );
    }
    
    // Add health-specific recommendations if available
    if (userData.healthData) {
      // Check if the response already contains personalized tips
      if (personalizedResponse.includes('PERSONALIZED TIPS:')) {
        // Add user-specific health info to personalized tips
        const healthInfo = generateHealthSpecificTips(userData.healthData);
        if (healthInfo) {
          personalizedResponse = personalizedResponse.replace(
            /(PERSONALIZED TIPS:[\s\S]*?)(?=$|MAIN ANSWER:|ADDITIONAL INFO:)/,
            `$1\n\nBased on your health profile: ${healthInfo}\n\n`
          );
        }
      }
    }
    
    // Track progress toward goals if available
    if (userData.goals && userData.goals.length > 0) {
      const goalInfo = generateGoalProgressInfo(userData.goals, userData.activities);
      if (goalInfo) {
        personalizedResponse += `\n\nGOAL TRACKING:\n${goalInfo}`;
      }
    }
    
    return personalizedResponse;
  } catch (error) {
    console.error('Error personalizing response:', error);
    return response; // Return original response if personalization fails
  }
};

/**
 * Generate health-specific tips based on user health data
 */
function generateHealthSpecificTips(healthData) {
  const tips = [];
  
  if (!healthData) return '';
  
  if (healthData.bmi) {
    const bmi = parseFloat(healthData.bmi);
    if (bmi < 18.5) {
      tips.push("Your BMI indicates you're underweight. Focus on nutrient-dense foods to support healthy weight gain.");
    } else if (bmi >= 18.5 && bmi < 25) {
      tips.push("Your BMI is within a healthy range. Maintain your balanced approach to nutrition and exercise.");
    } else if (bmi >= 25 && bmi < 30) {
      tips.push("Your BMI indicates you're overweight. Consider incorporating more cardio and strength training.");
    } else if (bmi >= 30) {
      tips.push("Your BMI indicates obesity. Consider consulting with a healthcare provider for a personalized plan.");
    }
  }
  
  if (healthData.fitnessLevel) {
    switch (healthData.fitnessLevel.toLowerCase()) {
      case 'beginner':
        tips.push("As a beginner, focus on building consistency with 2-3 workouts per week.");
        break;
      case 'intermediate':
        tips.push("At your intermediate level, consider adding more challenging exercises to your routine.");
        break;
      case 'advanced':
        tips.push("With your advanced fitness level, periodized training may help you continue progressing.");
        break;
    }
  }
  
  if (healthData.dietaryPreferences && healthData.dietaryPreferences.length) {
    const preferences = healthData.dietaryPreferences;
    if (preferences.includes('vegan')) {
      tips.push("For your vegan diet, ensure adequate protein from varied plant sources.");
    } else if (preferences.includes('vegetarian')) {
      tips.push("As a vegetarian, combining complementary proteins can help meet your nutritional needs.");
    } else if (preferences.includes('keto')) {
      tips.push("For your keto diet, monitoring electrolytes is important for optimal performance.");
    }
  }
  
  return tips.join(' ');
}

/**
 * Generate goal progress information based on user goals and activities
 */
function generateGoalProgressInfo(goals, activities) {
  if (!goals || !goals.length) return '';
  
  const goalInfo = [];
  
  goals.forEach(goal => {
    if (goal.type === 'weight') {
      const currentWeight = activities && activities.length > 0 && activities[0].weight 
        ? activities[0].weight 
        : null;
      
      if (currentWeight && goal.targetWeight) {
        const difference = Math.abs(currentWeight - goal.targetWeight);
        const direction = currentWeight > goal.targetWeight ? 'lose' : 'gain';
        
        goalInfo.push(`Weight goal: ${direction === 'lose' ? 'Lose' : 'Gain'} ${difference.toFixed(1)} kg to reach your target of ${goal.targetWeight} kg.`);
      }
    } else if (goal.type === 'workout' && goal.frequency) {
      // Count workouts in the last week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const workoutsThisWeek = activities ? activities.filter(activity => 
        activity.type === 'workout' && 
        new Date(activity.timestamp) > oneWeekAgo
      ).length : 0;
      
      goalInfo.push(`Workout goal: ${workoutsThisWeek}/${goal.frequency} workouts completed this week.`);
    }
  });
  
  return goalInfo.join('\n');
}
