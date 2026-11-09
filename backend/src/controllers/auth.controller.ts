import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
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
import { UserRole } from '@prisma/client';

/**
 * Auth Controller
 * Handles authentication-related HTTP requests
 */

export class AuthController {
  /**
   * POST /api/auth/login
   * Authenticate user and issue tokens
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Check for validation errors
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

  /**
   * POST /api/auth/register
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Check for validation errors
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
        passwordHash: '',
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

  /**
   * POST /api/auth/refresh
   * Refresh access token using refresh token
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      // Check for validation errors
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

  /**
   * GET /api/auth/profile
   * Get current user profile
   */
  async profile(req: Request, res: Response): Promise<void> {
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
  }
}

export default new AuthController();
