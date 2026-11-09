/**
 * Reporting Controller
 * Handles HTTP requests for reporting and dashboard data
 */

import { Request, Response, NextFunction } from 'express';
import { reportingService } from '../services/reporting.service';

export class ReportingController {
  /**
   * Get executive dashboard KPIs
   * GET /api/reporting/executive-dashboard
   */
  async getExecutiveDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const dashboard = await reportingService.getExecutiveDashboard();
      res.json(dashboard);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get blocked work items
   * GET /api/reporting/blocked-work
   */
  async getBlockedWork(req: Request, res: Response, next: NextFunction) {
    try {
      const blockedWork = await reportingService.getBlockedWork();
      res.json(blockedWork);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get next recommended actions
   * GET /api/reporting/next-actions
   */
  async getNextActions(req: Request, res: Response, next: NextFunction) {
    try {
      const actions = await reportingService.getNextActions();
      res.json(actions);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get team dashboard for current user
   * GET /api/reporting/team-dashboard
   */
  async getTeamDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const dashboard = await reportingService.getTeamDashboard(userId);
      res.json(dashboard);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get audit log with filters
   * GET /api/reporting/audit-log
   */
  async getAuditLog(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        entityType,
        entityId,
        actorId,
        action,
        startDate,
        endDate,
        page = '1',
        limit = '20',
      } = req.query;

      const filters = {
        entityType: entityType as string | undefined,
        entityId: entityId ? parseInt(entityId as string, 10) : undefined,
        actorId: actorId ? parseInt(actorId as string, 10) : undefined,
        action: action as string | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      };

      const result = await reportingService.getAuditLog(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get executive summary export
   * GET /api/reporting/export/executive-summary
   */
  async getExecutiveSummaryExport(req: Request, res: Response, next: NextFunction) {
    try {
      const exportData = await reportingService.getExecutiveSummaryExport();
      res.json(exportData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get risk heatmap
   * GET /api/reporting/risks/heatmap
   */
  async getRiskHeatmap(req: Request, res: Response, next: NextFunction) {
    try {
      const heatmap = await reportingService.getRiskHeatmap();
      res.json(heatmap);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get milestone timeline
   * GET /api/reporting/milestones/timeline
   */
  async getMilestoneTimeline(req: Request, res: Response, next: NextFunction) {
    try {
      const timeline = await reportingService.getMilestoneTimeline();
      res.json(timeline);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get budget utilization
   * GET /api/reporting/budget/utilization
   */
  async getBudgetUtilization(req: Request, res: Response, next: NextFunction) {
    try {
      const utilization = await reportingService.getBudgetUtilization();
      res.json(utilization);
    } catch (error) {
      next(error);
    }
  }
}

export const reportingController = new ReportingController();
