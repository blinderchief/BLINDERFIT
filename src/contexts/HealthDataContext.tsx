
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface HealthData {
  age: number;
  weight: number; // in kg
  height: number; // in cm
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goals: string[];
  healthIssues: string[];
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  availableTime: number; // minutes per day
  preferredWorkoutDays: string[];
}

interface HealthDataContextType {
  healthData: HealthData | null;
  updateHealthData: (data: HealthData) => void;
  loading: boolean;
  hasSubmittedHealthData: boolean;
}

const defaultHealthData: HealthData = {
  age: 30,
  weight: 70,
  height: 170,
  gender: 'male',
  activityLevel: 'moderate',
  goals: ['weight_loss'],
  healthIssues: [],
  fitnessLevel: 'intermediate',
  availableTime: 60,
  preferredWorkoutDays: ['monday', 'wednesday', 'friday']
};

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (context === undefined) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};

export const HealthDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSubmittedHealthData, setHasSubmittedHealthData] = useState(false);

  // Load health data from localStorage
  useEffect(() => {
    if (user) {
      const storedData = localStorage.getItem(`gofit_health_data_${user.id}`);
      if (storedData) {
        setHealthData(JSON.parse(storedData));
        setHasSubmittedHealthData(true);
      }
      setLoading(false);
    } else {
      setHealthData(null);
      setHasSubmittedHealthData(false);
      setLoading(false);
    }
  }, [user]);

  const updateHealthData = (data: HealthData) => {
    setHealthData(data);
    setHasSubmittedHealthData(true);
    if (user) {
      localStorage.setItem(`gofit_health_data_${user.id}`, JSON.stringify(data));
    }
  };

  return (
    <HealthDataContext.Provider value={{ healthData, updateHealthData, loading, hasSubmittedHealthData }}>
      {children}
    </HealthDataContext.Provider>
  );
};
