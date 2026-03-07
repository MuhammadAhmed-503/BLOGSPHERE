/**
 * Admin Analytics API Route
 * Provides dashboard statistics
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Blog from '@/models/Blog';
import Comment from '@/models/Comment';
import Subscriber from '@/models/Subscriber';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-response';

/**
 * GET /api/admin/analytics
 * Get dashboard analytics (admin only)
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return unauthorizedResponse();
    }

    await connectDB();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Run ALL queries in a single parallel batch
    const [
      totalBlogs,
      publishedBlogs,
      totalViews,
      totalSubscribers,
      pendingComments,
      mostViewedBlog,
      recentActivity,
      newBlogsThisWeek,
      newSubscribersThisWeek,
      newCommentsThisWeek,
    ] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ isPublished: true }),
      Blog.aggregate([
        { $group: { _id: null, total: { $sum: '$views' } } },
      ]),
      Subscriber.countDocuments({ isVerified: true }),
      Comment.countDocuments({ isApproved: false }),
      Blog.findOne({ isPublished: true })
        .sort({ views: -1 })
        .select('title slug views')
        .lean(),
      Blog.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title slug createdAt isPublished')
        .lean(),
      Blog.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Subscriber.countDocuments({
        isVerified: true,
        subscribedAt: { $gte: sevenDaysAgo },
      }),
      Comment.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ]);

    const analytics = {
      overview: {
        totalBlogs,
        publishedBlogs,
        totalViews: totalViews[0]?.total || 0,
        totalSubscribers,
        pendingComments,
      },
      thisWeek: {
        newBlogs: newBlogsThisWeek,
        newSubscribers: newSubscribersThisWeek,
        newComments: newCommentsThisWeek,
      },
      mostViewedBlog,
      recentActivity,
    };

    return successResponse(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return errorResponse('Failed to fetch analytics', 500);
  }
}
