/**
 * Agent Action Controller
 * Handles HTTP requests for AgentAction lifecycle management
 */

import { Request, Response, NextFunction } from 'express';
import { agentActionService, CreateAgentActionInput, UpdateAgentActionInput } from '../services/agent.service';
import { AgentActionStatus } from '@prisma/client';

export class AgentActionController {
  /**
   * List all agent actions with filters and pagination
   * GET /api/agent-actions
   */
  async listAgentActions(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        status,
        initiativeId,
        actorId,
        approverId,
        page = '1',
        limit = '20',
      } = req.query;

      const filters = {
        status: status as AgentActionStatus | undefined,
        initiativeId: initiativeId ? parseInt(initiativeId as string, 10) : undefined,
        actorId: actorId ? parseInt(actorId as string, 10) : undefined,
        approverId: approverId ? parseInt(approverId as string, 10) : undefined,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      };

      const result = await agentActionService.listAgentActions(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single agent action by ID
   * GET /api/agent-actions/:id
   */
  async getAgentActionById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_ID',
            message: 'Invalid agent action ID',
          },
        });
      }

      const agentAction = await agentActionService.getAgentActionById(id);
      res.json(agentAction);
    } catch (error) {
      if (error instanceof Error && error.message === 'AgentAction not found') {
        return res.status(404).json({
          error: {
            code: 'AGENT_ACTION_NOT_FOUND',
            message: 'Agent action not found',
          },
        });
      }
      next(error);
    }
  }

  /**
   * Create a new agent action
   * POST /api/agent-actions
   */
  async createAgentAction(req: Request, res: Response, next: NextFunction) {
    try {
      const { actionType, plan, evidence, confidenceScore, initiativeId } = req.body;
      const actorId = req.user?.id;

      if (!actorId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const input: CreateAgentActionInput = {
        actionType,
        plan,
        evidence,
        confidenceScore: parseFloat(confidenceScore),
        initiativeId: parseInt(initiativeId, 10),
        actorId,
      };

      const agentAction = await agentActionService.createAgentAction(input);
      res.status(201).json(agentAction);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
      }
      next(error);
    }
  }

  /**
   * Update an agent action (only when status is PENDING)
   * PUT /api/agent-actions/:id
   */
  async updateAgentAction(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_ID',
            message: 'Invalid agent action ID',
          },
        });
      }

      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const { plan, evidence, confidenceScore } = req.body;
      const input: UpdateAgentActionInput = {
        plan,
        evidence,
        confidenceScore: confidenceScore !== undefined ? parseFloat(confidenceScore) : undefined,
      };

      const agentAction = await agentActionService.updateAgentAction(id, input, actorId);
      res.json(agentAction);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'AgentAction not found') {
          return res.status(404).json({
            error: {
              code: 'AGENT_ACTION_NOT_FOUND',
              message: 'Agent action not found',
            },
          });
        }
        if (error.message === 'Can only update AgentAction when status is PENDING') {
          return res.status(400).json({
            error: {
              code: 'INVALID_STATUS',
              message: error.message,
            },
          });
        }
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
      }
      next(error);
    }
  }

  /**
   * Approve an agent action
   * PUT /api/agent-actions/:id/approve
   */
  async approveAgentAction(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_ID',
            message: 'Invalid agent action ID',
          },
        });
      }

      const approverId = req.user?.id;
      if (!approverId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const agentAction = await agentActionService.approveAgentAction(id, { approverId });
      res.json(agentAction);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'AgentAction not found') {
          return res.status(404).json({
            error: {
              code: 'AGENT_ACTION_NOT_FOUND',
              message: 'Agent action not found',
            },
          });
        }
        if (error.message === 'Can only approve AgentAction when status is PENDING') {
          return res.status(400).json({
            error: {
              code: 'INVALID_STATUS',
              message: error.message,
            },
          });
        }
      }
      next(error);
    }
  }

  /**
   * Reject an agent action
   * PUT /api/agent-actions/:id/reject
   */
  async rejectAgentAction(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_ID',
            message: 'Invalid agent action ID',
          },
        });
      }

      const approverId = req.user?.id;
      if (!approverId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const { rejectionReason } = req.body;
      const agentAction = await agentActionService.rejectAgentAction(id, { approverId, rejectionReason });
      res.json(agentAction);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'AgentAction not found') {
          return res.status(404).json({
            error: {
              code: 'AGENT_ACTION_NOT_FOUND',
              message: 'Agent action not found',
            },
          });
        }
        if (error.message === 'Can only reject AgentAction when status is PENDING') {
          return res.status(400).json({
            error: {
              code: 'INVALID_STATUS',
              message: error.message,
            },
          });
        }
        if (error.message === 'Rejection reason is required') {
          return res.status(400).json({
            error: {
              code: 'VALIDATION_ERROR',
              message: error.message,
            },
          });
        }
      }
      next(error);
    }
  }

  /**
   * Delete an agent action (only when status is PENDING)
   * DELETE /api/agent-actions/:id
   */
  async deleteAgentAction(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_ID',
            message: 'Invalid agent action ID',
          },
        });
      }

      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const result = await agentActionService.deleteAgentAction(id, actorId);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'AgentAction not found') {
          return res.status(404).json({
            error: {
              code: 'AGENT_ACTION_NOT_FOUND',
              message: 'Agent action not found',
            },
          });
        }
        if (error.message === 'Can only delete AgentAction when status is PENDING') {
          return res.status(400).json({
            error: {
              code: 'INVALID_STATUS',
              message: error.message,
            },
          });
        }
      }
      next(error);
    }
  }
}

export const agentActionController = new AgentActionController();
