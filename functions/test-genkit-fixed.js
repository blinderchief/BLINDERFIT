// Simple test file for Genkit integration using version 1.9.0
const { genkit } = require('genkit');
const { googleAI } = require('@genkit-ai/googleai');
require('dotenv').config();

// Get API key from environment variables
const apiKey = process.env.GENKIT_API_KEY || process.env.GOOGLE_API_KEY;
console.log("Using API Key:", apiKey ? "API key found" : "No API key found");

// Configure Genkit client
console.log("Initializing Genkit client...");
const ai = genkit({
  plugins: [googleAI({ apiKey })],
  model: 'gemini-1.5-pro'
});

// Run a simple test
async function runTest() {
  try {
    console.log("\nSending test prompt to Genkit...");
    const { text } = await ai.generate("What are three benefits of regular exercise?");
    
    console.log("\nGenkit response:");
    console.log(text);
    console.log("\nTest completed successfully!");
  } catch (error) {
    console.error("Error using Genkit:", error);
    console.error(error.stack);
  }
}

// Run the test
runTest();
