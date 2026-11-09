/**
 * Agent Action Routes
 * Routes for AgentAction lifecycle management
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { agentActionController } from '../controllers/agent-action.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

/**
 * @openapi
 * /api/agent-actions:
 *   get:
 *     summary: List all agent actions with filters
 *     tags: [AgentActions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, EXECUTED]
 *       - in: query
 *         name: initiativeId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: actorId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of agent actions
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  agentActionController.listAgentActions.bind(agentActionController)
);

/**
 * @openapi
 * /api/agent-actions/{id}:
 *   get:
 *     summary: Get agent action by ID
 *     tags: [AgentActions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Agent action details
 *       404:
 *         description: Agent action not found
 */
router.get(
  '/:id',
  [param('id').isInt()],
  agentActionController.getAgentActionById.bind(agentActionController)
);

/**
 * @openapi
 * /api/agent-actions:
 *   post:
 *     summary: Create a new agent action
 *     tags: [AgentActions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [actionType, plan, confidenceScore, initiativeId]
 *             properties:
 *               actionType:
 *                 type: string
 *               plan:
 *                 type: string
 *               evidence:
 *                 type: string
 *               confidenceScore:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *               initiativeId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Agent action created
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  [
    body('actionType').notEmpty().trim(),
    body('plan').notEmpty().trim(),
    body('confidenceScore').isFloat({ min: 0, max: 1 }),
    body('initiativeId').isInt(),
  ],
  agentActionController.createAgentAction.bind(agentActionController)
);

/**
 * @openapi
 * /api/agent-actions/{id}:
 *   put:
 *     summary: Update agent action (PENDING status only)
 *     tags: [AgentActions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan:
 *                 type: string
 *               evidence:
 *                 type: string
 *               confidenceScore:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *     responses:
 *       200:
 *         description: Agent action updated
 *       400:
 *         description: Invalid status or validation error
 */
router.put(
  '/:id',
  [
    param('id').isInt(),
    body('confidenceScore').optional().isFloat({ min: 0, max: 1 }),
  ],
  agentActionController.updateAgentAction.bind(agentActionController)
);

/**
 * @openapi
 * /api/agent-actions/{id}/approve:
 *   put:
 *     summary: Approve an agent action
 *     tags: [AgentActions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Agent action approved
 *       403:
 *         description: Forbidden - requires Executive or Admin role
 */
router.put(
  '/:id/approve',
  [param('id').isInt()],
  requireRole([UserRole.EXECUTIVE, UserRole.ADMIN]),
  agentActionController.approveAgentAction.bind(agentActionController)
);

/**
 * @openapi
 * /api/agent-actions/{id}/reject:
 *   put:
 *     summary: Reject an agent action
 *     tags: [AgentActions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rejectionReason]
 *             properties:
 *               rejectionReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Agent action rejected
 *       403:
 *         description: Forbidden - requires Executive or Admin role
 */
router.put(
  '/:id/reject',
  [
    param('id').isInt(),
    body('rejectionReason').notEmpty().trim(),
  ],
  requireRole([UserRole.EXECUTIVE, UserRole.ADMIN]),
  agentActionController.rejectAgentAction.bind(agentActionController)
);

/**
 * @openapi
 * /api/agent-actions/{id}:
 *   delete:
 *     summary: Delete an agent action (PENDING status only)
 *     tags: [AgentActions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Agent action deleted
 *       400:
 *         description: Can only delete when status is PENDING
 */
router.delete(
  '/:id',
  [param('id').isInt()],
  agentActionController.deleteAgentAction.bind(agentActionController)
);

export default router;
