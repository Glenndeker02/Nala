import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, JWTPayload } from './auth';
import { Role } from '@prisma/client';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Extract and verify JWT from request headers
 */
export function extractUser(request: NextRequest): JWTPayload | null {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

/**
 * Middleware to require authentication
 */
export function requireAuth(
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = extractUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing token' },
        { status: 401 }
      );
    }

    return handler(request, user);
  };
}

/**
 * Middleware to require specific role
 */
export function requireRole(
  roles: Role[],
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = extractUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing token' },
        { status: 401 }
      );
    }

    if (!roles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    return handler(request, user);
  };
}

/**
 * Standard API response helpers
 */
export const ApiResponse = {
  success: <T>(data: T, status: number = 200) => {
    return NextResponse.json({ success: true, data }, { status });
  },

  error: (message: string, status: number = 400, details?: any) => {
    return NextResponse.json(
      {
        success: false,
        error: message,
        ...(details && { details }),
      },
      { status }
    );
  },

  created: <T>(data: T) => {
    return NextResponse.json({ success: true, data }, { status: 201 });
  },

  noContent: () => {
    return new NextResponse(null, { status: 204 });
  },
};

/**
 * Rate limiting storage (in production, use Redis)
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Simple rate limiter (replace with Redis in production)
 */
export function rateLimit(request: NextRequest, limit: number = 100, windowMs: number = 60000): boolean {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}
