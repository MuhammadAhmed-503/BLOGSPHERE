"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.siteSettingSchema = exports.commentModerationSchema = exports.commentSchema = exports.uploadQuerySchema = exports.pushSubscriptionSchema = exports.contactSchema = exports.subscriptionSchema = exports.postSchema = exports.googleAuthSchema = exports.authCredentialsSchema = void 0;
const zod_1 = require("zod");
exports.authCredentialsSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    name: zod_1.z.string().min(2).optional(),
});
exports.googleAuthSchema = zod_1.z.object({
    idToken: zod_1.z.string().min(10),
});
exports.postSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    slug: zod_1.z.string().min(3).optional(),
    excerpt: zod_1.z.string().max(300).optional(),
    content: zod_1.z.string().min(1),
    category: zod_1.z.string().min(1),
    tags: zod_1.z.array(zod_1.z.string().min(1)).max(10).default([]),
    coverImage: zod_1.z.string().url().optional(),
    publishedAt: zod_1.z.string().datetime().optional(),
    createdAt: zod_1.z.string().datetime().optional(),
    readingTime: zod_1.z.number().int().positive().optional(),
    featured: zod_1.z.boolean().optional(),
    metaTitle: zod_1.z.string().optional(),
    metaDescription: zod_1.z.string().optional(),
    status: zod_1.z.enum(['draft', 'published', 'archived']).optional(),
    authorName: zod_1.z.string().optional(),
});
exports.subscriptionSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string().min(2).optional(),
    topics: zod_1.z.array(zod_1.z.string().min(1)).optional(),
});
exports.contactSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    subject: zod_1.z.string().min(3),
    message: zod_1.z.string().min(10),
});
exports.pushSubscriptionSchema = zod_1.z.object({
    endpoint: zod_1.z.string().url(),
    keys: zod_1.z.object({
        p256dh: zod_1.z.string().min(10),
        auth: zod_1.z.string().min(10),
    }),
    email: zod_1.z.string().email().optional(),
});
exports.uploadQuerySchema = zod_1.z.object({
    folder: zod_1.z.string().min(1).optional(),
});
exports.commentSchema = zod_1.z.object({
    authorName: zod_1.z.string().min(2),
    authorEmail: zod_1.z.string().email(),
    content: zod_1.z.string().min(2).max(5000),
});
exports.commentModerationSchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'approved', 'rejected', 'spam']).optional(),
    isPinned: zod_1.z.boolean().optional(),
});
exports.siteSettingSchema = zod_1.z.object({
    siteName: zod_1.z.string().min(2),
    logoUrl: zod_1.z.string().min(1),
    tagline: zod_1.z.string().optional(),
    contactEmail: zod_1.z.string().email().optional(),
    showFeaturedSection: zod_1.z.boolean().optional(),
    showTrendingSection: zod_1.z.boolean().optional(),
    showLatestSection: zod_1.z.boolean().optional(),
    showNewsletterSection: zod_1.z.boolean().optional(),
    requireUserLogin: zod_1.z.boolean().optional(),
    allowUserSignup: zod_1.z.boolean().optional(),
    allowAnonymousComments: zod_1.z.boolean().optional(),
});
