/**
 * Blog Views API - Increment view count
 */

import { NextRequest } from 'next/server';
import { BlogService } from '@/lib/blog-service';
import { successResponse, errorResponse } from '@/lib/api-response';
import { withRateLimit } from '@/lib/rate-limit';

/**
 * POST /api/blogs/[slug]/view
 * Increment view count for a blog
 */
async function handler(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    await BlogService.incrementViews(slug);

    return successResponse({ success: true });
  } catch (error) {
    console.error('Error incrementing views:', error);
    return errorResponse('Failed to increment views', 500);
  }
}

export const POST = (
  request: Request,
  context: { params: { slug: string } }
) => withRateLimit(
  (req) => handler(req as NextRequest, context),
  { maxRequests: 5, interval: 60000 } // 5 views per minute per IP
)(request as NextRequest);
