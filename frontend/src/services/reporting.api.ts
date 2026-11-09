/**
 * reporting.api.ts - Reporting API Service
 * 
 * Handles all reporting-related API calls including:
 * - Executive dashboard data
 * - Blocked work reports
 * - Next actions
 * - Audit logs
 * - Risk data
 * - Export functionality
 */

import { apiClient } from './apiClient';
import {
  ExecutiveDashboardKPIs,
  BlockedWorkItem,
  NextActionItem,
  AuditLog,
  Risk,
  Decision,
  PaginatedResponse,
  ApiResponse,
  RiskSeverity,
  RiskStatus,
  RiskCategory,
  DecisionType,
  DecisionStatus,
} from '../types/api.types';

// ============================================================================
// EXECUTIVE DASHBOARD
// ============================================================================

export const getExecutiveDashboard = async (): Promise<ExecutiveDashboardKPIs> => {
  const response = await apiClient.get<ApiResponse<ExecutiveDashboardKPIs>>('/reporting/executive-dashboard');
  return response.data.data;
};

export const exportExecutiveSummary = async (): Promise<Blob> => {
  const response = await apiClient.get('/reporting/export/executive-summary', {
    responseType: 'blob',
  });
  return response.data;
};

// ============================================================================
// BLOCKED WORK
// ============================================================================

export const getBlockedWork = async (): Promise<BlockedWorkItem[]> => {
  const response = await apiClient.get<ApiResponse<BlockedWorkItem[]>>('/reporting/blocked-work');
  return response.data.data;
};

export const exportBlockedWork = async (): Promise<Blob> => {
  const response = await apiClient.get('/reporting/export/blocked-work', {
    responseType: 'blob',
  });
  return response.data;
};

// ============================================================================
// NEXT ACTIONS
// ============================================================================

export const getNextActions = async (): Promise<NextActionItem[]> => {
  const response = await apiClient.get<ApiResponse<NextActionItem[]>>('/reporting/next-actions');
  return response.data.data;
};

export const exportNextActions = async (): Promise<Blob> => {
  const response = await apiClient.get('/reporting/export/next-actions', {
    responseType: 'blob',
  });
  return response.data;
};

// ============================================================================
// RISKS
// ============================================================================

export interface RiskFilters {
  severities?: RiskSeverity[];
  statuses?: RiskStatus[];
  categories?: RiskCategory[];
  initiativeId?: string;
  search?: string;
}

export const getRisks = async (filters?: RiskFilters): Promise<Risk[]> => {
  const params = new URLSearchParams();
  
  if (filters?.severities?.length) {
    filters.severities.forEach(s => params.append('severity', s));
  }
  if (filters?.statuses?.length) {
    filters.statuses.forEach(s => params.append('status', s));
  }
  if (filters?.categories?.length) {
    filters.categories.forEach(c => params.append('category', c));
  }
  if (filters?.initiativeId) {
    params.append('initiativeId', filters.initiativeId);
  }
  if (filters?.search) {
    params.append('search', filters.search);
  }

  const response = await apiClient.get<ApiResponse<Risk[]>>(`/risks?${params.toString()}`);
  return response.data.data;
};

export const getRiskById = async (id: string): Promise<Risk> => {
  const response = await apiClient.get<ApiResponse<Risk>>(`/risks/${id}`);
  return response.data.data;
};

export const exportRisks = async (filters?: RiskFilters): Promise<Blob> => {
  const params = new URLSearchParams();
  
  if (filters?.severities?.length) {
    filters.severities.forEach(s => params.append('severity', s));
  }
  if (filters?.statuses?.length) {
    filters.statuses.forEach(s => params.append('status', s));
  }

  const response = await apiClient.get(`/risks/export?${params.toString()}`, {
    responseType: 'blob',
  });
  return response.data;
};

// ============================================================================
// DECISIONS
// ============================================================================

export interface CreateDecisionInput {
  initiativeId: string;
  title: string;
  description: string;
  decisionType: DecisionType;
  requiredByDate?: string;
  implementationTargetDate?: string;
}

export const createDecision = async (input: CreateDecisionInput): Promise<Decision> => {
  const response = await apiClient.post<ApiResponse<Decision>>(`/initiatives/${input.initiativeId}/decisions`, input);
  return response.data.data;
};

export const getDecisions = async (initiativeId?: string): Promise<Decision[]> => {
  const url = initiativeId ? `/initiatives/${initiativeId}/decisions` : '/decisions';
  const response = await apiClient.get<ApiResponse<Decision[]>>(url);
  return response.data.data;
};

// ============================================================================
// AUDIT LOGS
// ============================================================================

export interface AuditLogFilters {
  page?: number;
  pageSize?: number;
  entityType?: string;
  action?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export const getAuditLogs = async (filters?: AuditLogFilters): Promise<PaginatedResponse<AuditLog>> => {
  const params = new URLSearchParams();
  
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
  if (filters?.entityType) params.append('entityType', filters.entityType);
  if (filters?.action) params.append('action', filters.action);
  if (filters?.userId) params.append('userId', filters.userId);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const response = await apiClient.get<ApiResponse<PaginatedResponse<AuditLog>>>(`/admin/audit-logs?${params.toString()}`);
  return response.data.data;
};

// ============================================================================
// CSV EXPORT UTILITY
// ============================================================================

export const downloadCsv = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const jsonToCsv = (data: unknown[]): string => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0] as Record<string, unknown>);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = (row as Record<string, unknown>)[header];
      const stringValue = value === null || value === undefined ? '' : String(value);
      // Escape values containing commas or quotes
      if (stringValue.includes(',') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};
