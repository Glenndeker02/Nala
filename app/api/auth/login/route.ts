import { NextRequest } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { comparePasswords, generateTokens } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-middleware';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return ApiResponse.error('Validation failed', 400, validation.error.errors);
    }

    const { email, password } = validation.data;

    // Find user
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        creatorProfile: {
          select: {
            verificationStatus: true,
            isOnboardingComplete: true,
          },
        },
      },
    });

    if (!user) {
      return ApiResponse.error('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return ApiResponse.error('Invalid email or password', 401);
    }

    // Update last login
    // TODO: Uncomment when lastLoginAt column is added to database
    // await db.user.update({
    //   where: { id: user.id },
    //   data: { lastLoginAt: new Date() },
    // });

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return ApiResponse.success({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        // emailVerified: user.emailVerified, // Field not in database yet
        ...(user.companyName && { companyName: user.companyName }),
        ...(user.creatorProfile && {
          creatorProfile: {
            verificationStatus: user.creatorProfile.verificationStatus,
            isOnboardingComplete: user.creatorProfile.isOnboardingComplete,
          },
        }),
      },
      ...tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    return ApiResponse.error('Internal server error', 500);
  }
}
