/**
 * Test utilities for API connectivity
 * Can be called from the browser console to debug
 */
import apiService from '@/services/api';

export const testAPICall = async () => {
  try {
    console.log("Testing API connectivity...");
    const result = await apiService.get('/health');
    console.log("API call successful!", result);
    return result;
  } catch (error) {
    console.error("Error calling API:", error);
    throw error;
  }
};

export const testAICall = async () => {
  try {
    console.log("Testing AI function connectivity...");
    const result = await apiService.sendMessage("What's a simple exercise for beginners?");
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
  window.testAPICall = testAPICall;
  // @ts-ignore
  window.testAICall = testAICall;
}
