/**
 * RoleRoute.tsx - Role-Based Route Guard Component
 * 
 * Protects routes that require specific user roles.
 * Redirects to 403 Forbidden page if user lacks required role.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, useUserRole, useIsAuthenticated } from '../../store/authStore';
import { UserRole } from '../../types/api.types';
import ForbiddenPage from '../../pages/errors/ForbiddenPage';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * RoleRoute Component
 * 
 * Wraps protected routes that require specific roles.
 * - Checks authentication first
 * - Then validates role membership
 * - Renders children if authorized
 * - Renders 403 page if role not permitted
 */
const RoleRoute: React.FC<RoleRouteProps> = ({ 
  children, 
  allowedRoles,
  fallback,
}) => {
  const isAuthenticated = useIsAuthenticated();
  const userRole = useUserRole();
  const { isLoading } = useAuth();

  // Show loading while auth state is being determined
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#F5F7FA'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  const hasRequiredRole = userRole && allowedRoles.includes(userRole);

  if (!hasRequiredRole) {
    // Return custom fallback if provided, otherwise show 403 page
    if (fallback) {
      return <>{fallback}</>;
    }
    return <ForbiddenPage />;
  }

  // User is authenticated and has required role
  return <>{children}</>;
};

export default RoleRoute;
