import api from './api';

const carService = {
  // Get all cars with optional filters - Spring Boot pagination support
  getAllCars: async (filters = {}, page = 0, size = 10) => {
    try {
      const params = new URLSearchParams();
      
      // Add pagination parameters
      params.append('page', page.toString());
      params.append('size', size.toString());
      
      // Add filters to query params
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/cars?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get car by ID
  getCarById: async (carId) => {
    try {
      const response = await api.get(`/cars/${carId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new car (admin only)
  createCar: async (carData) => {
    try {
      const response = await api.post('/cars', carData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update car (admin only)
  updateCar: async (carId, carData) => {
    try {
      const response = await api.put(`/cars/${carId}`, carData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete car (admin only)
  deleteCar: async (carId) => {
    try {
      const response = await api.delete(`/cars/${carId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Search cars with Spring Boot search functionality
  searchCars: async (searchQuery, page = 0, size = 10) => {
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        page: page.toString(),
        size: size.toString(),
      });
      
      const response = await api.get(`/cars/search?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get available cars for date range
  getAvailableCars: async (startDate, endDate, location = '', page = 0, size = 10) => {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        page: page.toString(),
        size: size.toString(),
      });
      
      if (location) {
        params.append('location', location);
      }

      const response = await api.get(`/cars/available?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get car categories
  getCategories: async () => {
    try {
      const response = await api.get('/cars/categories');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get car locations
  getLocations: async () => {
    try {
      const response = await api.get('/cars/locations');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Upload car images (admin only) - Spring Boot multipart
  uploadCarImages: async (carId, images) => {
    try {
      const formData = new FormData();
      
      // Add each image to form data
      images.forEach((image, index) => {
        formData.append('images', image);
      });

      const response = await api.post(`/cars/${carId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete car image (admin only)
  deleteCarImage: async (carId, imageId) => {
    try {
      const response = await api.delete(`/cars/${carId}/images/${imageId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get car availability for specific dates
  checkAvailability: async (carId, startDate, endDate) => {
    try {
      const response = await api.get(`/cars/${carId}/availability`, {
        params: { startDate, endDate },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get cars by category
  getCarsByCategory: async (category, page = 0, size = 10) => {
    try {
      const params = new URLSearchParams({
        category,
        page: page.toString(),
        size: size.toString(),
      });
      
      const response = await api.get(`/cars/category?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get featured cars (if implemented in backend)
  getFeaturedCars: async (limit = 6) => {
    try {
      const response = await api.get(`/cars/featured?size=${limit}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get car statistics (admin only)
  getCarStats: async () => {
    try {
      const response = await api.get('/cars/stats');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Toggle car availability (admin only)
  toggleAvailability: async (carId) => {
    try {
      const response = await api.patch(`/cars/${carId}/toggle-availability`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default carService;