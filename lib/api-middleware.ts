import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, JWTPayload } from './auth';
export type { JWTPayload };
import { Role } from '@prisma/client';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Extract and verify JWT from request headers
 */
export function extractUser(request: NextRequest): JWTPayload | null {
  const authHeader = request.headers.get('authorization');

  // Debug logging
  console.log('[AUTH DEBUG] Authorization header present:', !!authHeader);
  if (authHeader) {
    console.log('[AUTH DEBUG] Authorization header format:', authHeader.substring(0, 20) + '...');
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[AUTH DEBUG] Invalid or missing Authorization header');
    return null;
  }

  const token = authHeader.substring(7);
  console.log('[AUTH DEBUG] Token extracted, length:', token.length);

  const payload = verifyAccessToken(token);
  if (payload) {
    console.log('[AUTH DEBUG] Token verified successfully for user:', payload.userId, 'role:', payload.role);
  } else {
    console.log('[AUTH DEBUG] Token verification failed');
  }

  return payload;
}

/**
 * Middleware to require authentication
 */
export function requireAuth(
  handler: (request: NextRequest, user: JWTPayload, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const user = extractUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing token' },
        { status: 401 }
      );
    }

    return handler(request, user, ...args);
  };
}

/**
 * Middleware to require specific role
 */
export function requireRole(
  roles: Role | Role[],
  handler: (request: NextRequest, user: JWTPayload, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const user = extractUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing token' },
        { status: 401 }
      );
    }

    const rolesArray = Array.isArray(roles) ? roles : [roles];
    if (!rolesArray.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    return handler(request, user, ...args);
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
