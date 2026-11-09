/**
 * Environment Configuration
 * 
 * Centralized access to environment variables with sensible defaults
 * for the DERTOUR Group Functions application.
 */

export interface EnvConfig {
  /** API base URL */
  apiUrl: string;
  /** Application name */
  appName: string;
  /** Environment mode */
  mode: 'development' | 'production' | 'test';
  /** Enable debug logging */
  debug: boolean;
}

/**
 * Get environment variable with fallback
 */
const getEnvVar = (key: string, fallback: string): string => {
  return import.meta.env[key] || fallback;
};

/**
 * Get boolean environment variable
 */
const getBoolEnvVar = (key: string, fallback: boolean): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
};

/**
 * Application environment configuration
 */
export const env: EnvConfig = {
  apiUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:4000'),
  appName: getEnvVar('VITE_APP_NAME', 'DERTOUR Group Functions'),
  mode: (import.meta.env.MODE as 'development' | 'production' | 'test') || 'development',
  debug: getBoolEnvVar('VITE_DEBUG', import.meta.env.DEV || false),
};

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => env.mode === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = (): boolean => env.mode === 'production';

/**
 * Log environment configuration (development only)
 */
export const logEnvConfig = (): void => {
  if (isDevelopment()) {
    // eslint-disable-next-line no-console
    console.log('[EnvConfig] Environment:', env);
  }
};

export default env;
