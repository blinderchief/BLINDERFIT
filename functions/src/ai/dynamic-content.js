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
 * Dynamically adapt content based on user behavior and preferences
 */
exports.adaptContentForUser = functions.https.onCall(async (data, context) => {
  // Ensure authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required for content adaptation'
    );
  }
  
  const userId = context.auth.uid;
  const { contentId, contentType } = data;
  
  if (!contentId || !contentType) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Content ID and type are required'
    );
  }
  
  try {
    // Get the original content
    const contentRef = admin.firestore().collection('content').doc(contentId);
    const contentDoc = await contentRef.get();
    
    if (!contentDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Content not found'
      );
    }
    
    const content = contentDoc.data();
    
    // Get user data for personalization
    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'User profile not found'
      );
    }
    
    const userData = userDoc.data();
    
    // Get user behavior data
    const behaviorSnapshot = await admin.firestore()
      .collection('user_activities')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    
    const behaviors = [];
    behaviorSnapshot.forEach(doc => {
      behaviors.push(doc.data());
    });
    
    // Initialize GenKit instance
    const ai = getGenkitInstance();
    
    // Create prompt for content adaptation
    const prompt = `
Adapt this ${contentType} content for this specific user based on their profile and behavior:

Original Content:
${JSON.stringify(content.body)}

Content Type: ${contentType}
Content Title: ${content.title || 'Untitled'}

User Profile:
${JSON.stringify(userData.profile || {})}

User Goals:
${JSON.stringify(userData.goals || {})}

User Preferences:
${JSON.stringify(userData.preferences || {})}

Recent User Behavior (last 50 activities):
${JSON.stringify(behaviors.map(b => ({
  type: b.type,
  timestamp: b.timestamp,
  details: b.details
})))}

Adapt the content to:
1. Match the user's fitness level and experience
2. Align with their stated goals and preferences
3. Incorporate their learning style and preferences
4. Address any specific health conditions or limitations
5. Reflect their recent activity patterns and engagement

Format your response with these sections:
1. ADAPTED CONTENT: The fully adapted content
2. ADAPTATION NOTES: Brief explanation of changes made
3. PERSONALIZATION FACTORS: Key user factors that influenced adaptation
`;
    
    // Generate the adapted content
    const { text } = await ai.generate(prompt, {
      systemPrompt: "You are BlinderFit AI, a fitness and nutrition expert specializing in personalizing content for users. Adapt content to be more relevant, engaging, and effective for each specific user based on their profile and behavior patterns.",
      temperature: 0.4,
      maxOutputTokens: 2000,
    });
    
    // Parse the structured response
    const contentMatch = text.match(/ADAPTED CONTENT:?([\s\S]*?)(?=ADAPTATION NOTES|$)/i);
    const notesMatch = text.match(/ADAPTATION NOTES:?([\s\S]*?)(?=PERSONALIZATION FACTORS|$)/i);
    const factorsMatch = text.match(/PERSONALIZATION FACTORS:?([\s\S]*?)$/i);
    
    const adaptedContent = contentMatch ? contentMatch[1].trim() : text;
    const adaptationNotes = notesMatch ? notesMatch[1].trim() : "";
    const personalizationFactors = factorsMatch ? factorsMatch[1].trim() : "";
    
    // Store the adapted content
    const adaptedContentRef = await admin.firestore().collection('adapted_content').add({
      originalContentId: contentId,
      userId,
      contentType,
      originalContent: content.body,
      adaptedContent,
      adaptationNotes,
      personalizationFactors,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Log this adaptation for future reference
    await admin.firestore().collection('content_adaptations').add({
      contentId,
      userId,
      adaptedContentId: adaptedContentRef.id,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userProfile: userData.profile || {},
      userGoals: userData.goals || {},
      userPreferences: userData.preferences || {},
      behaviorCount: behaviors.length,
      adaptationFactors: personalizationFactors
    });
    
    // Return the adapted content
    return {
      adaptedContent,
      adaptationNotes,
      personalizationFactors,
      originalContent: content.body,
      contentType,
      contentTitle: content.title || 'Untitled',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error("Error adapting content:", error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to adapt content: ' + error.message
    );
  }
});

/**
 * Proactively generate personalized content recommendations
 */
exports.generateContentRecommendations = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  try {
    // Get active users (active in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeUsersSnapshot = await admin.firestore()
      .collection('user_activities')
      .where('timestamp', '>=', sevenDaysAgo)
      .get();
    
    // Get unique user IDs
    const activeUserIds = new Set();
    activeUsersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.userId) {
        activeUserIds.add(data.userId);
      }
    });
    
    console.log(`Generating content recommendations for ${activeUserIds.size} active users`);
    
    // Process each active user
    for (const userId of activeUserIds) {
      await generateRecommendationsForUser(userId);
    }
    
    return null;
  } catch (error) {
    console.error("Error generating content recommendations:", error);
    return null;
  }
});

/**
 * Generate personalized content recommendations for a specific user
 */
async function generateRecommendationsForUser(userId) {
  try {
    // Get user data
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) return;
    
    const userData = userDoc.data();
    
    // Get recent user behavior
    const behaviorSnapshot = await admin.firestore()
      .collection('user_activities')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();
    
    const behaviors = [];
    behaviorSnapshot.forEach(doc => {
      behaviors.push(doc.data());
    });
    
    // Get available content
    const contentSnapshot = await admin.firestore()
      .collection('content')
      .limit(50)
      .get();
    
    const availableContent = [];
    contentSnapshot.forEach(doc => {
      availableContent.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Initialize GenKit instance
    const ai = getGenkitInstance();
    
    // Create prompt for content recommendations
    const prompt = `
Generate personalized content recommendations for this user based on their profile and behavior:

User Profile:
${JSON.stringify(userData.profile || {})}

User Goals:
${JSON.stringify(userData.goals || {})}

User Preferences:
${JSON.stringify(userData.preferences || {})}

Recent User Behavior (last 100 activities):
${JSON.stringify(behaviors.map(b => ({
  type: b.type,
  timestamp: b.timestamp,
  details: b.details
})).slice(0, 10))}

Available Content:
${JSON.stringify(availableContent.map(c => ({
  id: c.id,
  title: c.title,
  type: c.contentType,
  tags: c.tags,
  summary: c.summary
})))}

Recommend 5 content items that would be most relevant and beneficial for this user right now.
For each recommendation, explain why it's appropriate based on the user's profile, goals, and recent behavior.

Format your response as a JSON array with these fields for each recommendation:
1. contentId: The ID of the recommended content
2. relevanceScore: A number from 1-10 indicating how relevant this content is
3. reasonForRecommendation: Why this content is recommended
4. suggestedAdaptations: How this content should be adapted for this user
`;
    
    // Generate recommendations
    const { text } = await ai.generate(prompt, {
      systemPrompt: "You are BlinderFit AI, a fitness and nutrition expert specializing in content recommendations. Recommend content that is highly relevant and beneficial for each specific user based on their profile, goals, and behavior patterns.",
      temperature: 0.3,
      maxOutputTokens: 1500,
    });
    
    // Parse the JSON response
    let recommendations = [];
    try {
      // Extract JSON array from the response
      const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not extract JSON from response");
      }
    } catch (parseError) {
      console.error("Error parsing recommendations:", parseError);
      // Fallback: create a simple structure
      recommendations = [
        {
          contentId: availableContent.length > 0 ? availableContent[0].id : null,
          relevanceScore: 5,
          reasonForRecommendation: "Recommended based on user profile",
          suggestedAdaptations: "Adapt to user's fitness level"
        }
      ];
    }
    
    // Store recommendations
    await admin.firestore().collection('content_recommendations').doc(userId).set({
      userId,
      recommendations,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isRead: false
    });
    
    return recommendations;
  } catch (error) {
    console.error(`Error generating recommendations for user ${userId}:`, error);
    return null;
  }
}

/**
 * Real-time content adaptation based on user interaction
 */
exports.adaptContentInRealTime = functions.firestore
  .document('content_interactions/{interactionId}')
  .onCreate(async (snapshot, context) => {
    const interaction = snapshot.data();
    const { userId, contentId, interactionType, details } = interaction;
    
    if (!userId || !contentId) return null;
    
    try {
      // Check if we should adapt content based on this interaction
      const shouldAdapt = 
        interactionType === 'difficulty_feedback' ||
        interactionType === 'comprehension_issue' ||
        interactionType === 'engagement_drop' ||
        (interactionType === 'time_spent' && details && details.timeSpent < 30); // Less than 30 seconds
      
      if (!shouldAdapt) return null;
      
      // Get the content
      const contentDoc = await admin.firestore().collection('content').doc(contentId).get();
      if (!contentDoc.exists) return null;
      
      const content = contentDoc.data();
      
      // Get user data
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      if (!userDoc.exists) return null;
      
      const userData = userDoc.data();
      
      // Initialize GenKit instance
      const ai = getGenkitInstance();
      
      // Create prompt for real-time adaptation
      const prompt = `
Adapt this content in real-time based on the user's interaction:

Content:
${JSON.stringify(content.body)}

Content Type: ${content.contentType || 'article'}
Content Title: ${content.title || 'Untitled'}

User Profile:
${JSON.stringify(userData.profile || {})}

Interaction Type: ${interactionType}
Interaction Details: ${JSON.stringify(details || {})}

Based on this interaction, the user is experiencing:
${interactionType === 'difficulty_feedback' ? '- Difficulty with the content' : ''}
${interactionType === 'comprehension_issue' ? '- Problems understanding the content' : ''}
${interactionType === 'engagement_drop' ? '- Decreased engagement with the content' : ''}
${interactionType === 'time_spent' && details && details.timeSpent < 30 ? '- Very brief engagement with the content' : ''}

Adapt the content to address these specific issues while maintaining the core information.
Make the content more accessible, engaging, and relevant to this specific user.
`;
      
      // Generate the adapted content
      const { text } = await ai.generate(prompt, {
        systemPrompt: "You are BlinderFit AI, a fitness and nutrition expert specializing in real-time content adaptation. Adapt content to address specific user interaction issues while maintaining the core information and value.",
        temperature: 0.3,
        maxOutputTokens: 1500,
      });
      
      // Store the adapted content
      await admin.firestore().collection('adapted_content').add({
        originalContentId: contentId,
        userId,
        contentType: content.contentType || 'article',
        originalContent: content.body,
        adaptedContent: text,
        adaptationReason: `Real-time adaptation based on ${interactionType}`,
        interactionId: context.params.interactionId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return null;
    } catch (error) {
      console.error("Error adapting content in real-time:", error);
      return null;
    }
  });

