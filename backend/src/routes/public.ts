import { Router } from 'express';
import { CommentModel } from '../models/Comment';
import { PostModel } from '../models/Post';
import { SiteSettingModel } from '../models/SiteSetting';
import { SubscriptionModel } from '../models/Subscription';
import { withId, withIdList } from '../utils/serialize';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';
import { commentSchema } from '../validators';

const publicRouter = Router();

publicRouter.get(
  '/settings',
  asyncHandler(async (_req, res) => {
    const settings = await SiteSettingModel.findOne().sort({ createdAt: 1 });

    res.json({
      success: true,
      data: settings
        ? withId(settings)
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
  })
);

publicRouter.get(
  '/home',
  asyncHandler(async (_req, res) => {
    const [featuredPosts, latestPosts, trendingPosts, categories, settings] = await Promise.all([
      PostModel.find({ status: 'published', featured: true }).sort({ publishedAt: -1 }).limit(3),
      PostModel.find({ status: 'published' }).sort({ publishedAt: -1 }).limit(6),
      PostModel.find({ status: 'published' }).sort({ views: -1 }).limit(4),
      PostModel.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ]),
      SiteSettingModel.findOne().sort({ createdAt: 1 }),
    ]);

    res.json({
      success: true,
      data: {
        featuredPosts: withIdList(featuredPosts),
        latestPosts: withIdList(latestPosts),
        trendingPosts: withIdList(trendingPosts),
        categories: categories.map((category) => ({ name: category._id, count: category.count })),
        settings: settings ? withId(settings) : null,
      },
    });
  })
);

publicRouter.get(
  '/posts',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 10)));
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const tag = typeof req.query.tag === 'string' ? req.query.tag : undefined;
    const featured = typeof req.query.featured === 'string' ? req.query.featured === 'true' : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
    const status = 'published';

    const filters: Record<string, unknown> = { status };

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
      PostModel.find(filters).sort({ publishedAt: -1 }).skip((page - 1) * limit).limit(limit),
      PostModel.countDocuments(filters),
    ]);

    res.json({
      success: true,
      data: {
        posts: withIdList(posts),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    });
  })
);

publicRouter.get(
  '/posts/:slug',
  asyncHandler(async (req, res) => {
    const post = await PostModel.findOneAndUpdate(
      { slug: req.params.slug, status: 'published' },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    const relatedPosts = await PostModel.find({
      slug: { $ne: post.slug },
      status: 'published',
      $or: [{ category: post.category }, { tags: { $in: post.tags } }],
    })
      .sort({ views: -1, publishedAt: -1 })
      .limit(3);

    res.json({
      success: true,
      data: {
        post: withId(post),
        relatedPosts: withIdList(relatedPosts),
      },
    });
  })
);

publicRouter.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const categories = await PostModel.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]);

    res.json({
      success: true,
      data: categories.map((category) => ({ name: category._id, count: category.count })),
    });
  })
);

publicRouter.get(
  '/tags',
  asyncHandler(async (_req, res) => {
    const tags = await PostModel.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]);

    res.json({
      success: true,
      data: tags.map((tag) => ({ name: tag._id, count: tag.count })),
    });
  })
);

publicRouter.post(
  '/posts/:slug/comments',
  asyncHandler(async (req, res) => {
    const parsed = commentSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Validation failed', 400, parsed.error.flatten());
    }

    const post = await PostModel.findOne({ slug: req.params.slug, status: 'published' });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    const comment = await CommentModel.create({
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
      data: withId(comment),
    });
  })
);

publicRouter.get(
  '/posts/:slug/comments',
  asyncHandler(async (req, res) => {
    const comments = await CommentModel.find({
      postSlug: req.params.slug,
      status: 'approved',
    })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(200);

    res.json({
      success: true,
      data: withIdList(comments),
    });
  })
);

publicRouter.post(
  '/newsletter/subscribe',
  asyncHandler(async (req, res) => {
    const email = typeof req.body.email === 'string' ? req.body.email.toLowerCase() : undefined;
    const name = typeof req.body.name === 'string' ? req.body.name : undefined;
    const topics = Array.isArray(req.body.topics) ? req.body.topics.filter((topic: unknown) => typeof topic === 'string') : [];

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    const subscription = await SubscriptionModel.findOneAndUpdate(
      { email },
      {
        email,
        name,
        topics,
        status: 'subscribed',
        verificationStatus: 'verified',
        subscribedAt: new Date(),
        unsubscribedAt: undefined,
      },
      { new: true, upsert: true }
    );

    res.status(201).json({
      success: true,
      message: 'Subscription saved',
      data: withId(subscription),
    });
  })
);

publicRouter.post(
  '/newsletter/unsubscribe',
  asyncHandler(async (req, res) => {
    const email = typeof req.body.email === 'string' ? req.body.email.toLowerCase() : undefined;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    const subscription = await SubscriptionModel.findOneAndUpdate(
      { email },
      { status: 'unsubscribed', unsubscribedAt: new Date() },
      { new: true }
    );

    if (!subscription) {
      throw new AppError('Subscription not found', 404);
    }

    res.json({
      success: true,
      message: 'Unsubscribed successfully',
      data: withId(subscription),
    });
  })
);

export default publicRouter;