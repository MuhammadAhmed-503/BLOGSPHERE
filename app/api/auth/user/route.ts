/**
 * User Auth API Routes - Signup and Login
 */

import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/api-response';
import { z } from 'zod';

// Signup schema
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

// Login schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /api/auth/signup
 * Create a new user account
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = request.nextUrl.searchParams.get('action');

    // Signup
    if (action === 'signup') {
      const validation = signupSchema.safeParse(body);
      if (!validation.success) {
        return errorResponse(validation.error.errors[0].message, 422);
      }

      await connectDB();

      // Check if user already exists
      const existingUser = await User.findOne({ email: validation.data.email });
      if (existingUser) {
        return errorResponse('Email already registered', 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validation.data.password, 10);

      // Create user
      const user = await User.create({
        email: validation.data.email,
        password: hashedPassword,
        name: validation.data.name,
        role: 'user',
      });

      return successResponse(
        {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        },
        'Account created successfully! Please login.',
        201
      );
    }

    // Login
    if (action === 'login') {
      const validation = loginSchema.safeParse(body);
      if (!validation.success) {
        return errorResponse(validation.error.errors[0].message, 422);
      }

      await connectDB();

      // Find user
      const user = await User.findOne({ email: validation.data.email }).select('+password');
      if (!user) {
        return errorResponse('Invalid email or password', 401);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(validation.data.password, user.password);
      if (!isPasswordValid) {
        return errorResponse('Invalid email or password', 401);
      }

      return successResponse(
        {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        },
        'Login successful!',
        200
      );
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    console.error('Auth error:', error);
    return errorResponse('Authentication failed', 500);
  }
}
