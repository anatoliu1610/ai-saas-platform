import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db } from './db';

// Use placeholder during build, validate at runtime
const JWT_SECRET = process.env.JWT_SECRET || 'placeholder-build-time-only';

const JWT_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

// Runtime validation - throw only when actually used
function validateJwtSecret() {
  if (process.env.JWT_SECRET) return;
  // Allow placeholder during build, fail at runtime
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
}

const JWT_SECRET_STRING: string = JWT_SECRET;

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// ============================================
// PASSWORD UTILITIES
// ============================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// ============================================
// JWT UTILITIES
// ============================================

export function generateToken(payload: TokenPayload): string {
  validateJwtSecret();
  return jwt.sign(payload, JWT_SECRET_STRING, { expiresIn: JWT_EXPIRES_IN });
}

export function generateRefreshToken(payload: TokenPayload): string {
  validateJwtSecret();
  return jwt.sign(payload, JWT_SECRET_STRING, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    validateJwtSecret();
    return jwt.verify(token, JWT_SECRET_STRING) as TokenPayload;
  } catch {
    return null;
  }
}

// ============================================
// SESSION COOKIES
// ============================================

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('session')?.value;
}

export async function removeSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

// ============================================
// AUTH HELPERS
// ============================================

export async function getCurrentUser() {
  const token = await getSessionCookie();
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
      createdAt: true,
    },
  });

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
