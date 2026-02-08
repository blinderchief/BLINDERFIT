import { useState } from 'react';
import apiService from '@/services/api';

interface UseAIOptions {
  onError?: (error: Error) => void;
}

interface PlanPreferences {
  focusArea: string;
  duration: string;
  daysPerWeek: number;
}

export const useAI = (options: UseAIOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const askAI = async (question: string | any) => {
    setIsLoading(true);
    setError(null);

    try {
      const msg = typeof question === 'string' ? question : JSON.stringify(question);
      const result = await apiService.sendMessage(msg);
      
      setIsLoading(false);
      return result;
    } catch (err: any) {
      setIsLoading(false);
      setError(err);
      
      if (options.onError) {
        options.onError(err);
      }
      
      throw err;
    }
  };

  const generatePlan = async (preferences: PlanPreferences | any, userData: any = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const message = `Generate a personalized fitness plan with these preferences: ${JSON.stringify(preferences)}. User data: ${JSON.stringify(userData)}`;
      const result = await apiService.sendMessage(message);
      
      setIsLoading(false);
      return result;
    } catch (err: any) {
      setIsLoading(false);
      setError(err);
      
      if (options.onError) {
        options.onError(err);
      }
      
      throw err;
    }
  };

  return {
    askAI,
    generatePlan,
    isLoading,
    error
  };
};
