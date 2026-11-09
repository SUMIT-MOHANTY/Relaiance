/**
 * Admin API Service
 * 
 * Provides typed client functions for all /api/admin/* endpoints
 * including user management, data reseed, audit logs, and configuration.
 */

import { apiClient } from './apiClient';
import {
  User,
  CreateUserInput,
  UpdateUserInput,
  UpdateUserRoleInput,
  AuditLog,
  AuditLogFilters,
  Configuration,
  CreateConfigurationInput,
  UpdateConfigurationInput,
  PaginatedResponse,
  EntityType,
  UserRole,
} from '../types/api.types';

// ============================================================================
// User Management API
// ============================================================================

export interface ListUsersFilters {
  role?: UserRole;
  isActive?: boolean;
  department?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ImportDataInput {
  type: 'seed' | 'custom';
  data?: unknown;
}

export interface DataResetResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface ImportDataResponse {
  success: boolean;
  message: string;
  recordsImported: number;
}

/**
 * Get all users with optional filtering
 */
export const getUsers = async (
  filters: ListUsersFilters = {}
): Promise<PaginatedResponse<User>> => {
  const params = new URLSearchParams();
  
  if (filters.role) params.append('role', filters.role);
  if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters.department) params.append('department', filters.department);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const response = await apiClient.get<PaginatedResponse<User>>(
    `/users?${params.toString()}`
  );
  return response.data;
};

/**
 * Get a single user by ID
 */
export const getUserById = async (id: string): Promise<User> => {
  const response = await apiClient.get<User>(`/users/${id}`);
  return response.data;
};

/**
 * Invite/create a new user
 */
export const inviteUser = async (input: CreateUserInput): Promise<User> => {
  const response = await apiClient.post<User>('/users', input);
  return response.data;
};

/**
 * Update user details
 */
export const updateUser = async (
  id: string,
  input: UpdateUserInput
): Promise<User> => {
  const response = await apiClient.put<User>(`/users/${id}`, input);
  return response.data;
};

/**
 * Update user role
 */
export const updateUserRole = async (
  id: string,
  input: UpdateUserRoleInput
): Promise<User> => {
  const response = await apiClient.put<User>(`/users/${id}/role`, input);
  return response.data;
};

/**
 * Deactivate/delete a user
 */
export const deactivateUser = async (id: string): Promise<void> => {
  await apiClient.delete(`/users/${id}`);
};

// ============================================================================
// Data Management API
// ============================================================================

/**
 * Reset all data to initial state
 * User accounts are preserved
 */
export const resetAllData = async (): Promise<DataResetResponse> => {
  const response = await apiClient.post<DataResetResponse>('/data/reset');
  return response.data;
};

/**
 * Import seed/demo data
 */
export const importSeedData = async (): Promise<ImportDataResponse> => {
  const response = await apiClient.post<ImportDataResponse>('/data/import', {
    type: 'seed',
  });
  return response.data;
};

// ============================================================================
// Audit Log API
// ============================================================================

/**
 * Get audit logs with filtering and pagination
 */
export const getAuditLogs = async (
  filters: AuditLogFilters = {}
): Promise<PaginatedResponse<AuditLog>> => {
  const params = new URLSearchParams();
  
  if (filters.entityTypes && filters.entityTypes.length > 0) {
    filters.entityTypes.forEach((type) => params.append('entityType', type));
  }
  if (filters.actorId) params.append('actorId', filters.actorId);
  if (filters.action) params.append('action', filters.action);
  if (filters.fromDate) params.append('fromDate', filters.fromDate);
  if (filters.toDate) params.append('toDate', filters.toDate);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const response = await apiClient.get<PaginatedResponse<AuditLog>>(
    `/audit-log?${params.toString()}`
  );
  return response.data;
};

/**
 * Get all unique entity types for filtering
 */
export const getEntityTypes = (): EntityType[] => {
  return Object.values(EntityType);
};

// ============================================================================
// Configuration API
// ============================================================================

/**
 * Get all configuration entries
 */
export const getConfigurations = async (): Promise<Configuration[]> => {
  const response = await apiClient.get<Configuration[]>('/system/config');
  return response.data;
};

/**
 * Get a single configuration by ID
 */
export const getConfigurationById = async (id: string): Promise<Configuration> => {
  const response = await apiClient.get<Configuration>(`/system/config/${id}`);
  return response.data;
};

/**
 * Create a new configuration entry
 */
export const createConfiguration = async (
  input: CreateConfigurationInput
): Promise<Configuration> => {
  const response = await apiClient.post<Configuration>('/system/config', input);
  return response.data;
};

/**
 * Update a configuration entry
 */
export const updateConfiguration = async (
  id: string,
  input: UpdateConfigurationInput
): Promise<Configuration> => {
  const response = await apiClient.put<Configuration>(`/system/config/${id}`, input);
  return response.data;
};

/**
 * Delete a configuration entry
 */
export const deleteConfiguration = async (id: string): Promise<void> => {
  await apiClient.delete(`/system/config/${id}`);
};

// ============================================================================
// System Health API
// ============================================================================

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: 'connected' | 'disconnected';
    cache: 'connected' | 'disconnected';
    api: 'healthy' | 'unhealthy';
  };
}

/**
 * Get system health status
 */
export const getSystemHealth = async (): Promise<SystemHealth> => {
  const response = await apiClient.get<SystemHealth>('/system/health');
  return response.data;
};

// ============================================================================
// Export all admin API functions
// ============================================================================

export const adminApi = {
  // Users
  getUsers,
  getUserById,
  inviteUser,
  updateUser,
  updateUserRole,
  deactivateUser,
  
  // Data Management
  resetAllData,
  importSeedData,
  
  // Audit Logs
  getAuditLogs,
  getEntityTypes,
  
  // Configuration
  getConfigurations,
  getConfigurationById,
  createConfiguration,
  updateConfiguration,
  deleteConfiguration,
  
  // System Health
  getSystemHealth,
};

export default adminApi;
