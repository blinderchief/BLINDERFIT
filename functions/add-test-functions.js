// add-test-functions.js
// This script adds the necessary test functions to the Firebase Functions

// First, read the index.js file
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.js');
const backupPath = path.join(__dirname, 'index.js.backup');

// Create a backup of the original file
if (!fs.existsSync(backupPath)) {
  console.log('Creating backup of index.js...');
  fs.copyFileSync(indexPath, backupPath);
}

// Read the current index.js content
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Function to check if a function already exists
function functionExists(content, funcName) {
  const regex = new RegExp(`exports\\.${funcName}\\s*=\\s*on(Call|Request)`, 'g');
  return regex.test(content);
}

// Add the test functions if they don't exist
const functionsToAdd = [];

if (!functionExists(indexContent, 'helloWorld')) {
  functionsToAdd.push(`
// Simple test function using v2 syntax
exports.helloWorld = onRequest((request, response) => {
  response.send({
    message: "Hello from Firebase Functions v2!",
    timestamp: new Date().toISOString(),
    success: true
  });
});`);
}

if (!functionExists(indexContent, 'testPing')) {
  functionsToAdd.push(`
// Test ping function to verify API connectivity
exports.testPing = onCall((data) => {
  return {
    status: "ok",
    message: "Firebase Functions are operational",
    timestamp: new Date().toISOString(),
    received: data || {}
  };
});`);
}

if (!functionExists(indexContent, 'testAIResponse')) {
  functionsToAdd.push(`
// Test AI function
exports.testAIResponse = onCall(async (data) => {
  try {
    const question = data?.question || "What are the benefits of regular exercise?";
    
    // Use Genkit to generate a response with the new API syntax
    const { text } = await genkitClient.generate(question, {
      systemPrompt: "You are a helpful fitness assistant. Provide accurate and concise information.",
      temperature: 0.3,
      maxOutputTokens: 500,
    });
    
    return {
      text: text,
      question: question,
      status: "success"
    };
  } catch (error) {
    console.error("Error in testAIResponse:", error);
    return {
      error: error.message,
      status: "error"
    };
  }
});`);
}

// If we have functions to add
if (functionsToAdd.length > 0) {
  console.log(`Adding ${functionsToAdd.length} test functions to index.js...`);
  
  // Find a good position to insert the functions
  // Ideally after other exports, before the end of the file
  const lastExportMatch = indexContent.match(/exports\.\w+\s*=\s*on(Call|Request)[^;]*;/g);
  
  if (lastExportMatch) {
    // Find the position of the last export
    const lastExport = lastExportMatch[lastExportMatch.length - 1];
    const lastExportPos = indexContent.lastIndexOf(lastExport) + lastExport.length;
    
    // Insert the new functions after the last export
    indexContent = 
      indexContent.substring(0, lastExportPos) + 
      '\n' + 
      functionsToAdd.join('\n') + 
      '\n' + 
      indexContent.substring(lastExportPos);
  } else {
    // If no exports found, add at the end of the file
    indexContent += '\n' + functionsToAdd.join('\n') + '\n';
  }
  
  // Write the updated content back to the file
  fs.writeFileSync(indexPath, indexContent);
  console.log('Successfully added test functions to index.js');
  
} else {
  console.log('All test functions already exist in index.js');
}

console.log('\nDone!');
