/**
 * initiative.api.ts - API service for initiative-related endpoints
 */

import { apiClient, get, post, put, patch, del } from './apiClient';
import {
  Initiative,
  Milestone,
  Risk,
  Decision,
  Benefit,
  AdoptionSignal,
  InitiativeFilters,
  PaginatedResponse,
  DependencyGraph,
  InitiativeDependency,
} from '../types/api.types';

const INITIATIVES_BASE = '/initiatives';

// ============================================================================
// INITIATIVE API
// ============================================================================

export const getInitiatives = async (
  filters?: InitiativeFilters
): Promise<PaginatedResponse<Initiative>> => {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.department) params.append('department', filters.department);
    if (filters.ownerId) params.append('ownerId', filters.ownerId);
    if (filters.search) params.append('search', filters.search);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  }
  
  const queryString = params.toString();
  const url = queryString ? `${INITIATIVES_BASE}?${queryString}` : INITIATIVES_BASE;
  
  return get<PaginatedResponse<Initiative>>(url);
};

export const getInitiativeById = async (id: string): Promise<Initiative> => {
  return get<Initiative>(`${INITIATIVES_BASE}/${id}`);
};

export const createInitiative = async (
  data: Omit<Initiative, 'id' | 'createdAt' | 'updatedAt' | 'owner'>
): Promise<Initiative> => {
  return post<Initiative>(INITIATIVES_BASE, data);
};

export const updateInitiative = async (
  id: string,
  data: Partial<Initiative>
): Promise<Initiative> => {
  return put<Initiative>(`${INITIATIVES_BASE}/${id}`, data);
};

export const patchInitiative = async (
  id: string,
  data: Partial<Initiative>
): Promise<Initiative> => {
  return patch<Initiative>(`${INITIATIVES_BASE}/${id}`, data);
};

export const deleteInitiative = async (id: string): Promise<void> => {
  return del<void>(`${INITIATIVES_BASE}/${id}`);
};

// ============================================================================
// MILESTONE API
// ============================================================================

export const getMilestones = async (
  initiativeId?: string
): Promise<Milestone[]> => {
  const url = initiativeId 
    ? `${INITIATIVES_BASE}/${initiativeId}/milestones`
    : '/milestones';
  return get<Milestone[]>(url);
};

export const getMilestoneById = async (id: string): Promise<Milestone> => {
  return get<Milestone>(`/milestones/${id}`);
};

export const createMilestone = async (
  initiativeId: string,
  data: Omit<Milestone, 'id' | 'initiativeId' | 'createdAt' | 'updatedAt' | 'initiative'>
): Promise<Milestone> => {
  return post<Milestone>(`${INITIATIVES_BASE}/${initiativeId}/milestones`, data);
};

export const updateMilestone = async (
  id: string,
  data: Partial<Milestone>
): Promise<Milestone> => {
  return put<Milestone>(`/milestones/${id}`, data);
};

export const deleteMilestone = async (id: string): Promise<void> => {
  return del<void>(`/milestones/${id}`);
};

// ============================================================================
// RISK API
// ============================================================================

export const getRisks = async (
  initiativeId?: string
): Promise<Risk[]> => {
  const url = initiativeId 
    ? `${INITIATIVES_BASE}/${initiativeId}/risks`
    : '/risks';
  return get<Risk[]>(url);
};

export const getRiskById = async (id: string): Promise<Risk> => {
  return get<Risk>(`/risks/${id}`);
};

export const createRisk = async (
  initiativeId: string,
  data: Omit<Risk, 'id' | 'initiativeId' | 'createdAt' | 'updatedAt' | 'initiative' | 'owner' | 'score'>
): Promise<Risk> => {
  return post<Risk>(`${INITIATIVES_BASE}/${initiativeId}/risks`, data);
};

export const updateRisk = async (
  id: string,
  data: Partial<Risk>
): Promise<Risk> => {
  return put<Risk>(`/risks/${id}`, data);
};

export const deleteRisk = async (id: string): Promise<void> => {
  return del<void>(`/risks/${id}`);
};

export const escalateRisk = async (
  id: string,
  escalatedTo: string
): Promise<Risk> => {
  return post<Risk>(`/risks/${id}/escalate`, { escalatedTo });
};

// ============================================================================
// DECISION API
// ============================================================================

export const getDecisions = async (
  initiativeId?: string
): Promise<Decision[]> => {
  const url = initiativeId 
    ? `${INITIATIVES_BASE}/${initiativeId}/decisions`
    : '/decisions';
  return get<Decision[]>(url);
};

export const getDecisionById = async (id: string): Promise<Decision> => {
  return get<Decision>(`/decisions/${id}`);
};

export const createDecision = async (
  initiativeId: string,
  data: Omit<Decision, 'id' | 'initiativeId' | 'createdAt' | 'updatedAt' | 'initiative' | 'requestedBy' | 'decidedBy'>
): Promise<Decision> => {
  return post<Decision>(`${INITIATIVES_BASE}/${initiativeId}/decisions`, data);
};

export const updateDecision = async (
  id: string,
  data: Partial<Decision>
): Promise<Decision> => {
  return put<Decision>(`/decisions/${id}`, data);
};

export const approveDecision = async (
  id: string,
  rationale: string
): Promise<Decision> => {
  return post<Decision>(`/decisions/${id}/approve`, { rationale });
};

export const rejectDecision = async (
  id: string,
  rationale: string
): Promise<Decision> => {
  return post<Decision>(`/decisions/${id}/reject`, { rationale });
};

// ============================================================================
// BENEFIT API
// ============================================================================

export const getBenefits = async (
  initiativeId?: string
): Promise<Benefit[]> => {
  const url = initiativeId 
    ? `${INITIATIVES_BASE}/${initiativeId}/benefits`
    : '/benefits';
  return get<Benefit[]>(url);
};

export const getBenefitById = async (id: string): Promise<Benefit> => {
  return get<Benefit>(`/benefits/${id}`);
};

export const createBenefit = async (
  initiativeId: string,
  data: Omit<Benefit, 'id' | 'initiativeId' | 'createdAt' | 'updatedAt' | 'initiative'>
): Promise<Benefit> => {
  return post<Benefit>(`${INITIATIVES_BASE}/${initiativeId}/benefits`, data);
};

export const updateBenefit = async (
  id: string,
  data: Partial<Benefit>
): Promise<Benefit> => {
  return put<Benefit>(`/benefits/${id}`, data);
};

export const deleteBenefit = async (id: string): Promise<void> => {
  return del<void>(`/benefits/${id}`);
};

// ============================================================================
// ADOPTION SIGNAL API
// ============================================================================

export const getAdoptionSignals = async (
  initiativeId?: string
): Promise<AdoptionSignal[]> => {
  const url = initiativeId 
    ? `${INITIATIVES_BASE}/${initiativeId}/adoption-signals`
    : '/adoption-signals';
  return get<AdoptionSignal[]>(url);
};

export const getAdoptionSignalById = async (id: string): Promise<AdoptionSignal> => {
  return get<AdoptionSignal>(`/adoption-signals/${id}`);
};

export const createAdoptionSignal = async (
  initiativeId: string,
  data: Omit<AdoptionSignal, 'id' | 'initiativeId' | 'createdAt' | 'initiative' | 'recordedBy'>
): Promise<AdoptionSignal> => {
  return post<AdoptionSignal>(`${INITIATIVES_BASE}/${initiativeId}/adoption-signals`, data);
};

export const updateAdoptionSignal = async (
  id: string,
  data: Partial<AdoptionSignal>
): Promise<AdoptionSignal> => {
  return put<AdoptionSignal>(`/adoption-signals/${id}`, data);
};

export const deleteAdoptionSignal = async (id: string): Promise<void> => {
  return del<void>(`/adoption-signals/${id}`);
};

// ============================================================================
// DEPENDENCY API
// ============================================================================

export const getDependencyGraph = async (
  initiativeId: string
): Promise<DependencyGraph> => {
  return get<DependencyGraph>(`${INITIATIVES_BASE}/${initiativeId}/dependencies/graph`);
};

export const getInitiativeDependencies = async (
  initiativeId: string
): Promise<InitiativeDependency[]> => {
  return get<InitiativeDependency[]>(`${INITIATIVES_BASE}/${initiativeId}/dependencies`);
};

export const createDependency = async (
  data: Omit<InitiativeDependency, 'id'>
): Promise<InitiativeDependency> => {
  return post<InitiativeDependency>('/dependencies', data);
};

export const deleteDependency = async (id: string): Promise<void> => {
  return del<void>(`/dependencies/${id}`);
};
