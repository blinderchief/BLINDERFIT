// Improved Genkit test script with better error handling and debugging
require('dotenv').config();
console.log("Environment setup complete");

// Import the Genkit and Google AI plugin libraries
console.log("Importing required libraries...");
try {
  const { genkit } = require('genkit');
  const { googleAI } = require('@genkit-ai/googleai');
  const { enableFirebaseTelemetry } = require('@genkit-ai/firebase');

  console.log("✅ Libraries imported successfully");
  console.log(`   - genkit type: ${typeof genkit}`);
  console.log(`   - googleAI type: ${typeof googleAI}`);

  // Enable Firebase telemetry for Genkit
  console.log("Enabling Firebase telemetry...");
  enableFirebaseTelemetry();
  
  // Get API key from environment variables or .env file
  const apiKey = process.env.GENKIT_API_KEY || process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.error("❌ No API key found! Please set GENKIT_API_KEY or GOOGLE_API_KEY in your .env file");
    process.exit(1);
  }
  
  console.log(`✅ API key detected (${apiKey.substring(0, 5)}...)`);
  
  // Configure a Genkit instance
  console.log("Creating Genkit client...");
  const ai = genkit({
    plugins: [googleAI({ apiKey })],
    model: 'gemini-1.5-pro' // set default model
  });
  
  console.log("✅ Genkit client created");
  
  // Run the test
  async function runTest() {
    try {
      console.log("\n🔄 Testing Genkit with Gemini...");
      console.log("   Sending prompt to Genkit API...");
      
      // Test simple generation
      const { text } = await ai.generate("What are three benefits of regular exercise?", {
        systemPrompt: "You are a helpful fitness assistant. Provide accurate and concise information.",
        temperature: 0.3,
        maxOutputTokens: 500,
      });
      
      console.log("\n✅ Response received from Genkit:");
      console.log("-----------------------------------");
      console.log(text);
      console.log("-----------------------------------");
      console.log("\n✅ Test completed successfully!");
    } catch (error) {
      console.error("\n❌ Test failed:");
      console.error(`   Error type: ${error.name}`);
      console.error(`   Message: ${error.message}`);
      console.error(`   Stack: ${error.stack}`);
      
      if (error.message.includes("API key")) {
        console.error("\n🔑 API KEY ISSUE: Your API key may be invalid or has insufficient permissions");
      }
    }
  }
  
  // Run the test
  runTest();
  
} catch (error) {
  console.error("❌ Error during library import:");
  console.error(`   Error type: ${error.name}`);
  console.error(`   Message: ${error.message}`);
  console.error(`   Stack: ${error.stack}`);
}
