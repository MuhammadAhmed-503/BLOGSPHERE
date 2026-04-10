import { Router } from 'express';
import multer from 'multer';
import { authenticateRequest, requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import { commentModerationSchema, postSchema, siteSettingSchema } from '../validators';
import { createSlug } from '../utils/slug';
import { CommentModel } from '../models/Comment';
import { PostModel } from '../models/Post';
import { SiteSettingModel } from '../models/SiteSetting';
import { UserModel } from '../models/User';
import { SubscriptionModel } from '../models/Subscription';
import { ContactMessageModel } from '../models/ContactMessage';
import { PushSubscriptionModel } from '../models/PushSubscription';
import { withId, withIdList } from '../utils/serialize';
import { uploadAsset, uploadImage } from '../services/cloudinary';
import { sendMail } from '../services/email';

const adminRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

adminRouter.use(authenticateRequest, requireAdmin);

adminRouter.get(
  '/settings',
  asyncHandler(async (_req, res) => {
    let settings = await SiteSettingModel.findOne().sort({ createdAt: 1 });

    if (!settings) {
      settings = await SiteSettingModel.create({
        siteName: process.env.NEXT_PUBLIC_APP_NAME ?? 'BlogSphere',
        logoUrl: '/logo.svg',
        tagline: 'Modern publishing platform',
        contactEmail: 'contact@blogplatform.com',
        requireUserLogin: false,
        allowUserSignup: true,
        allowAnonymousComments: true,
      });
    }

    res.json({ success: true, data: withId(settings) });
  })
);

adminRouter.put(
  '/settings',
  asyncHandler(async (req, res) => {
    const parsed = siteSettingSchema.partial().safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Validation failed', 400, parsed.error.flatten());
    }

    let settings = await SiteSettingModel.findOne().sort({ createdAt: 1 });

    if (!settings) {
      settings = await SiteSettingModel.create({
        siteName: process.env.NEXT_PUBLIC_APP_NAME ?? 'BlogSphere',
        logoUrl: '/logo.svg',
        requireUserLogin: false,
        allowUserSignup: true,
        allowAnonymousComments: true,
      });
    }

    Object.assign(settings, parsed.data);
    await settings.save();

    res.json({ success: true, data: withId(settings) });
  })
);

adminRouter.get(
  '/dashboard',
  asyncHandler(async (_req, res) => {
    const [posts, publishedPosts, draftPosts, subscribers, messages, users, comments, pendingComments, totalViewsResult] = await Promise.all([
      PostModel.countDocuments(),
      PostModel.countDocuments({ status: 'published' }),
      PostModel.countDocuments({ status: 'draft' }),
      SubscriptionModel.countDocuments({ status: 'subscribed' }),
      ContactMessageModel.countDocuments(),
      UserModel.countDocuments(),
      CommentModel.countDocuments(),
      CommentModel.countDocuments({ status: 'pending' }),
      PostModel.aggregate([
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
  })
);

adminRouter.get(
  '/posts',
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
    const sort = typeof req.query.sort === 'string' ? req.query.sort : 'createdAt';
    const order = typeof req.query.order === 'string' && req.query.order.toLowerCase() === 'asc' ? 1 : -1;
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
    const filters: Record<string, unknown> = {};

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
      PostModel.find(filters).sort({ [sort]: order }).skip((page - 1) * limit).limit(limit),
      PostModel.countDocuments(filters),
    ]);

    res.json({
      success: true,
      data: {
        posts: withIdList(posts),
        pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      },
    });
  })
);

adminRouter.post(
  '/posts',
  asyncHandler(async (req, res) => {
    const parsed = postSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Validation failed', 400, parsed.error.flatten());
    }

    const data = parsed.data;
    const slug = data.slug?.trim() || createSlug(data.title);
    const existingPost = await PostModel.findOne({ slug });

    if (existingPost) {
      throw new AppError('A post with this slug already exists', 409);
    }

    const post = await PostModel.create({
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

    res.status(201).json({ success: true, data: withId(post) });
  })
);

adminRouter.get(
  '/posts/:id',
  asyncHandler(async (req, res) => {
    const post = await PostModel.findById(req.params.id);

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    res.json({ success: true, data: withId(post) });
  })
);

adminRouter.put(
  '/posts/:id',
  asyncHandler(async (req, res) => {
    const parsed = postSchema.partial().safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Validation failed', 400, parsed.error.flatten());
    }

    const data = parsed.data;
    const post = await PostModel.findById(req.params.id);

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    if (data.title) post.title = data.title;
    if (data.slug) post.slug = data.slug;
    if (data.excerpt !== undefined) post.excerpt = data.excerpt || data.content?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300) || post.excerpt;
    if (data.content) post.content = data.content;
    if (data.category) post.category = data.category;
    if (data.tags) post.tags = data.tags;
    if (data.coverImage) post.coverImage = data.coverImage;
    if (data.publishedAt) post.publishedAt = new Date(data.publishedAt);
    if (data.createdAt) post.createdAt = new Date(data.createdAt);
    if (data.readingTime) post.readingTime = data.readingTime;
    if (data.featured !== undefined) post.featured = data.featured;
    if (data.metaTitle !== undefined) post.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined) post.metaDescription = data.metaDescription;
    if (data.status) post.status = data.status;
    if (data.authorName) post.authorName = data.authorName;
    if (data.slug) post.slug = createSlug(data.slug);

    await post.save();

    res.json({ success: true, data: withId(post) });
  })
);

adminRouter.delete(
  '/posts/:id',
  asyncHandler(async (req, res) => {
    const post = await PostModel.findByIdAndDelete(req.params.id);

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    res.json({ success: true, message: 'Post deleted successfully' });
  })
);

adminRouter.patch(
  '/posts/:id/status',
  asyncHandler(async (req, res) => {
    const { status } = req.body as { status?: 'draft' | 'published' | 'archived' };

    if (!status || !['draft', 'published', 'archived'].includes(status)) {
      throw new AppError('Invalid status value', 400);
    }

    const post = await PostModel.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    res.json({ success: true, data: withId(post) });
  })
);

adminRouter.patch(
  '/posts/:id/publish',
  asyncHandler(async (req, res) => {
    const post = await PostModel.findByIdAndUpdate(req.params.id, { status: 'published' }, { new: true });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    res.json({ success: true, data: withId(post) });
  })
);

adminRouter.patch(
  '/posts/:id/feature',
  asyncHandler(async (req, res) => {
    const { featured } = req.body as { featured?: boolean };

    if (typeof featured !== 'boolean') {
      throw new AppError('featured must be a boolean', 400);
    }

    const post = await PostModel.findByIdAndUpdate(req.params.id, { featured }, { new: true });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    res.json({ success: true, data: withId(post) });
  })
);

adminRouter.post(
  '/posts/:id/upload-cover',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError('Image file is required', 400);
    }

    const uploadResult = await uploadImage(req.file.buffer, 'blog-saas/covers');

    res.json({
      success: true,
      data: uploadResult,
    });
  })
);

adminRouter.post(
  '/uploads/file',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError('File is required', 400);
    }

    const requestedType = typeof req.body.resourceType === 'string' ? req.body.resourceType : 'auto';
    const resourceType = ['image', 'video', 'raw', 'auto'].includes(requestedType) ? requestedType as 'image' | 'video' | 'raw' | 'auto' : 'auto';
    const folder = typeof req.body.folder === 'string' && req.body.folder.trim()
      ? req.body.folder.trim()
      : 'blog-saas/uploads';

    const uploaded = await uploadAsset(req.file.buffer, folder, resourceType);

    res.status(201).json({
      success: true,
      data: uploaded,
    });
  })
);

adminRouter.get(
  '/comments',
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const blogId = typeof req.query.blogId === 'string' ? req.query.blogId : undefined;
    const filters: Record<string, unknown> = {};

    if (status) {
      filters.status = status;
    }

    if (blogId) {
      filters.postId = blogId;
    }

    const comments = await CommentModel.find(filters).populate('postId', 'title slug').sort({ createdAt: -1 }).limit(300);
    res.json({
      success: true,
      data: comments.map((comment) => {
        const serialized = withId(comment);
        const populatedPost = (comment as unknown as { postId?: { title?: string; slug?: string } }).postId ?? null;

        return {
          ...serialized,
          postTitle: populatedPost?.title,
          postSlug: populatedPost?.slug ?? serialized.postSlug,
        };
      }),
    });
  })
);

adminRouter.patch(
  '/comments/:id/approve',
  asyncHandler(async (req, res) => {
    const comment = await CommentModel.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    const post = await PostModel.findById(comment.postId).select('title slug');

    res.json({
      success: true,
      data: {
        ...withId(comment),
        postTitle: post?.title,
        postSlug: post?.slug ?? comment.postSlug,
      },
    });
  })
);

adminRouter.patch(
  '/comments/:id',
  asyncHandler(async (req, res) => {
    const parsed = commentModerationSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Validation failed', 400, parsed.error.flatten());
    }

    const comment = await CommentModel.findById(req.params.id);
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    if (parsed.data.status) {
      comment.status = parsed.data.status;
    }
    if (typeof parsed.data.isPinned === 'boolean') {
      comment.isPinned = parsed.data.isPinned;
    }

    await comment.save();
    res.json({ success: true, data: withId(comment) });
  })
);

adminRouter.delete(
  '/comments/:id',
  asyncHandler(async (req, res) => {
    const deleted = await CommentModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      throw new AppError('Comment not found', 404);
    }

    res.json({ success: true, message: 'Comment deleted successfully' });
  })
);

adminRouter.get(
  '/subscribers',
  asyncHandler(async (_req, res) => {
    const subscribers = await SubscriptionModel.find().sort({ createdAt: -1 }).limit(100);

    res.json({ success: true, data: withIdList(subscribers) });
  })
);

adminRouter.delete(
  '/subscribers/:id',
  asyncHandler(async (req, res) => {
    const deleted = await SubscriptionModel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      throw new AppError('Subscriber not found', 404);
    }

    res.json({ success: true, message: 'Subscriber deleted successfully' });
  })
);

adminRouter.post(
  '/subscribers/notify',
  asyncHandler(async (req, res) => {
    const subject = typeof req.body.subject === 'string' && req.body.subject.trim() ? req.body.subject.trim() : 'Latest update from BlogSphere';
    const message = typeof req.body.message === 'string' && req.body.message.trim() ? req.body.message.trim() : 'A new update is available on the blog.';
    const subscribers = await SubscriptionModel.find({ status: 'subscribed' }).sort({ createdAt: -1 }).limit(200);

    for (const subscriber of subscribers) {
      await sendMail({
        to: subscriber.email,
        subject,
        text: message,
      });
    }

    res.json({ success: true, data: { sentTo: subscribers.length } });
  })
);

adminRouter.get(
  '/messages',
  asyncHandler(async (_req, res) => {
    const messages = await ContactMessageModel.find().sort({ createdAt: -1 }).limit(100);

    res.json({ success: true, data: withIdList(messages) });
  })
);

adminRouter.get(
  '/push-subscriptions',
  asyncHandler(async (_req, res) => {
    const subscriptions = await PushSubscriptionModel.find().sort({ createdAt: -1 }).limit(100);

    res.json({ success: true, data: withIdList(subscriptions) });
  })
);

export default adminRouter;