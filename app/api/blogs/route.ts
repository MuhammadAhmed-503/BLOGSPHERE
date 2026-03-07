/**
 * Blog API Routes - GET all blogs, POST create blog
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BlogService } from '@/lib/blog-service';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  unauthorizedResponse,
} from '@/lib/api-response';
import { validatePagination } from '@/lib/utils';
import { z } from 'zod';

// Validation schema for creating a blog
const createBlogSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().max(300).optional(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).max(10).optional(),
  category: z.string().min(1),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  featured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

/**
 * GET /api/blogs
 * Get all blogs with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') as 'latest' | 'views' | 'featured' | null;
    const featured = searchParams.get('featured');
    const includeUnpublished = searchParams.get('includeUnpublished');

    const { page: pageNum, limit: limitNum } = validatePagination(page, limit);

    // Check if user is admin when requesting unpublished blogs
    let isPublishedFilter: boolean | undefined = true;
    if (includeUnpublished === 'true') {
      const session = await getServerSession(authOptions);
      if (session && session.user.role === 'admin') {
        isPublishedFilter = undefined; // Return all blogs for admin
      }
    }

    const result = await BlogService.getBlogs({
      page: pageNum,
      limit: limitNum,
      category: category || undefined,
      tag: tag || undefined,
      search: search || undefined,
      sort: sort || 'latest',
      featured: featured === 'true' ? true : undefined,
      isPublished: isPublishedFilter,
    });

    return paginatedResponse(
      result.blogs,
      {
        page: result.page,
        limit: result.limit,
        total: result.total,
      }
    );
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return errorResponse('Failed to fetch blogs', 500);
  }
}

/**
 * POST /api/blogs
 * Create a new blog (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return unauthorizedResponse();
    }

    const body = await request.json();

    // Validate input
    const validation = createBlogSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        validation.error.errors[0].message,
        422
      );
    }

    const blog = await BlogService.createBlog({
      ...validation.data,
      coverImage: validation.data.coverImage || 'https://placehold.co/1200x630?text=No+Cover',
    });

    return successResponse(blog, 'Blog created successfully', 201);
  } catch (error) {
    console.error('Error creating blog:', error);
    return errorResponse('Failed to create blog', 500);
  }
}
