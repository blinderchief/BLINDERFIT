import { functions } from '@/integrations/firebase/client';
import { httpsCallable } from "firebase/functions";

/**
 * Test function to verify Firebase Cloud Function connectivity
 * Can be called from the browser console to debug
 */
export const testFunctionCall = async () => {
  try {
    console.log("Testing Firebase function connectivity...");
    const testPing = httpsCallable(functions, 'testPing');
    const result = await testPing();
    console.log("Function call successful!", result);
    return result;
  } catch (error) {
    console.error("Error calling Firebase function:", error);
    throw error;
  }
};

/**
 * Test the AI specifically with a simple question
 */
export const testAICall = async () => {
  try {
    console.log("Testing AI function connectivity...");
    const testAI = httpsCallable(functions, 'testAIResponse');
    const result = await testAI({ 
      question: "What's a simple exercise for beginners?" 
    });
    console.log("AI function call successful!", result);
    return result;
  } catch (error) {
    console.error("Error calling AI function:", error);
    throw error;
  }
};

// Make these functions available on window for browser console testing
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.testFunctionCall = testFunctionCall;
  // @ts-ignore
  window.testAICall = testAICall;
}
