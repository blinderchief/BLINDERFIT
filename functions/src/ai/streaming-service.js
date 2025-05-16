const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { getGenkitInstance } = require('./genkit-modern-service');
const { sendUpdateToUser } = require('../utils/websocket-service');

// Check if Firebase app is initialized
try {
  admin.app();
} catch (e) {
  admin.initializeApp();
}

/**
 * Stream AI responses to the client
 */
exports.streamAIResponse = functions.https.onCall(async (data, context) => {
  // Ensure authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required for streaming responses'
    );
  }
  
  const userId = context.auth.uid;
  const { question, chatHistory = [] } = data;
  
  // Validate question
  if (!question) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Question is required'
    );
  }
  
  try {
    // Create a document to track the streaming response
    const streamRef = await admin.firestore().collection('ai_streams').add({
      userId,
      question,
      status: 'starting',
      partialResponse: '',
      complete: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Return the stream ID immediately
    const streamId = streamRef.id;
    
    // Start the streaming process in the background
    processStreamInBackground(streamId, userId, question, chatHistory);
    
    return { streamId };
  } catch (error) {
    console.error('Error starting AI stream:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to start streaming response'
    );
  }
});

/**
 * Process the streaming response in the background
 */
async function processStreamInBackground(streamId, userId, question, chatHistory) {
  try {
    // Update stream status
    await admin.firestore().collection('ai_streams').doc(streamId).update({
      status: 'processing'
    });
    
    // Initialize GenKit instance
    const ai = getGenkitInstance();
    
    // Format chat history
    let formattedChatHistory = '';
    if (chatHistory && chatHistory.length > 0) {
      formattedChatHistory = chatHistory.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n\n');
    }
    
    // Create the prompt
    const prompt = `
Question: ${question}
${formattedChatHistory ? `\nChat History:\n${formattedChatHistory}` : ''}

Provide a detailed and accurate answer to this question.
Format your response in three sections:
1. MAIN ANSWER: A direct, comprehensive answer to the question
2. ADDITIONAL INFO: Relevant scientific or contextual information
3. PERSONALIZED TIPS: Actionable advice based on the question topic
`;
    
    // Generate streaming response
    const stream = await ai.generateStream(prompt, {
      systemPrompt: "You are BlinderFit AI, a fitness and nutrition expert. You provide accurate, personalized, and science-based answers to health and fitness questions.",
      temperature: 0.3,
      maxOutputTokens: 1000,
    });
    
    let fullResponse = '';
    let lastUpdateTime = Date.now();
    const updateInterval = 500; // Update every 500ms
    
    // Process the stream
    for await (const chunk of stream) {
      fullResponse += chunk.text;
      
      // Update the client and database periodically to avoid too many writes
      const currentTime = Date.now();
      if (currentTime - lastUpdateTime > updateInterval) {
        // Update Firestore
        await admin.firestore().collection('ai_streams').doc(streamId).update({
          partialResponse: fullResponse,
          status: 'streaming'
        });
        
        // Send update to connected client
        sendUpdateToUser(userId, {
          type: 'stream_update',
          streamId,
          partialResponse: fullResponse
        });
        
        lastUpdateTime = currentTime;
      }
    }
    
    // Parse the structured response
    const mainAnswerMatch = fullResponse.match(/MAIN ANSWER:?([\s\S]*?)(?=ADDITIONAL INFO|$)/i);
    const additionalInfoMatch = fullResponse.match(/ADDITIONAL INFO:?([\s\S]*?)(?=PERSONALIZED TIPS|$)/i);
    const tipsMatch = fullResponse.match(/PERSONALIZED TIPS:?([\s\S]*?)$/i);
    
    const structuredAnswer = {
      mainAnswer: mainAnswerMatch ? mainAnswerMatch[1].trim() : fullResponse,
      additionalInfo: additionalInfoMatch ? additionalInfoMatch[1].trim() : "",
      personalizedTips: tipsMatch ? tipsMatch[1].trim() : ""
    };
    
    // Update with complete response
    await admin.firestore().collection('ai_streams').doc(streamId).update({
      partialResponse: fullResponse,
      structuredResponse: structuredAnswer,
      status: 'complete',
      complete: true,
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Send final update to connected client
    sendUpdateToUser(userId, {
      type: 'stream_complete',
      streamId,
      response: structuredAnswer
    });
    
    // Log the completed interaction
    await admin.firestore().collection('ai_queries').add({
      userId,
      question,
      chatHistoryLength: chatHistory.length,
      response: {
        answer: structuredAnswer,
        fromCache: false,
        timestamp: new Date().toISOString(),
        personalized: false
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
  } catch (error) {
    console.error('Error processing AI stream:', error);
    
    // Update stream with error
    await admin.firestore().collection('ai_streams').doc(streamId).update({
      status: 'error',
      error: error.message,
      complete: true,
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Notify client of error
    sendUpdateToUser(userId, {
      type: 'stream_error',
      streamId,
      error: 'Failed to generate streaming response'
    });
  }
}