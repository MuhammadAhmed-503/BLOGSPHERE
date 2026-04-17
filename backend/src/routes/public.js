"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Comment_1 = require("../models/Comment");
const Post_1 = require("../models/Post");
const SiteSetting_1 = require("../models/SiteSetting");
const Subscription_1 = require("../models/Subscription");
const serialize_1 = require("../utils/serialize");
const appError_1 = require("../utils/appError");
const asyncHandler_1 = require("../utils/asyncHandler");
const validators_1 = require("../validators");
const publicRouter = (0, express_1.Router)();
publicRouter.get('/settings', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const settings = await SiteSetting_1.SiteSettingModel.findOne().sort({ createdAt: 1 });
    res.json({
        success: true,
        data: settings
            ? (0, serialize_1.withId)(settings)
            : {
                id: 'default',
                siteName: process.env.NEXT_PUBLIC_APP_NAME ?? 'BlogSphere',
                logoUrl: '/logo.svg',
                tagline: 'Modern publishing platform',
                contactEmail: 'contact@blogplatform.com',
                showFeaturedSection: true,
                showTrendingSection: true,
                showLatestSection: true,
                showNewsletterSection: true,
                requireUserLogin: false,
                allowUserSignup: true,
                allowAnonymousComments: true,
            },
    });
}));
publicRouter.get('/home', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const [featuredPosts, latestPosts, trendingPosts, categories, settings] = await Promise.all([
        Post_1.PostModel.find({ status: 'published', featured: true }).sort({ publishedAt: -1 }).limit(3),
        Post_1.PostModel.find({ status: 'published' }).sort({ publishedAt: -1 }).limit(6),
        Post_1.PostModel.find({ status: 'published' }).sort({ views: -1 }).limit(4),
        Post_1.PostModel.aggregate([
            { $match: { status: 'published' } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
        ]),
        SiteSetting_1.SiteSettingModel.findOne().sort({ createdAt: 1 }),
    ]);
    res.json({
        success: true,
        data: {
            featuredPosts: (0, serialize_1.withIdList)(featuredPosts),
            latestPosts: (0, serialize_1.withIdList)(latestPosts),
            trendingPosts: (0, serialize_1.withIdList)(trendingPosts),
            categories: categories.map((category) => ({ name: category._id, count: category.count })),
            settings: settings ? (0, serialize_1.withId)(settings) : null,
        },
    });
}));
publicRouter.get('/posts', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 10)));
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const tag = typeof req.query.tag === 'string' ? req.query.tag : undefined;
    const featured = typeof req.query.featured === 'string' ? req.query.featured === 'true' : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
    const status = 'published';
    const filters = { status };
    if (category) {
        filters.category = category;
    }
    if (tag) {
        filters.tags = tag;
    }
    if (featured !== undefined) {
        filters.featured = featured;
    }
    if (search) {
        filters.$or = [
            { title: { $regex: search, $options: 'i' } },
            { excerpt: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
        ];
    }
    const [posts, total] = await Promise.all([
        Post_1.PostModel.find(filters).sort({ publishedAt: -1 }).skip((page - 1) * limit).limit(limit),
        Post_1.PostModel.countDocuments(filters),
    ]);
    res.json({
        success: true,
        data: {
            posts: (0, serialize_1.withIdList)(posts),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        },
    });
}));
publicRouter.get('/posts/:slug', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const post = await Post_1.PostModel.findOneAndUpdate({ slug: req.params.slug, status: 'published' }, { $inc: { views: 1 } }, { new: true });
    if (!post) {
        throw new appError_1.AppError('Post not found', 404);
    }
    const relatedPosts = await Post_1.PostModel.find({
        slug: { $ne: post.slug },
        status: 'published',
        $or: [{ category: post.category }, { tags: { $in: post.tags } }],
    })
        .sort({ views: -1, publishedAt: -1 })
        .limit(3);
    res.json({
        success: true,
        data: {
            post: (0, serialize_1.withId)(post),
            relatedPosts: (0, serialize_1.withIdList)(relatedPosts),
        },
    });
}));
publicRouter.get('/categories', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const categories = await Post_1.PostModel.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
    ]);
    res.json({
        success: true,
        data: categories.map((category) => ({ name: category._id, count: category.count })),
    });
}));
publicRouter.get('/tags', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const tags = await Post_1.PostModel.aggregate([
        { $match: { status: 'published' } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
    ]);
    res.json({
        success: true,
        data: tags.map((tag) => ({ name: tag._id, count: tag.count })),
    });
}));
publicRouter.post('/posts/:slug/comments', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const parsed = validators_1.commentSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new appError_1.AppError('Validation failed', 400, parsed.error.flatten());
    }
    const post = await Post_1.PostModel.findOne({ slug: req.params.slug, status: 'published' });
    if (!post) {
        throw new appError_1.AppError('Post not found', 404);
    }
    const comment = await Comment_1.CommentModel.create({
        postId: post._id,
        postSlug: post.slug,
        authorName: parsed.data.authorName,
        authorEmail: parsed.data.authorEmail,
        content: parsed.data.content,
        status: 'pending',
    });
    res.status(201).json({
        success: true,
        message: 'Comment submitted for review',
        data: (0, serialize_1.withId)(comment),
    });
}));
publicRouter.get('/posts/:slug/comments', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const comments = await Comment_1.CommentModel.find({
        postSlug: req.params.slug,
        status: 'approved',
    })
        .sort({ isPinned: -1, createdAt: -1 })
        .limit(200);
    res.json({
        success: true,
        data: (0, serialize_1.withIdList)(comments),
    });
}));
publicRouter.post('/newsletter/subscribe', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const email = typeof req.body.email === 'string' ? req.body.email.toLowerCase() : undefined;
    const name = typeof req.body.name === 'string' ? req.body.name : undefined;
    const topics = Array.isArray(req.body.topics) ? req.body.topics.filter((topic) => typeof topic === 'string') : [];
    if (!email) {
        throw new appError_1.AppError('Email is required', 400);
    }
    const subscription = await Subscription_1.SubscriptionModel.findOneAndUpdate({ email }, {
        email,
        name,
        topics,
        status: 'subscribed',
        verificationStatus: 'verified',
        subscribedAt: new Date(),
        unsubscribedAt: undefined,
    }, { new: true, upsert: true });
    res.status(201).json({
        success: true,
        message: 'Subscription saved',
        data: (0, serialize_1.withId)(subscription),
    });
}));
publicRouter.post('/newsletter/unsubscribe', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const email = typeof req.body.email === 'string' ? req.body.email.toLowerCase() : undefined;
    if (!email) {
        throw new appError_1.AppError('Email is required', 400);
    }
    const subscription = await Subscription_1.SubscriptionModel.findOneAndUpdate({ email }, { status: 'unsubscribed', unsubscribedAt: new Date() }, { new: true });
    if (!subscription) {
        throw new appError_1.AppError('Subscription not found', 404);
    }
    res.json({
        success: true,
        message: 'Unsubscribed successfully',
        data: (0, serialize_1.withId)(subscription),
    });
}));
exports.default = publicRouter;
