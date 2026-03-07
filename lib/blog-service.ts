/**
 * Blog Service Layer
 * Business logic for blog operations
 */

import connectDB from '@/lib/db';
import Blog from '@/models/Blog';
import type { IBlog } from '@/models/Blog';

// Mongoose's LeanDocument type may not be available in all installed @types/mongoose
// Define a flexible lean result type for plain JS objects returned by `.lean()`
type LeanBlog = Partial<IBlog> & Record<string, unknown>;
import { calculateReadingTime, generateSlug, extractExcerpt } from '@/lib/utils';

export interface CreateBlogData {
  title: string;
  content: string;
  excerpt?: string;
  coverImage: string;
  tags?: string[];
  category: string;
  metaTitle?: string;
  metaDescription?: string;
  featured?: boolean;
  isPublished?: boolean;
}

export interface UpdateBlogData extends Partial<CreateBlogData> {
  slug?: string;
}

export interface BlogFilters {
  category?: string;
  tag?: string;
  featured?: boolean;
  isPublished?: boolean;
  search?: string;
}

export interface BlogListOptions extends BlogFilters {
  page?: number;
  limit?: number;
  sort?: 'latest' | 'views' | 'featured';
}

export class BlogService {
  /**
   * Create a new blog post
   */
  static async createBlog(data: CreateBlogData): Promise<LeanBlog> {
    await connectDB();

    // Generate slug from title
    const slug = generateSlug(data.title);
    
    // Ensure slug uniqueness
    let counter = 1;
    let uniqueSlug = slug;
    while (await Blog.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    // Calculate reading time
    const readingTime = calculateReadingTime(data.content);

    // Generate excerpt if not provided
    const excerpt = data.excerpt || extractExcerpt(data.content);

    // Use title as meta title if not provided
    const metaTitle = data.metaTitle || data.title.substring(0, 60);

    // Use excerpt as meta description if not provided
    const metaDescription = data.metaDescription || excerpt.substring(0, 160);

    const blog = await Blog.create({
      ...data,
      slug: uniqueSlug,
      excerpt,
      metaTitle,
      metaDescription,
      readingTime,
    });

    return blog.toObject ? blog.toObject() as LeanBlog : (blog as unknown as LeanBlog);
  }

  /**
   * Update a blog post
   */
  static async updateBlog(id: string, data: UpdateBlogData): Promise<LeanBlog | null> {
    await connectDB();

    const updateData: Partial<IBlog> = { ...data };

    // If title is being updated, regenerate slug
    if (data.title && !data.slug) {
      const slug = generateSlug(data.title);
      
      // Ensure slug uniqueness
      let counter = 1;
      let uniqueSlug = slug;
      while (await Blog.findOne({ slug: uniqueSlug, _id: { $ne: id } })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }
      
      updateData.slug = uniqueSlug;
    }

    // Recalculate reading time if content is updated
    if (data.content) {
      updateData.readingTime = calculateReadingTime(data.content);
    }

    const blog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    return blog as LeanBlog | null;
  }

  /**
   * Delete a blog post
   */
  static async deleteBlog(id: string): Promise<boolean> {
    await connectDB();

    const result = await Blog.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Get a single blog by slug
   */
  static async getBlogBySlug(slug: string, includeUnpublished: boolean = false): Promise<LeanBlog | null> {
    await connectDB();

    const query: Record<string, unknown> = { slug };
    
    if (!includeUnpublished) {
      query.isPublished = true;
    }

    const blog = await Blog.findOne(query).lean().exec();
    return blog as LeanBlog | null;
  }

  /**
   * Get a single blog by ID
   */
  static async getBlogById(id: string): Promise<LeanBlog | null> {
    await connectDB();
    const blog = await Blog.findById(id).lean().exec();
    return blog as LeanBlog | null;
  }

  /**
   * Get blogs with filtering, sorting, and pagination
   */
  static async getBlogs(options: BlogListOptions = {}): Promise<{
    blogs: LeanBlog[];
    total: number;
    page: number;
    limit: number;
  }> {
    await connectDB();

    const {
      category,
      tag,
      featured,
      isPublished = true,
      search,
      page = 1,
      limit = 10,
      sort = 'latest',
    } = options;

    // Build query
    const query: Record<string, unknown> = {};

    if (isPublished !== undefined) {
      query.isPublished = isPublished;
    }

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (featured !== undefined) {
      query.featured = featured;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    let sortOption: Record<string, 1 | -1> = {};
    switch (sort) {
      case 'views':
        sortOption = { views: -1, publishedAt: -1 };
        break;
      case 'featured':
        sortOption = { featured: -1, publishedAt: -1 };
        break;
      case 'latest':
      default:
        sortOption = { publishedAt: -1, createdAt: -1 };
        break;
    }

    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .select('title slug excerpt coverImage category tags views featured isPublished createdAt publishedAt readingTime')
        .lean()
        .exec(),
      Blog.countDocuments(query),
    ]);

    return {
      blogs: blogs as unknown as LeanBlog[],
      total,
      page,
      limit,
    };
  }

  /**
   * Increment view count for a blog
   */
  static async incrementViews(slug: string): Promise<void> {
    await connectDB();

    await Blog.findOneAndUpdate(
      { slug, isPublished: true },
      { $inc: { views: 1 } }
    );
  }

  /**
   * Get trending blogs (most views in last 7 days)
   */
  static async getTrendingBlogs(limit: number = 5): Promise<LeanBlog[]> {
    await connectDB();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const blogs = await Blog.find({
      isPublished: true,
      publishedAt: { $gte: sevenDaysAgo },
    })
      .sort({ views: -1, publishedAt: -1 })
      .limit(limit)
      .select('title slug excerpt coverImage category tags views readingTime publishedAt createdAt')
      .lean()
      .exec();

    return blogs as unknown as LeanBlog[];
  }

  /**
   * Get related blogs by category and tags
   */
  static async getRelatedBlogs(blogId: string, limit: number = 3): Promise<LeanBlog[]> {
    await connectDB();

    const blog = await Blog.findById(blogId).select('category tags').lean().exec();
    if (!blog) {
      return [];
    }

    const relatedBlogs = await Blog.find({
      _id: { $ne: blogId },
      isPublished: true,
      $or: [
        { category: blog.category },
        { tags: { $in: blog.tags } },
      ],
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select('title slug excerpt coverImage category tags views readingTime publishedAt createdAt')
      .lean()
      .exec();

    return relatedBlogs as unknown as LeanBlog[];
  }

  /**
   * Get all categories with blog counts
   */
  static async getCategories(): Promise<Array<{ name: string; count: number }>> {
    await connectDB();

    const categories = await Blog.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]).exec();

    return categories as Array<{ name: string; count: number }>;
  }

  /**
   * Get all tags with blog counts
   */
  static async getTags(): Promise<Array<{ name: string; count: number }>> {
    await connectDB();

    const tags = await Blog.aggregate([
      { $match: { isPublished: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]).exec();

    return tags as Array<{ name: string; count: number }>;
  }

  /**
   * Search blogs
   */
  static async searchBlogs(query: string, limit: number = 10): Promise<LeanBlog[]> {
    await connectDB();

    const blogs = await Blog.find(
      {
        $text: { $search: query },
        isPublished: true,
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .lean();

    return blogs as unknown as LeanBlog[];
  }
}
