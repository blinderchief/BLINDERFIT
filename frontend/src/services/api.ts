import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { auth } from '@/integrations/firebase/client';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const user = auth.currentUser;
          if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error getting auth token:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          console.error('Authentication error:', error.response.data);
          // You might want to redirect to login or refresh token here
        } else if (error.response?.status === 429) {
          // Rate limited
          console.error('Rate limited:', error.response.data);
        } else if (error.response?.status >= 500) {
          // Server error
          console.error('Server error:', error.response.data);
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  async get<T = unknown>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get(url, { params });
    return response.data;
  }

  async post<T = unknown>(url: string, data?: Record<string, unknown>): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post(url, data);
    return response.data;
  }

  async put<T = unknown>(url: string, data?: Record<string, unknown>): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put(url, data);
    return response.data;
  }

  async patch<T = unknown>(url: string, data?: Record<string, unknown>): Promise<T> {
    const response: AxiosResponse<T> = await this.api.patch(url, data);
    return response.data;
  }

  async delete<T = unknown>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.api.delete(url);
    return response.data;
  }

  // Health check
  async healthCheck() {
    return this.get('/health');
  }

  // Auth methods - handled by Firebase Auth directly
  // These are no-ops since authentication is managed by Firebase
  async login(_email: string, _password: string) {
    console.warn('Use Firebase Auth (AuthContext) for login instead of api.login()');
    return { success: true };
  }

  async register(_userData: Record<string, unknown>) {
    console.warn('Use Firebase Auth (AuthContext) for registration instead of api.register()');
    return { success: true };
  }

  // Onboarding methods
  async submitHealthData(healthData: Record<string, unknown>) {
    return this.post('/onboarding/health-data', healthData);
  }

  async submitGoals(goals: Record<string, unknown>) {
    return this.post('/onboarding/goals', goals);
  }

  async getOnboardingStatus() {
    return this.get('/onboarding/status');
  }

  // AI Chat methods
  async sendMessage(message: string, context?: Record<string, unknown>) {
    return this.post('/ai/chat', { message, context });
  }

  async getChatHistory(limit?: number) {
    return this.get('/ai/history', { limit });
  }

  async clearChatHistory() {
    return this.delete('/ai/history');
  }

  // Plans methods
  async generatePlan(planRequest: Record<string, unknown>) {
    return this.post('/plans/generate', planRequest);
  }

  async getCurrentPlan() {
    return this.get('/plans/current');
  }

  async updatePlan(planId: string, updates: Record<string, unknown>) {
    return this.put(`/plans/${planId}`, updates);
  }

  async getPlanHistory() {
    return this.get('/plans/history');
  }

  // Tracking methods
  async logMeal(mealData: Record<string, unknown>) {
    return this.post('/tracking/meal', mealData);
  }

  async logExercise(exerciseData: Record<string, unknown>) {
    return this.post('/tracking/exercise', exerciseData);
  }

  async logWeight(weightData: Record<string, unknown>) {
    return this.post('/tracking/weight', weightData);
  }

  async getTrackingData(dateRange?: Record<string, unknown>) {
    return this.get('/tracking/data', dateRange);
  }

  async updateTrackingEntry(entryId: string, updates: Record<string, unknown>) {
    return this.put(`/tracking/${entryId}`, updates);
  }

  // Dashboard methods
  async getDashboardData() {
    return this.get('/dashboard/overview');
  }

  async getPulseHubData() {
    return this.get('/dashboard/pulsehub');
  }

  async getHealthMetrics() {
    return this.get('/dashboard/metrics');
  }

  // ML Predictions methods
  async getPredictions(predictionType?: string) {
    return this.get('/ml/predictions', { type: predictionType });
  }

  async getInsights(insightType?: string) {
    return this.get('/ml/insights', { type: insightType });
  }

  async getRecommendations() {
    return this.get('/ml/recommendations');
  }

  // Notifications methods
  async sendNotification(notificationData: any) {
    return this.post('/notifications/send', notificationData);
  }

  async getUnreadNotifications() {
    return this.get('/notifications/unread');
  }

  async markNotificationRead(notificationId: string) {
    return this.put(`/notifications/${notificationId}/read`);
  }

  async updateNotificationPreferences(preferences: any) {
    return this.put('/notifications/preferences', preferences);
  }

  async updateFCMToken(fcmToken: string) {
    return this.put('/notifications/fcm-token', { fcm_token: fcmToken });
  }

  // Integrations methods
  async searchWeb(query: string, numResults?: number) {
    return this.post('/integrations/web-search', { query, num_results: numResults });
  }

  async getNutritionInfo(foodItem: string) {
    return this.post('/integrations/nutrition-info', { food_item: foodItem });
  }

  async getExerciseInfo(exerciseName: string) {
    return this.post('/integrations/exercise-info', { exercise_name: exerciseName });
  }

  async syncWearableData(accessToken: string, provider: string) {
    return this.post('/integrations/wearable-sync', { access_token: accessToken, provider });
  }

  async getWeatherData(latitude: number, longitude: number) {
    return this.post('/integrations/weather', { latitude, longitude });
  }

  async getHealthNews(limit?: number) {
    return this.get('/integrations/health-news', { limit });
  }

  async analyzeTrends(dataType: string) {
    return this.post('/integrations/analyze-trends', { data_type: dataType });
  }

  async getMealSuggestions(preferences: any) {
    return this.post('/integrations/meal-suggestions', preferences);
  }

  async generateWorkoutPlan(goals: any) {
    return this.post('/integrations/workout-plan', goals);
  }

  async getHealthAssessment() {
    return this.post('/integrations/health-assessment');
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;