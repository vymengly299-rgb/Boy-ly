import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        // In a real app, you would attempt to refresh the token here
        // For now, just redirect to login
        window.location.href = '/login';
      } else {
        window.location.href = '/login';
      }
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

// Generic API request function
const apiRequest = async (method, url, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url,
      headers: { ...api.defaults.headers, ...headers }
    };
    
    if (data) {
      if (method === 'GET') {
        config.params = data;
      } else {
        config.data = data;
      }
    }
    
    const response = await api(config);
    return response;
  } catch (error) {
    // Enhance error with more information
    if (error.response) {
      // The request was made and the server responded with a status code
      error.message = error.response.data?.message || error.response.data?.error || error.message;
      error.status = error.response.status;
    } else if (error.request) {
      // The request was made but no response was received
      error.message = 'No response received from server';
    } else {
      // Something happened in setting up the request
      error.message = error.message || 'Request setup error';
    }
    
    throw error;
  }
};

// Export api instance and request function
export { api, apiRequest };

export default api;
