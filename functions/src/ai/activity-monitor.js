const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { getGenkitInstance } = require('./genkit-modern-service');

// Check if Firebase app is initialized
try {
  admin.app();
} catch (e) {
  admin.initializeApp();
}

/**
 * Monitor user activity in real-time to enhance AI personalization
 */
exports.trackUserActivity = functions.firestore
  .document('user_activities/{activityId}')
  .onCreate(async (snapshot, context) => {
    const activityData = snapshot.data();
    const userId = activityData.userId;
    
    if (!userId) return null;
    
    try {
      // Update user's activity profile
      const userRef = admin.firestore().collection('users').doc(userId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) return null;
      
      // Get current activity stats or initialize
      const userData = userDoc.data();
      const activityStats = userData.activityStats || {
        lastActive: null,
        activityCount: 0,
        activityTypes: {},
        recentActivities: []
      };
      
      // Update activity stats
      const activityType = activityData.type || 'unknown';
      activityStats.lastActive = admin.firestore.FieldValue.serverTimestamp();
      activityStats.activityCount = (activityStats.activityCount || 0) + 1;
      activityStats.activityTypes[activityType] = (activityStats.activityTypes[activityType] || 0) + 1;
      
      // Add to recent activities (keep last 10)
      const recentActivities = activityStats.recentActivities || [];
      recentActivities.unshift({
        type: activityType,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: activityData.details || {}
      });
      
      if (recentActivities.length > 10) {
        recentActivities.pop();
      }
      
      activityStats.recentActivities = recentActivities;
      
      // Update user document
      await userRef.update({ activityStats });
      
      // Check if we should generate real-time insights
      const shouldGenerateInsights = 
        activityStats.activityCount % 10 === 0 || // Every 10 activities
        !userData.lastInsightsGenerated || // Never generated before
        (userData.lastInsightsGenerated && 
         userData.lastInsightsGenerated.toDate() < new Date(Date.now() - 24 * 60 * 60 * 1000)); // More than 24 hours ago
      
      if (shouldGenerateInsights) {
        await generateRealTimeInsights(userId, activityStats);
      }
      
      return null;
    } catch (error) {
      console.error('Error tracking user activity:', error);
      return null;
    }
  });

/**
 * Generate real-time insights based on user activity
 */
async function generateRealTimeInsights(userId, activityStats) {
  try {
    // Get comprehensive user data
    const userRef = admin.firestore().collection('users').doc(userId);
    
    // Initialize GenKit instance
    const ai = getGenkitInstance();
    
    // Get user profile and recent activities
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    
    // Create context for AI
    const userContext = {
      profile: userData.profile || {},
      goals: userData.goals || {},
      recentActivities: activityStats.recentActivities || [],
      activityTypes: activityStats.activityTypes || {},
      activityCount: activityStats.activityCount || 0
    };
    
    // Create prompt for insights
    const prompt = `
Generate personalized real-time insights for this user based on their recent activity:

User Profile: ${JSON.stringify(userContext.profile)}
User Goals: ${JSON.stringify(userContext.goals)}
Recent Activities: ${JSON.stringify(userContext.recentActivities)}
Activity Patterns: ${JSON.stringify(userContext.activityTypes)}

Provide insights that are:
1. Data-driven, based on the user's actual activities and patterns
2. Actionable, with specific recommendations
3. Motivational, acknowledging progress and encouraging improvement
4. Relevant to their current goals and recent behavior

Format your response in three sections:
1. ACTIVITY INSIGHTS: Analysis of recent activity patterns and trends
2. PROGRESS ASSESSMENT: Evaluation of progress toward stated goals
3. RECOMMENDATIONS: Specific, actionable next steps based on current data
`;
    
    // Generate insights
    const { text } = await ai.generate(prompt, {
      systemPrompt: "You are BlinderFit AI, a fitness and nutrition expert. You provide personalized, data-driven insights based on user activity patterns.",
      temperature: 0.3,
      maxOutputTokens: 1000,
    });
    
    // Parse the structured response
    const insightsMatch = text.match(/ACTIVITY INSIGHTS:?([\s\S]*?)(?=PROGRESS ASSESSMENT|$)/i);
    const progressMatch = text.match(/PROGRESS ASSESSMENT:?([\s\S]*?)(?=RECOMMENDATIONS|$)/i);
    const recommendationsMatch = text.match(/RECOMMENDATIONS:?([\s\S]*?)$/i);
    
    const structuredInsights = {
      activityInsights: insightsMatch ? insightsMatch[1].trim() : "",
      progressAssessment: progressMatch ? progressMatch[1].trim() : "",
      recommendations: recommendationsMatch ? recommendationsMatch[1].trim() : ""
    };
    
    // Store the insights
    await admin.firestore().collection('user_insights').add({
      userId,
      insights: structuredInsights,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      basedOn: {
        activityCount: activityStats.activityCount,
        recentActivities: activityStats.recentActivities
      }
    });
    
    // Update user's last insights timestamp
    await userRef.update({
      lastInsightsGenerated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return structuredInsights;
  } catch (error) {
    console.error('Error generating real-time insights:', error);
    return null;
  }
}