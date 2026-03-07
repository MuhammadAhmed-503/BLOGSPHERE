import { BlogService } from '@/lib/blog-service';
import { formatDate } from '@/lib/utils';
import { Calendar, Clock, Eye, Share2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import type { Metadata } from 'next';
import CommentsSection from '@/components/CommentsSection';

export const revalidate = 3600; // Revalidate every hour

// Generate metadata
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const blog = await BlogService.getBlogBySlug(params.slug);

  if (!blog) {
    return {
      title: 'Blog Not Found',
    };
  }

  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.excerpt,
    openGraph: {
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt,
      type: 'article',
      publishedTime: blog.publishedAt?.toISOString(),
      authors: [process.env.NEXT_PUBLIC_APP_NAME || 'BlogSphere'],
      images: [
        {
          url: blog.coverImage || '',
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt,
      images: [blog.coverImage || ''],
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const blog = await BlogService.getBlogBySlug(params.slug);

  if (!blog) {
    notFound();
  }

  // Run non-blocking operations in parallel
  // Content may be HTML (from TipTap editor) or Markdown (legacy) — handle both
  const isHtml = blog.content?.trimStart().startsWith('<');
  const [relatedBlogs, htmlContent] = await Promise.all([
    BlogService.getRelatedBlogs(blog._id?.toString() || '', 3),
    isHtml ? Promise.resolve(blog.content || '') : marked(blog.content || ''),
  ]);

  // Increment view count (fire-and-forget)
  BlogService.incrementViews(params.slug).catch(() => {});

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/blog/${blog.slug}`;

  const blogTitle = blog.title || 'Untitled';

  return (
    <article className="min-h-screen py-8">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        {/* Meta info */}
        <div className="flex items-center flex-wrap gap-3 mb-6">
          <span className="badge text-sm">{blog.category}</span>
          {blog.tags && blog.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
          {blog.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center flex-wrap gap-4 text-gray-600 dark:text-gray-400 mb-8">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate((blog.publishedAt || blog.createdAt) as Date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {blog.readingTime} min read
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {blog.views} views
          </span>
        </div>

        {/* Cover Image */}
        <div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-8 flex items-center justify-center max-h-[50vh]">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-contain max-h-[50vh]"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="prose prose-lg dark:prose-dark max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>

      {/* Share Buttons */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 pt-8 pb-8 border-t border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share:
          </span>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(blogTitle)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm"
          >
            Twitter
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm"
          >
            LinkedIn
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(blogTitle + ' ' + shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm"
          >
            WhatsApp
          </a>
        </div>
      </div>

      {/* Comments Section */}
      <CommentsSection blogId={blog._id?.toString() || ''} />

      {/* Related Posts */}
      {relatedBlogs.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-16 border-t border-gray-200 dark:border-gray-800">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Related Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedBlogs.map((relatedBlog) => (
              <a
                key={relatedBlog._id?.toString()}
                href={`/blog/${relatedBlog.slug}`}
                className="card overflow-hidden group"
              >
                <div className="aspect-video bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <img
                    src={relatedBlog.coverImage}
                    alt={relatedBlog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {relatedBlog.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {relatedBlog.excerpt}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
