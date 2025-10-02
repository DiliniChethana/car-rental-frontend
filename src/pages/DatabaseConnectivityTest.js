import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Alert,
  Card,
  CardContent,
  Grid,
  TextField,
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as ErrorIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Storage as DatabaseIcon,
  Security as AuthIcon,
  DirectionsCar as CarIcon,
  Book as BookIcon,
} from '@mui/icons-material';
import authService from '../services/authService';
import carService from '../services/carService';
import bookingService from '../services/bookingService';
import api from '../services/api';

const DatabaseConnectivityTest = () => {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [testCredentials, setTestCredentials] = useState({
    username: 'testuser',
    password: 'password123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User'
  });

  const addResult = (test, status, message, data = null) => {
    setTestResults(prev => [...prev, {
      test,
      status, // 'success', 'error', 'warning'
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Test basic backend connectivity
  const testBackendConnection = async () => {
    try {
      // Test if backend is running by trying any endpoint
      const response = await fetch('http://localhost:8081/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.status === 404) {
        addResult('Backend Connection', 'warning', 'Backend is running but /api/health endpoint not found (normal)');
      } else if (response.status === 401) {
        addResult('Backend Connection', 'success', 'Backend is running and responding (401 is expected for protected endpoints)');
      } else {
        addResult('Backend Connection', 'success', `Backend responded with status: ${response.status}`);
      }
    } catch (error) {
      addResult('Backend Connection', 'error', `Cannot connect to backend: ${error.message}`);
    }
  };

  // Test authentication endpoints
  const testAuthEndpoints = async () => {
    try {
      // Test register endpoint
      try {
        const registerResponse = await authService.register({
          username: `testuser_${Date.now()}`,
          password: 'password123',
          email: `test${Date.now()}@example.com`,
          firstName: 'Test',
          lastName: 'User'
        });
        addResult('Auth - Register', 'success', 'Registration successful', registerResponse.data);
      } catch (error) {
        if (error.response?.status === 409) {
          addResult('Auth - Register', 'warning', 'User already exists (this is normal)');
        } else {
          addResult('Auth - Register', 'error', `Registration failed: ${error.response?.data?.message || error.message}`);
        }
      }

      // Test login endpoint with existing user
      try {
        const loginResponse = await authService.login({
          username: testCredentials.username,
          password: testCredentials.password
        });
        addResult('Auth - Login', 'success', 'Login successful', loginResponse.data);
      } catch (error) {
        if (error.response?.status === 401) {
          addResult('Auth - Login', 'warning', 'Login failed - user may not exist or wrong credentials');
        } else {
          addResult('Auth - Login', 'error', `Login failed: ${error.response?.data?.message || error.message}`);
        }
      }
    } catch (error) {
      addResult('Auth Endpoints', 'error', `General auth error: ${error.message}`);
    }
  };

  // Test cars endpoints
  const testCarsEndpoints = async () => {
    try {
      // Test get all cars
      const carsResponse = await carService.getAllCars();
      if (carsResponse.data && Array.isArray(carsResponse.data)) {
        addResult('Cars - Get All', 'success', `Found ${carsResponse.data.length} cars in database`, carsResponse.data);
      } else {
        addResult('Cars - Get All', 'warning', 'Cars endpoint responded but no car data found');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        addResult('Cars - Get All', 'warning', 'Cars endpoint requires authentication');
      } else {
        addResult('Cars - Get All', 'error', `Cars fetch failed: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test creating a car (if authenticated)
    try {
      const testCar = {
        make: 'Test',
        model: 'Car',
        year: 2023,
        category: 'Economy',
        pricePerDay: 50.00,
        location: 'Test Location',
        seats: 4,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        features: ['Test Feature'],
        description: 'Test car for connectivity',
        isAvailable: true
      };
      
      const createResponse = await carService.createCar(testCar);
      addResult('Cars - Create', 'success', 'Car creation successful', createResponse.data);
    } catch (error) {
      if (error.response?.status === 401) {
        addResult('Cars - Create', 'warning', 'Car creation requires authentication');
      } else if (error.response?.status === 403) {
        addResult('Cars - Create', 'warning', 'Car creation requires admin privileges');
      } else {
        addResult('Cars - Create', 'error', `Car creation failed: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // Test booking endpoints
  const testBookingEndpoints = async () => {
    try {
      // Test get user bookings
      const bookingsResponse = await bookingService.getUserBookings();
      if (bookingsResponse.data && Array.isArray(bookingsResponse.data)) {
        addResult('Booking - Get User Bookings', 'success', `Found ${bookingsResponse.data.length} bookings`, bookingsResponse.data);
      } else {
        addResult('Booking - Get User Bookings', 'warning', 'Bookings endpoint responded but no booking data found');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        addResult('Booking - Get User Bookings', 'warning', 'Booking endpoint requires authentication');
      } else {
        addResult('Booking - Get User Bookings', 'error', `Bookings fetch failed: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setLoading(true);
    clearResults();
    
    addResult('Test Session', 'success', 'Starting comprehensive database connectivity tests...');
    
    await testBackendConnection();
    await testAuthEndpoints();
    await testCarsEndpoints();
    await testBookingEndpoints();
    
    addResult('Test Session', 'success', 'All tests completed. Review results above.');
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckIcon color="success" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'warning': return <WarningIcon color="warning" />;
      default: return <DatabaseIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Database Connectivity Test
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          This tool tests all database connections and API endpoints to help diagnose connectivity issues.
        </Typography>
      </Box>

      {/* Test Configuration */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Configuration
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Test Username"
                value={testCredentials.username}
                onChange={(e) => setTestCredentials(prev => ({ ...prev, username: e.target.value }))}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Test Password"
                type="password"
                value={testCredentials.password}
                onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          onClick={runAllTests}
          disabled={loading}
          size="large"
          startIcon={loading ? <CircularProgress size={20} /> : <DatabaseIcon />}
        >
          {loading ? 'Running Tests...' : 'Run All Database Tests'}
        </Button>
        {testResults.length > 0 && (
          <Button
            variant="outlined"
            onClick={clearResults}
            sx={{ ml: 2 }}
          >
            Clear Results
          </Button>
        )}
      </Box>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Test Results ({testResults.length} tests)
            </Typography>
            <List>
              {testResults.map((result, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      {getStatusIcon(result.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{result.test}</Typography>
                          <Chip
                            label={result.status}
                            color={getStatusColor(result.status)}
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {result.timestamp}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">{result.message}</Typography>
                          {result.data && (
                            <Accordion sx={{ mt: 1 }}>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="caption">View Response Data</Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <pre style={{ fontSize: '0.75rem', overflow: 'auto' }}>
                                  {JSON.stringify(result.data, null, 2)}
                                </pre>
                              </AccordionDetails>
                            </Accordion>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < testResults.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Troubleshooting Guide
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>If tests fail:</strong>
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Ensure your Spring Boot backend is running on port 8081</li>
            <li>Check that your database (XAMPP/MySQL) is running</li>
            <li>Verify your backend has the correct API endpoints (/api/auth/login, /api/cars, etc.)</li>
            <li>Check CORS configuration in your Spring Boot application</li>
            <li>Review the console logs for detailed error messages</li>
          </ul>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DatabaseConnectivityTest;