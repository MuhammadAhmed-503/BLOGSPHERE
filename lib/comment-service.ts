/**
 * Comment Service Layer
 * Business logic for comment operations with nested replies
 */

import connectDB from '@/lib/db';
import Comment, { IComment } from '@/models/Comment';
import { sanitizeHtml } from '@/lib/security';

export interface CreateCommentData {
  blogId: string;
  parentCommentId?: string | null;
  name: string;
  email?: string;
  content: string;
}

// Plain JS object shape returned by `.lean()` (does not include Mongoose Document methods)
export interface LeanComment {
  _id: unknown; // ObjectId from Mongoose
  blogId: string;
  parentCommentId?: string | null;
  name: string;
  email?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentWithReplies extends LeanComment {
  replies?: CommentWithReplies[];
}

export class CommentService {
  /**
   * Create a new comment
   */
  static async createComment(data: CreateCommentData): Promise<IComment> {
    await connectDB();

    // Sanitize content to prevent XSS
    const sanitizedContent = sanitizeHtml(data.content);

    const comment = await Comment.create({
      ...data,
      content: sanitizedContent,
    });

    return comment;
  }

  /**
   * Approve a comment
   */
  static async approveComment(commentId: string): Promise<IComment | null> {
    await connectDB();

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { isApproved: true },
      { new: true }
    );

    return comment;
  }

  /**
   * Delete a comment and all its replies
   */
  static async deleteComment(commentId: string): Promise<boolean> {
    await connectDB();

    // Get all reply IDs recursively
    const getAllReplyIds = async (parentId: string): Promise<string[]> => {
      const replies = await Comment.find({ parentCommentId: parentId }).select('_id');
      const replyIds = replies.map(r => r._id.toString());

      for (const replyId of replyIds) {
        const nestedReplyIds = await getAllReplyIds(replyId);
        replyIds.push(...nestedReplyIds);
      }

      return replyIds;
    };

    const replyIds = await getAllReplyIds(commentId);

    // Delete the comment and all its replies
    await Comment.deleteMany({
      _id: { $in: [commentId, ...replyIds] }
    });

    return true;
  }

  /**
   * Get comments for a blog with nested structure
   */
  static async getCommentsByBlog(
    blogId: string
  ): Promise<CommentWithReplies[]> {
    await connectDB();

    try {
      // Fetch all comments for this blog
      const allComments = (await Comment.find({ blogId })
        .select('-__v')
        .sort({ createdAt: 1 })
        .lean()) as unknown as LeanComment[];

      if (!allComments || allComments.length === 0) {
        return [];
      }

      // Build nested structure
      const commentMap = new Map<string, CommentWithReplies>();
      const rootComments: CommentWithReplies[] = [];

      // Step 1: Initialize all comments in the map
      allComments.forEach((comment: LeanComment) => {
        const commentId = comment._id?.toString ? comment._id.toString() : String(comment._id);
        commentMap.set(commentId, {
          ...comment,
          _id: commentId,
          replies: [],
        } as CommentWithReplies);
      });

      // Step 2: Build the tree structure
      allComments.forEach((comment: LeanComment) => {
        const commentId = comment._id?.toString ? comment._id.toString() : String(comment._id);
        const commentWithReplies = commentMap.get(commentId);
        
        if (!commentWithReplies) return;

        if (comment.parentCommentId && String(comment.parentCommentId).trim() !== '') {
          const parent = commentMap.get(String(comment.parentCommentId));
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(commentWithReplies);
          } else {
            // If parent not found, treat as root comment
            rootComments.push(commentWithReplies);
          }
        } else {
          // This is a root comment
          rootComments.push(commentWithReplies);
        }
      });

      return rootComments;
    } catch (error) {
      console.error('Error in getCommentsByBlog:', error);
      return [];
    }
  }

  /**
   * Get comment count for a blog
   */
  static async getCommentCount(blogId: string): Promise<number> {
    await connectDB();

    const count = await Comment.countDocuments({
      blogId,
      parentCommentId: null,
    });

    return count;
  }
}
