/**
 * Push Notification Send API Route (Admin only)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PushNotificationService } from '@/lib/push-notification';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-response';
import { z } from 'zod';

const sendPushSchema = z.object({
  blogTitle: z.string().min(1),
  blogSlug: z.string().min(1),
  excerpt: z.string().min(1),
});

/**
 * POST /api/push/send
 * Send push notification to all subscribers (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return unauthorizedResponse();
    }

    const body = await request.json();

    // Validate input
    const validation = sendPushSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        validation.error.errors[0].message,
        422
      );
    }

    const result = await PushNotificationService.notifyNewBlog(
      validation.data.blogTitle,
      validation.data.blogSlug
    );

    return successResponse(
      result,
      `Push notifications sent: ${result.sent} succeeded, ${result.failed} failed`
    );
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return errorResponse('Failed to send push notifications', 500);
  }
}
