import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { env } from '../config/env';

// Token storage keys
const ACCESS_TOKEN_KEY = 'dertour_access_token';
const REFRESH_TOKEN_KEY = 'dertour_refresh_token';

// API Error shape
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Track refresh token promise to prevent multiple simultaneous refresh attempts
let refreshTokenPromise: Promise<string | null> | null = null;

// Event emitter for auth errors (to notify React components)
type AuthErrorHandler = () => void;
const authErrorHandlers: AuthErrorHandler[] = [];

export const onAuthError = (handler: AuthErrorHandler): (() => void) => {
  authErrorHandlers.push(handler);
  return () => {
    const index = authErrorHandlers.indexOf(handler);
    if (index > -1) {
      authErrorHandlers.splice(index, 1);
    }
  };
};

const emitAuthError = (): void => {
  authErrorHandlers.forEach(handler => handler());
};

/**
 * Get the stored access token
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get the stored refresh token
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Store tokens in localStorage
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Clear all stored tokens
 */
export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Attempt to refresh the access token
 */
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      `${env.apiUrl}/auth/refresh`,
      { refreshToken }
    );

    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      setTokens(accessToken, newRefreshToken);
      return accessToken;
    }
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Create and configure the Axios API client
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: `${env.apiUrl}/api`,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - attach JWT token
  client.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle 401 errors and token refresh
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError<ApiError>) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // Handle 401 Unauthorized
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        // Use existing refresh promise or create new one
        if (!refreshTokenPromise) {
          refreshTokenPromise = refreshAccessToken();
        }

        try {
          const newToken = await refreshTokenPromise;
          refreshTokenPromise = null;

          if (newToken && originalRequest.headers) {
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return client(originalRequest);
          }
        } catch (refreshError) {
          refreshTokenPromise = null;
        }

        // Refresh failed - clear tokens and emit auth error
        // Navigation is handled by React Router components listening to auth errors
        clearTokens();
        emitAuthError();
        return Promise.reject(error);
      }

      // Normalize error response
      const normalizedError: ApiError = {
        code: error.response?.data?.code || 'UNKNOWN_ERROR',
        message: error.response?.data?.message || error.message || 'An unexpected error occurred',
        details: error.response?.data?.details,
      };

      return Promise.reject(normalizedError);
    }
  );

  return client;
};

// Export the configured API client instance
export const apiClient = createApiClient();

/**
 * Generic GET request wrapper
 */
export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.get<ApiResponse<T>>(url, config);
  return response.data.data;
};

/**
 * Generic POST request wrapper
 */
export const post = async <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.post<ApiResponse<T>>(url, data, config);
  return response.data.data;
};

/**
 * Generic PUT request wrapper
 */
export const put = async <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.put<ApiResponse<T>>(url, data, config);
  return response.data.data;
};

/**
 * Generic PATCH request wrapper
 */
export const patch = async <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
  return response.data.data;
};

/**
 * Generic DELETE request wrapper
 */
export const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.delete<ApiResponse<T>>(url, config);
  return response.data.data;
};

export default apiClient;
