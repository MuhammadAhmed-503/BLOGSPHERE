import { Schema, model, type InferSchemaType } from 'mongoose';

const commentSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    postSlug: { type: String, required: true, index: true },
    authorName: { type: String, required: true, trim: true },
    authorEmail: { type: String, required: true, lowercase: true, trim: true },
    content: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'spam'], default: 'pending', index: true },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type Comment = InferSchemaType<typeof commentSchema>;

export const CommentModel = model('Comment', commentSchema);