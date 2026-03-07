/**
 * Search API Route
 */

import { NextRequest } from 'next/server';
import { BlogService } from '@/lib/blog-service';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * GET /api/search
 * Search blogs
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!query) {
      return errorResponse('Search query is required', 400);
    }

    const blogs = await BlogService.searchBlogs(query, limit);

    return successResponse(blogs);
  } catch (error) {
    console.error('Error searching blogs:', error);
    return errorResponse('Failed to search blogs', 500);
  }
}
