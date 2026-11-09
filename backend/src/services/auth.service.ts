import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '@prisma/client';
import prisma from '../lib/prisma';

const SALT_ROUNDS = 12;
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

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

/**
 * Hash a plain text password using bcrypt
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * Verify a plain text password against a hash
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Issue access and refresh tokens for a user
 */
export function issueTokens(user: User): TokenPair {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ sub: user.id }, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
}

/**
 * Verify and decode an access token
 * Throws 401 error if invalid or expired
 */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    const err = new Error('Invalid or expired token');
    (err as any).code = 'UNAUTHORIZED';
    (err as any).statusCode = 401;
    throw err;
  }
}

/**
 * Verify and decode a refresh token
 * Throws 401 error if invalid or expired
 */
export function verifyRefreshToken(token: string): { sub: number } {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { sub: number };
    return decoded;
  } catch (error) {
    const err = new Error('Invalid or expired refresh token');
    (err as any).code = 'UNAUTHORIZED';
    (err as any).statusCode = 401;
    throw err;
  }
}

/**
 * Get user by ID (excluding password hash)
 */
export async function getUserById(id: number): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
    },
  });
  return user;
}

/**
 * Get user by email (with password hash for login)
 */
export async function getUserByEmailWithPassword(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user;
}

/**
 * Create a new user
 */
export async function createUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: UserRole = UserRole.TEAM_MEMBER
): Promise<AuthUser> {
  const passwordHash = await hashPassword(password);
  
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      role,
    },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
    },
  });
  
  return user;
}

/**
 * Check if email already exists
 */
export async function emailExists(email: string): Promise<boolean> {
  const count = await prisma.user.count({
    where: { email },
  });
  return count > 0;
}
