/**
 * Unsubscribe API Route
 */

import { NextRequest } from 'next/server';
import { SubscriberService } from '@/lib/subscriber-service';
import { successResponse, errorResponse } from '@/lib/api-response';
import { z } from 'zod';

const unsubscribeSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
});

/**
 * POST /api/subscribers/unsubscribe
 * Unsubscribe from newsletter
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = unsubscribeSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        validation.error.errors[0].message,
        422
      );
    }

    const result = await SubscriberService.unsubscribe(validation.data.email);

    if (!result.success) {
      return errorResponse(result.message, 400);
    }

    return successResponse(
      { email: validation.data.email },
      result.message
    );
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return errorResponse('Failed to unsubscribe', 500);
  }
}
