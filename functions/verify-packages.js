// Script to verify Genkit package versions and exports
require('dotenv').config();
console.log("Verifying Genkit packages...\n");

try {
  // Check the genkit package
  const genkitPackage = require('genkit/package.json');
  console.log(`Genkit version: ${genkitPackage.version}`);
  
  // Check the googleai package
  const googleaiPackage = require('@genkit-ai/googleai/package.json');
  console.log(`@genkit-ai/googleai version: ${googleaiPackage.version}`);
  
  // Check the firebase package
  const firebasePackage = require('@genkit-ai/firebase/package.json');
  console.log(`@genkit-ai/firebase version: ${firebasePackage.version}`);

  console.log("\nChecking exported modules:");
  
  // Inspect genkit exports
  const genkit = require('genkit');
  console.log("\nGenkit exports:");
  if (typeof genkit === 'function') {
    console.log("- genkit is exported as a function (correct)");
  } else if (genkit.genkit && typeof genkit.genkit === 'function') {
    console.log("- genkit.genkit is exported as a function (use { genkit } in import)");
  } else {
    console.log("- Unexpected genkit export type:", typeof genkit);
    console.log("- Available properties:", Object.keys(genkit));
  }
  
  // Inspect googleai exports
  const googleai = require('@genkit-ai/googleai');
  console.log("\n@genkit-ai/googleai exports:");
  if (typeof googleai.GoogleGenerativeAI === 'function') {
    console.log("- GoogleGenerativeAI is exported as a function (use { GoogleGenerativeAI })");
  } 
  if (typeof googleai.googleAI === 'function') {
    console.log("- googleAI is exported as a function (use { googleAI })");
  }
  console.log("- Available properties:", Object.keys(googleai));
  
  console.log("\n✅ Verification complete");
} catch (error) {
  console.error("\n❌ Error during verification:");
  console.error(`   Error type: ${error.name}`);
  console.error(`   Message: ${error.message}`);
}
