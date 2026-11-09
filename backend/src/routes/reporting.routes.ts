/**
 * Reporting Routes
 * Routes for reporting and dashboard data
 */

import { Router } from 'express';
import { query } from 'express-validator';
import { reportingController } from '../controllers/reporting.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

/**
 * @openapi
 * /api/reporting/executive-dashboard:
 *   get:
 *     summary: Get executive dashboard KPIs
 *     tags: [Reporting]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Executive dashboard data
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/executive-dashboard',
  requireRole([UserRole.EXECUTIVE, UserRole.ADMIN, UserRole.FINANCE]),
  reportingController.getExecutiveDashboard.bind(reportingController)
);

/**
 * @openapi
 * /api/reporting/blocked-work:
 *   get:
 *     summary: Get blocked work items
 *     tags: [Reporting]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of blocked work items
 */
router.get(
  '/blocked-work',
  reportingController.getBlockedWork.bind(reportingController)
);

/**
 * @openapi
 * /api/reporting/next-actions:
 *   get:
 *     summary: Get next recommended actions
 *     tags: [Reporting]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recommended next actions
 */
router.get(
  '/next-actions',
  reportingController.getNextActions.bind(reportingController)
);

/**
 * @openapi
 * /api/reporting/team-dashboard:
 *   get:
 *     summary: Get team dashboard for current user
 *     tags: [Reporting]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Team dashboard data
 */
router.get(
  '/team-dashboard',
  reportingController.getTeamDashboard.bind(reportingController)
);

/**
 * @openapi
 * /api/reporting/audit-log:
 *   get:
 *     summary: Get audit log with filters
 *     tags: [Reporting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: actorId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
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
 *         description: Paginated audit log
 *       403:
 *         description: Forbidden - requires Admin role
 */
router.get(
  '/audit-log',
  requireRole([UserRole.ADMIN]),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('entityId').optional().isInt(),
    query('actorId').optional().isInt(),
  ],
  reportingController.getAuditLog.bind(reportingController)
);

/**
 * @openapi
 * /api/reporting/export/executive-summary:
 *   get:
 *     summary: Export executive summary
 *     tags: [Reporting]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Executive summary export data
 *       403:
 *         description: Forbidden - requires Executive or Admin role
 */
router.get(
  '/export/executive-summary',
  requireRole([UserRole.EXECUTIVE, UserRole.ADMIN]),
  reportingController.getExecutiveSummaryExport.bind(reportingController)
);

/**
 * @openapi
 * /api/reporting/risks/heatmap:
 *   get:
 *     summary: Get risk heatmap data
 *     tags: [Reporting]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Risk heatmap data
 */
router.get(
  '/risks/heatmap',
  reportingController.getRiskHeatmap.bind(reportingController)
);

/**
 * @openapi
 * /api/reporting/milestones/timeline:
 *   get:
 *     summary: Get milestone timeline
 *     tags: [Reporting]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Milestone timeline data
 */
router.get(
  '/milestones/timeline',
  reportingController.getMilestoneTimeline.bind(reportingController)
);

/**
 * @openapi
 * /api/reporting/budget/utilization:
 *   get:
 *     summary: Get budget utilization
 *     tags: [Reporting]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Budget utilization data
 */
router.get(
  '/budget/utilization',
  requireRole([UserRole.EXECUTIVE, UserRole.ADMIN, UserRole.FINANCE]),
  reportingController.getBudgetUtilization.bind(reportingController)
);

export default router;
