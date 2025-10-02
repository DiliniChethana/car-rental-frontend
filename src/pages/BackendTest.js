import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import api from '../services/api';
import authService from '../services/authService';
import carService from '../services/carService';

const BackendTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTest = async (testName, testFunction) => {
    setLoading(true);
    try {
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, data: result }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { 
          success: false, 
          error: error.message,
          details: error.response?.data 
        }
      }));
    }
    setLoading(false);
  };

  const testBackendConnection = async () => {
    const response = await api.get('/health');
    return response.data;
  };

  const testAuthEndpoint = async () => {
    const response = await api.post('/auth/test', {});
    return response.data;
  };

  const testCarsEndpoint = async () => {
    const response = await carService.getAllCars();
    return response.data;
  };

  const testLoginEndpoint = async () => {
    // Test with dummy credentials (this should fail but show if endpoint exists)
    try {
      const response = await authService.login({
        email: 'test@test.com',
        password: 'test123'
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 400) {
        return { message: 'Login endpoint is working (credentials were invalid as expected)' };
      }
      throw error;
    }
  };

  const TestResult = ({ testName, result }) => {
    if (!result) return null;

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {testName}
          </Typography>
          {result.success ? (
            <Alert severity="success">
              Test passed! 
              {result.data && (
                <pre style={{ marginTop: 8, fontSize: '12px' }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </Alert>
          ) : (
            <Alert severity="error">
              Test failed: {result.error}
              {result.details && (
                <pre style={{ marginTop: 8, fontSize: '12px' }}>
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              )}
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Backend Connection Test
      </Typography>
      
      <Typography variant="body1" paragraph>
        Use this page to test the connection between your React frontend and Spring Boot backend.
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Backend Configuration
        </Typography>
        <Typography variant="body2">
          API URL: {process.env.REACT_APP_API_URL || 'http://localhost:8081/api'}
        </Typography>
        <Typography variant="body2">
          Backend URL: {process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081'}
        </Typography>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => runTest('Backend Health', testBackendConnection)}
            disabled={loading}
          >
            Test Health Endpoint
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => runTest('Auth Endpoint', testAuthEndpoint)}
            disabled={loading}
          >
            Test Auth Endpoint
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => runTest('Cars Endpoint', testCarsEndpoint)}
            disabled={loading}
          >
            Test Cars Endpoint
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => runTest('Login Endpoint', testLoginEndpoint)}
            disabled={loading}
          >
            Test Login Endpoint
          </Button>
        </Grid>
      </Grid>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress />
        </Box>
      )}

      <Box>
        <TestResult testName="Backend Health" result={testResults['Backend Health']} />
        <TestResult testName="Auth Endpoint" result={testResults['Auth Endpoint']} />
        <TestResult testName="Cars Endpoint" result={testResults['Cars Endpoint']} />
        <TestResult testName="Login Endpoint" result={testResults['Login Endpoint']} />
      </Box>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Expected Results:</strong>
          <br />
          • Health endpoint: Should return 200 OK
          <br />
          • Auth endpoint: Should return 404 if not implemented, or proper response
          <br />
          • Cars endpoint: Should return cars data or 404/401
          <br />
          • Login endpoint: Should return 400/401 for invalid credentials
        </Typography>
      </Alert>
    </Container>
  );
};

export default BackendTest;