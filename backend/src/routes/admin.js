"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../utils/asyncHandler");
const appError_1 = require("../utils/appError");
const validators_1 = require("../validators");
const slug_1 = require("../utils/slug");
const Comment_1 = require("../models/Comment");
const Post_1 = require("../models/Post");
const SiteSetting_1 = require("../models/SiteSetting");
const User_1 = require("../models/User");
const Subscription_1 = require("../models/Subscription");
const ContactMessage_1 = require("../models/ContactMessage");
const PushSubscription_1 = require("../models/PushSubscription");
const serialize_1 = require("../utils/serialize");
const cloudinary_1 = require("../services/cloudinary");
const email_1 = require("../services/email");
const adminRouter = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
adminRouter.use(auth_1.authenticateRequest, auth_1.requireAdmin);
adminRouter.get('/settings', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    let settings = await SiteSetting_1.SiteSettingModel.findOne().sort({ createdAt: 1 });
    if (!settings) {
        settings = await SiteSetting_1.SiteSettingModel.create({
            siteName: process.env.NEXT_PUBLIC_APP_NAME ?? 'BlogSphere',
            logoUrl: '/logo.svg',
            tagline: 'Modern publishing platform',
            contactEmail: 'contact@blogplatform.com',
            requireUserLogin: false,
            allowUserSignup: true,
            allowAnonymousComments: true,
        });
    }
    res.json({ success: true, data: (0, serialize_1.withId)(settings) });
}));
adminRouter.put('/settings', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const parsed = validators_1.siteSettingSchema.partial().safeParse(req.body);
    if (!parsed.success) {
        throw new appError_1.AppError('Validation failed', 400, parsed.error.flatten());
    }
    let settings = await SiteSetting_1.SiteSettingModel.findOne().sort({ createdAt: 1 });
    if (!settings) {
        settings = await SiteSetting_1.SiteSettingModel.create({
            siteName: process.env.NEXT_PUBLIC_APP_NAME ?? 'BlogSphere',
            logoUrl: '/logo.svg',
            requireUserLogin: false,
            allowUserSignup: true,
            allowAnonymousComments: true,
        });
    }
    Object.assign(settings, parsed.data);
    await settings.save();
    res.json({ success: true, data: (0, serialize_1.withId)(settings) });
}));
adminRouter.get('/dashboard', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const [posts, publishedPosts, draftPosts, subscribers, messages, users, comments, pendingComments, totalViewsResult] = await Promise.all([
        Post_1.PostModel.countDocuments(),
        Post_1.PostModel.countDocuments({ status: 'published' }),
        Post_1.PostModel.countDocuments({ status: 'draft' }),
        Subscription_1.SubscriptionModel.countDocuments({ status: 'subscribed' }),
        ContactMessage_1.ContactMessageModel.countDocuments(),
        User_1.UserModel.countDocuments(),
        Comment_1.CommentModel.countDocuments(),
        Comment_1.CommentModel.countDocuments({ status: 'pending' }),
        Post_1.PostModel.aggregate([
            { $group: { _id: null, totalViews: { $sum: '$views' } } },
        ]),
    ]);
    const totalViews = totalViewsResult[0]?.totalViews ?? 0;
    res.json({
        success: true,
        data: {
            posts,
            publishedPosts,
            draftPosts,
            subscribers,
            messages,
            users,
            comments,
            pendingComments,
            totalViews,
        },
    });
}));
adminRouter.get('/posts', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
    const sort = typeof req.query.sort === 'string' ? req.query.sort : 'createdAt';
    const order = typeof req.query.order === 'string' && req.query.order.toLowerCase() === 'asc' ? 1 : -1;
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
    const filters = {};
    if (status) {
        filters.status = status;
    }
    if (category) {
        filters.category = category;
    }
    if (search) {
        filters.$or = [
            { title: { $regex: search, $options: 'i' } },
            { excerpt: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
        ];
    }
    const [posts, total] = await Promise.all([
        Post_1.PostModel.find(filters).sort({ [sort]: order }).skip((page - 1) * limit).limit(limit),
        Post_1.PostModel.countDocuments(filters),
    ]);
    res.json({
        success: true,
        data: {
            posts: (0, serialize_1.withIdList)(posts),
            pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
        },
    });
}));
adminRouter.post('/posts', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const parsed = validators_1.postSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new appError_1.AppError('Validation failed', 400, parsed.error.flatten());
    }
    const data = parsed.data;
    const slug = data.slug?.trim() || (0, slug_1.createSlug)(data.title);
    const existingPost = await Post_1.PostModel.findOne({ slug });
    if (existingPost) {
        throw new appError_1.AppError('A post with this slug already exists', 409);
    }
    const post = await Post_1.PostModel.create({
        ...data,
        slug,
        excerpt: data.excerpt?.trim() || data.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300),
        coverImage: data.coverImage?.trim() || 'https://placehold.co/1280x720/f0f9ff/0c4a6e?text=Draft+Cover',
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        readingTime: data.readingTime ?? Math.max(1, Math.ceil(data.content.split(/\s+/).length / 200)),
        status: data.status ?? 'draft',
        authorId: req.auth?.userId,
        authorName: data.authorName ?? 'Administrator',
    });
    res.status(201).json({ success: true, data: (0, serialize_1.withId)(post) });
}));
adminRouter.get('/posts/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const post = await Post_1.PostModel.findById(req.params.id);
    if (!post) {
        throw new appError_1.AppError('Post not found', 404);
    }
    res.json({ success: true, data: (0, serialize_1.withId)(post) });
}));
adminRouter.put('/posts/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const parsed = validators_1.postSchema.partial().safeParse(req.body);
    if (!parsed.success) {
        throw new appError_1.AppError('Validation failed', 400, parsed.error.flatten());
    }
    const data = parsed.data;
    const post = await Post_1.PostModel.findById(req.params.id);
    if (!post) {
        throw new appError_1.AppError('Post not found', 404);
    }
    if (data.title)
        post.title = data.title;
    if (data.slug)
        post.slug = data.slug;
    if (data.excerpt !== undefined)
        post.excerpt = data.excerpt || data.content?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300) || post.excerpt;
    if (data.content)
        post.content = data.content;
    if (data.category)
        post.category = data.category;
    if (data.tags)
        post.tags = data.tags;
    if (data.coverImage)
        post.coverImage = data.coverImage;
    if (data.publishedAt)
        post.publishedAt = new Date(data.publishedAt);
    if (data.createdAt)
        post.createdAt = new Date(data.createdAt);
    if (data.readingTime)
        post.readingTime = data.readingTime;
    if (data.featured !== undefined)
        post.featured = data.featured;
    if (data.metaTitle !== undefined)
        post.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined)
        post.metaDescription = data.metaDescription;
    if (data.status)
        post.status = data.status;
    if (data.authorName)
        post.authorName = data.authorName;
    if (data.slug)
        post.slug = (0, slug_1.createSlug)(data.slug);
    await post.save();
    res.json({ success: true, data: (0, serialize_1.withId)(post) });
}));
adminRouter.delete('/posts/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const post = await Post_1.PostModel.findByIdAndDelete(req.params.id);
    if (!post) {
        throw new appError_1.AppError('Post not found', 404);
    }
    res.json({ success: true, message: 'Post deleted successfully' });
}));
adminRouter.patch('/posts/:id/status', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { status } = req.body;
    if (!status || !['draft', 'published', 'archived'].includes(status)) {
        throw new appError_1.AppError('Invalid status value', 400);
    }
    const post = await Post_1.PostModel.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!post) {
        throw new appError_1.AppError('Post not found', 404);
    }
    res.json({ success: true, data: (0, serialize_1.withId)(post) });
}));
adminRouter.patch('/posts/:id/publish', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const post = await Post_1.PostModel.findByIdAndUpdate(req.params.id, { status: 'published' }, { new: true });
    if (!post) {
        throw new appError_1.AppError('Post not found', 404);
    }
    res.json({ success: true, data: (0, serialize_1.withId)(post) });
}));
adminRouter.patch('/posts/:id/feature', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { featured } = req.body;
    if (typeof featured !== 'boolean') {
        throw new appError_1.AppError('featured must be a boolean', 400);
    }
    const post = await Post_1.PostModel.findByIdAndUpdate(req.params.id, { featured }, { new: true });
    if (!post) {
        throw new appError_1.AppError('Post not found', 404);
    }
    res.json({ success: true, data: (0, serialize_1.withId)(post) });
}));
adminRouter.post('/posts/:id/upload-cover', upload.single('file'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        throw new appError_1.AppError('Image file is required', 400);
    }
    const uploadResult = await (0, cloudinary_1.uploadImage)(req.file.buffer, 'blog-saas/covers');
    res.json({
        success: true,
        data: uploadResult,
    });
}));
adminRouter.post('/uploads/file', upload.single('file'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        throw new appError_1.AppError('File is required', 400);
    }
    const requestedType = typeof req.body.resourceType === 'string' ? req.body.resourceType : 'auto';
    const resourceType = ['image', 'video', 'raw', 'auto'].includes(requestedType) ? requestedType : 'auto';
    const folder = typeof req.body.folder === 'string' && req.body.folder.trim()
        ? req.body.folder.trim()
        : 'blog-saas/uploads';
    const uploaded = await (0, cloudinary_1.uploadAsset)(req.file.buffer, folder, resourceType);
    res.status(201).json({
        success: true,
        data: uploaded,
    });
}));
adminRouter.get('/comments', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const blogId = typeof req.query.blogId === 'string' ? req.query.blogId : undefined;
    const filters = {};
    if (status) {
        filters.status = status;
    }
    if (blogId) {
        filters.postId = blogId;
    }
    const comments = await Comment_1.CommentModel.find(filters).populate('postId', 'title slug').sort({ createdAt: -1 }).limit(300);
    res.json({
        success: true,
        data: comments.map((comment) => {
            const serialized = (0, serialize_1.withId)(comment);
            const populatedPost = comment.postId ?? null;
            return {
                ...serialized,
                postTitle: populatedPost?.title,
                postSlug: populatedPost?.slug ?? serialized.postSlug,
            };
        }),
    });
}));
adminRouter.patch('/comments/:id/approve', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const comment = await Comment_1.CommentModel.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!comment) {
        throw new appError_1.AppError('Comment not found', 404);
    }
    const post = await Post_1.PostModel.findById(comment.postId).select('title slug');
    res.json({
        success: true,
        data: {
            ...(0, serialize_1.withId)(comment),
            postTitle: post?.title,
            postSlug: post?.slug ?? comment.postSlug,
        },
    });
}));
adminRouter.patch('/comments/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const parsed = validators_1.commentModerationSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new appError_1.AppError('Validation failed', 400, parsed.error.flatten());
    }
    const comment = await Comment_1.CommentModel.findById(req.params.id);
    if (!comment) {
        throw new appError_1.AppError('Comment not found', 404);
    }
    if (parsed.data.status) {
        comment.status = parsed.data.status;
    }
    if (typeof parsed.data.isPinned === 'boolean') {
        comment.isPinned = parsed.data.isPinned;
    }
    await comment.save();
    res.json({ success: true, data: (0, serialize_1.withId)(comment) });
}));
adminRouter.delete('/comments/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const deleted = await Comment_1.CommentModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
        throw new appError_1.AppError('Comment not found', 404);
    }
    res.json({ success: true, message: 'Comment deleted successfully' });
}));
adminRouter.get('/subscribers', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const subscribers = await Subscription_1.SubscriptionModel.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: (0, serialize_1.withIdList)(subscribers) });
}));
adminRouter.delete('/subscribers/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const deleted = await Subscription_1.SubscriptionModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
        throw new appError_1.AppError('Subscriber not found', 404);
    }
    res.json({ success: true, message: 'Subscriber deleted successfully' });
}));
adminRouter.post('/subscribers/notify', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const subject = typeof req.body.subject === 'string' && req.body.subject.trim() ? req.body.subject.trim() : 'Latest update from BlogSphere';
    const message = typeof req.body.message === 'string' && req.body.message.trim() ? req.body.message.trim() : 'A new update is available on the blog.';
    const subscribers = await Subscription_1.SubscriptionModel.find({ status: 'subscribed' }).sort({ createdAt: -1 }).limit(200);
    for (const subscriber of subscribers) {
        await (0, email_1.sendMail)({
            to: subscriber.email,
            subject,
            text: message,
        });
    }
    res.json({ success: true, data: { sentTo: subscribers.length } });
}));
adminRouter.get('/messages', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const messages = await ContactMessage_1.ContactMessageModel.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: (0, serialize_1.withIdList)(messages) });
}));
adminRouter.get('/push-subscriptions', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const subscriptions = await PushSubscription_1.PushSubscriptionModel.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: (0, serialize_1.withIdList)(subscriptions) });
}));
exports.default = adminRouter;
