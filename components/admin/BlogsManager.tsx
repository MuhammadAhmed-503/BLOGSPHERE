'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  FileText, Edit, Trash2, Eye, EyeOff,
  Plus, Search, Star, Calendar,
} from 'lucide-react';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  views: number;
  featured: boolean;
  isPublished: boolean;
  createdAt: string;
  coverImage?: string;
}

export default function BlogsManager({ initialBlogs }: { initialBlogs: Blog[] }) {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/blogs/edit/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        toast.success('Blog deleted');
        setBlogs((prev) => prev.filter((b) => b._id !== id));
        router.refresh();
      } else {
        toast.error(result.message || 'Delete failed');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/blogs/edit/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(currentStatus ? 'Blog unpublished' : 'Blog published!');
        setBlogs((prev) =>
          prev.map((b) => b._id === id ? { ...b, isPublished: !currentStatus } : b)
        );
        router.refresh();
      } else {
        toast.error(result.message || 'Update failed');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = blogs.filter((b) => {
    const matchSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'published') return matchSearch && b.isPublished;
    if (filter === 'draft') return matchSearch && !b.isPublished;
    return matchSearch;
  });

  const publishedCount = blogs.filter((b) => b.isPublished).length;
  const draftCount = blogs.filter((b) => !b.isPublished).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Manage Blogs</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {blogs.length} total &nbsp;·&nbsp;
            <span className="text-green-600 dark:text-green-400">{publishedCount} published</span>
            &nbsp;·&nbsp;
            <span className="text-yellow-600 dark:text-yellow-400">{draftCount} drafts</span>
          </p>
        </div>
        <Link href="/admin/create" className="btn-primary flex items-center gap-2 w-fit">
          <Plus className="w-4 h-4" />
          Create New Blog
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'published', 'draft'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                  filter === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {f} {f === 'published' ? `(${publishedCount})` : f === 'draft' ? `(${draftCount})` : `(${blogs.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blog List */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No blogs found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm ? 'Try a different search term.' : filter !== 'all' ? `No ${filter} blogs yet.` : 'Create your first blog post.'}
          </p>
          <Link href="/admin/create" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Blog
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((blog) => (
            <div key={blog._id} className="card p-5 flex flex-col md:flex-row gap-4">
              {/* Cover thumbnail */}
              {blog.coverImage && (
                <div className="md:w-32 md:h-24 w-full h-40 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-contain" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    blog.isPublished
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {blog.isPublished ? 'Published' : 'Draft'}
                  </span>
                  {blog.featured && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center gap-1">
                      <Star className="w-3 h-3" /> Featured
                    </span>
                  )}
                  <span className="badge text-xs">{blog.category}</span>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg leading-tight mb-1 truncate">
                  {blog.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{blog.excerpt}</p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {blog.views} views
                  </span>
                  {blog.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex md:flex-col gap-2 flex-shrink-0 md:justify-start justify-end items-center md:items-end">
                <Link
                  href={`/admin/edit/${blog._id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  <Edit className="w-4 h-4" /> Edit
                </Link>

                <button
                  onClick={() => handleTogglePublish(blog._id, blog.isPublished)}
                  disabled={togglingId === blog._id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    blog.isPublished
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200'
                      : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200'
                  } disabled:opacity-50`}
                >
                  {togglingId === blog._id ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : blog.isPublished ? (
                    <><EyeOff className="w-4 h-4" /> Unpublish</>
                  ) : (
                    <><Eye className="w-4 h-4" /> Publish</>
                  )}
                </button>

                {blog.isPublished && (
                  <Link
                    href={`/blog/${blog.slug}`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4" /> View
                  </Link>
                )}

                <button
                  onClick={() => handleDelete(blog._id, blog.title)}
                  disabled={deletingId === blog._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                >
                  {deletingId === blog._id ? (
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Trash2 className="w-4 h-4" /> Delete</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
