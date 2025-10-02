import api from './api';

const userService = {
  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/profile');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      // Update user in localStorage
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/users/change-password', passwordData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete user account
  deleteAccount: async () => {
    try {
      const response = await api.delete('/users/profile');
      // Clear local storage on successful deletion
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', imageFile);

      const response = await api.post('/users/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Admin functions
  // Get all users (admin only)
  getAllUsers: async (page = 1, limit = 10, search = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (search) {
        params.append('search', search);
      }

      const response = await api.get(`/users?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user by ID (admin only)
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new user (admin only)
  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update user (admin only)
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Activate/Deactivate user (admin only)
  toggleUserStatus: async (userId) => {
    try {
      const response = await api.patch(`/users/${userId}/toggle-status`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user statistics (admin only)
  getUserStats: async () => {
    try {
      const response = await api.get('/users/stats');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Export users data (admin only)
  exportUsers: async (format = 'csv') => {
    try {
      const response = await api.get(`/users/export?format=${format}`, {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Send notification to user (admin only)
  sendNotification: async (userId, notificationData) => {
    try {
      const response = await api.post(`/users/${userId}/notifications`, notificationData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user's booking history
  getUserBookings: async (userId = null) => {
    try {
      const endpoint = userId ? `/users/${userId}/bookings` : '/users/profile/bookings';
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default userService;