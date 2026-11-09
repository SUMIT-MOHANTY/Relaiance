/**
 * Admin Routes
 * Administrative endpoints with strict RBAC requiring ADMIN role
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { adminController } from '../controllers/admin.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(authenticateJWT);
router.use(requireRole(UserRole.ADMIN));

/**
 * @route   GET /api/admin/users
 * @desc    List all users with filters and pagination
 * @access  Admin only
 */
router.get('/users', adminController.listUsers);

/**
 * @route   POST /api/admin/users
 * @desc    Create a new user
 * @access  Admin only
 */
router.post(
  '/users',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('role').isIn(Object.values(UserRole)),
  ],
  adminController.createUser
);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID
 * @access  Admin only
 */
router.get('/users/:id', adminController.getUserById);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user
 * @access  Admin only
 */
router.put(
  '/users/:id',
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('role').optional().isIn(Object.values(UserRole)),
    body('isActive').optional().isBoolean(),
  ],
  adminController.updateUser
);

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role explicitly
 * @access  Admin only
 */
router.put(
  '/users/:id/role',
  [body('role').isIn(Object.values(UserRole))],
  adminController.updateUserRole
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Deactivate (soft-delete) user
 * @access  Admin only
 */
router.delete('/users/:id', adminController.deactivateUser);

/**
 * @route   POST /api/admin/data/reset
 * @desc    Reset all data (truncate all entity tables, preserve users)
 * @access  Admin only
 */
router.post('/data/reset', adminController.resetData);

/**
 * @route   POST /api/admin/data/import
 * @desc    Import data from JSON payload
 * @access  Admin only
 */
router.post('/data/import', adminController.importData);

/**
 * @route   GET /api/admin/system/health
 * @desc    Get system health status
 * @access  Admin only
 */
router.get('/system/health', adminController.getSystemHealth);

export default router;
