import Link from 'next/link';
import { BlogService } from '@/lib/blog-service';
import { validatePagination } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { Clock, Calendar } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Explore our collection of articles and tutorials.',
};

export const revalidate = 60;

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string; tag?: string };
}) {
  const { page, limit } = validatePagination(searchParams.page);
  
  // Fetch everything in parallel
  const [result, categories, tags] = await Promise.all([
    BlogService.getBlogs({
      page,
      limit,
      category: searchParams.category,
      tag: searchParams.tag,
    }),
    BlogService.getCategories(),
    BlogService.getTags(),
  ]);

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Our Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Explore our latest articles and insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Categories */}
            {categories.length > 0 && (
              <div className="card p-6 mb-6">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Categories
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/blog"
                    className={`block py-2 px-3 rounded-lg transition-colors ${
                      !searchParams.category
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    All Posts
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.name}
                      href={`/blog?category=${encodeURIComponent(cat.name)}`}
                      className={`block py-2 px-3 rounded-lg transition-colors ${
                        searchParams.category === cat.name
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {cat.name} ({cat.count})
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Popular Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 15).map((tag) => (
                    <Link
                      key={tag.name}
                      href={`/blog?tag=${encodeURIComponent(tag.name)}`}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        searchParams.tag === tag.name
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Active Filters */}
            {(searchParams.category || searchParams.tag) && (
              <div className="mb-6 flex items-center gap-2 flex-wrap">
                <span className="text-gray-600 dark:text-gray-400">Filtering by:</span>
                {searchParams.category && (
                  <span className="badge">Category: {searchParams.category}</span>
                )}
                {searchParams.tag && (
                  <span className="badge">Tag: {searchParams.tag}</span>
                )}
                <Link href="/blog" className="text-primary-600 hover:underline text-sm">
                  Clear filters
                </Link>
              </div>
            )}

            {/* Blog Posts */}
            {result.blogs.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No blog posts found.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {result.blogs.map((blog) => (
                  <Link
                    key={blog._id?.toString()}
                    href={`/blog/${blog.slug}`}
                    className="card overflow-hidden flex flex-col sm:flex-row group"
                  >
                    <div className="sm:w-64 h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6 flex-grow">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="badge">{blog.category}</span>
                        {blog.tags && blog.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {blog.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {blog.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate((blog.publishedAt || blog.createdAt) as Date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {blog.readingTime} min read
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {result.total > limit && (
              <div className="mt-8 flex justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/blog?page=${page - 1}${searchParams.category ? `&category=${searchParams.category}` : ''}${searchParams.tag ? `&tag=${searchParams.tag}` : ''}`}
                    className="btn-secondary"
                  >
                    Previous
                  </Link>
                )}
                <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  Page {page} of {Math.ceil(result.total / limit)}
                </span>
                {page < Math.ceil(result.total / limit) && (
                  <Link
                    href={`/blog?page=${page + 1}${searchParams.category ? `&category=${searchParams.category}` : ''}${searchParams.tag ? `&tag=${searchParams.tag}` : ''}`}
                    className="btn-secondary"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
