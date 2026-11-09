/**
 * Admin Controller
 * Handles HTTP requests for administrative operations
 */

import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { UserRole } from '@prisma/client';

export class AdminController {
  /**
   * List all users with filters and pagination
   * GET /api/admin/users
   */
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        role: req.query.role as UserRole | undefined,
        isActive: req.query.isActive !== undefined 
          ? req.query.isActive === 'true' 
          : undefined,
        department: req.query.department as string | undefined,
        search: req.query.search as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      };

      const result = await adminService.listUsers(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new user
   * POST /api/admin/users
   */
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = (req as any).user?.userId;
      const user = await adminService.createUser(req.body, actorId);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   * GET /api/admin/users/:id
   */
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const user = await adminService.getUserById(id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user
   * PUT /api/admin/users/:id
   */
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const actorId = (req as any).user?.userId;
      const user = await adminService.updateUser(id, req.body, actorId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user role
   * PUT /api/admin/users/:id/role
   */
  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const actorId = (req as any).user?.userId;
      const user = await adminService.updateUserRole(id, req.body, actorId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deactivate (soft-delete) user
   * DELETE /api/admin/users/:id
   */
  async deactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const actorId = (req as any).user?.userId;
      const user = await adminService.deactivateUser(id, actorId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset all data (truncate all entity tables, preserve users)
   * POST /api/admin/data/reset
   */
  async resetData(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = (req as any).user?.userId;
      const result = await adminService.resetData(actorId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Import data from JSON payload
   * POST /api/admin/data/import
   */
  async importData(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = (req as any).user?.userId;
      const result = await adminService.importData(req.body, actorId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get system health status
   * GET /api/admin/system/health
   */
  async getSystemHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const health = await adminService.getSystemHealth();
      res.json(health);
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const adminController = new AdminController();
