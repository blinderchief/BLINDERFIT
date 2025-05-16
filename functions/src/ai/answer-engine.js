const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Check if Firebase app is initialized
try {
  admin.app();
} catch (e) {
  admin.initializeApp();
}

// Get config from Firebase environment
const perplexityApiKey = functions.config().perplexity?.apikey || process.env.PERPLEXITY_API_KEY;
const aiModel = functions.config().app?.model || process.env.AI_MODEL_VERSION || 'sonar-pro';

/**
 * Generate personalized answers to user health and fitness questions
 */
exports.answerHealthQuestion = functions.https.onCall(async (data, context) => {
  // Ensure authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const userId = context.auth.uid;
  const userQuestion = data.question;
  
  if (!userQuestion) {
    throw new functions.https.HttpsError('invalid-argument', 'Question is required');
  }
  
  try {
    // Generate cache key based on question
    const questionHash = generateCacheHash(userQuestion);
    
    // Check cache first
    const cacheDoc = await admin.firestore()
      .collection('ai_cache')
      .where('queryHash', '==', questionHash)
      .limit(1)
      .get();
    
    // If we have a cached response and it's not expired, use it
    if (!cacheDoc.empty) {
      const cachedData = cacheDoc.docs[0].data();
      const expiryDate = cachedData.expiresAt.toDate();
      
      if (expiryDate > new Date()) {
        console.log('Using cached response for query:', userQuestion);
        
        // Log user question with cached response
        await logUserQuestion(userId, userQuestion, JSON.parse(cachedData.response));
        
        return {
          answer: JSON.parse(cachedData.response),
          fromCache: true
        };
      }
    }
    
    // Get user profile and personalization data
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
    
    const personalization = personalizationDoc.exists 
      ? personalizationDoc.data() 
      : {};
    
    // Prepare context for the AI
    const userContext = prepareUserContext(userProfile, personalization);
    
    // Call Perplexity API with the user's question and context
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
            content: `You are a personalized health and fitness assistant for the BlinderFit app. 
            Give helpful, accurate, and personalized answers based on the user's profile and history.
            Always prioritize health and safety in your responses.
            
            User context:
            ${userContext}`
          },
          {
            role: "user",
            content: userQuestion
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }
    });
    
    // Process the response
    const aiResponse = response.data.choices[0].message.content;
    
    // Structure the answer for better display
    const structuredAnswer = {
      mainAnswer: extractMainAnswer(aiResponse),
      additionalInfo: extractAdditionalInfo(aiResponse),
      personalizedTips: extractPersonalizedTips(aiResponse)
    };
    
    // Cache the response
    await admin.firestore()
      .collection('ai_cache')
      .add({
        queryHash: questionHash,
        query: userQuestion,
        response: JSON.stringify(structuredAnswer),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        )
      });
    
    // Log the question and answer
    await logUserQuestion(userId, userQuestion, structuredAnswer);
    
    return {
      answer: structuredAnswer,
      fromCache: false
    };
  } catch (error) {
    console.error('Error answering health question:', error);
    throw new functions.https.HttpsError('internal', 'Failed to answer question', error);
  }
});

/**
 * Log user question to Firestore
 */
async function logUserQuestion(userId, question, answer) {
  await admin.firestore()
    .collection('ai_queries')
    .add({
      userId: userId,
      query: question,
      response: answer,
      type: 'health_question',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
}

/**
 * Generate a hash for query caching
 */
function generateCacheHash(question) {
  // In a real implementation, use a proper hashing function
  // For demonstration, we're using a simplified approach
  return `hash_${question.toLowerCase().replace(/[^a-z0-9]/g, '')
    .slice(0, 30)}`;
}

/**
 * Prepare user context for AI
 */
function prepareUserContext(userProfile, personalization) {
  return `
  User Profile:
  - Age: ${userProfile.age || 'Unknown'}
  - Gender: ${userProfile.gender || 'Unknown'}
  - Primary health goal: ${userProfile.primaryGoal || 'General health'}
  - Activity level: ${userProfile.activityLevel || 'Moderate'}
  - Dietary preferences: ${userProfile.dietaryRestrictions?.join(', ') || 'None specified'}
  - Medical conditions: ${userProfile.medicalConditions?.join(', ') || 'None specified'}
  - Allergies: ${userProfile.allergies?.join(', ') || 'None specified'}
  
  Personalization Insights:
  - Preferred learning style: ${getPreferredLearningStyle(personalization)}
  - Adherence to plans: ${personalization.behavioralInsights?.planAdherenceRate || '80'}%
  - Motivational factors: ${personalization.behavioralInsights?.motivationalFactors?.join(', ') || 'Achievement, progress tracking'}
  - Preferred detail level: ${personalization.modelParameters?.explainabilityNeed || 5}/10
  
  Tailor your response to this user's profile and preferences. Keep explanations at their preferred detail level.
  `;
}

/**
 * Get preferred learning style from personalization data
 */
function getPreferredLearningStyle(personalization) {
  if (!personalization.learningStyle) return 'Visual';
  
  const styles = {
    visual: personalization.learningStyle.visual || 0,
    auditory: personalization.learningStyle.auditory || 0,
    reading: personalization.learningStyle.reading || 0,
    kinesthetic: personalization.learningStyle.kinesthetic || 0
  };
  
  const maxStyle = Object.keys(styles).reduce((a, b) => styles[a] > styles[b] ? a : b);
  
  return maxStyle.charAt(0).toUpperCase() + maxStyle.slice(1);
}

/**
 * Extract main answer from AI response
 */
function extractMainAnswer(aiResponse) {
  // In a real implementation, use more sophisticated parsing
  // For demonstration, we take the first paragraph
  const paragraphs = aiResponse.split('\n\n');
  return paragraphs[0].trim();
}

/**
 * Extract additional info from AI response
 */
function extractAdditionalInfo(aiResponse) {
  // Look for sections that might contain additional information
  const sections = aiResponse.split('\n\n');
  
  // Skip the first paragraph (main answer)
  if (sections.length > 1) {
    // Look for sections that don't appear to be personalized tips
    return sections
      .slice(1)
      .filter(section => 
        !section.toLowerCase().includes('tip') && 
        !section.toLowerCase().includes('recommendation')
      )
      .join('\n\n')
      .trim();
  }
  
  return '';
}

/**
 * Extract personalized tips from AI response
 */
function extractPersonalizedTips(aiResponse) {
  // Look for sections that contain tips
  if (aiResponse.toLowerCase().includes('tip') || 
      aiResponse.toLowerCase().includes('recommendation')) {
    
    const tipSectionStart = Math.max(
      aiResponse.toLowerCase().indexOf('tip'),
      aiResponse.toLowerCase().indexOf('recommendation')
    );
    
    if (tipSectionStart > 0) {
      return aiResponse.substring(tipSectionStart).trim();
    }
  }
  
  return '';
}