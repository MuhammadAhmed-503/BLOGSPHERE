/**
 * Comments API Routes
 */

import { NextRequest } from 'next/server';
import { CommentService } from '@/lib/comment-service';
import {
  successResponse,
  errorResponse,
} from '@/lib/api-response';
import { withRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

// Validation schema for creating a comment
const createCommentSchema = z.object({
  blogId: z.string().min(1),
  parentCommentId: z.string().optional(),
  name: z.string().min(1).max(100),
  email: z.string().email().optional().or(z.literal('')),
  content: z.string().min(1).max(1000),
});

/**
 * GET /api/comments
 * Get comments for a blog
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('blogId');

    // Get comments for a blog
    if (!blogId) {
      return errorResponse('Blog ID is required', 400);
    }

    const comments = await CommentService.getCommentsByBlog(blogId);

    return successResponse(comments, undefined, 200);
  } catch (error) {
    console.error('Error fetching comments:', {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return errorResponse('Failed to fetch comments', 500);
  }
}

/**
 * POST /api/comments
 * Create a new comment
 */
async function createCommentHandler(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createCommentSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        validation.error.errors[0].message,
        422
      );
    }

    // Convert empty email to undefined for cleaner data
    const data = {
      ...validation.data,
      email: validation.data.email ? validation.data.email.trim() : undefined,
    };

    const comment = await CommentService.createComment(data);

    return successResponse(
      comment,
      'Comment posted successfully!',
      201
    );
  } catch (error) {
    console.error('Error creating comment:', error);
    return errorResponse('Failed to create comment', 500);
  }
}

export const POST = (request: Request) =>
  withRateLimit(createCommentHandler, {
    maxRequests: 3,
    interval: 60000, // 3 comments per minute
  })(request);
