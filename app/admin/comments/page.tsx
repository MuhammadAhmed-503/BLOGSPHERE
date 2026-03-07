import connectDB from '@/lib/db';
import Comment from '@/models/Comment';
import Blog from '@/models/Blog';
import CommentsManager from '@/components/admin/CommentsManager';

export const dynamic = 'force-dynamic';

export default async function AdminCommentsPage() {

  await connectDB();

  const [rawComments, rawBlogs] = await Promise.all([
    Comment.find({}).sort({ createdAt: -1 }).limit(200).lean().exec(),
    Blog.find({}).select('title _id').lean().exec(),
  ]);

  const blogMap: Record<string, string> = {};
  for (const b of rawBlogs) {
    blogMap[String(b._id)] = String(b.title);
  }

  const comments = rawComments.map((c: Record<string, unknown>) => ({
    _id: String(c._id),
    blogId: String(c.blogId ?? ''),
    blogTitle: blogMap[String(c.blogId)] ?? 'Unknown Blog',
    name: String(c.name ?? ''),
    email: String(c.email ?? ''),
    content: String(c.content ?? ''),
    isApproved: Boolean(c.isApproved),
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt ?? ''),
  }));

  return <CommentsManager initialComments={comments} />;
}
