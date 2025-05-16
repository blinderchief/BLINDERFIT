/**
 * Import function triggers from their respective submodules
 */
// Load environment variables from .env file
require('dotenv').config();

const {onRequest, onCall} = require("firebase-functions/v2/https");
const { genkit } = require('genkit');
const googleai = require('@genkit-ai/googleai');
const googleAI = googleai.googleAI || googleai.GoogleGenerativeAI;
const {enableFirebaseTelemetry} = require('@genkit-ai/firebase');
const cors = require('cors');
const corsOptions = require('./src/utils/cors-config');

// Import centralized Firebase initialization
// This ensures Firebase is properly initialized before any other imports
const { admin } = require('./src/utils/firebase-init');

// Enable Firebase telemetry for Genkit
enableFirebaseTelemetry();

// Import our AI service modules - after Firebase is initialized
const fitmentorModern = require('./src/ai/fitmentor-modern');
const fitnessPlanGenerator = require('./src/ai/fitness-plan-generator');

// Get API key from environment variables or .env file
const apiKey = process.env.GENKIT_API_KEY || process.env.GOOGLE_API_KEY;

// Initialize Genkit client with the appropriate API depending on what's available
const genkitClient = genkit({
  plugins: [googleAI({ apiKey })],
  model: 'gemini-1.5-pro'
});

// Simple test function using v2 syntax
exports.helloWorld = onRequest((request, response) => {
  response.send("Hello from Firebase Functions v2!");
});

// Test Genkit function
exports.askAI = onCall(async (data) => {
  try {
    const question = data.question || "What are the benefits of regular exercise?";
    
    // Use Genkit to generate a response with the new API syntax
    const { text } = await genkitClient.generate(question, {
      systemPrompt: "You are a helpful fitness assistant. Provide accurate and concise information.",
      temperature: 0.3,
      maxOutputTokens: 500,
    });
    
    return {
      answer: text,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error using Genkit:", error);
    throw new Error(`Failed to process your request: ${error.message}`);
  }
});

// Test function to verify AI responses are relevant to questions
exports.testAIResponse = onCall(async (data) => {
  try {
    const question = data.question || "What are the benefits of regular exercise?";
    console.log(`Testing AI with question: "${question}"`);
    
    // Use Genkit to generate a response with the new API syntax
    const { text } = await genkitClient.generate(question, {
      systemPrompt: "You are a helpful fitness assistant. Provide accurate and direct answers to the specific question asked. Do not provide generic pre-written responses.",
      temperature: 0.3,
      maxOutputTokens: 500,
    });
    
    console.log(`AI response: "${text.substring(0, 100)}..."`);
    
    return {
      question: question,
      answer: text,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error testing AI:", error);
    throw new Error(`Failed to process your request: ${error.message}`);
  }
});

// For backward compatibility, keep the testPing function
exports.testPing = onRequest((request, response) => {
  response.status(200).send({
    message: "Test function is working with Node.js v20!",
    timestamp: new Date().toISOString(),
    nodeVersion: process.version
  });
});

// Export the modern AI functions
exports.answerHealthQuestion = fitmentorModern.answerHealthQuestion;
exports.generatePersonalizedPlan = fitnessPlanGenerator.generatePersonalizedPlan;
exports.updateFitnessPlan = fitnessPlanGenerator.updateFitnessPlan;

// Export the Express API app for production use
const expressApp = require('./src/utils/api-server');
exports.app = onRequest({ 
  cors: true, 
  timeoutSeconds: 300,
  minInstances: 0,
  maxInstances: 10
}, expressApp);

// New production-ready function with comprehensive AI personalization
exports.getPersonalizedInsights = onCall(async (data, context) => {
  if (!context.npm run devauth) {
    throw new Error('Authentication required');
  }
  
  try {
    // Call our AI service for personalized insights
    const insights = await fitmentorModern.getPersonalizedInsights(data, context);
    
    // Structure the response with telemetry data for Firebase monitoring
    return {
      insights,
      telemetry: {
        responseTime: Date.now(),
        version: '1.0.0',
        functionName: 'getPersonalizedInsights'
      }
    };
  } catch (error) {
    console.error("Error in getPersonalizedInsights:", error);
    throw new Error(`Failed to get personalized insights: ${error.message}`);
  }
});

