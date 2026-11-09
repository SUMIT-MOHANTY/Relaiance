import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate access token with 15 minute expiry
 */
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

/**
 * Generate refresh token with 7 day expiry
 */
export function generateRefreshToken(userId: number): string {
  return jwt.sign({ sub: userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

/**
 * Verify and decode an access token
 */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Verify and decode a refresh token
 */
export function verifyRefreshToken(token: string): { sub: number } {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { sub: number };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Generate both tokens for a user
 */
export function generateTokenPair(payload: JwtPayload): TokenPair {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload.sub),
  };
}
