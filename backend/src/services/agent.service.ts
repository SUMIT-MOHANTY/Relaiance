/**
 * Agent Action Service
 * Handles AgentAction lifecycle: create, approve, reject, execute
 * with AuditLog emission and notification dispatch
 */

import prisma from '../lib/prisma';
import { AgentActionStatus, AuditAction, Prisma } from '@prisma/client';
import { sendNotification } from '../adapters/notification.adapter';

// Input types for AgentAction operations
export interface CreateAgentActionInput {
  actionType: string;
  plan: string;
  evidence?: string;
  confidenceScore: number;
  initiativeId: number;
  actorId: number;
}

export interface UpdateAgentActionInput {
  plan?: string;
  evidence?: string;
  confidenceScore?: number;
}

export interface ApproveAgentActionInput {
  approverId: number;
}

export interface RejectAgentActionInput {
  approverId: number;
  rejectionReason: string;
}

export interface ListAgentActionsFilters {
  status?: AgentActionStatus;
  initiativeId?: number;
  actorId?: number;
  approverId?: number;
  page?: number;
  limit?: number;
}

export class AgentActionService {
  /**
   * Create a new AgentAction
   * Status defaults to PENDING
   */
  async createAgentAction(input: CreateAgentActionInput) {
    const { actionType, plan, evidence, confidenceScore, initiativeId, actorId } = input;

    // Validate confidence score range
    if (confidenceScore < 0 || confidenceScore > 1) {
      throw new Error('Confidence score must be between 0.00 and 1.00');
    }

    // Create the agent action
    const agentAction = await prisma.agentAction.create({
      data: {
        actionType,
        plan,
        evidence,
        confidenceScore,
        status: AgentActionStatus.PENDING,
        initiativeId,
        actorId,
      },
      include: {
        initiative: true,
        actor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create audit log entry
    await this.createAuditLog({
      entityType: 'AgentAction',
      entityId: agentAction.id,
      action: AuditAction.CREATE,
      newValues: agentAction as unknown as Prisma.JsonValue,
      actorId,
    });

    // Notify initiative owner
    await this.notifyInitiativeOwner(
      agentAction.initiativeId,
      'New Agent Action Pending Approval',
      `A new agent action "${actionType}" has been created and is pending approval.`,
      agentAction.id
    );

    return agentAction;
  }

  /**
   * List AgentActions with filters and pagination
   */
  async listAgentActions(filters: ListAgentActionsFilters) {
    const { status, initiativeId, actorId, approverId, page = 1, limit = 20 } = filters;

    const where: Prisma.AgentActionWhereInput = {};
    if (status) where.status = status;
    if (initiativeId) where.initiativeId = initiativeId;
    if (actorId) where.actorId = actorId;
    if (approverId) where.approverId = approverId;

    const [agentActions, total] = await Promise.all([
      prisma.agentAction.findMany({
        where,
        include: {
          initiative: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          actor: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          approver: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.agentAction.count({ where }),
    ]);

    return {
      data: agentActions,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get AgentAction by ID with full details
   */
  async getAgentActionById(id: number) {
    const agentAction = await prisma.agentAction.findUnique({
      where: { id },
      include: {
        initiative: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        actor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        approver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!agentAction) {
      throw new Error('AgentAction not found');
    }

    return agentAction;
  }

  /**
   * Update AgentAction (only allowed when status is PENDING)
   */
  async updateAgentAction(id: number, input: UpdateAgentActionInput, actorId: number) {
    const agentAction = await prisma.agentAction.findUnique({
      where: { id },
    });

    if (!agentAction) {
      throw new Error('AgentAction not found');
    }

    if (agentAction.status !== AgentActionStatus.PENDING) {
      throw new Error('Can only update AgentAction when status is PENDING');
    }

    // Validate confidence score if provided
    if (input.confidenceScore !== undefined && (input.confidenceScore < 0 || input.confidenceScore > 1)) {
      throw new Error('Confidence score must be between 0.00 and 1.00');
    }

    const oldValues = { ...agentAction };

    const updatedAgentAction = await prisma.agentAction.update({
      where: { id },
      data: {
        plan: input.plan,
        evidence: input.evidence,
        confidenceScore: input.confidenceScore,
      },
      include: {
        initiative: true,
        actor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create audit log entry
    await this.createAuditLog({
      entityType: 'AgentAction',
      entityId: id,
      action: AuditAction.UPDATE,
      oldValues: oldValues as unknown as Prisma.JsonValue,
      newValues: updatedAgentAction as unknown as Prisma.JsonValue,
      actorId,
    });

    return updatedAgentAction;
  }

  /**
   * Approve an AgentAction
   * Only Executive and Admin roles can approve
   */
  async approveAgentAction(id: number, input: ApproveAgentActionInput) {
    const { approverId } = input;

    const agentAction = await prisma.agentAction.findUnique({
      where: { id },
      include: {
        initiative: {
          include: {
            owner: true,
          },
        },
        actor: true,
      },
    });

    if (!agentAction) {
      throw new Error('AgentAction not found');
    }

    if (agentAction.status !== AgentActionStatus.PENDING) {
      throw new Error('Can only approve AgentAction when status is PENDING');
    }

    const oldValues = { ...agentAction };

    // Update the agent action
    const updatedAgentAction = await prisma.agentAction.update({
      where: { id },
      data: {
        status: AgentActionStatus.APPROVED,
        approverId,
        approvedAt: new Date(),
      },
      include: {
        initiative: true,
        actor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        approver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create audit log entry
    await this.createAuditLog({
      entityType: 'AgentAction',
      entityId: id,
      action: AuditAction.APPROVE,
      oldValues: oldValues as unknown as Prisma.JsonValue,
      newValues: updatedAgentAction as unknown as Prisma.JsonValue,
      actorId: approverId,
    });

    // Notify the actor who created the action
    await sendNotification({
      recipientId: agentAction.actorId,
      title: 'Agent Action Approved',
      message: `Your agent action "${agentAction.actionType}" for initiative "${agentAction.initiative.name}" has been approved.`,
      type: 'SUCCESS',
      entityType: 'AgentAction',
      entityId: agentAction.id,
    });

    // Notify initiative owner
    await this.notifyInitiativeOwner(
      agentAction.initiativeId,
      'Agent Action Approved',
      `Agent action "${agentAction.actionType}" has been approved for your initiative.`,
      agentAction.id
    );

    return updatedAgentAction;
  }

  /**
   * Reject an AgentAction
   * Only Executive and Admin roles can reject
   */
  async rejectAgentAction(id: number, input: RejectAgentActionInput) {
    const { approverId, rejectionReason } = input;

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      throw new Error('Rejection reason is required');
    }

    const agentAction = await prisma.agentAction.findUnique({
      where: { id },
      include: {
        initiative: {
          include: {
            owner: true,
          },
        },
        actor: true,
      },
    });

    if (!agentAction) {
      throw new Error('AgentAction not found');
    }

    if (agentAction.status !== AgentActionStatus.PENDING) {
      throw new Error('Can only reject AgentAction when status is PENDING');
    }

    const oldValues = { ...agentAction };

    // Update the agent action with rejection reason in evidence field
    const updatedAgentAction = await prisma.agentAction.update({
      where: { id },
      data: {
        status: AgentActionStatus.REJECTED,
        approverId,
        approvedAt: new Date(),
        evidence: agentAction.evidence
          ? `${agentAction.evidence}\n\nRejection Reason: ${rejectionReason}`
          : `Rejection Reason: ${rejectionReason}`,
      },
      include: {
        initiative: true,
        actor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        approver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create audit log entry
    await this.createAuditLog({
      entityType: 'AgentAction',
      entityId: id,
      action: AuditAction.REJECT,
      oldValues: oldValues as unknown as Prisma.JsonValue,
      newValues: updatedAgentAction as unknown as Prisma.JsonValue,
      actorId: approverId,
    });

    // Notify the actor who created the action
    await sendNotification({
      recipientId: agentAction.actorId,
      title: 'Agent Action Rejected',
      message: `Your agent action "${agentAction.actionType}" for initiative "${agentAction.initiative.name}" has been rejected. Reason: ${rejectionReason}`,
      type: 'ERROR',
      entityType: 'AgentAction',
      entityId: agentAction.id,
    });

    // Notify initiative owner
    await this.notifyInitiativeOwner(
      agentAction.initiativeId,
      'Agent Action Rejected',
      `Agent action "${agentAction.actionType}" has been rejected for your initiative. Reason: ${rejectionReason}`,
      agentAction.id
    );

    return updatedAgentAction;
  }

  /**
   * Delete an AgentAction (only allowed when status is PENDING)
   */
  async deleteAgentAction(id: number, actorId: number) {
    const agentAction = await prisma.agentAction.findUnique({
      where: { id },
    });

    if (!agentAction) {
      throw new Error('AgentAction not found');
    }

    if (agentAction.status !== AgentActionStatus.PENDING) {
      throw new Error('Can only delete AgentAction when status is PENDING');
    }

    // Create audit log entry before deletion
    await this.createAuditLog({
      entityType: 'AgentAction',
      entityId: id,
      action: AuditAction.DELETE,
      oldValues: agentAction as unknown as Prisma.JsonValue,
      actorId,
    });

    await prisma.agentAction.delete({
      where: { id },
    });

    return { success: true, message: 'AgentAction deleted successfully' };
  }

  /**
   * Execute an AgentAction (transition from APPROVED to EXECUTED)
   */
  async executeAgentAction(id: number, actorId: number, result?: Prisma.JsonValue) {
    const agentAction = await prisma.agentAction.findUnique({
      where: { id },
    });

    if (!agentAction) {
      throw new Error('AgentAction not found');
    }

    if (agentAction.status !== AgentActionStatus.APPROVED) {
      throw new Error('Can only execute AgentAction when status is APPROVED');
    }

    const oldValues = { ...agentAction };

    const updatedAgentAction = await prisma.agentAction.update({
      where: { id },
      data: {
        status: AgentActionStatus.EXECUTED,
        // Store result in evidence field as JSON string
        evidence: result
          ? JSON.stringify({ previousEvidence: agentAction.evidence, executionResult: result })
          : agentAction.evidence,
      },
      include: {
        initiative: true,
        actor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        approver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create audit log entry
    await this.createAuditLog({
      entityType: 'AgentAction',
      entityId: id,
      action: AuditAction.UPDATE,
      oldValues: oldValues as unknown as Prisma.JsonValue,
      newValues: updatedAgentAction as unknown as Prisma.JsonValue,
      actorId,
    });

    return updatedAgentAction;
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
      // Don't throw - audit log failure shouldn't break the main operation
    }
  }

  /**
   * Helper: Notify initiative owner
   */
  private async notifyInitiativeOwner(initiativeId: number, title: string, message: string, entityId: number) {
    try {
      const initiative = await prisma.initiative.findUnique({
        where: { id: initiativeId },
        include: {
          owner: true,
        },
      });

      if (initiative) {
        await sendNotification({
          recipientId: initiative.ownerId,
          title,
          message,
          type: 'INFO',
          entityType: 'AgentAction',
          entityId,
        });
      }
    } catch (error) {
      console.error('Failed to notify initiative owner:', error);
      // Don't throw - notification failure shouldn't break the main operation
    }
  }
}

// Export singleton instance
export const agentActionService = new AgentActionService();
