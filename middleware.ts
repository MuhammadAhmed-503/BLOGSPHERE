/**
 * Next.js Middleware
 * Protects admin routes and handles authentication
 * Optimized: minimal work, fast token check
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip login page entirely - no token check needed
  if (pathname === '/admin/login') {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (token && token.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protect all other admin routes
  if (pathname.startsWith('/admin')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.role !== 'admin') {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
