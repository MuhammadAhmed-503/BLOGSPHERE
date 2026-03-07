/**
 * Admin Initialization Script
 * Creates the first admin user from environment variables
 * Non-blocking: runs in background
 */

import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { env } from '@/lib/env';

let initialized = false;

export async function initializeAdmin(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    await connectDB();

    const existingAdmin = await User.findOne({ email: env.ADMIN_EMAIL }).lean();

    if (existingAdmin) {
      return;
    }

    const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 12);

    await User.create({
      email: env.ADMIN_EMAIL,
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
    });

    console.log('Admin user created successfully');
  } catch (error) {
    initialized = false;
    console.error('Error initializing admin:', error);
  }
}
