/**
 * Blog API Routes - GET by slug
 */

import { NextRequest } from 'next/server';
import { BlogService } from '@/lib/blog-service';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

/**
 * GET /api/blogs/[slug]
 * Get a single blog by slug
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const blog = await BlogService.getBlogBySlug(slug);

    if (!blog) {
      return notFoundResponse('Blog not found');
    }

    return successResponse(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return errorResponse('Failed to fetch blog', 500);
  }
}
