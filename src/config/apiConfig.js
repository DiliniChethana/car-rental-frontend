// Configuration file for Spring Boot backend integration
export const API_CONFIG = {
  // Base URLs
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8081/api',
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081',
  
  // Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      VERIFY_EMAIL: '/auth/verify-email',
      ME: '/auth/me',
    },
    CARS: {
      BASE: '/cars',
      SEARCH: '/cars/search',
      CATEGORIES: '/cars/categories',
      LOCATIONS: '/cars/locations',
      AVAILABLE: '/cars/available',
      FEATURED: '/cars/featured',
      STATS: '/cars/stats',
    },
    USERS: {
      BASE: '/users',
      PROFILE: '/users/profile',
      STATS: '/users/stats',
      EXPORT: '/users/export',
    },
    BOOKINGS: {
      BASE: '/bookings',
      USER: '/bookings/user',
      ADMIN: '/bookings/admin',
      STATS: '/bookings/stats',
      ANALYTICS: '/bookings/analytics',
      EXPORT: '/bookings/export',
    },
  },
  
  // Default pagination
  PAGINATION: {
    DEFAULT_PAGE: 0,
    DEFAULT_SIZE: 10,
    MAX_SIZE: 100,
  },
  
  // Request timeouts
  TIMEOUTS: {
    DEFAULT: 10000,
    UPLOAD: 30000,
  },
};

// Spring Boot specific configurations
export const SPRING_BOOT_CONFIG = {
  // Common Spring Boot response structure
  RESPONSE_STRUCTURE: {
    SUCCESS_FIELD: 'success',
    MESSAGE_FIELD: 'message',
    DATA_FIELD: 'data',
    ERROR_FIELD: 'error',
    TIMESTAMP_FIELD: 'timestamp',
  },
  
  // Spring Security role prefixes
  ROLE_PREFIX: 'ROLE_',
  
  // Common Spring Boot error codes
  ERROR_CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    ACCESS_DENIED: 'ACCESS_DENIED',
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
    DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
  },
  
  // JWT token configuration
  JWT: {
    HEADER_NAME: 'Authorization',
    TOKEN_PREFIX: 'Bearer ',
    EXPIRY_BUFFER: 300, // 5 minutes buffer before token expiry
  },
};

// CORS configuration for development
export const CORS_CONFIG = {
  // Add these headers to your Spring Boot application.yml or application.properties:
  /*
  spring:
    web:
      cors:
        allowed-origins: "http://localhost:3000"
        allowed-methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS"
        allowed-headers: "*"
        allow-credentials: true
        max-age: 3600
  */
  
  // Or configure programmatically in your Spring Boot application:
  /*
  @Configuration
  @EnableWebMvc
  public class WebConfig implements WebMvcConfigurer {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
          registry.addMapping("/api/**")
                  .allowedOrigins("http://localhost:3000")
                  .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                  .allowedHeaders("*")
                  .allowCredentials(true)
                  .maxAge(3600);
      }
  }
  */
};

export default API_CONFIG;