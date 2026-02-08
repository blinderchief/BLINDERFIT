import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

// Query keys
export const queryKeys = {
  healthData: ['healthData'] as const,
  goals: ['goals'] as const,
  onboardingStatus: ['onboardingStatus'] as const,
  chatHistory: ['chatHistory'] as const,
  currentPlan: ['currentPlan'] as const,
  planHistory: ['planHistory'] as const,
  trackingData: ['trackingData'] as const,
  dashboardData: ['dashboardData'] as const,
  pulseHubData: ['pulseHubData'] as const,
  healthMetrics: ['healthMetrics'] as const,
  predictions: ['predictions'] as const,
  insights: ['insights'] as const,
  recommendations: ['recommendations'] as const,
  unreadNotifications: ['unreadNotifications'] as const,
  notificationHistory: ['notificationHistory'] as const,
  healthNews: ['healthNews'] as const,
  wearableHistory: ['wearableHistory'] as const,
};

// Health check hook
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiService.healthCheck(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Onboarding hooks
export const useOnboardingStatus = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.onboardingStatus,
    queryFn: () => apiService.getOnboardingStatus(),
    enabled: !!user,
  });
};

export const useSubmitHealthData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (healthData: any) => apiService.submitHealthData(healthData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.onboardingStatus });
    },
  });
};

export const useSubmitGoals = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goals: any) => apiService.submitGoals(goals),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.onboardingStatus });
    },
  });
};

// AI Chat hooks
export const useChatHistory = (limit?: number) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...queryKeys.chatHistory, limit],
    queryFn: () => apiService.getChatHistory(limit),
    enabled: !!user,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ message, context }: { message: string; context?: any }) =>
      apiService.sendMessage(message, context),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chatHistory });
    },
  });
};

export const useClearChatHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiService.clearChatHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chatHistory });
    },
  });
};

// Plans hooks
export const useCurrentPlan = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.currentPlan,
    queryFn: () => apiService.getCurrentPlan(),
    enabled: !!user,
  });
};

export const usePlanHistory = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.planHistory,
    queryFn: () => apiService.getPlanHistory(),
    enabled: !!user,
  });
};

export const useGeneratePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planRequest: any) => apiService.generatePlan(planRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentPlan });
      queryClient.invalidateQueries({ queryKey: queryKeys.planHistory });
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, updates }: { planId: string; updates: any }) =>
      apiService.updatePlan(planId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentPlan });
    },
  });
};

// Tracking hooks
export const useTrackingData = (dateRange?: any) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...queryKeys.trackingData, dateRange],
    queryFn: () => apiService.getTrackingData(dateRange),
    enabled: !!user,
  });
};

export const useLogMeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mealData: any) => apiService.logMeal(mealData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trackingData });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardData });
    },
  });
};

export const useLogExercise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exerciseData: any) => apiService.logExercise(exerciseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trackingData });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardData });
    },
  });
};

export const useLogWeight = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (weightData: any) => apiService.logWeight(weightData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trackingData });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardData });
    },
  });
};

export const useUpdateTrackingEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, updates }: { entryId: string; updates: any }) =>
      apiService.updateTrackingEntry(entryId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trackingData });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardData });
    },
  });
};

// Dashboard hooks
export const useDashboardData = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.dashboardData,
    queryFn: () => apiService.getDashboardData(),
    enabled: !!user,
  });
};

export const usePulseHubData = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.pulseHubData,
    queryFn: () => apiService.getPulseHubData(),
    enabled: !!user,
  });
};

export const useHealthMetrics = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.healthMetrics,
    queryFn: () => apiService.getHealthMetrics(),
    enabled: !!user,
  });
};

// ML hooks
export const usePredictions = (predictionType?: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...queryKeys.predictions, predictionType],
    queryFn: () => apiService.getPredictions(predictionType),
    enabled: !!user,
  });
};

export const useInsights = (insightType?: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...queryKeys.insights, insightType],
    queryFn: () => apiService.getInsights(insightType),
    enabled: !!user,
  });
};

export const useRecommendations = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.recommendations,
    queryFn: () => apiService.getRecommendations(),
    enabled: !!user,
  });
};

// Notifications hooks
export const useUnreadNotifications = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.unreadNotifications,
    queryFn: () => apiService.getUnreadNotifications(),
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useSendNotification = () => {
  return useMutation({
    mutationFn: (notificationData: any) => apiService.sendNotification(notificationData),
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => apiService.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotifications });
    },
  });
};

export const useUpdateNotificationPreferences = () => {
  return useMutation({
    mutationFn: (preferences: any) => apiService.updateNotificationPreferences(preferences),
  });
};

export const useUpdateFCMToken = () => {
  return useMutation({
    mutationFn: (fcmToken: string) => apiService.updateFCMToken(fcmToken),
  });
};

// Integrations hooks
export const useHealthNews = (limit?: number) => {
  return useQuery({
    queryKey: [...queryKeys.healthNews, limit],
    queryFn: () => apiService.getHealthNews(limit),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useSearchWeb = () => {
  return useMutation({
    mutationFn: ({ query, numResults }: { query: string; numResults?: number }) =>
      apiService.searchWeb(query, numResults),
  });
};

export const useNutritionInfo = () => {
  return useMutation({
    mutationFn: (foodItem: string) => apiService.getNutritionInfo(foodItem),
  });
};

export const useExerciseInfo = () => {
  return useMutation({
    mutationFn: (exerciseName: string) => apiService.getExerciseInfo(exerciseName),
  });
};

export const useSyncWearableData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ accessToken, provider }: { accessToken: string; provider: string }) =>
      apiService.syncWearableData(accessToken, provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trackingData });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardData });
    },
  });
};

export const useWeatherData = () => {
  return useMutation({
    mutationFn: ({ latitude, longitude }: { latitude: number; longitude: number }) =>
      apiService.getWeatherData(latitude, longitude),
  });
};

export const useAnalyzeTrends = () => {
  return useMutation({
    mutationFn: (dataType: string) => apiService.analyzeTrends(dataType),
  });
};

export const useMealSuggestions = () => {
  return useMutation({
    mutationFn: (preferences: any) => apiService.getMealSuggestions(preferences),
  });
};

export const useGenerateWorkoutPlan = () => {
  return useMutation({
    mutationFn: (goals: any) => apiService.generateWorkoutPlan(goals),
  });
};

export const useHealthAssessment = () => {
  return useMutation({
    mutationFn: () => apiService.getHealthAssessment(),
  });
};