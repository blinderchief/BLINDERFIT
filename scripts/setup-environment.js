/**
 * Blinderfit Environment Setup Script
 * Sets up environment variables and Firebase configuration
 * 
 * Usage: node scripts/setup-environment.js
 * 
 * Required environment variables:
 *   PERPLEXITY_API_KEY - Your Perplexity API key
 *   GOOGLE_API_KEY     - Your Google API key
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration (reads from environment variables - never hardcode secrets)
const config = {
  projectId: 'blinderfit',
  aiModel: 'gemini-1.5-pro',
  perplexityApiKey: process.env.PERPLEXITY_API_KEY || '',
  googleApiKey: process.env.GOOGLE_API_KEY || ''
};

if (!config.perplexityApiKey || !config.googleApiKey) {
  console.error('❌ Missing required environment variables:');
  if (!config.perplexityApiKey) console.error('   - PERPLEXITY_API_KEY');
  if (!config.googleApiKey) console.error('   - GOOGLE_API_KEY');
  console.error('\nSet them before running this script:');
  console.error('  export PERPLEXITY_API_KEY=your_key_here');
  console.error('  export GOOGLE_API_KEY=your_key_here');
  process.exit(1);
}

// Ensure .env file exists in functions directory
const functionsEnvPath = path.join(__dirname, '../functions/.env');
const envContent = `
PERPLEXITY_API_KEY=${config.perplexityApiKey}
GOOGLE_API_KEY=${config.googleApiKey}
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

// Create frontend .env file
const frontendEnvPath = path.join(__dirname, '../frontend/.env');
const frontendEnvContent = `
VITE_API_BASE_URL=http://localhost:8000
VITE_FIREBASE_PROJECT_ID=${config.projectId}
`;

fs.writeFileSync(frontendEnvPath, frontendEnvContent.trim());
console.log(`✅ Created .env file in frontend directory`);

// Verify Firebase is installed
try {
  const { execSync } = await import('child_process');
  execSync('firebase --version', { stdio: 'pipe' });
  console.log('✅ Firebase CLI is installed');
} catch (e) {
  console.warn('⚠️  Firebase CLI not found. Install with: npm install -g firebase-tools');
}

console.log('\n🎉 Environment setup complete!');
console.log(`   Project: ${config.projectId}`);
console.log(`   AI Model: ${config.aiModel}`);
