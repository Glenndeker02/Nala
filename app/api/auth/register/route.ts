import { NextRequest } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { hashPassword, validatePassword, validateEmail, generateTokens, generateVerificationToken } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-middleware';
import { Role } from '@prisma/client';

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['FOUNDER', 'CREATOR']),
  companyName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return ApiResponse.error('Validation failed', 400, validation.error.errors);
    }

    const { email, password, fullName, role, companyName } = validation.data;

    // Additional email validation
    if (!validateEmail(email)) {
      return ApiResponse.error('Invalid email format');
    }

    // Password strength validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return ApiResponse.error('Password does not meet requirements', 400, {
        requirements: passwordValidation.errors,
      });
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return ApiResponse.error('User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        fullName,
        role: role as Role,
        ...(role === 'FOUNDER' && companyName && { companyName }),
      },
    });

    // Create creator profile if role is CREATOR
    if (role === 'CREATOR') {
      await db.creatorProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Generate email verification token
    const verificationToken = generateVerificationToken();
    await db.verificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        type: 'EMAIL_VERIFICATION',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // TODO: Send verification email
    // await sendVerificationEmail(user.email, verificationToken);

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return ApiResponse.created({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      ...tokens,
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return ApiResponse.error('Internal server error', 500);
  }
}
