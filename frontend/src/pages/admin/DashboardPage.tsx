import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpenText, MessageSquareText, PlusCircle, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatCard from '../../components/admin/AdminStatCard';
import { fetchAdminBlogs, fetchAdminComments, fetchAdminDashboard, fetchAdminSubscribers } from '../../lib/adminApi';
import { formatDate } from '../../lib/utils';
import { getAuthSession } from '../../lib/auth';
import type { AdminActivityItem, BlogPost } from '../../types';

function isRecent(dateString?: string) {
  if (!dateString) {
    return false;
  }

  const createdAt = new Date(dateString).getTime();
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return createdAt >= oneWeekAgo;
}

export default function DashboardPage() {
  const session = getAuthSession();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ posts: 0, publishedPosts: 0, draftPosts: 0, subscribers: 0, messages: 0, users: 0, comments: 0, pendingComments: 0, totalViews: 0 });
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [activities, setActivities] = useState<AdminActivityItem[]>([]);
  const [weekStats, setWeekStats] = useState({ subscribers: 0, comments: 0 });

  useEffect(() => {
    if (!session?.token) {
      return;
    }

    let active = true;

    void (async () => {
      setLoading(true);

      try {
        const [dashboard, blogsResponse, comments, subscribers] = await Promise.all([
          fetchAdminDashboard(session.token),
          fetchAdminBlogs(session.token, { limit: 100 }),
          fetchAdminComments(session.token),
          fetchAdminSubscribers(session.token),
        ]);

        if (!active) {
          return;
        }

        setMetrics(dashboard);
        setPosts(blogsResponse.posts);

        const nextActivities: AdminActivityItem[] = [];

        blogsResponse.posts.slice(0, 4).forEach((post) => {
          nextActivities.push({
            id: `post-${post.id}`,
            title: post.title,
            date: post.createdAt ?? post.publishedAt,
            status: post.status === 'draft' ? 'draft' : 'published',
            description: `${post.views} views`,
          });
        });

        comments.slice(0, 3).forEach((comment) => {
          nextActivities.push({
            id: `comment-${comment.id}`,
            title: comment.postTitle ?? comment.postSlug,
            date: comment.createdAt ?? new Date().toISOString(),
            status: comment.status,
            description: comment.content,
          });
        });

        subscribers.slice(0, 2).forEach((subscriber) => {
          nextActivities.push({
            id: `subscriber-${subscriber.id}`,
            title: subscriber.email,
            date: subscriber.subscribedAt ?? subscriber.createdAt ?? new Date().toISOString(),
            status: subscriber.verificationStatus === 'pending' ? 'pending' : 'subscribed',
            description: subscriber.name ?? 'Newsletter subscriber',
          });
        });

        nextActivities.sort((left, right) => +new Date(right.date) - +new Date(left.date));
        setActivities(nextActivities.slice(0, 6));
        setWeekStats({
          subscribers: subscribers.filter((subscriber) => isRecent(subscriber.subscribedAt ?? subscriber.createdAt)).length,
          comments: comments.filter((comment) => isRecent(comment.createdAt)).length,
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load dashboard');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [session?.token]);

  const mostViewedBlog = useMemo(() => {
    return [...posts].sort((left, right) => right.views - left.views)[0] ?? null;
  }, [posts]);

  const thisWeekStats = useMemo(() => {
    return {
      blogs: posts.filter((post) => isRecent(post.createdAt)).length,
      subscribers: weekStats.subscribers,
      comments: weekStats.comments,
    };
  }, [posts, weekStats.comments, weekStats.subscribers]);

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Welcome back. Here is a fast snapshot of the editorial workflow and audience health."
        actions={<Link to="/admin/create" className="btn-primary inline-flex items-center gap-2"><PlusCircle className="h-4 w-4" />Create New Blog</Link>}
      />

      {loading ? (
        <div className="card p-6 text-slate-600 dark:text-slate-400">Loading dashboard...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <AdminStatCard title="Total Blogs" value={metrics.posts} icon={BookOpenText} tone="blue" />
            <AdminStatCard title="Total Views" value={metrics.totalViews} icon={Sparkles} tone="green" />
            <AdminStatCard title="Subscribers" value={metrics.subscribers} icon={Users} tone="purple" />
            <AdminStatCard title="Pending Comments" value={metrics.pendingComments} icon={MessageSquareText} tone="orange" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <AdminStatCard title="This Week - New Blogs" value={thisWeekStats.blogs} icon={BookOpenText} tone="blue" detail="Published or drafted in the last 7 days" />
            <AdminStatCard title="This Week - New Subscribers" value={thisWeekStats.subscribers} icon={Users} tone="green" detail="Recent newsletter signups" />
            <AdminStatCard title="This Week - New Comments" value={thisWeekStats.comments} icon={MessageSquareText} tone="orange" detail="Fresh comment activity" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Most Viewed Blog</h2>
                {mostViewedBlog && <span className="badge">{mostViewedBlog.views} views</span>}
              </div>
              {mostViewedBlog ? (
                <div className="space-y-4">
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{mostViewedBlog.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{mostViewedBlog.excerpt}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="badge">{mostViewedBlog.category}</span>
                    <span className="text-slate-500 dark:text-slate-400">Published {formatDate(mostViewedBlog.publishedAt)}</span>
                    <Link to={`/blog/${mostViewedBlog.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary-600 hover:underline dark:text-primary-400">
                      Open public link <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">No blog posts are available yet.</p>
              )}
            </div>

            <div className="card p-6">
              <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-slate-100">Recent Activity</h2>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400">No recent activity found.</p>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{activity.title}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{activity.description}</p>
                        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{formatDate(activity.date)}</p>
                      </div>
                      <span className="badge">{activity.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-slate-100">Quick Actions</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Link to="/admin/create" className="btn-primary inline-flex items-center justify-center gap-2"><PlusCircle className="h-4 w-4" />Create New Blog</Link>
              <Link to="/admin/comments" className="btn-secondary inline-flex items-center justify-center gap-2">Review Comments</Link>
              <Link to="/admin/blogs" className="btn-secondary inline-flex items-center justify-center gap-2">Manage Blogs</Link>
              <Link to="/admin/subscribers" className="btn-outline inline-flex items-center justify-center gap-2">View Subscribers</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
