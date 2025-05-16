// Deploy script for BlinderFit application
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the current module's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set the current directory to the project root
const projectRoot = __dirname;
console.log(`Project root: ${projectRoot}`);

// Helper function to run a command
function runCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Running command: ${command}`);
    const process = exec(command, { cwd: projectRoot });
    
    process.stdout.on('data', (data) => {
      console.log(data.toString().trim());
    });
    
    process.stderr.on('data', (data) => {
      console.error(data.toString().trim());
    });
    
    process.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

async function deploy() {
  try {
    // Step 1: Build the application
    console.log('Building the application...');
    await runCommand('npx vite build');
    
    // Step 2: Check if the dist directory exists and contains index.html
    const distDir = path.join(projectRoot, 'dist');
    if (!fs.existsSync(distDir) || !fs.existsSync(path.join(distDir, 'index.html'))) {
      throw new Error('Build failed: dist directory or index.html not found');
    }
    
    // Step 3: Deploy to Firebase hosting
    console.log('Deploying to Firebase hosting...');
    await runCommand('firebase deploy --only hosting');
    
    console.log('Deployment successful!');
    console.log('Your changes have been deployed to blinderfit.blinder.live');
    console.log('It may take a few minutes for the changes to be visible.');
  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy();
