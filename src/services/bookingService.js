import api from './api';

const bookingService = {
  // Create new booking
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings', bookingData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user's bookings
  getUserBookings: async () => {
    try {
      const response = await api.get('/bookings/user');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update booking
  updateBooking: async (bookingId, bookingData) => {
    try {
      const response = await api.put(`/bookings/${bookingId}`, bookingData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId, reason = '') => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/cancel`, { reason });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Confirm booking (admin/system)
  confirmBooking: async (bookingId) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/confirm`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Complete booking
  completeBooking: async (bookingId) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/complete`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Process payment for booking
  processPayment: async (bookingId, paymentData) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/payment`, paymentData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get booking invoice
  getInvoice: async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}/invoice`, {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Add review for completed booking
  addReview: async (bookingId, reviewData) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/review`, reviewData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Admin functions
  // Get all bookings (admin only)
  getAllBookings: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Add filters to query params
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/bookings/admin?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get booking statistics (admin only)
  getBookingStats: async (startDate = '', endDate = '') => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/bookings/stats?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get revenue analytics (admin only)
  getRevenueAnalytics: async (period = 'month') => {
    try {
      const response = await api.get(`/bookings/analytics/revenue?period=${period}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Export bookings data (admin only)
  exportBookings: async (format = 'csv', filters = {}) => {
    try {
      const params = new URLSearchParams({ format });
      
      // Add filters to query params
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/bookings/export?${params.toString()}`, {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update booking status (admin only)
  updateBookingStatus: async (bookingId, status, notes = '') => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/status`, {
        status,
        notes,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Send booking notification (admin only)
  sendNotification: async (bookingId, notificationData) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/notification`, notificationData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Calculate booking price
  calculatePrice: async (carId, startDate, endDate) => {
    try {
      const response = await api.post('/bookings/calculate-price', {
        carId,
        startDate,
        endDate,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Check booking conflicts
  checkConflicts: async (carId, startDate, endDate, excludeBookingId = null) => {
    try {
      const params = new URLSearchParams({
        carId,
        startDate,
        endDate,
      });
      
      if (excludeBookingId) {
        params.append('exclude', excludeBookingId);
      }

      const response = await api.get(`/bookings/check-conflicts?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default bookingService;