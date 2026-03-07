/**
 * Email Verification API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { SubscriberService } from '@/lib/subscriber-service';

/**
 * GET /api/subscribers/verify?token=xxx
 * Verify subscriber email
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        new URL('/subscribe?error=Invalid verification link', request.url)
      );
    }

    const result = await SubscriberService.verifySubscriber(token);

    if (!result.success) {
      return NextResponse.redirect(
        new URL(`/subscribe?error=${encodeURIComponent(result.message)}`, request.url)
      );
    }

    return NextResponse.redirect(
      new URL('/subscribe?success=true', request.url)
    );
  } catch (error) {
    console.error('Error verifying subscriber:', error);
    return NextResponse.redirect(
      new URL('/subscribe?error=Verification failed', request.url)
    );
  }
}
