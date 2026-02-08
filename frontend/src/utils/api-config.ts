/**
 * API client configuration for different environments
 */

// Determine the environment and set the appropriate API URL
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.API_BASE_URL || 'http://localhost:8000';
  }

  const hostname = window.location.hostname;
  
  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  }
  
  // Production - use environment variable or default to Railway backend
  return import.meta.env.VITE_API_BASE_URL || 'https://api.blinderfit.com';
};

const apiConfig = {
  baseUrl: getApiBaseUrl(),
  
  // Helper function to create API URLs
  endpoint: function(path: string) {
    return `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  },
};

export default apiConfig;
