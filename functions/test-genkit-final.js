// Final test script for Genkit integration
require('dotenv').config();

// Import the Genkit library - genkit is a function export
const genkit = require('genkit');

// Import the Google AI plugin - use the appropriate export based on the version
const googleai = require('@genkit-ai/googleai');
const googleAI = googleai.googleAI || googleai.GoogleGenerativeAI;

// Enable Firebase telemetry (optional for local testing)
try {
  const { enableFirebaseTelemetry } = require('@genkit-ai/firebase');
  enableFirebaseTelemetry();
  console.log("Firebase telemetry enabled");
} catch (err) {
  console.log("Firebase telemetry setup skipped:", err.message);
}

// Get API key from environment variables
const apiKey = process.env.GENKIT_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error("No API key found in environment variables!");
  process.exit(1);
}

console.log("API key loaded from environment variables");

// Configure Genkit client
console.log("Initializing Genkit client...");
const ai = genkit({
  plugins: [googleAI({ apiKey })],
  model: 'gemini-1.5-pro'
});

// Run a simple test
async function runTest() {
  try {
    console.log("Sending test prompt to Genkit...");
    const { text } = await ai.generate("What are three benefits of regular exercise?");
    
    console.log("\nGenkit response:");
    console.log("-----------------------------------");
    console.log(text);
    console.log("-----------------------------------");
    console.log("\nTest completed successfully!");
  } catch (error) {
    console.error("Error using Genkit:", error);
  }
}

// Run the test
runTest();
