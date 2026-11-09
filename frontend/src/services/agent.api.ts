/**
 * agent.api.ts - Agent Action API Client
 * 
 * Typed client for all agent-action endpoints including approve/reject.
 */

import { apiClient, ApiResponse } from './apiClient';
import { AgentAction, AgentActionStatus } from '../types/api.types';

export interface AgentActionFilters {
  status?: AgentActionStatus;
  initiativeId?: string;
  confidenceMin?: number;
  confidenceMax?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateAgentActionInput {
  initiativeId: string;
  actionType: 'RECOMMEND_DECISION' | 'ESCALATE_RISK' | 'REQUEST_INFO' | 'SCHEDULE_REVIEW';
  description: string;
  rationale: string;
  confidenceScore: number;
}

export interface UpdateAgentActionInput {
  status?: AgentActionStatus;
  reviewNotes?: string;
}

export interface RejectAgentActionInput {
  rejectionReason: string;
}

// Mock data for development
const mockAgentActions: AgentAction[] = [
  {
    id: 'AA-001',
    initiativeId: 'INI-001',
    actionType: 'RECOMMEND_DECISION',
    description: 'Recommend accelerating the Digital Finance Transformation milestone by 2 weeks based on current progress and resource availability.',
    rationale: 'Team velocity indicates 15% buffer capacity. Risk assessment shows low impact on dependencies.',
    confidenceScore: 0.85,
    status: AgentActionStatus.PENDING,
    suggestedBy: 'AI_AGENT',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'AA-002',
    initiativeId: 'INI-003',
    actionType: 'ESCALATE_RISK',
    description: 'Critical risk identified: Vendor delivery delay may impact Group ERP Rollout timeline by 3 weeks.',
    rationale: 'Vendor confirmed 21-day delay on critical module. Mitigation plan requires executive approval.',
    confidenceScore: 0.92,
    status: AgentActionStatus.PENDING,
    suggestedBy: 'AI_AGENT',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T14:20:00Z',
  },
  {
    id: 'AA-003',
    initiativeId: 'INI-007',
    actionType: 'REQUEST_INFO',
    description: 'Request updated budget allocation details for Q2 to optimize resource distribution.',
    rationale: 'Current spend tracking shows 12% variance from forecast. Additional clarity needed for accurate projections.',
    confidenceScore: 0.78,
    status: AgentActionStatus.PENDING,
    suggestedBy: 'AI_AGENT',
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z',
  },
  {
    id: 'AA-004',
    initiativeId: 'INI-001',
    actionType: 'SCHEDULE_REVIEW',
    description: 'Schedule stakeholder review meeting for Digital Finance Transformation Phase 2 completion.',
    rationale: 'Phase 2 milestones 85% complete. Stakeholder sign-off required before Phase 3 initiation.',
    confidenceScore: 0.88,
    status: AgentActionStatus.PENDING,
    suggestedBy: 'AI_AGENT',
    createdAt: '2024-01-12T16:45:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
  },
  {
    id: 'AA-005',
    initiativeId: 'INI-003',
    actionType: 'RECOMMEND_DECISION',
    description: 'Recommend reallocating 2 FTE from completed workstream to critical path activities.',
    rationale: 'Resource utilization analysis shows opportunity to accelerate delivery by 10 days.',
    confidenceScore: 0.72,
    status: AgentActionStatus.PENDING,
    suggestedBy: 'AI_AGENT',
    createdAt: '2024-01-11T11:30:00Z',
    updatedAt: '2024-01-11T11:30:00Z',
  },
  {
    id: 'AA-006',
    initiativeId: 'INI-007',
    actionType: 'ESCALATE_RISK',
    description: 'Budget variance exceeds threshold - recommend executive review of cost containment measures.',
    rationale: 'Actual spend 18% above forecast. Immediate intervention required to prevent further overrun.',
    confidenceScore: 0.95,
    status: AgentActionStatus.APPROVED,
    suggestedBy: 'AI_AGENT',
    reviewedById: 'user-001',
    reviewedAt: '2024-01-10T15:20:00Z',
    createdAt: '2024-01-09T08:00:00Z',
    updatedAt: '2024-01-10T15:20:00Z',
  },
  {
    id: 'AA-007',
    initiativeId: 'INI-001',
    actionType: 'REQUEST_INFO',
    description: 'Request clarification on adoption metrics calculation methodology.',
    rationale: 'Current metrics appear inconsistent with baseline measurements. Standardization needed.',
    confidenceScore: 0.65,
    status: AgentActionStatus.APPROVED,
    suggestedBy: 'AI_AGENT',
    reviewedById: 'user-001',
    reviewedAt: '2024-01-08T10:15:00Z',
    createdAt: '2024-01-07T14:30:00Z',
    updatedAt: '2024-01-08T10:15:00Z',
  },
  {
    id: 'AA-008',
    initiativeId: 'INI-003',
    actionType: 'SCHEDULE_REVIEW',
    description: 'Propose early completion review for milestone 3 based on accelerated delivery.',
    rationale: 'Team delivered 2 weeks ahead of schedule. Early review enables faster Phase 4 start.',
    confidenceScore: 0.58,
    status: AgentActionStatus.REJECTED,
    suggestedBy: 'AI_AGENT',
    reviewedById: 'user-001',
    reviewedAt: '2024-01-06T09:45:00Z',
    reviewNotes: 'Rejected: Need to align with contractual review dates. Cannot proceed with early review.',
    createdAt: '2024-01-05T11:00:00Z',
    updatedAt: '2024-01-06T09:45:00Z',
  },
];

// Flag to use mock data (set to false when backend is ready)
const USE_MOCK_DATA = true;

export const agentActionApi = {
  // Get all agent actions with optional filters
  getAgentActions: async (filters?: AgentActionFilters): Promise<ApiResponse<AgentAction[]>> => {
    if (USE_MOCK_DATA) {
      let filtered = [...mockAgentActions];
      
      if (filters?.status) {
        filtered = filtered.filter(a => a.status === filters.status);
      }
      if (filters?.initiativeId) {
        filtered = filtered.filter(a => a.initiativeId === filters.initiativeId);
      }
      if (filters?.confidenceMin !== undefined) {
        filtered = filtered.filter(a => a.confidenceScore >= (filters.confidenceMin! / 100));
      }
      if (filters?.confidenceMax !== undefined) {
        filtered = filtered.filter(a => a.confidenceScore <= (filters.confidenceMax! / 100));
      }
      
      return {
        success: true,
        data: filtered,
        message: 'Agent actions retrieved successfully',
      };
    }

    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.initiativeId) params.append('initiativeId', filters.initiativeId);
    
    const response = await apiClient.get<AgentAction[]>(`/agent-actions?${params.toString()}`);
    return response;
  },

  // Get agent action by ID
  getAgentActionById: async (id: string): Promise<ApiResponse<AgentAction>> => {
    if (USE_MOCK_DATA) {
      const action = mockAgentActions.find(a => a.id === id);
      if (!action) {
        return {
          success: false,
          data: null as unknown as AgentAction,
          message: 'Agent action not found',
        };
      }
      return {
        success: true,
        data: action,
        message: 'Agent action retrieved successfully',
      };
    }

    const response = await apiClient.get<AgentAction>(`/agent-actions/${id}`);
    return response;
  },

  // Create new agent action
  createAgentAction: async (input: CreateAgentActionInput): Promise<ApiResponse<AgentAction>> => {
    if (USE_MOCK_DATA) {
      const newAction: AgentAction = {
        id: `AA-${String(mockAgentActions.length + 1).padStart(3, '0')}`,
        ...input,
        status: AgentActionStatus.PENDING,
        suggestedBy: 'AI_AGENT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockAgentActions.push(newAction);
      return {
        success: true,
        data: newAction,
        message: 'Agent action created successfully',
      };
    }

    const response = await apiClient.post<AgentAction>('/agent-actions', input);
    return response;
  },

  // Update agent action
  updateAgentAction: async (id: string, input: UpdateAgentActionInput): Promise<ApiResponse<AgentAction>> => {
    if (USE_MOCK_DATA) {
      const index = mockAgentActions.findIndex(a => a.id === id);
      if (index === -1) {
        return {
          success: false,
          data: null as unknown as AgentAction,
          message: 'Agent action not found',
        };
      }
      mockAgentActions[index] = {
        ...mockAgentActions[index],
        ...input,
        updatedAt: new Date().toISOString(),
      };
      return {
        success: true,
        data: mockAgentActions[index],
        message: 'Agent action updated successfully',
      };
    }

    const response = await apiClient.put<AgentAction>(`/agent-actions/${id}`, input);
    return response;
  },

  // Approve agent action
  approveAgentAction: async (id: string): Promise<ApiResponse<AgentAction>> => {
    if (USE_MOCK_DATA) {
      const index = mockAgentActions.findIndex(a => a.id === id);
      if (index === -1) {
        return {
          success: false,
          data: null as unknown as AgentAction,
          message: 'Agent action not found',
        };
      }
      mockAgentActions[index] = {
        ...mockAgentActions[index],
        status: AgentActionStatus.APPROVED,
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        success: true,
        data: mockAgentActions[index],
        message: 'Agent action approved successfully',
      };
    }

    const response = await apiClient.put<AgentAction>(`/agent-actions/${id}/approve`, {});
    return response;
  },

  // Reject agent action
  rejectAgentAction: async (id: string, input: RejectAgentActionInput): Promise<ApiResponse<AgentAction>> => {
    if (USE_MOCK_DATA) {
      const index = mockAgentActions.findIndex(a => a.id === id);
      if (index === -1) {
        return {
          success: false,
          data: null as unknown as AgentAction,
          message: 'Agent action not found',
        };
      }
      mockAgentActions[index] = {
        ...mockAgentActions[index],
        status: AgentActionStatus.REJECTED,
        reviewNotes: input.rejectionReason,
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        success: true,
        data: mockAgentActions[index],
        message: 'Agent action rejected successfully',
      };
    }

    const response = await apiClient.put<AgentAction>(`/agent-actions/${id}/reject`, input);
    return response;
  },

  // Submit agent action for approval (transition to PENDING)
  submitForApproval: async (id: string): Promise<ApiResponse<AgentAction>> => {
    if (USE_MOCK_DATA) {
      const index = mockAgentActions.findIndex(a => a.id === id);
      if (index === -1) {
        return {
          success: false,
          data: null as unknown as AgentAction,
          message: 'Agent action not found',
        };
      }
      mockAgentActions[index] = {
        ...mockAgentActions[index],
        status: AgentActionStatus.PENDING,
        updatedAt: new Date().toISOString(),
      };
      return {
        success: true,
        data: mockAgentActions[index],
        message: 'Agent action submitted for approval',
      };
    }

    const response = await apiClient.put<AgentAction>(`/agent-actions/${id}/submit`, {});
    return response;
  },
};

export default agentActionApi;
