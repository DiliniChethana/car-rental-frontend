import axios from 'axios';

// Create axios instance with base configuration for Spring Boot
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 15000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Enhanced logging for debugging
    console.log('🌐 API Request:', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data ? 'Data included' : 'No data'
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Enhanced success logging
    console.log('✅ API Response Success:', {
      status: response.status,
      url: response.config.url,
      dataType: typeof response.data,
      hasData: !!response.data
    });
    return response;
  },
  (error) => {
    // Enhanced error logging for debugging
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: error.message,
      data: error.response?.data,
      stack: error.response ? 'Server Error' : 'Network Error'
    });

    // Handle different error types
    if (!error.response) {
      // Network error - backend not accessible
      console.error('🔌 Network Error: Backend server not accessible at http://localhost:8081');
      error.message = 'Cannot connect to server. Please ensure your Spring Boot backend is running on http://localhost:8081';
    } else if (error.response.status === 401) {
      // Unauthorized - clear token and redirect to login
      console.error('🔐 Unauthorized: Invalid or expired token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login/register page
      if (!['/login', '/register'].includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    } else if (error.response.status === 403) {
      // Forbidden - user doesn't have permission
      console.error('🚫 Access forbidden:', error.response.data);
    } else if (error.response.status >= 500) {
      // Server error
      console.error('🚨 Server error:', error.response.data);
    } else if (error.response.status === 404) {
      // Not found
      console.error('🔍 Endpoint not found:', error.config.url);
    }
    
    return Promise.reject(error);
  }
);

export default api;