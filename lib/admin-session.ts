/**
 * Lightweight admin session reader
 * Decodes JWT directly from cookies WITHOUT importing heavy auth chain
 * (no bcryptjs, no mongoose, no User model)
 */

import { cookies } from 'next/headers';
import { decode } from 'next-auth/jwt';

export interface AdminUser {
  name: string;
  email: string;
  role: string;
}

/**
 * Read admin session from JWT cookie.
 * Much faster than getServerSession(authOptions) because it avoids
 * importing bcrypt, mongoose, User model, and connectDB.
 */
export async function getAdminSession(): Promise<AdminUser | null> {
  const cookieStore = cookies();
  const token =
    cookieStore.get('next-auth.session-token')?.value ||
    cookieStore.get('__Secure-next-auth.session-token')?.value;

  if (!token) return null;

  try {
    const decoded = await decode({
      token,
      secret: process.env.NEXTAUTH_SECRET!,
    });

    if (!decoded || decoded.role !== 'admin') return null;

    return {
      name: (decoded.name as string) || 'Admin',
      email: (decoded.email as string) || '',
      role: decoded.role as string,
    };
  } catch {
    return null;
  }
}
