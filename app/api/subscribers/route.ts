/**
 * Subscribers API Routes
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SubscriberService } from '@/lib/subscriber-service';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-response';
import { withRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

// Validation schema
const subscribeSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
});

/**
 * GET /api/subscribers
 * Get all subscribers (admin only)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return unauthorizedResponse();
    }

    const subscribers = await SubscriberService.getVerifiedSubscribers();

    return successResponse(subscribers);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return errorResponse('Failed to fetch subscribers', 500);
  }
}

/**
 * POST /api/subscribers
 * Subscribe to newsletter
 */
async function subscribeHandler(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validation = subscribeSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        validation.error.errors[0].message,
        422
      );
    }

    const result = await SubscriberService.subscribe(validation.data.email);

    if (!result.success) {
      return errorResponse(result.message, 400);
    }

    return successResponse(
      { email: validation.data.email },
      result.message,
      201
    );
  } catch (error) {
    console.error('Error subscribing:', error);
    return errorResponse('Failed to subscribe', 500);
  }
}

export const POST = (request: Request) =>
  withRateLimit(subscribeHandler, {
    maxRequests: 3,
    interval: 60000, // 3 subscriptions per minute per IP
  })(request);
