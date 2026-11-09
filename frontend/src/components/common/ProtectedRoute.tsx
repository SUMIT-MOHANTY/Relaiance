/**
 * ProtectedRoute - Authentication Guard Component
 * 
 * Wraps routes that require authentication. Redirects unauthenticated users
 * to the login page with the attempted URL preserved for post-login redirect.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { Box, CircularProgress } from '@mui/material';
import { DERTOUR_COLORS } from '../../config/theme';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: DERTOUR_COLORS.background,
        }}
      >
        <CircularProgress
          size={48}
          sx={{
            color: DERTOUR_COLORS.primary,
          }}
        />
      </Box>
    );
  }

  // Redirect to login if not authenticated, preserving the attempted URL
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  // Render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
