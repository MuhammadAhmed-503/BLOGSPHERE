/**
 * Blog API Routes - Update and Delete by ID
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BlogService } from '@/lib/blog-service';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
} from '@/lib/api-response';
import { z } from 'zod';

// Validation schema for updating a blog
const updateBlogSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(300).optional(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).max(10).optional(),
  category: z.string().min(1).optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  featured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

/**
 * GET /api/blogs/edit/[id]
 * Get a single blog by ID (admin only)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return unauthorizedResponse();
    }

    const { id } = params;

    const blog = await BlogService.getBlogById(id);

    if (!blog) {
      return notFoundResponse('Blog not found');
    }

    return successResponse(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return errorResponse('Failed to fetch blog', 500);
  }
}

/**
 * PUT /api/blogs/edit/[id]
 * Update a blog (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return unauthorizedResponse();
    }

    const { id } = params;
    const body = await request.json();

    // Validate input
    const validation = updateBlogSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        validation.error.errors[0].message,
        422
      );
    }

    const blog = await BlogService.updateBlog(id, validation.data);

    if (!blog) {
      return notFoundResponse('Blog not found');
    }

    return successResponse(blog, 'Blog updated successfully');
  } catch (error) {
    console.error('Error updating blog:', error);
    return errorResponse('Failed to update blog', 500);
  }
}

/**
 * DELETE /api/blogs/edit/[id]
 * Delete a blog (admin only)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return unauthorizedResponse();
    }

    const { id } = params;

    const deleted = await BlogService.deleteBlog(id);

    if (!deleted) {
      return notFoundResponse('Blog not found');
    }

    return successResponse({ id }, 'Blog deleted successfully');
  } catch (error) {
    console.error('Error deleting blog:', error);
    return errorResponse('Failed to delete blog', 500);
  }
}
