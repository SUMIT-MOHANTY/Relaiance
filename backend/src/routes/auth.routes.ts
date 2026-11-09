import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import {
  getUserByEmailWithPassword,
  createUser,
  verifyPassword,
  issueTokens,
  verifyRefreshToken,
  getUserById,
  emailExists,
  AuthUser,
} from '../services/auth.service';
import { authenticateJWT } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Validation middleware helper
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors.array(),
      },
    });
    return;
  }
  next();
};

/**
 * POST /api/auth/login
 * Authenticate user and issue tokens
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors,
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await getUserByEmailWithPassword(email);
      if (!user) {
        res.status(401).json({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        });
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        res.status(401).json({
          error: {
            code: 'ACCOUNT_INACTIVE',
            message: 'Account is inactive',
          },
        });
        return;
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        res.status(401).json({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        });
        return;
      }

      // Issue tokens
      const tokens = issueTokens(user);

      // Return tokens and user info (without password)
      const userResponse: AuthUser = {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: userResponse,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during login',
        },
      });
    }
  }
);

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    handleValidationErrors,
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if email already exists
      const exists = await emailExists(email);
      if (exists) {
        res.status(409).json({
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Email already registered',
          },
        });
        return;
      }

      // Create user with default TEAM_MEMBER role
      const user = await createUser(email, password, firstName, lastName, UserRole.TEAM_MEMBER);

      // Issue tokens
      const tokens = issueTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        passwordHash: '', // Not used after creation
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      res.status(201).json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during registration',
        },
      });
    }
  }
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post(
  '/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    handleValidationErrors,
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      let decoded;
      try {
        decoded = verifyRefreshToken(refreshToken);
      } catch (error) {
        res.status(401).json({
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid or expired refresh token',
          },
        });
        return;
      }

      // Get user from database
      const user = await getUserById(decoded.sub);
      if (!user) {
        res.status(401).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
        return;
      }

      // Issue new tokens
      const tokens = issueTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        passwordHash: '',
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during token refresh',
        },
      });
    }
  }
);

/**
 * GET /api/auth/profile
 * Get current user profile (protected)
 */
router.get('/profile', authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const user = await getUserById(req.user.sub);
    if (!user) {
      res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred fetching profile',
      },
    });
  }
});

export default router;
