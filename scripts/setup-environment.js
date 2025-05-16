/**
 * BlinderFit Environment Setup Script
 * Run with: node scripts/setup-environment.js
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  projectId: 'blinderfit',
  aiModel: 'sonar-pro',
  perplexityApiKey: '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',
  googleApiKey: 'AIzaSyAmQuXdNIb1SZvt-zhPf9VMbC6FtMCk0JE'
};

// Ensure .env file exists in functions directory
const functionsEnvPath = path.join(__dirname, '../functions/.env');
const envContent = `
PERPLEXITY_API_KEY=${config.perplexityApiKey}
GOOGLE_API_KEY=${config.googleApiKey}
GENKIT_API_KEY=${config.googleApiKey}
AI_MODEL_VERSION=${config.aiModel}
FIREBASE_PROJECT_ID=${config.projectId}
`;

// Create functions directory if it doesn't exist
const functionsDir = path.join(__dirname, '../functions');
if (!fs.existsSync(functionsDir)) {
  fs.mkdirSync(functionsDir, { recursive: true });
}

// Write .env file
fs.writeFileSync(functionsEnvPath, envContent.trim());
console.log(`✅ Created .env file in functions directory`);

// Add .env to .gitignore if not already there
const gitignorePath = path.join(__dirname, '../.gitignore');
let gitignoreContent = '';

if (fs.existsSync(gitignorePath)) {
  gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
}

if (!gitignoreContent.includes('.env')) {
  gitignoreContent += '\n# Environment variables\n.env\nfunctions/.env\n';
  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log(`✅ Updated .gitignore to exclude .env files`);
}

// Set up Firebase environment variables
console.log(`Setting up Firebase environment variables...`);

try {
  execSync(`firebase use ${config.projectId}`);
  execSync(`firebase functions:config:set perplexity.apikey="${config.perplexityApiKey}"`);
  execSync(`firebase functions:config:set genkit.apikey="${config.googleApiKey}"`);
  execSync(`firebase functions:config:set app.model="${config.aiModel}"`);
  execSync(`firebase functions:config:set app.projectid="${config.projectId}"`);
  console.log(`✅ Firebase environment variables set successfully`);
} catch (error) {
  console.error(`❌ Error setting Firebase environment variables: ${error.message}`);
  console.log('Make sure you are logged into Firebase CLI and have proper permissions.');
}

console.log(`\n✨ Environment setup complete!`);
console.log(`Next steps:`);
console.log(`1. Install dependencies: cd functions && npm install`);
console.log(`2. Deploy functions: firebase deploy --only functions`);