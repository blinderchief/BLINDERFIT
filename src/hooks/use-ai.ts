import { useState, useCallback } from 'react';
import apiConfig from '../utils/api-config';

interface UseAIOptions {
  onStart?: () => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export const useAI = (options: UseAIOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Ask a question to the AI assistant
   */
  const askAI = useCallback(async (question: string) => {
    setIsLoading(true);
    setError(null);
    
    options.onStart?.();
    
    try {
      const response = await apiConfig.fetchWithAuth('/ask', {
        method: 'POST',
        body: JSON.stringify({ question })
      });
      
      options.onComplete?.();
      setIsLoading(false);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options.onError?.(error);
      setIsLoading(false);
      return null;
    }
  }, [options]);

  /**
   * Generate a personalized fitness plan
   */
  const generatePlan = useCallback(async (userProfile: any) => {
    setIsLoading(true);
    setError(null);
    
    options.onStart?.();
    
    try {
      const response = await apiConfig.fetchWithAuth('/generate-plan', {
        method: 'POST',
        body: JSON.stringify({ userProfile })
      });
      
      options.onComplete?.();
      setIsLoading(false);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options.onError?.(error);
      setIsLoading(false);
      return null;
    }
  }, [options]);

  /**
   * Check the health status of the AI service
   */
  const checkAIHealth = useCallback(async () => {
    try {
      const response = await fetch(apiConfig.endpoint('/health'));
      const data = await response.json();
      return data.status === 'ok';
    } catch (err) {
      console.error('AI health check failed:', err);
      return false;
    }
  }, []);

  return {
    askAI,
    generatePlan,
    checkAIHealth,
    isLoading,
    error
  };
};

export default useAI;
