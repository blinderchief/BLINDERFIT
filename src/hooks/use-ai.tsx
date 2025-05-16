import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../integrations/firebase/client';

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

  const askAI = async (question: string, chatHistory: any[] = []) => {
    setIsLoading(true);
    setError(null);

    try {
      const answerHealthQuestion = httpsCallable(functions, 'answerHealthQuestion');
      const result = await answerHealthQuestion({ 
        question, 
        chatHistory 
      });
      
      setIsLoading(false);
      return result.data;
    } catch (err: any) {
      setIsLoading(false);
      setError(err);
      
      if (options.onError) {
        options.onError(err);
      }
      
      throw err;
    }
  };

  const generatePlan = async (preferences: PlanPreferences, userData: any = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const generateFitnessPlan = httpsCallable(functions, 'generateFitnessPlan');
      const result = await generateFitnessPlan({ 
        preferences,
        userData 
      });
      
      setIsLoading(false);
      return result.data;
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