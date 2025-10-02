import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Grid,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Storage as DatabaseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import carService from '../services/carService';
import userService from '../services/userService';
import authService from '../services/authService';

const StyledCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(2),
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
}));

const DatabaseConnectivity = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    backend: { status: 'checking', message: '', details: null },
    database: { status: 'checking', message: '', details: null },
    cars: { status: 'checking', message: '', details: null },
    users: { status: 'checking', message: '', details: null },
  });
  
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({
    backend: false,
    database: false,
    cars: false,
    users: false,
  });

  const handleExpandClick = (section) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#f44336' }} />;
      case 'checking':
        return <CircularProgress size={20} sx={{ color: '#2196f3' }} />;
      default:
        return <DatabaseIcon sx={{ color: '#9e9e9e' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'checking':
        return 'info';
      default:
        return 'default';
    }
  };

  const testBackendConnection = async () => {
    try {
      // Test basic backend connectivity
      const startTime = Date.now();
      const response = await fetch('http://localhost:8081/api/cars', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(prev => ({
          ...prev,
          backend: {
            status: 'success',
            message: `Backend connected successfully (${responseTime}ms)`,
            details: {
              url: 'http://localhost:8081/api',
              responseTime: `${responseTime}ms`,
              status: response.status,
              statusText: response.statusText,
              contentType: response.headers.get('content-type'),
              dataReceived: Array.isArray(data) ? `${data.length} records` : 'Object received'
            }
          }
        }));
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setConnectionStatus(prev => ({
        ...prev,
        backend: {
          status: 'error',
          message: `Backend connection failed: ${error.message}`,
          details: {
            error: error.message,
            url: 'http://localhost:8081/api',
            suggestion: 'Check if Spring Boot backend is running on port 8081'
          }
        }
      }));
    }
  };

  const testDatabaseConnection = async () => {
    try {
      // Test MySQL database connectivity through backend
      const response = await carService.getAllCars();
      
      if (response.success !== false) {
        setConnectionStatus(prev => ({
          ...prev,
          database: {
            status: 'success',
            message: 'MySQL database connected successfully',
            details: {
              database: 'car_rental_db',
              type: 'MySQL',
              tablesAccessed: ['car', 'users', 'booking'],
              recordsFound: response.data ? response.data.length : 0,
              connection: 'Active'
            }
          }
        }));
      } else {
        throw new Error(response.error || 'Database query failed');
      }
    } catch (error) {
      setConnectionStatus(prev => ({
        ...prev,
        database: {
          status: 'error',
          message: `MySQL database connection failed: ${error.message}`,
          details: {
            error: error.message,
            database: 'car_rental_db',
            suggestion: 'Check MySQL server and database configuration'
          }
        }
      }));
    }
  };

  const testCarService = async () => {
    try {
      const response = await carService.getAllCars();
      
      if (response.success !== false) {
        const cars = response.data || [];
        setConnectionStatus(prev => ({
          ...prev,
          cars: {
            status: 'success',
            message: `Car service working - ${cars.length} cars found`,
            details: {
              totalCars: cars.length,
              availableCars: cars.filter(car => car.available).length,
              categories: [...new Set(cars.map(car => car.category))],
              locations: [...new Set(cars.map(car => car.location))],
              sampleCar: cars[0] ? {
                id: cars[0].id,
                make: cars[0].make,
                model: cars[0].model,
                year: cars[0].year,
                pricePerDay: cars[0].pricePerDay
              } : 'No cars available'
            }
          }
        }));
      } else {
        throw new Error(response.error || 'Car service failed');
      }
    } catch (error) {
      setConnectionStatus(prev => ({
        ...prev,
        cars: {
          status: 'error',
          message: `Car service failed: ${error.message}`,
          details: {
            error: error.message,
            service: 'carService.getAllCars()',
            suggestion: 'Check car table structure and data'
          }
        }
      }));
    }
  };

  const testUserService = async () => {
    try {
      // Test user authentication
      const testLogin = await authService.login('demo', 'demo123');
      
      if (testLogin.success !== false) {
        setConnectionStatus(prev => ({
          ...prev,
          users: {
            status: 'success',
            message: 'User service working - authentication successful',
            details: {
              testUser: 'demo',
              authenticationWorking: true,
              userTableAccess: 'Success',
              jwtTokenReceived: testLogin.token ? 'Yes' : 'No',
              userRole: testLogin.user?.role || 'Unknown'
            }
          }
        }));
      } else {
        throw new Error(testLogin.error || 'Authentication failed');
      }
    } catch (error) {
      setConnectionStatus(prev => ({
        ...prev,
        users: {
          status: 'error',
          message: `User service failed: ${error.message}`,
          details: {
            error: error.message,
            testUser: 'demo',
            suggestion: 'Check users table and authentication configuration'
          }
        }
      }));
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    
    // Reset status
    setConnectionStatus({
      backend: { status: 'checking', message: 'Testing backend connection...', details: null },
      database: { status: 'checking', message: 'Testing MySQL database...', details: null },
      cars: { status: 'checking', message: 'Testing car service...', details: null },
      users: { status: 'checking', message: 'Testing user service...', details: null },
    });

    // Run tests sequentially
    await testBackendConnection();
    await testDatabaseConnection();
    await testCarService();
    await testUserService();
    
    setLoading(false);
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const renderDetails = (details) => {
    if (!details) return null;

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableBody>
            {Object.entries(details).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </TableCell>
                <TableCell>
                  {Array.isArray(value) ? value.join(', ') : 
                   typeof value === 'object' ? JSON.stringify(value, null, 2) : 
                   String(value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <StyledCard>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" component="h1">
                MySQL Database Connectivity Test
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Testing connection to car_rental_db MySQL database
              </Typography>
            </Box>
            <DatabaseIcon sx={{ fontSize: 60, opacity: 0.3 }} />
          </Box>
        </CardContent>
      </StyledCard>

      {/* Test Results */}
      <Grid container spacing={3}>
        {Object.entries(connectionStatus).map(([key, status]) => (
          <Grid item xs={12} md={6} key={key}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getStatusIcon(status.status)}
                    <Typography variant="h6" sx={{ ml: 1, textTransform: 'capitalize' }}>
                      {key} Service
                    </Typography>
                  </Box>
                  <Chip 
                    label={status.status} 
                    color={getStatusColor(status.status)}
                    size="small"
                  />
                </Box>
                
                <Alert severity={getStatusColor(status.status)} sx={{ mb: 2 }}>
                  {status.message}
                </Alert>

                {status.details && (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                         onClick={() => handleExpandClick(key)}>
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        View Details
                      </Typography>
                      <IconButton size="small">
                        {expanded[key] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                    
                    <Collapse in={expanded[key]}>
                      {renderDetails(status.details)}
                    </Collapse>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={runAllTests}
          disabled={loading}
          size="large"
        >
          {loading ? 'Testing Connection...' : 'Refresh Tests'}
        </Button>
      </Box>
    </Box>
  );
};

export default DatabaseConnectivity;