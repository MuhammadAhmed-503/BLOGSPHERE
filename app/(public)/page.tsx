import Link from 'next/link';
import Image from 'next/image';
import { BlogService } from '@/lib/blog-service';
import { formatDate } from '@/lib/utils';
import { Clock, Calendar, TrendingUp, Star } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to our modern blogging platform. Discover articles on technology, tutorials, and more.',
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  // Fetch data in parallel
  const [featuredBlogs, latestBlogs, trendingBlogs] = await Promise.all([
    BlogService.getBlogs({ featured: true, limit: 3 }),
    BlogService.getBlogs({ limit: 6 }),
    BlogService.getTrendingBlogs(4),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Welcome to Our Blog
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 animate-slide-up">
              Discover insightful articles, tutorials, and stories from our community
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/blog"
                className="btn-primary bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg"
              >
                Explore Articles
              </Link>
              <Link
                href="/subscribe"
                className="btn-outline border-white text-white dark:border-white dark:text-white hover:bg-white/10 px-8 py-3 text-lg"
              >
                Subscribe Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredBlogs.blogs.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Star className="w-8 h-8 text-yellow-500" />
                Featured Posts
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBlogs.blogs.map((blog) => (
                <Link
                  key={blog._id?.toString()}
                  href={`/blog/${blog.slug}`}
                  className="card overflow-hidden group"
                >
                  <div className="h-48 relative overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Image
                      src={blog.coverImage || ''}
                      alt={blog.title || 'Featured blog cover'}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="badge">{blog.category}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {blog.readingTime} min read
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate((blog.publishedAt || blog.createdAt) as Date)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Posts */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Latest Posts
            </h2>
            <Link
              href="/blog"
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestBlogs.blogs.map((blog) => (
              <Link
                key={blog._id?.toString()}
                href={`/blog/${blog.slug}`}
                className="card overflow-hidden group"
              >
                <div className="aspect-video relative overflow-hidden bg-gray-200 dark:bg-gray-800">
                  <Image
                    src={blog.coverImage || ''}
                    alt={blog.title || 'Latest blog cover'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="badge">{blog.category}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {blog.readingTime} min read
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate((blog.publishedAt || blog.createdAt) as Date)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Posts */}
      {trendingBlogs.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-primary-600" />
                Trending This Week
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingBlogs.map((blog, index) => (
                <Link
                  key={blog._id?.toString()}
                  href={`/blog/${blog.slug}`}
                  className="card p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                        {blog.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {blog.views} views
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Never Miss an Update
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Subscribe to our newsletter and get the latest articles delivered to your inbox
          </p>
          <Link
            href="/subscribe"
            className="btn-primary bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg"
          >
            Subscribe Now
          </Link>
        </div>
      </section>
    </div>
  );
}
