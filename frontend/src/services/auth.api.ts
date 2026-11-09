/**
 * auth.api.ts - Authentication API Service
 * 
 * Provides functions for authentication operations:
 * - Login, register, token refresh
 * - Profile retrieval
 */

import { apiClient } from './apiClient';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User,
  ApiResponse,
} from '../types/api.types';

/**
 * Login with email and password
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
  return response.data.data;
}

/**
 * Register a new user account
 */
export async function register(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department?: string;
}): Promise<User> {
  const response = await apiClient.post<ApiResponse<User>>('/auth/register', data);
  return response.data.data;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(token: string): Promise<RefreshTokenResponse> {
  const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', {
    refreshToken: token,
  } as RefreshTokenRequest);
  return response.data.data;
}

/**
 * Get current user profile
 */
export async function getProfile(): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
  return response.data.data;
}

/**
 * Logout user (invalidate tokens on server)
 */
export async function logout(): Promise<void> {
  await apiClient.post<ApiResponse<void>>('/auth/logout');
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<void> {
  await apiClient.post<ApiResponse<void>>('/auth/forgot-password', { email });
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiClient.post<ApiResponse<void>>('/auth/reset-password', {
    token,
    newPassword,
  });
}

// Default export for convenience
export default {
  login,
  register,
  refreshToken,
  getProfile,
  logout,
  requestPasswordReset,
  resetPassword,
};
