/**
 * Comment Delete API Route (Admin only)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CommentService } from '@/lib/comment-service';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-response';

/**
 * DELETE /api/comments/[id]
 * Delete a comment and all its replies (admin only)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return unauthorizedResponse();
    }

    const { id } = params;

    await CommentService.deleteComment(id);

    return successResponse({ id }, 'Comment deleted successfully');
  } catch (error) {
    console.error('Error deleting comment:', error);
    return errorResponse('Failed to delete comment', 500);
  }
}
