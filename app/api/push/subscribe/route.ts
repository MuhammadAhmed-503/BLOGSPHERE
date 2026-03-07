/**
 * Push Subscription API Route
 */

import { NextRequest } from 'next/server';
import { SubscriberService } from '@/lib/subscriber-service';
import { successResponse, errorResponse } from '@/lib/api-response';
import { z } from 'zod';

const pushSubscriptionSchema = z.object({
  email: z.string().email(),
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
});

/**
 * POST /api/push/subscribe
 * Store push notification subscription
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = pushSubscriptionSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        validation.error.errors[0].message,
        422
      );
    }

    const result = await SubscriberService.storePushSubscription(
      validation.data.email,
      validation.data.subscription
    );

    if (!result.success) {
      return errorResponse(result.message, 400);
    }

    return successResponse(
      { success: true },
      result.message
    );
  } catch (error) {
    console.error('Error storing push subscription:', error);
    return errorResponse('Failed to store push subscription', 500);
  }
}
