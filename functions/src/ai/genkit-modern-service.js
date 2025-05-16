const functions = require('firebase-functions');
const { genkit } = require('genkit');
const { gemini15Pro, googleAI } = require('@genkit-ai/googleai');
const { enableFirebaseTelemetry } = require('@genkit-ai/firebase');
const admin = require('firebase-admin');

// Check if Firebase app is initialized
try {
  admin.app();
} catch (e) {
  admin.initializeApp();
}

// Enable Firebase telemetry for Genkit
enableFirebaseTelemetry();

// Configure Genkit with Google AI plugin
const getGenkitInstance = () => {
  const apiKey = functions.config().genkit?.apikey || process.env.GENKIT_API_KEY;
  
  if (!apiKey) {
    console.error("No GenKit API key found in environment");
    throw new Error("Missing GenKit API key");
  }
  
  return genkit({
    plugins: [googleAI({ apiKey })],
    model: gemini15Pro, // Default model
  });
};

// Get configuration
const getConfig = () => {
  return {
    model: functions.config().app?.model || process.env.AI_MODEL_VERSION || 'gemini-1.5-pro',
    projectId: functions.config().app?.projectid || process.env.BLINDERFIT_PROJECT_ID || 'blinderfit'
  };
};

// Get user data from Firestore
const getUserData = async (userId) => {
  if (!userId) return null;
  
  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.log(`No user data found for user ID: ${userId}`);
      return null;
    }
    
    return userDoc.data();
  } catch (error) {
    console.error(`Error fetching user data for ${userId}:`, error);
    return null;
  }
};

module.exports = {
  getGenkitInstance,
  getConfig,
  getUserData
};
