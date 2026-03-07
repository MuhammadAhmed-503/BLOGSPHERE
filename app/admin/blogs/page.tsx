import connectDB from '@/lib/db';
import Blog from '@/models/Blog';
import BlogsManager from '@/components/admin/BlogsManager';

export const dynamic = 'force-dynamic';

export default async function ManageBlogsPage() {

  await connectDB();

  const rawBlogs = await Blog.find({})
    .select('title slug excerpt category tags views featured isPublished createdAt coverImage')
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  // Serialize for client component (convert ObjectId and Date)
  const blogs = rawBlogs.map((b: Record<string, unknown>) => ({
    _id: String(b._id),
    title: String(b.title ?? ''),
    slug: String(b.slug ?? ''),
    excerpt: String(b.excerpt ?? ''),
    category: String(b.category ?? ''),
    tags: Array.isArray(b.tags) ? (b.tags as string[]) : [],
    views: Number(b.views ?? 0),
    featured: Boolean(b.featured),
    isPublished: Boolean(b.isPublished),
    coverImage: String(b.coverImage ?? ''),
    createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : String(b.createdAt ?? ''),
  }));

  return <BlogsManager initialBlogs={blogs} />;
}
