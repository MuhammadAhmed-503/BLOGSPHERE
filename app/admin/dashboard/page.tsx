import Link from 'next/link';
import connectDB from '@/lib/db';
import Blog from '@/models/Blog';
import Comment from '@/models/Comment';
import Subscriber from '@/models/Subscriber';
import {
  FileText,
  Eye,
  Users,
  MessageSquare,
  TrendingUp,
  Calendar,
  Activity,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getAnalytics() {
  await connectDB();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalBlogs,
    publishedBlogs,
    totalViewsResult,
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
    Blog.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    Subscriber.countDocuments({ isVerified: true }),
    Comment.countDocuments({ isApproved: false }),
    Blog.findOne({ isPublished: true }).sort({ views: -1 }).select('title slug views').lean(),
    Blog.find().sort({ createdAt: -1 }).limit(5).select('title slug createdAt isPublished').lean(),
    Blog.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Subscriber.countDocuments({ isVerified: true, subscribedAt: { $gte: sevenDaysAgo } }),
    Comment.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
  ]);

  return {
    overview: {
      totalBlogs,
      publishedBlogs,
      totalViews: totalViewsResult[0]?.total || 0,
      totalSubscribers,
      pendingComments,
    },
    thisWeek: { newBlogs: newBlogsThisWeek, newSubscribers: newSubscribersThisWeek, newComments: newCommentsThisWeek },
    mostViewedBlog: mostViewedBlog as { title: string; slug: string; views: number } | null,
    recentActivity: recentActivity as Array<{ title: string; slug: string; createdAt: Date; isPublished: boolean }>,
  };
}

export default async function AdminDashboard() {
  const analytics = await getAnalytics();

  const stats = [
    {
      label: 'Total Blogs',
      value: analytics.overview.totalBlogs,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Views',
      value: analytics.overview.totalViews.toLocaleString(),
      icon: <Eye className="w-6 h-6" />,
      color: 'bg-green-500',
    },
    {
      label: 'Subscribers',
      value: analytics.overview.totalSubscribers,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-purple-500',
    },
    {
      label: 'Pending Comments',
      value: analytics.overview.pendingComments,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your blog.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* This Week */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary-600" />
          This Week
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">New Blogs</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {analytics.thisWeek.newBlogs}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">New Subscribers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {analytics.thisWeek.newSubscribers}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">New Comments</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {analytics.thisWeek.newComments}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Viewed */}
        {analytics.mostViewedBlog && (
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary-600" />
              Most Viewed Blog
            </h2>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                {analytics.mostViewedBlog.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {analytics.mostViewedBlog.views.toLocaleString()} views
              </p>
              <Link
                href={`/blog/${analytics.mostViewedBlog.slug}`}
                className="text-primary-600 hover:underline text-sm"
                target="_blank"
              >
                View Blog →
              </Link>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary-600" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {analytics.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    activity.isPublished
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {activity.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/create" className="btn-primary">
            Create New Blog
          </Link>
          <Link href="/admin/comments" className="btn-secondary">
            Review Comments ({analytics.overview.pendingComments})
          </Link>
          <Link href="/admin/blogs" className="btn-secondary">
            Manage Blogs
          </Link>
          <Link href="/admin/subscribers" className="btn-secondary">
            View Subscribers
          </Link>
        </div>
      </div>
    </div>
  );
}
