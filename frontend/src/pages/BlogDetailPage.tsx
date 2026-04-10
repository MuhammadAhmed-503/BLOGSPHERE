import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { marked } from 'marked';
import { Calendar, Clock, Eye, Share2 } from 'lucide-react';
import { fetchPostBySlug } from '../lib/api';
import { formatDate } from '../lib/utils';
import NotFoundPage from './NotFoundPage';
import CommentSection from '../components/CommentSection';
import type { BlogPost } from '../types';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    let active = true;

    void (async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const response = await fetchPostBySlug(slug);

        if (!active) {
          return;
        }

        setBlog(response.post);
        setRelatedBlogs(response.relatedPosts);
      } catch {
        if (!active) {
          return;
        }

        setNotFound(true);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [slug]);

  const htmlContent = useMemo(() => {
    if (!blog) {
      return '';
    }

    const containsHtmlTag = /<\/?[a-z][\s\S]*>/i.test(blog.content);

    if (containsHtmlTag) {
      return blog.content;
    }

    return marked.parse(blog.content) as string;
  }, [blog]);

  if (loading) {
    return (
      <div className="min-h-screen py-16 text-center">
        <p className="text-slate-600 dark:text-slate-400">Loading article...</p>
      </div>
    );
  }

  if (notFound || !blog) {
    return <NotFoundPage />;
  }

  const shareUrl = window.location.href;

  return (
    <article className="min-h-screen py-8">
      <div className="mx-auto mb-8 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="badge text-sm">{blog.category}</span>
          {blog.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-slate-200 px-3 py-1 text-sm dark:bg-slate-700">
              {tag}
            </span>
          ))}
        </div>

        <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100 md:text-5xl">
          {blog.title}
        </h1>

        <div className="mb-8 flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(blog.publishedAt)}</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{blog.readingTime} min read</span>
          <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{blog.views} views</span>
        </div>

        <div className="relative mb-8 flex h-[50vh] max-h-[50vh] items-center justify-center overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
          <img src={blog.coverImage} alt={blog.title} className="h-full w-full object-cover" />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div
          className="prose prose-slate max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>

      <div className="mx-auto mb-8 max-w-4xl border-y border-slate-200 px-4 py-8 dark:border-slate-800 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Share2 className="h-4 w-4" />
            Share:
          </span>
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(blog.title)}`} target="_blank" rel="noreferrer" className="btn-secondary text-sm">
            Twitter
          </a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className="btn-secondary text-sm">
            LinkedIn
          </a>
          <a href={`https://wa.me/?text=${encodeURIComponent(`${blog.title} ${shareUrl}`)}`} target="_blank" rel="noreferrer" className="btn-secondary text-sm">
            WhatsApp
          </a>
        </div>
      </div>

      {relatedBlogs.length > 0 && (
        <div className="mx-auto mt-16 max-w-4xl border-t border-slate-200 px-4 pt-16 sm:px-6 lg:px-8 dark:border-slate-800">
          <h2 className="mb-8 text-3xl font-bold text-slate-900 dark:text-slate-100">
            Related Posts
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {relatedBlogs.map((relatedBlog) => (
              <Link key={relatedBlog.id} to={`/blog/${relatedBlog.slug}`} className="card group overflow-hidden">
                <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src={relatedBlog.coverImage} alt={relatedBlog.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <h3 className="mb-2 line-clamp-2 font-bold text-slate-900 transition-colors group-hover:text-primary-600 dark:text-slate-100 dark:group-hover:text-primary-400">
                    {relatedBlog.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                    {relatedBlog.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <CommentSection slug={blog.slug} />
    </article>
  );
}
