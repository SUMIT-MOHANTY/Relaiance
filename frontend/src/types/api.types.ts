/**
 * API Types - Centralized type definitions for the DERTOUR Portfolio Control Tower
 * 
 * This file contains all TypeScript interfaces and types used across the application
 * for API communication, data structures, and domain models.
 */

// ============================================================================
// Enums
// ============================================================================

export enum UserRole {
  FINANCE_USER = 'FINANCE_USER',
  TEAM_MEMBER = 'TEAM_MEMBER',
  EXECUTIVE = 'EXECUTIVE',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
}

export enum InitiativeStatus {
  DRAFT = 'DRAFT',
  PROPOSED = 'PROPOSED',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum RiskSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum RiskStatus {
  IDENTIFIED = 'IDENTIFIED',
  ASSESSING = 'ASSESSING',
  MITIGATING = 'MITIGATING',
  MONITORING = 'MONITORING',
  CLOSED = 'CLOSED',
  ESCALATED = 'ESCALATED',
}

export enum DecisionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DEFERRED = 'DEFERRED',
}

export enum AgentActionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXECUTED = 'EXECUTED',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum EntityType {
  INITIATIVE = 'INITIATIVE',
  MILESTONE = 'MILESTONE',
  RISK = 'RISK',
  DECISION = 'DECISION',
  BENEFIT = 'BENEFIT',
  ADOPTION_SIGNAL = 'ADOPTION_SIGNAL',
  AGENT_ACTION = 'AGENT_ACTION',
  USER = 'USER',
  CONFIGURATION = 'CONFIGURATION',
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department: string;
  password?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: string;
  isActive?: boolean;
}

export interface UpdateUserRoleInput {
  role: UserRole;
}

// ============================================================================
// Initiative Types
// ============================================================================

export interface Initiative {
  id: string;
  code: string;
  title: string;
  description: string;
  status: InitiativeStatus;
  priority: Priority;
  ownerId: string;
  owner?: User;
  department: string;
  budget: number;
  actualSpend: number;
  startDate: string;
  targetDate: string;
  healthScore: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Milestone Types
// ============================================================================

export interface Milestone {
  id: string;
  initiativeId: string;
  title: string;
  description: string;
  dueDate: string;
  completedDate?: string;
  status: string;
  dependencies: Dependency[];
}

export interface Dependency {
  id: string;
  milestoneId: string;
  dependsOnMilestoneId: string;
  type: string;
}

// ============================================================================
// Risk Types
// ============================================================================

export interface Risk {
  id: string;
  initiativeId: string;
  title: string;
  description: string;
  severity: RiskSeverity;
  probability: number;
  impact: number;
  status: RiskStatus;
  mitigationPlan?: string;
  ownerId: string;
  escalatedTo?: string;
  escalatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Decision Types
// ============================================================================

export interface Decision {
  id: string;
  initiativeId: string;
  title: string;
  description: string;
  requestedById: string;
  requestedBy?: User;
  status: DecisionStatus;
  requiredByDate?: string;
  decidedAt?: string;
  rationale?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Benefit Types
// ============================================================================

export interface Benefit {
  id: string;
  initiativeId: string;
  description: string;
  targetValue: number;
  actualValue: number;
  unit: string;
  realizationDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Adoption Signal Types
// ============================================================================

export interface AdoptionSignal {
  id: string;
  initiativeId: string;
  metricName: string;
  metricValue: number;
  targetValue: number;
  unit: string;
  recordedAt: string;
  recordedById: string;
  notes?: string;
}

// ============================================================================
// Agent Action Types
// ============================================================================

export interface AgentAction {
  id: string;
  initiativeId: string;
  initiative?: Initiative;
  type: string;
  description: string;
  rationale: string;
  status: AgentActionStatus;
  suggestedBy: string;
  approvedById?: string;
  approvedBy?: User;
  approvedAt?: string;
  rejectedReason?: string;
  executedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentActionInput {
  initiativeId: string;
  type: string;
  description: string;
  rationale: string;
}

export interface UpdateAgentActionInput {
  type?: string;
  description?: string;
  rationale?: string;
}

export interface RejectAgentActionInput {
  reason: string;
}

// ============================================================================
// Audit Log Types
// ============================================================================

export interface AuditLog {
  id: string;
  entityType: EntityType;
  entityId: string;
  action: AuditAction;
  actorId: string;
  actor?: User;
  actorName: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  timestamp: string;
  ipAddress?: string;
}

export interface AuditLogFilters {
  entityTypes?: EntityType[];
  actorId?: string;
  action?: AuditAction;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface Configuration {
  id: string;
  key: string;
  value: string;
  description: string;
  category: string;
  updatedAt: string;
  updatedById?: string;
}

export interface CreateConfigurationInput {
  key: string;
  value: string;
  description: string;
  category: string;
}

export interface UpdateConfigurationInput {
  value?: string;
  description?: string;
  category?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string[]>;
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface ExecutiveDashboard {
  totalInitiatives: number;
  atRiskCount: number;
  avgAdoptionRate: number;
  benefitsRealized: number;
  portfolioHealth: number;
  onTrackInitiatives: number;
  totalBudgetAtRisk: number;
  avgDecisionTime: number;
}

export interface TeamDashboard {
  myInitiatives: Initiative[];
  upcomingMilestones: Milestone[];
  pendingActions: AgentAction[];
}

export interface BlockedWorkItem {
  id: string;
  type: string;
  title: string;
  blocker: string;
  daysBlocked: number;
  priority: Priority;
}

export interface NextActionItem {
  id: string;
  type: string;
  title: string;
  dueDate: string;
  priority: Priority;
}

// ============================================================================
// Auth Types
// ============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
