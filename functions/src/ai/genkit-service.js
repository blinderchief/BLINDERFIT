const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@genkit-ai/googleai');
const { enableFirebaseTelemetry } = require('@genkit-ai/firebase');

// Check if Firebase app is initialized
try {
  admin.app();
} catch (e) {
  admin.initializeApp();
}

// Enable Firebase telemetry for Genkit
enableFirebaseTelemetry();

// Initialize GenKit with Google AI
const getGenkitClient = () => {
  const apiKey = functions.config().genkit?.apikey || process.env.GENKIT_API_KEY;
  if (!apiKey) {
    console.error("No GenKit API key found in environment");
  }
  return new GoogleGenerativeAI(apiKey);
};

// Get config
const getConfig = () => {
  try {
    return {
      projectId: functions.config().app?.projectid || process.env.PROJECT_ID || 'blinderfit',
      model: functions.config().genkit?.model || process.env.GENKIT_MODEL || 'gemini-1.5-pro'
    };
  } catch (e) {
    return {
      projectId: process.env.PROJECT_ID || 'blinderfit',
      model: process.env.GENKIT_MODEL || 'gemini-1.5-pro'
    };
  }
};

// Helper to get user data for personalization
async function getUserData(userId) {
  if (!userId) return null;
  
  try {
    // Get user profile
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) return null;
    
    // Get assessment data if available
    const assessmentDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('assessmentData')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    const assessmentData = !assessmentDoc.empty ? assessmentDoc.docs[0].data() : null;
    
    // Get progress data
    const progressSnapshot = await admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('progress')
      .orderBy('date', 'desc')
      .limit(10)
      .get();
    
    const progressData = [];
    progressSnapshot.forEach(doc => {
      progressData.push(doc.data());
    });
    
    return {
      profile: userDoc.data(),
      assessmentData,
      progressData
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

module.exports = { getGenkitClient, getConfig, getUserData };




