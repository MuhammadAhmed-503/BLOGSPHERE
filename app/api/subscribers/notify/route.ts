/**
 * Notify Subscribers API Route (Admin only)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SubscriberService } from '@/lib/subscriber-service';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-response';
import { z } from 'zod';

const notifySchema = z.object({
  blogTitle: z.string().min(1),
  blogSlug: z.string().min(1),
  blogExcerpt: z.string().min(1),
});

/**
 * POST /api/subscribers/notify
 * Notify all subscribers about new blog post (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return unauthorizedResponse();
    }

    const body = await request.json();

    // Validate input
    const validation = notifySchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        validation.error.errors[0].message,
        422
      );
    }

    const result = await SubscriberService.notifySubscribers(
      validation.data.blogTitle,
      validation.data.blogSlug,
      validation.data.blogExcerpt
    );

    return successResponse(
      result,
      `Notifications sent: ${result.sent} succeeded, ${result.failed} failed`
    );
  } catch (error) {
    console.error('Error notifying subscribers:', error);
    return errorResponse('Failed to notify subscribers', 500);
  }
}
