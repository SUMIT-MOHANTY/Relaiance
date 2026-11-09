/**
 * Auth Store - Authentication State Management
 * 
 * Manages JWT tokens, user session, and role-based access control
 * for the DERTOUR Group Functions application.
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { 
  getAccessToken, 
  getRefreshToken, 
  setTokens, 
  clearTokens
} from '../services/apiClient';
import { User, UserRole } from '../types/api.types';

// Token storage keys
const ACCESS_TOKEN_KEY = 'dertour_access_token';
const REFRESH_TOKEN_KEY = 'dertour_refresh_token';

// JWT Payload structure
interface JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Auth State
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth Actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; accessToken: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'REFRESH_TOKEN'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Auth Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'REFRESH_TOKEN':
      return { ...state, accessToken: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Auth Context
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<string | null>;
  clearError: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  getDashboardRoute: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Decode JWT and extract user info
const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch {
    return null;
  }
};

// Build User object from JWT payload
const buildUserFromPayload = (payload: JWTPayload): User => {
  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    name: payload.email.split('@')[0],
    department: 'Unknown',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// Check if token is expired
const isTokenExpired = (token: string): boolean => {
  const payload = decodeToken(token);
  if (!payload) return true;
  return payload.exp * 1000 < Date.now();
};

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Get dashboard route based on user role
  const getDashboardRoute = useCallback((): string => {
    if (!state.user) return '/login';
    
    switch (state.user.role) {
      case UserRole.FINANCE_USER:
        return '/dashboard/finance';
      case UserRole.TEAM_MEMBER:
        return '/dashboard/team';
      case UserRole.EXECUTIVE:
        return '/dashboard/executive';
      case UserRole.SYSTEM_ADMIN:
        return '/admin';
      default:
        return '/dashboard/finance';
    }
  }, [state.user]);

  // Check if user has one of the required roles
  const hasRole = useCallback((roles: UserRole[]): boolean => {
    if (!state.user) return false;
    return roles.includes(state.user.role);
  }, [state.user]);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid email or password. Please try again.');
      }

      const { accessToken, refreshToken } = data.data;
      
      // Store tokens
      setTokens(accessToken, refreshToken);

      // Decode token and build user
      const payload = decodeToken(accessToken);
      if (!payload) {
        throw new Error('Invalid token received');
      }

      const user = buildUserFromPayload(payload);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, accessToken } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      throw error;
    }
  }, []);

  // Logout function - dispatches logout action only
  const logout = useCallback(() => {
    clearTokens();
    dispatch({ type: 'LOGOUT' });
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<string | null> => {
    const currentRefreshToken = getRefreshToken();
    
    if (!currentRefreshToken) {
      logout();
      return null;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error('Token refresh failed');
      }

      const { accessToken, refreshToken: newRefreshToken } = data.data;
      setTokens(accessToken, newRefreshToken);
      dispatch({ type: 'REFRESH_TOKEN', payload: accessToken });
      
      return accessToken;
    } catch {
      logout();
      return null;
    }
  }, [logout]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      const token = getAccessToken();
      
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        // Try to refresh
        const newToken = await refreshToken();
        if (!newToken) {
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
      }

      // Token is valid, restore session
      const payload = decodeToken(token);
      if (payload) {
        const user = buildUserFromPayload(payload);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, accessToken: token } });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkExistingSession();
  }, [refreshToken]);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
    clearError,
    hasRole,
    getDashboardRoute,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook to get current user
export function useCurrentUser(): User | null {
  const { user } = useAuth();
  return user;
}

// Hook to get user role
export function useUserRole(): UserRole | null {
  const { user } = useAuth();
  return user?.role || null;
}

// Hook to check if user is authenticated
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

// Hook to check if auth is loading
export function useAuthLoading(): boolean {
  const { isLoading } = useAuth();
  return isLoading;
}

export default AuthContext;
