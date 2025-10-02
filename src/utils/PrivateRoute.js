import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

/**
 * PrivateRoute component for protecting routes that require authentication
 * @param {Object} props - Component props
 * @param {React.Component} props.children - Child components to render if authenticated
 * @param {Array} props.roles - Array of roles that are allowed to access this route
 * @param {string} props.redirectTo - Path to redirect to if not authenticated (default: '/login')
 * @returns {React.Component} - Protected component or redirect
 */
const PrivateRoute = ({ 
  children, 
  roles = [], 
  redirectTo = '/login',
  requireAuth = true 
}) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    // Redirect to login with the current location as state
    // so we can redirect back after login
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check if specific roles are required
  if (roles.length > 0 && currentUser) {
    const userRole = currentUser.role;
    const hasRequiredRole = roles.includes(userRole);
    
    if (!hasRequiredRole) {
      // User doesn't have required role, redirect to unauthorized page or home
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and has required permissions
  return children;
};

/**
 * AdminRoute component for protecting admin-only routes
 * @param {Object} props - Component props
 * @param {React.Component} props.children - Child components to render if user is admin
 * @returns {React.Component} - Protected component or redirect
 */
export const AdminRoute = ({ children }) => {
  return (
    <PrivateRoute roles={['admin']}>
      {children}
    </PrivateRoute>
  );
};

/**
 * UserRoute component for protecting user routes (both user and admin can access)
 * @param {Object} props - Component props
 * @param {React.Component} props.children - Child components to render if authenticated
 * @returns {React.Component} - Protected component or redirect
 */
export const UserRoute = ({ children }) => {
  return (
    <PrivateRoute roles={['user', 'admin']}>
      {children}
    </PrivateRoute>
  );
};

/**
 * PublicRoute component for routes that should only be accessible when NOT authenticated
 * (e.g., login, register pages)
 * @param {Object} props - Component props
 * @param {React.Component} props.children - Child components to render if not authenticated
 * @param {string} props.redirectTo - Path to redirect to if authenticated (default: '/')
 * @returns {React.Component} - Public component or redirect
 */
export const PublicRoute = ({ children, redirectTo = '/' }) => {
  const isAuthenticated = authService.isAuthenticated();

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

/**
 * ConditionalRoute component for routes with custom conditions
 * @param {Object} props - Component props
 * @param {React.Component} props.children - Child components to render if condition is met
 * @param {Function} props.condition - Function that returns boolean for access permission
 * @param {string} props.redirectTo - Path to redirect to if condition fails
 * @returns {React.Component} - Protected component or redirect
 */
export const ConditionalRoute = ({ children, condition, redirectTo = '/' }) => {
  const hasAccess = condition();

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default PrivateRoute;