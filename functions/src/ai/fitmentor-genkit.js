const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { getGenkitClient, getConfig, getUserData } = require('./genkit-service');
const { enableFirebaseTelemetry } = require('@genkit-ai/firebase');

// Check if Firebase app is initialized
try {
  admin.app();
} catch (e) {
  admin.initializeApp();
}

// Enable Firebase telemetry for Genkit
enableFirebaseTelemetry();

// System prompt for FitMentor
const FITMENTOR_SYSTEM_PROMPT = `You are BlinderFit AI, a fitness and nutrition expert. 
Answer user questions PRECISELY and DIRECTLY based on what they ask.
Do NOT provide general fitness tips unrelated to their specific question.
Format your response in three sections:
1) MAIN ANSWER: Provide a clear, direct answer to the exact question asked.
2) ADDITIONAL INFO: Include relevant scientific context and information.
3) PERSONALIZED TIPS: Offer actionable advice specific to the question topic.`;

/**
 * Answer health and fitness questions with GenKit
 */
exports.answerHealthQuestion = functions.https.onCall(async (data, context) => {
  // Extract question with robust extraction
  let question = '';
  
  if (typeof data === 'string') {
    question = data;
  } else if (data && typeof data === 'object') {
    if (data.question) {
      question = data.question;
    } else if (data.data && data.data.question) {
      question = data.data.question;
    }
  }
  
  // Validate
  if (!question) {
    console.error("Invalid request: missing question");
    throw new functions.https.HttpsError(
      'invalid-argument', 
      'Question is required'
    );
  }
  
  try {
    const config = getConfig();
    console.log(`Processing question: "${question}" with model: ${config.model}`);
    
    // Get user data for personalization if authenticated
    let userContext = '';
    if (context.auth) {
      const userId = context.auth.uid;
      const userData = await getUserData(userId);
      
      if (userData) {
        userContext = `User Profile: ${JSON.stringify(userData.profile || {})}
        Assessment Data: ${JSON.stringify(userData.assessmentData || {})}
        Recent Progress: ${JSON.stringify(userData.progressData || [])}`;
        
        console.log(`Retrieved personalization data for user ${userId}`);
      }
    }
    
    // Initialize GenKit client
    const genAI = getGenkitClient();
    const model = genAI.getGenerativeModel({ model: config.model });
    
    // Generate content
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'I need fitness and nutrition advice' }],
        },
        {
          role: 'model',
          parts: [{ text: 'I\'m BlinderFit AI, your fitness and nutrition expert. How can I help you today?' }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1000,
      },
    });
    
    // Send the message with user context if available
    const result = await chat.sendMessage(`
      ${userContext ? `User Context:\n${userContext}\n\n` : ''}
      Question: ${question}
      
      Please provide a detailed, accurate, and direct answer to this specific question.
    `);
    const response = await result.response;
    const aiContent = response.text();
    
    // Parse the structured response
    const mainAnswerMatch = aiContent.match(/MAIN ANSWER:?([\s\S]*?)(?=ADDITIONAL INFO|$)/i);
    const additionalInfoMatch = aiContent.match(/ADDITIONAL INFO:?([\s\S]*?)(?=PERSONALIZED TIPS|$)/i);
    const tipsMatch = aiContent.match(/PERSONALIZED TIPS:?([\s\S]*?)$/i);
    
    // Validate response format
    if (!mainAnswerMatch) {
      console.error("AI response doesn't match expected format:", aiContent);
      
      // Attempt to structure the response anyway
      return {
        answer: {
          mainAnswer: aiContent,
          additionalInfo: "Information not structured in the expected format.",
          personalizedTips: "Please ask again for more specific advice."
        },
        fromCache: false,
        timestamp: new Date().toISOString()
      };
    }
    
    // Structure the response
    const structuredResponse = {
      answer: {
        mainAnswer: mainAnswerMatch[1].trim(),
        additionalInfo: additionalInfoMatch ? additionalInfoMatch[1].trim() : "",
        personalizedTips: tipsMatch ? tipsMatch[1].trim() : ""
      },
      fromCache: false,
      timestamp: new Date().toISOString()
    };
    
    // Log the interaction if user is authenticated
    if (context.auth) {
      await admin.firestore().collection('ai_queries').add({
        userId: context.auth.uid,
        question,
        response: structuredResponse,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    return structuredResponse;
  } catch (error) {
    console.error("Error calling AI API:", error.response?.data || error.message);
    
    return {
      answer: {
        mainAnswer: `Sorry, I couldn't process your question about "${question}" right now.`,
        additionalInfo: "Our AI service encountered an error. Please try again later.",
        personalizedTips: "If the issue persists, try rephrasing your question."
      },
      error: true,
      fromCache: false,
      timestamp: new Date().toISOString()
    };
  }
});

/**
 * Generate personalized fitness plan
 */
exports.generateFitnessPlan = functions.https.onCall(async (data, context) => {
  // Ensure authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to generate a personalized plan'
    );
  }
  
  const userId = context.auth.uid;
  const planType = data.planType || 'general';
  
  try {
    // Get user data
    const userData = await getUserData(userId);
    if (!userData || !userData.profile) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'User profile not found. Please complete your profile first.'
      );
    }
    
    // Initialize GenKit client
    const genAI = getGenkitClient();
    const model = genAI.getGenerativeModel({ model: getConfig().model });
    
    // Prepare prompt for plan generation
    const planPrompt = `Create a personalized ${planType} fitness plan for this user:
    
    User Profile: ${JSON.stringify(userData.profile)}
    Assessment Data: ${JSON.stringify(userData.assessmentData || {})}
    Recent Progress: ${JSON.stringify(userData.progressData || [])}
    
    Format the plan with these sections:
    1. GOALS AND OVERVIEW
    2. WEEKLY WORKOUT SCHEDULE
    3. NUTRITION GUIDELINES
    4. PROGRESS TRACKING RECOMMENDATIONS`;
    
    // Generate the plan
    const result = await model.generateContent(planPrompt);
    const response = await result.response;
    const plan = response.text();
    
    // Store the generated plan
    await admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('plans')
      .add({
        planType,
        plan,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        aiGenerated: true
      });
    
    return {
      plan,
      planType,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error generating fitness plan:", error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to generate fitness plan'
    );
  }
});

/**
 * Get real-time fitness insights
 */
exports.getRealTimeFitnessInsights = functions.https.onCall(async (data, context) => {
  const topic = data.topic || 'fitness trends';
  const userId = context.auth?.uid;
  
  try {
    // Initialize GenKit client
    const genAI = getGenkitClient();
    const model = genAI.getGenerativeModel({ model: getConfig().model });
    
    // Get user data if authenticated
    let userContext = '';
    if (userId) {
      const userData = await getUserData(userId);
      if (userData) {
        userContext = `User Profile: ${JSON.stringify(userData.profile || {})}`;
      }
    }
    
    // Current date for real-time context
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Generate real-time insights
    const prompt = `
      ${userContext ? `User Context: ${userContext}\n\n` : ''}
      Today's date: ${currentDate}
      
      Provide the latest insights and information about "${topic}" in the fitness world.
      Include recent trends, research findings, and practical applications.
      
      Format your response in three sections:
      1) MAIN ANSWER: Provide the latest information about ${topic}.
      2) ADDITIONAL INFO: Include relevant scientific context and research.
      3) PERSONALIZED TIPS: Offer actionable advice related to ${topic}.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    // Parse the structured response
    const mainAnswerMatch = content.match(/MAIN ANSWER:?([\s\S]*?)(?=ADDITIONAL INFO|$)/i);
    const additionalInfoMatch = content.match(/ADDITIONAL INFO:?([\s\S]*?)(?=PERSONALIZED TIPS|$)/i);
    const tipsMatch = content.match(/PERSONALIZED TIPS:?([\s\S]*?)$/i);
    
    return {
      insights: {
        mainAnswer: mainAnswerMatch ? mainAnswerMatch[1].trim() : content,
        additionalInfo: additionalInfoMatch ? additionalInfoMatch[1].trim() : "",
        personalizedTips: tipsMatch ? tipsMatch[1].trim() : ""
      },
      topic,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error getting real-time insights:", error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get real-time fitness insights'
    );
  }
});






