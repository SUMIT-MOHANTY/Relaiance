import { Request, Response, NextFunction } from 'express';
import { initiativeService } from '../services/initiative.service';
import { auditService } from '../services/audit.service';
import { Prisma } from '@prisma/client';

export class InitiativeController {
  /**
   * GET /api/initiatives
   * Get paginated list of initiatives with filters
   */
  async getInitiatives(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        status: req.query.status as string,
        priority: req.query.priority as string,
        department: req.query.department as string,
        ownerId: req.query.owner_id as string,
      };

      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };

      const result = await initiativeService.getInitiatives(filters, pagination);

      res.json({
        data: result.data,
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/initiatives/summary
   * Get portfolio summary with aggregated metrics
   */
  async getPortfolioSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await initiativeService.getPortfolioSummary();
      res.json(summary);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/initiatives/:id
   * Get initiative by ID with full details
   */
  async getInitiativeById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const initiative = await initiativeService.getInitiativeById(id);

      if (!initiative) {
        res.status(404).json({
          error: {
            code: 'INITIATIVE_NOT_FOUND',
            message: 'Initiative not found',
          },
        });
        return;
      }

      res.json(initiative);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/initiatives
   * Create a new initiative
   */
  async createInitiative(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const initiative = await initiativeService.createInitiative({
        ...req.body,
        ownerId: req.body.ownerId || userId,
      });

      // Create audit log
      await auditService.createAuditLog({
        userId,
        action: 'CREATE_INITIATIVE',
        resource: `initiative:${initiative.id}`,
        changes: { new: initiative },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
      });

      res.status(201).json(initiative);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          res.status(409).json({
            error: {
              code: 'DUPLICATE_CODE',
              message: 'Initiative code already exists',
            },
          });
          return;
        }
      }
      next(error);
    }
  }

  /**
   * PUT /api/initiatives/:id
   * Update an initiative
   */
  async updateInitiative(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const { id } = req.params;

      // Get old values for audit
      const oldInitiative = await initiativeService.getInitiativeById(id);
      if (!oldInitiative) {
        res.status(404).json({
          error: {
            code: 'INITIATIVE_NOT_FOUND',
            message: 'Initiative not found',
          },
        });
        return;
      }

      const updatedInitiative = await initiativeService.updateInitiative(id, req.body);

      // Create audit log
      await auditService.createAuditLog({
        userId,
        action: 'UPDATE_INITIATIVE',
        resource: `initiative:${id}`,
        changes: { old: oldInitiative, new: updatedInitiative },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
      });

      res.json(updatedInitiative);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/initiatives/:id
   * Delete an initiative
   */
  async deleteInitiative(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const { id } = req.params;

      // Get old values for audit
      const oldInitiative = await initiativeService.getInitiativeById(id);
      if (!oldInitiative) {
        res.status(404).json({
          error: {
            code: 'INITIATIVE_NOT_FOUND',
            message: 'Initiative not found',
          },
        });
        return;
      }

      await initiativeService.deleteInitiative(id);

      // Create audit log
      await auditService.createAuditLog({
        userId,
        action: 'DELETE_INITIATIVE',
        resource: `initiative:${id}`,
        changes: { old: oldInitiative },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/initiatives/:id/dependencies
   * Get dependency graph for an initiative
   */
  async getDependencies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const graph = await initiativeService.getDependencyGraph(id);
      res.json(graph);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/initiatives/:id/dependencies
   * Add a dependency link
   */
  async addDependency(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const { id } = req.params;
      const { dependencyId } = req.body;

      await initiativeService.addDependency(id, dependencyId);

      // Create audit log
      await auditService.createAuditLog({
        userId,
        action: 'ADD_DEPENDENCY',
        resource: `initiative:${id}`,
        changes: { dependencyId },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
      });

      res.status(201).json({ message: 'Dependency added successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/initiatives/:id/dependencies/:depId
   * Remove a dependency link
   */
  async removeDependency(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const { id, depId } = req.params;

      await initiativeService.removeDependency(id, depId);

      // Create audit log
      await auditService.createAuditLog({
        userId,
        action: 'REMOVE_DEPENDENCY',
        resource: `initiative:${id}`,
        changes: { dependencyId: depId },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const initiativeController = new InitiativeController();
