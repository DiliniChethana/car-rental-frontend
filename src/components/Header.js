import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import authService from '../services/authService';

const Header = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      const user = authService.getCurrentUser();
      setIsAuthenticated(authenticated);
      setCurrentUser(user);
    };

    checkAuth();

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleCarsClick = () => {
    navigate('/cars');
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleProfileMenuClose();
  };

  const handleAdminClick = () => {
    navigate('/admin/users');
    handleProfileMenuClose();
  };

  const handleCarAdminClick = () => {
    navigate('/admin/cars');
    handleProfileMenuClose();
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setCurrentUser(null);
      handleProfileMenuClose();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if API call fails
      setIsAuthenticated(false);
      setCurrentUser(null);
      handleProfileMenuClose();
      navigate('/');
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin' || 
                  currentUser?.role === 'ADMIN' || 
                  currentUser?.authorities?.some(auth => auth.authority === 'ROLE_ADMIN');

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="logo"
          onClick={handleLogoClick}
          sx={{ mr: 2 }}
        >
          <DirectionsCarIcon />
        </IconButton>
        
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={handleLogoClick}
        >
          CarRental
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button color="inherit" onClick={handleLogoClick}>
            Home
          </Button>
          <Button color="inherit" onClick={handleCarsClick}>
            Cars
          </Button>
          
          {isAuthenticated ? (
            <>
              <Button
                color="inherit"
                onClick={handleProfileMenuOpen}
                startIcon={<AccountCircleIcon />}
              >
                {currentUser?.firstName || 'User'}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
              >
                <MenuItem onClick={handleProfileClick}>
                  Profile
                </MenuItem>
                {isAdmin && (
                  <MenuItem onClick={handleAdminClick}>
                    <AdminPanelSettingsIcon sx={{ mr: 1 }} />
                    User Management
                  </MenuItem>
                )}
                {isAdmin && (
                  <MenuItem onClick={handleCarAdminClick}>
                    <DirectionsCarIcon sx={{ mr: 1 }} />
                    Car Management
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" onClick={handleLoginClick}>
              <AccountCircleIcon sx={{ mr: 1 }} />
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;