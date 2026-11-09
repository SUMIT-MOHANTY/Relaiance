/**
 * Admin Validators
 * Validation schemas for admin endpoints
 */

import { body, query, param } from 'express-validator';
import { UserRole } from '@prisma/client';

export const listUsersValidator = [
  query('role')
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage('Invalid role value'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  query('department')
    .optional()
    .trim(),
  query('search')
    .optional()
    .trim(),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const createUserValidator = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('role')
    .isIn(Object.values(UserRole))
    .withMessage('Invalid role value'),
  body('department')
    .optional()
    .trim(),
];

export const updateUserValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty'),
  body('role')
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage('Invalid role value'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('department')
    .optional()
    .trim(),
];

export const updateUserRoleValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  body('role')
    .isIn(Object.values(UserRole))
    .withMessage('Invalid role value'),
];

export const userIdParamValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
];

export const importDataValidator = [
  body('initiatives')
    .optional()
    .isArray()
    .withMessage('Initiatives must be an array'),
  body('milestones')
    .optional()
    .isArray()
    .withMessage('Milestones must be an array'),
  body('risks')
    .optional()
    .isArray()
    .withMessage('Risks must be an array'),
  body('decisions')
    .optional()
    .isArray()
    .withMessage('Decisions must be an array'),
  body('benefits')
    .optional()
    .isArray()
    .withMessage('Benefits must be an array'),
  body('adoptionSignals')
    .optional()
    .isArray()
    .withMessage('Adoption signals must be an array'),
  body('agentActions')
    .optional()
    .isArray()
    .withMessage('Agent actions must be an array'),
];
