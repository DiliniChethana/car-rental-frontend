# Spring Boot Backend Integration Guide

## Quick Setup Checklist

### 1. Backend Setup (Spring Boot)
Make sure your Spring Boot application has the following configuration:

#### Add CORS Configuration
Add this to your `application.yml`:
```yaml
spring:
  web:
    cors:
      allowed-origins: "http://localhost:3000"
      allowed-methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS"
      allowed-headers: "*"
      allow-credentials: true
      max-age: 3600

server:
  port: 8081
```

Or create a CORS configuration class:
```java
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
```

### 2. Expected API Endpoints
Your Spring Boot backend should have these endpoints:

#### Authentication (`/api/auth`)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

#### Cars (`/api/cars`)
- `GET /api/cars` - Get all cars (supports pagination: ?page=0&size=10)
- `GET /api/cars/{id}` - Get car by ID
- `POST /api/cars` - Create new car (admin only)
- `PUT /api/cars/{id}` - Update car (admin only)
- `DELETE /api/cars/{id}` - Delete car (admin only)
- `GET /api/cars/search` - Search cars
- `GET /api/cars/categories` - Get car categories
- `GET /api/cars/locations` - Get car locations

#### Users (`/api/users`)
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/{id}` - Update user (admin only)
- `DELETE /api/users/{id}` - Delete user (admin only)

#### Bookings (`/api/bookings`)
- `GET /api/bookings/user` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/{id}` - Get booking by ID
- `PATCH /api/bookings/{id}/cancel` - Cancel booking

### 3. Expected Request/Response Format

#### Login Request
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "role": "USER"
  }
}
```

#### Car Response
```json
{
  "id": 1,
  "name": "Toyota Camry",
  "category": "Sedan",
  "price": 45.00,
  "location": "Downtown",
  "seats": 5,
  "fuel": "Petrol",
  "transmission": "Automatic",
  "available": true,
  "description": "A comfortable sedan...",
  "features": ["Air Conditioning", "GPS", "Bluetooth"],
  "images": ["image1.jpg", "image2.jpg"]
}
```

### 4. Database Tables (for reference)

You should have these main tables in your MySQL database:

#### users
```sql
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('USER', 'ADMIN') DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### cars
```sql
CREATE TABLE cars (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  location VARCHAR(100) NOT NULL,
  seats INT NOT NULL,
  fuel VARCHAR(20) NOT NULL,
  transmission VARCHAR(20) NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  description TEXT,
  features JSON,
  images JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### bookings
```sql
CREATE TABLE bookings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  car_id BIGINT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pickup_location VARCHAR(255) NOT NULL,
  dropoff_location VARCHAR(255) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (car_id) REFERENCES cars(id)
);
```

### 5. Running the Application

1. Start your Spring Boot backend:
   ```bash
   mvn spring-boot:run
   ```
   or
   ```bash
   ./gradlew bootRun
   ```

2. Start the React frontend:
   ```bash
   npm start
   ```

3. The frontend will run on http://localhost:3000
4. The backend should run on http://localhost:8081

### 6. Testing the Connection

1. Open browser console and look for API request logs
2. Try registering a new user
3. Try logging in
4. Check the Cars page to see if it loads data

### 7. Common Issues and Solutions

#### CORS Errors
- Make sure CORS is properly configured in Spring Boot
- Check that the frontend URL (http://localhost:3000) is allowed

#### Authentication Issues
- Verify JWT token format matches what the frontend expects
- Check token expiration handling

#### 404 Errors
- Ensure your Spring Boot controllers have the correct `@RequestMapping("/api")` prefix
- Verify endpoint URLs match between frontend and backend

#### Database Connection
- Make sure MySQL/XAMPP is running
- Verify database credentials in application.properties
- Check that tables are created with correct schema

### 8. Environment Variables
Create a `.env.local` file in your React project root if you need different settings:

```env
REACT_APP_API_URL=http://localhost:8081/api
REACT_APP_BACKEND_URL=http://localhost:8081
```

This setup should connect your React frontend with your Spring Boot backend successfully!