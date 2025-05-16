const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { getGenkitInstance, getConfig, getUserData } = require('./genkit-modern-service');
const { getUserPersonalizationData, logAIInteraction, personalizeResponse } = require('./realtime-personalization');

// Check if Firebase app is initialized
try {
  admin.app();
} catch (e) {
  admin.initializeApp();
}

// System prompt for FitMentor
const FITMENTOR_SYSTEM_PROMPT = `You are BlinderFit AI, a fitness and nutrition expert. 
Answer user questions PRECISELY and DIRECTLY based on what they ask.
Do NOT provide general fitness tips unrelated to their specific question.
Format your response in three sections:
1) MAIN ANSWER: Provide a clear, direct answer to the exact question asked.
2) ADDITIONAL INFO: Include relevant scientific context and information.
3) PERSONALIZED TIPS: Offer actionable advice specific to the question topic.`;

// Define the answer health question flow
const defineAnswerHealthQuestionFlow = (ai) => {
  return ai.defineFlow('answerHealthQuestion', async (question, userContext = '', chatHistory = '') => {
    console.log(`Processing question: "${question}" with user context length: ${userContext.length} and chat history length: ${chatHistory.length}`);
    
    // Create a more direct prompt that ensures the response is relevant to the question
    // and incorporates chat history for context
    const prompt = `
Question: ${question}
${userContext ? `\nUser context: ${userContext}` : ''}
${chatHistory ? `\nChat history: ${chatHistory}` : ''}

Please provide a detailed, accurate, and DIRECT answer to this SPECIFIC question.
Your answer must be tailored specifically to what was asked.
If chat history is provided, use it to provide context-aware responses that build on previous interactions.

Format your response in three sections:
1. MAIN ANSWER: A direct, comprehensive answer to the question
2. ADDITIONAL INFO: Relevant scientific or contextual information
3. PERSONALIZED TIPS: Actionable advice based on the user's profile and history
`;

    // Generate the response
    const { text } = await ai.generate(prompt, {
      systemPrompt: "You are BlinderFit AI, a fitness and nutrition expert. You provide accurate, personalized, and science-based answers to health and fitness questions. Always be direct and specific in your responses.",
      temperature: 0.3,
      maxOutputTokens: 1000,
    });

    // Parse the structured response
    const mainAnswerMatch = text.match(/MAIN ANSWER:?([\s\S]*?)(?=ADDITIONAL INFO|$)/i);
    const additionalInfoMatch = text.match(/ADDITIONAL INFO:?([\s\S]*?)(?=PERSONALIZED TIPS|$)/i);
    const tipsMatch = text.match(/PERSONALIZED TIPS:?([\s\S]*?)$/i);

    return {
      mainAnswer: mainAnswerMatch ? mainAnswerMatch[1].trim() : text,
      additionalInfo: additionalInfoMatch ? additionalInfoMatch[1].trim() : "",
      personalizedTips: tipsMatch ? tipsMatch[1].trim() : ""
    };
  });
};

// Define the real-time insights flow
const defineRealTimeInsightsFlow = (ai) => {
  return ai.defineFlow('realTimeInsights', async (topic, userContext = '') => {
    // Create the prompt
    const prompt = `
Provide the latest insights on: ${topic}
${userContext ? `\nUser context: ${userContext}` : ''}
    `;
    
    const { text: aiContent } = await ai.generate(prompt, {
      systemPrompt: FITMENTOR_SYSTEM_PROMPT,
      temperature: 0.2,
      maxOutputTokens: 1000,
    });
    
    // Parse the structured response
    const mainAnswerMatch = aiContent.match(/MAIN ANSWER:?([\s\S]*?)(?=ADDITIONAL INFO|$)/i);
    const additionalInfoMatch = aiContent.match(/ADDITIONAL INFO:?([\s\S]*?)(?=PERSONALIZED TIPS|$)/i);
    const tipsMatch = aiContent.match(/PERSONALIZED TIPS:?([\s\S]*?)$/i);
    
    // Structure the response
    return {
      mainAnswer: mainAnswerMatch ? mainAnswerMatch[1].trim() : aiContent,
      additionalInfo: additionalInfoMatch ? additionalInfoMatch[1].trim() : "",
      personalizedTips: tipsMatch ? tipsMatch[1].trim() : ""
    };
  });
};

// Helper to detect the type of the question for better tracking
function detectQuestionType(question) {
  const lowerQuestion = question.toLowerCase();
  
  // Define categories and their keywords
  const categories = {
    nutrition: ['food', 'diet', 'eat', 'meal', 'protein', 'carb', 'fat', 'calorie', 'nutrition', 'vitamin', 'mineral', 'supplement'],
    workout: ['exercise', 'workout', 'training', 'cardio', 'strength', 'weight', 'lift', 'muscle', 'gym', 'fitness', 'routine'],
    recovery: ['recovery', 'rest', 'sleep', 'injury', 'pain', 'sore', 'stretch', 'flexibility', 'mobility'],
    goals: ['goal', 'weight loss', 'muscle gain', 'build muscle', 'lose weight', 'tone', 'endurance', 'performance'],
    health: ['health', 'medical', 'condition', 'disease', 'symptom', 'diagnosis', 'doctor', 'medication']
  };
  
  // Check each category
  const matchedCategories = [];
  for (const [category, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      if (lowerQuestion.includes(keyword)) {
        matchedCategories.push(category);
        break;
      }
    }
  }
  
  // Return the matched categories or 'general' if none matched
  return matchedCategories.length > 0 ? matchedCategories : ['general'];
}

/**
 * Answer health and fitness questions with GenKit
 */
exports.answerHealthQuestion = functions.https.onCall(async (data, context) => {
  // Extract question with robust extraction
  let question = '';
  let chatHistory = [];
  
  if (typeof data === 'string') {
    question = data;
  } else if (data && typeof data === 'object') {
    if (data.question) {
      question = data.question;
    } else if (data.data && data.data.question) {
      question = data.data.question;
    }
    
    // Extract chat history if available
    if (data.chatHistory && Array.isArray(data.chatHistory)) {
      chatHistory = data.chatHistory;
    } else if (data.data && data.data.chatHistory && Array.isArray(data.data.chatHistory)) {
      chatHistory = data.data.chatHistory;
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
  
  console.log(`Processing question request: "${question}" with ${chatHistory.length} history messages`);
  
  try {
    // Get user data for personalization if authenticated
    let userData = null;
    let userContext = '';
    let userId = null;
    
    if (context.auth) {
      userId = context.auth.uid;
      console.log(`Authenticated user: ${userId}`);
      userData = await getUserData(userId);
      
      if (userData) {
        userContext = `User Profile: ${JSON.stringify(userData.profile || {})}
        Assessment Data: ${JSON.stringify(userData.assessmentData || {})}
        Recent Progress: ${JSON.stringify(userData.progressData || [])}`;
        
        console.log(`Retrieved personalization data for user ${userId}`);
      }
      
      // Get additional user query history for better personalization
      if (chatHistory.length < 5) {
        const userQueriesSnapshot = await admin.firestore()
          .collection('user_queries')
          .where('userId', '==', userId)
          .orderBy('timestamp', 'desc')
          .limit(10)
          .get();
        
        if (!userQueriesSnapshot.empty) {
          const additionalHistory = [];
          
          userQueriesSnapshot.forEach(doc => {
            const queryData = doc.data();
            
            // Only add queries that aren't already in the chat history
            const queryContent = queryData.query;
            const isAlreadyInHistory = chatHistory.some(msg => 
              msg.role === 'user' && msg.content === queryContent
            );
            
            if (!isAlreadyInHistory) {
              additionalHistory.push({
                role: 'user',
                content: queryContent
              });
              
              // If there's a response stored, add that too
              if (queryData.response) {
                additionalHistory.push({
                  role: 'assistant',
                  content: typeof queryData.response === 'string' 
                    ? queryData.response 
                    : JSON.stringify(queryData.response)
                });
              }
            }
          });
          
          // Add the additional history to the context
          if (additionalHistory.length > 0) {
            console.log(`Adding ${additionalHistory.length} additional history items from user query history`);
            userContext += `\n\nPrevious Relevant Interactions:\n${JSON.stringify(additionalHistory)}`;
          }
        }
      }
    }
    
    // Initialize GenKit instance
    const ai = getGenkitInstance();
    const answerHealthQuestionFlow = defineAnswerHealthQuestionFlow(ai);
    
    // Prepare the chat history in a format suitable for the AI
    let formattedChatHistory = '';
    if (chatHistory && chatHistory.length > 0) {
      formattedChatHistory = chatHistory.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n\n');
      
      console.log(`Formatted chat history with ${chatHistory.length} messages`);
    }
    
    // Execute the flow with direct question passing and chat history
    console.log("Calling GenKit API...");
    const answer = await answerHealthQuestionFlow(
      question, 
      userContext,
      formattedChatHistory
    );
    console.log("Received response from GenKit API");
    
    // Personalize the response if user data is available
    let personalizedAnswer = answer;
    if (userData) {
      // Apply real-time personalization to each section
      personalizedAnswer = {
        mainAnswer: await personalizeResponse(answer.mainAnswer, userData),
        additionalInfo: answer.additionalInfo,
        personalizedTips: await personalizeResponse(answer.personalizedTips, userData)
      };
      
      // Log the interaction for continuous improvement
      if (userId) {
        await logAIInteraction(userId, {
          prompt: question,
          responseType: 'health_question',
          metadata: { 
            questionType: detectQuestionType(question),
            hadChatHistory: chatHistory.length > 0
          }
        });
      }
    }
    
    // Structure the response
    const structuredResponse = {
      answer: personalizedAnswer,
      fromCache: false,
      timestamp: new Date().toISOString(),
      personalized: !!userData,
      questionAsked: question, // Include the original question for verification
      usedChatHistory: chatHistory.length > 0 // Indicate if chat history was used
    };
    
    // Log the interaction if user is authenticated
    if (context.auth) {
      await admin.firestore().collection('ai_queries').add({
        userId: context.auth.uid,
        question,
        chatHistoryLength: chatHistory.length,
        response: structuredResponse,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    return structuredResponse;
  } catch (error) {
    console.error("Error calling AI API:", error);
    
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
 * Get real-time fitness insights
 */
exports.getRealTimeFitnessInsights = functions.https.onCall(async (data, context) => {
  const topic = data.topic || 'fitness trends';
  const userId = context.auth?.uid;
  
  try {
    // Initialize GenKit instance
    const ai = getGenkitInstance();
    const getRealTimeInsightsFlow = defineRealTimeInsightsFlow(ai);
    
    // Get user data if authenticated
    let userContext = '';
    if (userId) {
      const userData = await getUserData(userId);
      if (userData) {
        userContext = `User Profile: ${JSON.stringify(userData.profile || {})}`;
      }
    }
    
    // Execute the flow
    const insights = await getRealTimeInsightsFlow(topic, userContext);
    
    return {
      insights,
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

/**
 * Get personalized insights for real-time user experience
 * Uses AI to generate insights based on user data, trends, and activities
 */
exports.getPersonalizedInsights = async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated', 
      'Authentication required'
    );
  }
  
  const userId = context.auth.uid;
  const { topic, insightType } = data || {};
  
  try {
    // Get comprehensive user data
    const userData = await getUserPersonalizationData(userId);
    
    if (!userData) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'User data not found. Please complete your profile.'
      );
    }
    
    // Initialize Genkit instance
    const ai = getGenkitInstance();
    
    // Prepare context for the AI
    let insightContext = '';
    
    // Add relevant context based on the insight type
    switch (insightType) {
      case 'workout_progress':
        insightContext = prepareWorkoutContext(userData);
        break;
      case 'nutrition_analysis':
        insightContext = prepareNutritionContext(userData);
        break;
      case 'goal_tracking':
        insightContext = prepareGoalTrackingContext(userData);
        break;
      case 'health_trends':
        insightContext = prepareHealthTrendsContext(userData);
        break;
      default:
        // Default context with general user data
        insightContext = `
User Profile: ${JSON.stringify(userData.profile || {})}
Health Data: ${JSON.stringify(userData.healthData || {})}
Recent Activities: ${JSON.stringify(userData.activities?.slice(0, 5) || [])}
Active Goals: ${JSON.stringify(userData.goals || [])}
        `;
    }
    
    // Create the prompt for real-time insights
    const prompt = `
Generate personalized insights about: ${topic || 'fitness progress'}
User context: ${insightContext}

Provide insights that are:
1. Data-driven, based on the user's actual metrics and activities
2. Actionable, with specific recommendations
3. Motivational, acknowledging progress and encouraging improvement
4. Backed by scientific evidence where relevant
    `;
    
    // Generate insights using Genkit
    const { text: rawInsights } = await ai.generate(prompt, {
      systemPrompt: FITMENTOR_SYSTEM_PROMPT,
      temperature: 0.3,
      maxOutputTokens: 1000,
    });
    
    // Parse structured insights
    const mainInsightMatch = rawInsights.match(/MAIN ANSWER:?([\s\S]*?)(?=ADDITIONAL INFO|$)/i);
    const additionalInfoMatch = rawInsights.match(/ADDITIONAL INFO:?([\s\S]*?)(?=PERSONALIZED TIPS|$)/i);
    const tipsMatch = rawInsights.match(/PERSONALIZED TIPS:?([\s\S]*?)$/i);
    
    // Apply personalization
    const insights = {
      mainInsight: await personalizeResponse(
        mainInsightMatch ? mainInsightMatch[1].trim() : rawInsights, 
        userData
      ),
      additionalInfo: additionalInfoMatch ? additionalInfoMatch[1].trim() : "",
      actionableTips: await personalizeResponse(
        tipsMatch ? tipsMatch[1].trim() : "", 
        userData
      )
    };
    
    // Log the interaction
    await logAIInteraction(userId, {
      prompt: topic || 'fitness insights',
      responseType: `insights_${insightType || 'general'}`,
      metadata: { insightType: insightType || 'general' }
    });
    
    return {
      insights,
      generatedAt: new Date().toISOString(),
      topicArea: topic || 'fitness progress',
      insightType: insightType || 'general'
    };
    
  } catch (error) {
    console.error('Error generating personalized insights:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to generate personalized insights. Please try again later.'
    );
  }
};

// Helper functions to prepare context for different insight types
function prepareWorkoutContext(userData) {
  if (!userData || !userData.activities) return '';
  
  // Filter out workout activities
  const workouts = userData.activities.filter(a => 
    a.type === 'workout' || a.category === 'exercise'
  );
  
  // Get recent workouts
  const recentWorkouts = workouts.slice(0, 10);
  
  return `
Recent Workouts: ${JSON.stringify(recentWorkouts)}
Fitness Level: ${userData.healthData?.fitnessLevel || 'unknown'}
Fitness Goals: ${JSON.stringify(userData.goals?.filter(g => g.type === 'fitness' || g.type === 'workout') || [])}
Physical Limitations: ${userData.healthData?.limitations || 'none reported'}
  `;
}

function prepareNutritionContext(userData) {
  return `
Dietary Preferences: ${userData.profile?.dietaryPreferences || 'not specified'}
Health Data: ${JSON.stringify(userData.healthData || {})}
Nutrition Goals: ${JSON.stringify(userData.goals?.filter(g => g.type === 'diet' || g.type === 'nutrition') || [])}
Recent Meals: ${JSON.stringify(userData.activities?.filter(a => a.type === 'meal' || a.category === 'nutrition').slice(0, 10) || [])}
  `;
}

function prepareGoalTrackingContext(userData) {
  if (!userData || !userData.goals) return '';
  
  // Calculate progress for each goal if possible
  const goalsWithProgress = userData.goals.map(goal => {
    let progressPercentage = 0;
    let currentValue = null;
    
    if (goal.type === 'weight' && userData.healthData?.weight) {
      currentValue = userData.healthData.weight;
      const startWeight = goal.startValue || userData.healthData.startingWeight;
      const targetWeight = goal.targetValue;
      
      if (startWeight && targetWeight) {
        const totalChange = Math.abs(targetWeight - startWeight);
        const currentChange = Math.abs(currentValue - startWeight);
        progressPercentage = Math.min(100, Math.round((currentChange / totalChange) * 100));
      }
    }
    
    return {
      ...goal,
      currentValue,
      progressPercentage
    };
  });
  
  return `
User Goals: ${JSON.stringify(goalsWithProgress)}
Health Metrics: ${JSON.stringify(userData.healthData || {})}
Recent Activities: ${JSON.stringify(userData.activities?.slice(0, 5) || [])}
  `;
}

function prepareHealthTrendsContext(userData) {
  // Extract time-series data if available
  const weightTrend = userData.activities
    ?.filter(a => a.weight)
    .map(a => ({ date: a.timestamp, weight: a.weight }))
    .sort((a, b) => new Date(a.date) - new Date(b.date)) || [];
    
  const sleepTrend = userData.activities
    ?.filter(a => a.sleepDuration)
    .map(a => ({ date: a.timestamp, hours: a.sleepDuration }))
    .sort((a, b) => new Date(a.date) - new Date(b.date)) || [];
    
  return `
Weight Trend: ${JSON.stringify(weightTrend.slice(-14))}
Sleep Trend: ${JSON.stringify(sleepTrend.slice(-14))}
Current Health Metrics: ${JSON.stringify(userData.healthData || {})}
Health Goals: ${JSON.stringify(userData.goals?.filter(g => g.type === 'health') || [])}
Known Health Conditions: ${userData.healthData?.conditions || 'none reported'}
  `;
}


