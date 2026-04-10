import { z } from 'zod';

export const authCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).optional(),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(10),
});

export const postSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(3).optional(),
  excerpt: z.string().max(300).optional(),
  content: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string().min(1)).max(10).default([]),
  coverImage: z.string().url().optional(),
  publishedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime().optional(),
  readingTime: z.number().int().positive().optional(),
  featured: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  authorName: z.string().optional(),
});

export const subscriptionSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).optional(),
  topics: z.array(z.string().min(1)).optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
});

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(10),
    auth: z.string().min(10),
  }),
  email: z.string().email().optional(),
});

export const uploadQuerySchema = z.object({
  folder: z.string().min(1).optional(),
});

export const commentSchema = z.object({
  authorName: z.string().min(2),
  authorEmail: z.string().email(),
  content: z.string().min(2).max(5000),
});

export const commentModerationSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'spam']).optional(),
  isPinned: z.boolean().optional(),
});

export const siteSettingSchema = z.object({
  siteName: z.string().min(2),
  logoUrl: z.string().min(1),
  tagline: z.string().optional(),
  contactEmail: z.string().email().optional(),
  showFeaturedSection: z.boolean().optional(),
  showTrendingSection: z.boolean().optional(),
  showLatestSection: z.boolean().optional(),
  showNewsletterSection: z.boolean().optional(),
  requireUserLogin: z.boolean().optional(),
  allowUserSignup: z.boolean().optional(),
  allowAnonymousComments: z.boolean().optional(),
});