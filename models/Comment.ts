/**
 * Comment Model
 * Supports nested replies with infinite depth
 */

import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IComment extends Document {
  _id: Types.ObjectId;
  blogId: string;
  parentCommentId?: string | null;
  name: string;
  email?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    blogId: {
      type: String,
      required: [true, 'Blog ID is required'],
      index: true,
    },
    parentCommentId: {
      type: String,
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
      sparse: true,
      validate: {
        validator: function(v: any) {
          // Allow null, undefined, or empty string
          if (!v) return true;
          // Validate email format if provided
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please provide a valid email address',
      },
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimized queries
CommentSchema.index({ blogId: 1, createdAt: 1 }); // For comments by blog
CommentSchema.index({ blogId: 1, parentCommentId: 1 }); // For nested replies

const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;
