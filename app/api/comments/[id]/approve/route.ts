/**
 * Comment Management API Routes (Admin only)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CommentService } from '@/lib/comment-service';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
} from '@/lib/api-response';

/**
 * PUT /api/comments/[id]/approve
 * Deprecated - Comments are now auto-approved. This endpoint is kept for backward compatibility.
 */
export async function PUT(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return unauthorizedResponse();
    }

    const { id } = params;

    const comment = await CommentService.approveComment(id);

    if (!comment) {
      return notFoundResponse('Comment not found');
    }

    return successResponse(comment, 'Comments are automatically approved. No approval needed.');
  } catch (error) {
    console.error('Error processing comment:', error);
    return errorResponse('Failed to process comment', 500);
  }
}
