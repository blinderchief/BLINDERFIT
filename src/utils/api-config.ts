/**
 * API client configuration for different environments
 */

// Determine the environment and set the appropriate API URL
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    // Server-side rendering case
    return process.env.API_BASE_URL || 'https://us-central1-blinderfit.cloudfunctions.net/app';
  }

  const hostname = window.location.hostname;
  
  // Production domain
  if (hostname === 'blinderfit.blinder.live') {
    return 'https://us-central1-blinderfit.cloudfunctions.net/app';
  }
  
  // Firebase hosting domains
  if (hostname.includes('blinderfit.web.app') || hostname.includes('blinderfit.firebaseapp.com')) {
    return 'https://us-central1-blinderfit.cloudfunctions.net/app';
  }
  
  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5001/blinderfit/us-central1/app';
  }
  
  // Default to production
  return 'https://us-central1-blinderfit.cloudfunctions.net/app';
};

const apiConfig = {
  baseUrl: getApiBaseUrl(),
  
  // Helper function to create API URLs
  endpoint: function(path) {
    return `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  },
  
  // Helper function for API requests with auth token
  fetchWithAuth: async function(path, options = {}) {
    const token = await this.getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };
    
    const response = await fetch(this.endpoint(path), {
      ...options,
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    
    return response.json();
  },
  
  // Get the auth token from Firebase Auth
  getAuthToken: async function() {
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        console.warn('No user is signed in');
        return null;
      }
      
      return await user.getIdToken();
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }
};

export default apiConfig;
