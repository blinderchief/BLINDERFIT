/**
 * Express-based HTTP API for all Blinderfit AI functionality
 */
const express = require('express');
const cors = require('cors');
const corsOptions = require('./cors-config');
const functions = require('firebase-functions/v2');
const { admin } = require('./firebase-init');
const { genkit } = require('genkit');
const googleai = require('@genkit-ai/googleai');
const googleAI = googleai.googleAI || googleai.GoogleGenerativeAI;

// Import AI services
const fitmentorModern = require('../ai/fitmentor-modern');
const fitnessPlanGenerator = require('../ai/fitness-plan-generator');

// Create Express app
const app = express();

// Configure middleware
app.use(cors(corsOptions));
app.use(express.json());

// Authentication middleware
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Initialize Genkit client
const initializeGenkit = () => {
  const apiKey = process.env.GENKIT_API_KEY || process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    throw new Error('Missing API key for Genkit');
  }
  
  return genkit({
    plugins: [googleAI({ apiKey })],
    model: 'gemini-1.5-pro'
  });
};

const genkitClient = initializeGenkit();

// Health check endpoint - no authentication required
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// AI Chat endpoint - requires authentication
app.post('/ask', authenticate, async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Missing question in request body' });
    }
    
    // Use Genkit to generate a response
    const { text } = await genkitClient.generate(question, {
      systemPrompt: "You are a helpful fitness assistant. Provide accurate and concise information.",
      temperature: 0.3,
      maxOutputTokens: 500,
    });
    
    res.status(200).json({
      answer: text,
      timestamp: new Date().toISOString(),
      userId: req.user.uid
    });
  } catch (error) {
    console.error('Error processing AI request:', error);
    res.status(500).json({ error: `Failed to process request: ${error.message}` });
  }
});

// Fitness plan generation - requires authentication
app.post('/generate-plan', authenticate, async (req, res) => {
  try {
    const { userProfile } = req.body;
    
    if (!userProfile) {
      return res.status(400).json({ error: 'Missing user profile in request body' });
    }
    
    const plan = await fitnessPlanGenerator.generatePersonalizedPlan(userProfile);
    res.status(200).json(plan);
  } catch (error) {
    console.error('Error generating fitness plan:', error);
    res.status(500).json({ error: `Failed to generate plan: ${error.message}` });
  }
});

// Export the Express app as a Firebase Function
module.exports = app;
