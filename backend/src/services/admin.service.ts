/**
 * Admin Service
 * Handles administrative operations: user management, data reset/import, system health
 */

import prisma from '../lib/prisma';
import { UserRole, AuditAction, Prisma } from '@prisma/client';
import { hashPassword } from './auth.service';

// Input types for Admin operations
export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
}

export interface UpdateUserInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  department?: string;
  isActive?: boolean;
}

export interface UpdateUserRoleInput {
  role: UserRole;
}

export interface ListUsersFilters {
  role?: UserRole;
  isActive?: boolean;
  department?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ImportDataInput {
  initiatives?: any[];
  milestones?: any[];
  risks?: any[];
  decisions?: any[];
  benefits?: any[];
  adoptionSignals?: any[];
  agentActions?: any[];
}

export interface SystemHealth {
  dbStatus: 'healthy' | 'unhealthy';
  uptimeSeconds: number;
  nodeVersion: string;
  env: string;
  recordCounts: Record<string, number>;
}

export class AdminService {
  /**
   * List all users with filters and pagination
   */
  async listUsers(filters: ListUsersFilters) {
    const { role, isActive, department, search, page = 1, limit = 20 } = filters;

    const where: Prisma.UserWhereInput = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;
    if (department) where.department = department;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          department: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a new user
   */
  async createUser(input: CreateUserInput, actorId: number) {
    const { email, password, firstName, lastName, role, department } = input;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role,
        department,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create audit log entry
    await this.createAuditLog({
      entityType: 'User',
      entityId: user.id,
      action: AuditAction.CREATE,
      newValues: user as unknown as Prisma.JsonValue,
      actorId,
    });

    return user;
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user
   */
  async updateUser(id: number, input: UpdateUserInput, actorId: number) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check email uniqueness if being updated
    if (input.email && input.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
    }

    const oldValues = { ...user };

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role,
        department: input.department,
        isActive: input.isActive,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create audit log entry
    await this.createAuditLog({
      entityType: 'User',
      entityId: id,
      action: AuditAction.UPDATE,
      oldValues: oldValues as unknown as Prisma.JsonValue,
      newValues: updatedUser as unknown as Prisma.JsonValue,
      actorId,
    });

    return updatedUser;
  }

  /**
   * Update user role
   */
  async updateUserRole(id: number, input: UpdateUserRoleInput, actorId: number) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const oldValues = { ...user };

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role: input.role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create audit log entry
    await this.createAuditLog({
      entityType: 'User',
      entityId: id,
      action: AuditAction.UPDATE,
      oldValues: oldValues as unknown as Prisma.JsonValue,
      newValues: updatedUser as unknown as Prisma.JsonValue,
      actorId,
    });

    return updatedUser;
  }

  /**
   * Deactivate (soft-delete) user
   */
  async deactivateUser(id: number, actorId: number) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const oldValues = { ...user };

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create audit log entry
    await this.createAuditLog({
      entityType: 'User',
      entityId: id,
      action: AuditAction.DELETE,
      oldValues: oldValues as unknown as Prisma.JsonValue,
      newValues: updatedUser as unknown as Prisma.JsonValue,
      actorId,
    });

    return updatedUser;
  }

  /**
   * Reset all data (truncate all entity tables, preserve users)
   */
  async resetData(actorId: number) {
    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Delete in order to respect foreign key constraints
      await tx.auditLog.deleteMany({});
      await tx.agentAction.deleteMany({});
      await tx.adoptionSignal.deleteMany({});
      await tx.benefit.deleteMany({});
      await tx.decision.deleteMany({});
      await tx.risk.deleteMany({});
      await tx.milestone.deleteMany({});
      await tx.initiative.deleteMany({});
    });

    // Create audit log entry
    await this.createAuditLog({
      entityType: 'System',
      entityId: 0,
      action: AuditAction.DELETE,
      oldValues: { message: 'All data reset' } as Prisma.JsonValue,
      actorId,
    });

    return { success: true, message: 'All data has been reset successfully' };
  }

  /**
   * Import data from JSON payload
   */
  async importData(input: ImportDataInput, actorId: number) {
    const results: Record<string, { created: number; errors: string[] }> = {};

    await prisma.$transaction(async (tx) => {
      // Import initiatives
      if (input.initiatives?.length) {
        results.initiatives = { created: 0, errors: [] };
        for (const item of input.initiatives) {
          try {
            await tx.initiative.create({ data: item });
            results.initiatives.created++;
          } catch (error: any) {
            results.initiatives.errors.push(`Initiative ${item.id || 'unknown'}: ${error.message}`);
          }
        }
      }

      // Import milestones
      if (input.milestones?.length) {
        results.milestones = { created: 0, errors: [] };
        for (const item of input.milestones) {
          try {
            await tx.milestone.create({ data: item });
            results.milestones.created++;
          } catch (error: any) {
            results.milestones.errors.push(`Milestone ${item.id || 'unknown'}: ${error.message}`);
          }
        }
      }

      // Import risks
      if (input.risks?.length) {
        results.risks = { created: 0, errors: [] };
        for (const item of input.risks) {
          try {
            await tx.risk.create({ data: item });
            results.risks.created++;
          } catch (error: any) {
            results.risks.errors.push(`Risk ${item.id || 'unknown'}: ${error.message}`);
          }
        }
      }

      // Import decisions
      if (input.decisions?.length) {
        results.decisions = { created: 0, errors: [] };
        for (const item of input.decisions) {
          try {
            await tx.decision.create({ data: item });
            results.decisions.created++;
          } catch (error: any) {
            results.decisions.errors.push(`Decision ${item.id || 'unknown'}: ${error.message}`);
          }
        }
      }

      // Import benefits
      if (input.benefits?.length) {
        results.benefits = { created: 0, errors: [] };
        for (const item of input.benefits) {
          try {
            await tx.benefit.create({ data: item });
            results.benefits.created++;
          } catch (error: any) {
            results.benefits.errors.push(`Benefit ${item.id || 'unknown'}: ${error.message}`);
          }
        }
      }

      // Import adoption signals
      if (input.adoptionSignals?.length) {
        results.adoptionSignals = { created: 0, errors: [] };
        for (const item of input.adoptionSignals) {
          try {
            await tx.adoptionSignal.create({ data: item });
            results.adoptionSignals.created++;
          } catch (error: any) {
            results.adoptionSignals.errors.push(`AdoptionSignal ${item.id || 'unknown'}: ${error.message}`);
          }
        }
      }

      // Import agent actions
      if (input.agentActions?.length) {
        results.agentActions = { created: 0, errors: [] };
        for (const item of input.agentActions) {
          try {
            await tx.agentAction.create({ data: item });
            results.agentActions.created++;
          } catch (error: any) {
            results.agentActions.errors.push(`AgentAction ${item.id || 'unknown'}: ${error.message}`);
          }
        }
      }
    });

    // Create audit log entry
    await this.createAuditLog({
      entityType: 'System',
      entityId: 0,
      action: AuditAction.CREATE,
      newValues: { importResults: results } as Prisma.JsonValue,
      actorId,
    });

    return { success: true, results };
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    let dbStatus: 'healthy' | 'unhealthy' = 'unhealthy';

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'healthy';
    } catch (error) {
      dbStatus = 'unhealthy';
    }

    const recordCounts = await this.getRecordCounts();

    return {
      dbStatus,
      uptimeSeconds: process.uptime(),
      nodeVersion: process.version,
      env: process.env.NODE_ENV || 'development',
      recordCounts,
    };
  }

  /**
   * Get record counts for all entities
   */
  private async getRecordCounts(): Promise<Record<string, number>> {
    const [
      users,
      initiatives,
      milestones,
      risks,
      decisions,
      benefits,
      adoptionSignals,
      agentActions,
      auditLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.initiative.count(),
      prisma.milestone.count(),
      prisma.risk.count(),
      prisma.decision.count(),
      prisma.benefit.count(),
      prisma.adoptionSignal.count(),
      prisma.agentAction.count(),
      prisma.auditLog.count(),
    ]);

    return {
      users,
      initiatives,
      milestones,
      risks,
      decisions,
      benefits,
      adoptionSignals,
      agentActions,
      auditLogs,
    };
  }

  /**
   * Helper: Create audit log entry
   */
  private async createAuditLog(params: {
    entityType: string;
    entityId: number;
    action: AuditAction;
    oldValues?: Prisma.JsonValue;
    newValues?: Prisma.JsonValue;
    actorId?: number;
  }) {
    try {
      await prisma.auditLog.create({
        data: {
          entityType: params.entityType,
          entityId: params.entityId,
          action: params.action,
          oldValues: params.oldValues,
          newValues: params.newValues,
          actorId: params.actorId,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();
