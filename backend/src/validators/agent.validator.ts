/**
 * Agent Action Validators
 * Validation schemas for agent action endpoints
 */

import { body, query, param } from 'express-validator';
import { AgentActionStatus, AgentActionType } from '@prisma/client';

export const listAgentActionsValidator = [
  query('status')
    .optional()
    .isIn(Object.values(AgentActionStatus))
    .withMessage('Invalid status value'),
  query('initiativeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Initiative ID must be a positive integer'),
  query('createdBy')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Created by must be a positive integer'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const createAgentActionValidator = [
  body('initiativeId')
    .isInt({ min: 1 })
    .withMessage('Initiative ID is required and must be a positive integer'),
  body('plan')
    .trim()
    .notEmpty()
    .withMessage('Plan is required'),
  body('evidence')
    .optional()
    .isObject()
    .withMessage('Evidence must be a JSON object'),
  body('confidenceScore')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Confidence score must be between 0 and 1'),
  body('actionType')
    .isIn(Object.values(AgentActionType))
    .withMessage('Invalid action type'),
];

export const updateAgentActionValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Action ID must be a positive integer'),
  body('plan')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Plan cannot be empty'),
  body('evidence')
    .optional()
    .isObject()
    .withMessage('Evidence must be a JSON object'),
  body('confidenceScore')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Confidence score must be between 0 and 1'),
];

export const approveAgentActionValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Action ID must be a positive integer'),
];

export const rejectAgentActionValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Action ID must be a positive integer'),
  body('rejectionReason')
    .trim()
    .notEmpty()
    .withMessage('Rejection reason is required'),
];

export const getAgentActionByIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Action ID must be a positive integer'),
];
