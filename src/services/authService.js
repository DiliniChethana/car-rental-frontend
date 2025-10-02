import api from './api';

const authService = {
  // User login - Spring Boot typically returns JWT token
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Handle your backend response structure
      if (response.data.token) {
        const token = response.data.token;
        const user = response.data.user || {};
        
        // Create user object with available data
        const userObject = {
          id: user.id,
          username: user.username || credentials.username,
          firstName: user.firstName || user.username,
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          role: user.role || 'USER',
          createdAt: user.createdAt || new Date().toISOString(),
          totalBookings: 0,
          totalSpent: 0,
          favoriteCarType: 'Not specified',
          membershipLevel: 'Standard',
          ...user // Include any additional fields from backend
        };
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userObject));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // User registration
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      // Handle your backend response structure
      if (response.data.token) {
        const token = response.data.token;
        const user = response.data.user || {};
        
        // Create user object with registration data
        const userObject = {
          id: user.id,
          username: user.username || userData.username,
          firstName: user.firstName || userData.firstName,
          lastName: user.lastName || userData.lastName,
          email: user.email || userData.email,
          phone: user.phone || userData.phone,
          role: user.role || 'USER',
          createdAt: user.createdAt || new Date().toISOString(),
          totalBookings: 0, // New user starts with 0 bookings
          totalSpent: 0,    // New user starts with 0 spent
          favoriteCarType: 'Not specified',
          membershipLevel: 'Standard', // New users start as Standard
          ...user // Include any additional fields from backend
        };
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userObject));
      } else {
        // If no token returned, still store user data from registration
        const userObject = {
          username: userData.username,
          firstName: userData.firstName || userData.username,
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: 'USER',
          createdAt: new Date().toISOString(),
          totalBookings: 0,
          totalSpent: 0,
          favoriteCarType: 'Not specified',
          membershipLevel: 'Standard',
        };
        localStorage.setItem('user', JSON.stringify(userObject));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      // Spring Boot logout endpoint (if implemented)
      const response = await api.post('/auth/logout');
      return response;
    } catch (error) {
      // Even if API call fails, clear local storage
      console.warn('Logout API call failed, but clearing local storage');
    } finally {
      // Always clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Refresh token (if your Spring Boot backend supports it)
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await api.post('/auth/refresh', { 
        refreshToken: refreshToken 
      });
      
      if (response.data.token || response.data.accessToken) {
        const token = response.data.token || response.data.accessToken;
        localStorage.setItem('token', token);
        
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
      }
      
      return response;
    } catch (error) {
      // If refresh fails, logout user
      this.logout();
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password: newPassword,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Verify email (if implemented in Spring Boot)
  verifyEmail: async (token) => {
    try {
      const response = await api.post('/auth/verify-email', { token });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get current user profile from backend
  getCurrentUserProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      
      // Update local storage with fresh user data
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      // Basic JWT expiration check (if needed)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        // Token expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
      }
      
      return true;
    } catch (error) {
      // Invalid token format
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get auth token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Get user role
  getUserRole: () => {
    const user = authService.getCurrentUser();
    return user?.role || user?.authorities?.[0]?.authority || 'user';
  },

  // Check if user has specific role
  hasRole: (role) => {
    const userRole = authService.getUserRole();
    return userRole === role || userRole === 'ROLE_' + role.toUpperCase();
  },

  // Check if user is admin
  isAdmin: () => {
    return authService.hasRole('admin') || authService.hasRole('ADMIN');
  },
};

export default authService;