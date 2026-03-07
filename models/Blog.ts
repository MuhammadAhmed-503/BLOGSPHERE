/**
 * Blog Model
 * Production-grade blog model with SEO optimization and indexing
 */

import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IBlog extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  category: string;
  metaTitle: string;
  metaDescription: string;
  readingTime: number; // in minutes
  views: number;
  featured: boolean;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: 'text', // Text index for search
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^[a-z0-9-]+$/,
        'Slug can only contain lowercase letters, numbers, and hyphens',
      ],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      index: 'text', // Text index for search
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      maxlength: [300, 'Excerpt cannot exceed 300 characters'],
    },
    coverImage: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
      index: true,
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= 10;
        },
        message: 'Cannot have more than 10 tags',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    metaTitle: {
      type: String,
      required: [true, 'Meta title is required'],
      maxlength: [60, 'Meta title should not exceed 60 characters'],
    },
    metaDescription: {
      type: String,
      required: [true, 'Meta description is required'],
      maxlength: [160, 'Meta description should not exceed 160 characters'],
    },
    readingTime: {
      type: Number,
      default: 0,
      min: [0, 'Reading time cannot be negative'],
    },
    views: {
      type: Number,
      default: 0,
      index: true,
      min: [0, 'Views cannot be negative'],
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimized queries
BlogSchema.index({ isPublished: 1, publishedAt: -1 }); // For published blogs sorted by date
BlogSchema.index({ isPublished: 1, views: -1 }); // For trending blogs
BlogSchema.index({ isPublished: 1, featured: 1 }); // For featured blogs
BlogSchema.index({ category: 1, isPublished: 1 }); // For category filtering
BlogSchema.index({ tags: 1, isPublished: 1 }); // For tag filtering
BlogSchema.index({ createdAt: -1 }); // For latest blogs

// Text index for search functionality
BlogSchema.index({ title: 'text', content: 'text' }, {
  weights: {
    title: 10,
    content: 5,
  },
  name: 'blog_text_index',
});

// Pre-save middleware to set publishedAt
BlogSchema.pre('save', function (next) {
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const Blog: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);

export default Blog;
