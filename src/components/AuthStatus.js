import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Alert,
  Divider,
} from '@mui/material';
import authService from '../services/authService';

const AuthStatus = () => {
  const [authInfo, setAuthInfo] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  const checkAuthStatus = () => {
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getCurrentUser();
    const token = authService.getToken();
    
    setAuthInfo({
      isAuthenticated,
      user,
      token: token ? token.substring(0, 20) + '...' : null,
    });
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleRefresh = () => {
    checkAuthStatus();
  };

  const handleLogout = () => {
    authService.logout();
    checkAuthStatus();
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            🔐 Authentication Status
          </Typography>
          <Box>
            <Button onClick={handleRefresh} size="small" sx={{ mr: 1 }}>
              Refresh
            </Button>
            {authInfo.isAuthenticated && (
              <Button onClick={handleLogout} size="small" color="error">
                Logout
              </Button>
            )}
          </Box>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Chip
            label={authInfo.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            color={authInfo.isAuthenticated ? 'success' : 'error'}
            size="small"
          />
        </Box>

        {authInfo.isAuthenticated && authInfo.user ? (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              User Information:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Username:</strong> {authInfo.user.username || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Name:</strong> {authInfo.user.firstName} {authInfo.user.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Email:</strong> {authInfo.user.email || 'N/A'}
            </Typography>
            {authInfo.token && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>Token:</strong> {authInfo.token}
                </Typography>
              </>
            )}
          </Box>
        ) : (
          <Alert severity="warning" size="small">
            Please login to access booking functionality
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthStatus;