// Import the Genkit and Google AI plugin libraries
const { genkit } = require('genkit');
const { googleAI } = require('@genkit-ai/googleai');
const { enableFirebaseTelemetry } = require('@genkit-ai/firebase');

// Import centralized Firebase initialization
require('./src/utils/firebase-init');

// Load environment variables
require('dotenv').config();

// Enable Firebase telemetry for Genkit
enableFirebaseTelemetry();

// Get API key from environment variables or .env file
const apiKey = process.env.GENKIT_API_KEY || process.env.GOOGLE_API_KEY;

// Configure a Genkit instance
const ai = genkit({
  plugins: [googleAI({ apiKey })],
  model: 'gemini-1.5-pro', // set default model
});

// Run the test
async function runTest() {
  try {
    console.log("Testing Genkit with Gemini...");
    
    // Test simple generation
    const { text } = await ai.generate("What are three benefits of regular exercise?", {
      systemPrompt: "You are a helpful fitness assistant. Provide accurate and concise information.",
      temperature: 0.3,
      maxOutputTokens: 500,
    });
    
    console.log("\nGenkit response:");
    console.log(text);
    console.log("\nTest completed successfully!");
  } catch (error) {
    console.error("Test failed:", error);
    console.error(error.stack);
  }
}

// Run the test
runTest();