// emulator-connection.js
//
// This utility helps connect to the Firebase Functions emulator
// Import this file to automatically connect to the emulator when in development
// Usage: import './utils/emulator-connection';

import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getApp } from 'firebase/app';

// Only connect to emulator in development environment
if (
  process.env.NODE_ENV === 'development' || 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1'
) {
  try {
    console.log('Development environment detected. Connecting to Firebase Functions emulator...');
    
    // Get the initialized Firebase app
    const app = getApp();
    
    // Get the functions instance
    const functions = getFunctions(app);
    
    // Connect to the emulator
    connectFunctionsEmulator(functions, 'localhost', 5001);
    
    console.log('Successfully connected to Firebase Functions emulator.');
    
    // Add a visual indicator to the UI that we're using the emulator
    const emulatorIndicator = document.createElement('div');
    emulatorIndicator.style.position = 'fixed';
    emulatorIndicator.style.bottom = '10px';
    emulatorIndicator.style.right = '10px';
    emulatorIndicator.style.backgroundColor = 'rgba(255, 87, 34, 0.9)';
    emulatorIndicator.style.color = 'white';
    emulatorIndicator.style.padding = '5px 10px';
    emulatorIndicator.style.borderRadius = '4px';
    emulatorIndicator.style.fontSize = '12px';
    emulatorIndicator.style.zIndex = '9999';
    emulatorIndicator.textContent = 'Using Firebase Emulator';
    
    // Add the indicator after the page loads
    window.addEventListener('load', () => {
      document.body.appendChild(emulatorIndicator);
    });
    
  } catch (error) {
    console.error('Failed to connect to Firebase Functions emulator:', error);
  }
}
