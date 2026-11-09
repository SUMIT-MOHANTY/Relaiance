import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../services/auth.service';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * JWT Authentication Middleware
 * Extracts Bearer token from Authorization header, verifies it,
 * and attaches decoded payload to req.user
 */
export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authorization header missing',
      },
    });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid authorization header format. Expected: Bearer <token>',
      },
    });
    return;
  }

  const token = parts[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    });
  }
}

export default authenticateJWT;
