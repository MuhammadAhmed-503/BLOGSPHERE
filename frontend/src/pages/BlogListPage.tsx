import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import { fetchCategories, fetchPosts, fetchTags } from '../lib/api';
import { formatDate } from '../lib/utils';
import type { BlogPost, CategoryCount, TagCount } from '../types';

const defaultLimit = 4;

function buildQuery(params: URLSearchParams, updates: Record<string, string | number | null | undefined>) {
  const nextParams = new URLSearchParams(params);

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined || value === '') {
      nextParams.delete(key);
    } else {
      nextParams.set(key, String(value));
    }
  }

  const query = nextParams.toString();
  return query ? `?${query}` : '';
}

export default function BlogListPage() {
  const [searchParams] = useSearchParams();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [tags, setTags] = useState<TagCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');

  useEffect(() => {
    let active = true;

    void (async () => {
      setLoading(true);
      setError('');

      try {
        const [postsResponse, categoriesResponse, tagsResponse] = await Promise.all([
          fetchPosts({ page, limit: defaultLimit, category, tag }),
          fetchCategories(),
          fetchTags(),
        ]);

        if (!active) {
          return;
        }

        setBlogs(postsResponse.posts);
        setTotal(postsResponse.pagination.total);
        setTotalPages(postsResponse.pagination.totalPages);
        setCategories(categoriesResponse);
        setTags(tagsResponse);
      } catch (requestError) {
        if (!active) {
          return;
        }

        const message = requestError instanceof Error ? requestError.message : 'Failed to load blog posts';
        setError(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [page, category, tag]);

  return (
    <div className="min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-5xl">
            Our Blog
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Explore the latest articles and insights.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            {categories.length > 0 && (
              <div className="card mb-6 p-6">
                <h3 className="mb-4 font-bold text-slate-900 dark:text-slate-100">Categories</h3>
                <div className="space-y-2">
                  <Link
                    to="/blog"
                    className={`block rounded-lg px-3 py-2 transition-colors ${!category ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                  >
                    All Posts
                  </Link>
                  {categories.map((item) => (
                    <Link
                      key={item.name}
                      to={`/blog${buildQuery(searchParams, { category: item.name, page: null, tag: null })}`}
                      className={`block rounded-lg px-3 py-2 transition-colors ${category === item.name ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                    >
                      {item.name} ({item.count})
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {tags.length > 0 && (
              <div className="card p-6">
                <h3 className="mb-4 font-bold text-slate-900 dark:text-slate-100">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 15).map((item) => (
                    <Link
                      key={item.name}
                      to={`/blog${buildQuery(searchParams, { tag: item.name, page: null, category: null })}`}
                      className={`rounded-full px-3 py-1 text-sm transition-colors ${tag === item.name ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <main className="lg:col-span-3">
            {loading && (
              <div className="card p-12 text-center">
                <p className="text-lg text-slate-600 dark:text-slate-400">Loading posts...</p>
              </div>
            )}

            {error && (
              <div className="card mb-6 p-6">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {(category || tag) && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="text-slate-600 dark:text-slate-400">Filtering by:</span>
                {category && <span className="badge">Category: {category}</span>}
                {tag && <span className="badge">Tag: {tag}</span>}
                <Link to="/blog" className="text-sm text-primary-600 hover:underline dark:text-primary-400">
                  Clear filters
                </Link>
              </div>
            )}

            {!loading && blogs.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-lg text-slate-600 dark:text-slate-400">No blog posts found.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {blogs.map((blog) => (
                  <Link key={blog.id} to={`/blog/${blog.slug}`} className="card group flex flex-col overflow-hidden sm:flex-row">
                    <div className="relative h-48 flex-shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 sm:w-64">
                      <img src={blog.coverImage} alt={blog.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    <div className="flex-grow p-6">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="badge">{blog.category}</span>
                        {blog.tags.slice(0, 2).map((blogTag) => (
                          <span key={blogTag} className="rounded bg-slate-200 px-2 py-1 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                            {blogTag}
                          </span>
                        ))}
                      </div>
                      <h2 className="mb-3 text-2xl font-bold text-slate-900 transition-colors group-hover:text-primary-600 dark:text-slate-100 dark:group-hover:text-primary-400">
                        {blog.title}
                      </h2>
                      <p className="mb-4 line-clamp-2 text-slate-600 dark:text-slate-400">{blog.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(blog.publishedAt)}</span>
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{blog.readingTime} min read</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {total > defaultLimit && (
              <div className="mt-8 flex justify-center gap-2">
                {page > 1 && (
                  <Link
                    to={`/blog${buildQuery(searchParams, { page: page - 1 })}`}
                    className="btn-secondary"
                  >
                    Previous
                  </Link>
                )}
                <span className="px-4 py-2 text-slate-700 dark:text-slate-300">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    to={`/blog${buildQuery(searchParams, { page: page + 1 })}`}
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
