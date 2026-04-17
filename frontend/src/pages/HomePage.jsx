import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Star, TrendingUp } from 'lucide-react';
import { fetchHome } from '../services/api';
import { formatDate } from '../utils';
export default function HomePage() {
    const [featuredBlogs, setFeaturedBlogs] = useState([]);
    const [latestBlogs, setLatestBlogs] = useState([]);
    const [trendingBlogs, setTrendingBlogs] = useState([]);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let active = true;
        void (async () => {
            try {
                const data = await fetchHome();
                if (!active) {
                    return;
                }
                setFeaturedBlogs(data.featuredPosts);
                setLatestBlogs(data.latestPosts);
                setTrendingBlogs(data.trendingPosts);
                setSettings(data.settings ?? null);
            }
            finally {
                if (active) {
                    setLoading(false);
                }
            }
        })();
        return () => {
            active = false;
        };
    }, []);
    return (<div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-sky-500 py-20 text-white">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_top_left,_white,_transparent_40%),radial-gradient(circle_at_bottom_right,_white,_transparent_35%)]"/>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-1 text-sm font-medium text-white/90 backdrop-blur">
              A polished React migration for static hosting
            </p>
            <h1 className="animate-slide-up text-4xl font-bold tracking-tight md:text-6xl">
              Welcome to Our Blog
            </h1>
            <p className="animate-slide-up mt-6 text-xl text-white/90 md:text-2xl">
              Discover practical articles, design notes, and product ideas from the BlogSphere editorial team.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/blog" className="btn-primary bg-white px-8 py-3 text-lg text-primary-700 hover:bg-slate-100">
                Explore Articles
              </Link>
              <Link to="/subscribe" className="btn-outline border-white px-8 py-3 text-lg text-white hover:bg-white/10">
                Subscribe Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {loading && (<section className="bg-white py-12 text-center dark:bg-slate-950">
          <p className="text-slate-600 dark:text-slate-400">Loading latest content...</p>
        </section>)}

      {featuredBlogs.length > 0 && settings?.showFeaturedSection !== false && (<section className="bg-white py-16 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                <Star className="h-8 w-8 text-amber-500"/>
                Featured Posts
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredBlogs.map((blog) => (<Link key={blog.id} to={`/blog/${blog.slug}`} className="card group overflow-hidden">
                  <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={blog.coverImage} alt={blog.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"/>
                  </div>
                  <div className="p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="badge">{blog.category}</span>
                      <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400"><Clock className="h-4 w-4"/>{blog.readingTime} min read</span>
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-primary-600 dark:text-slate-100 dark:group-hover:text-primary-400">{blog.title}</h3>
                    <p className="mb-4 line-clamp-2 text-slate-600 dark:text-slate-400">{blog.excerpt}</p>
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400"><Calendar className="mr-1 h-4 w-4"/>{formatDate(blog.publishedAt)}</div>
                  </div>
                </Link>))}
            </div>
          </div>
        </section>)}

      {settings?.showLatestSection !== false && (<section className="bg-slate-50 py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Latest Posts</h2>
            <Link to="/blog" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {latestBlogs.map((blog) => (<Link key={blog.id} to={`/blog/${blog.slug}`} className="card group overflow-hidden">
                <div className="relative aspect-video overflow-hidden bg-slate-200 dark:bg-slate-800">
                  <img src={blog.coverImage} alt={blog.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"/>
                </div>
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="badge">{blog.category}</span>
                    <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400"><Clock className="h-4 w-4"/>{blog.readingTime} min read</span>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-primary-600 dark:text-slate-100 dark:group-hover:text-primary-400">{blog.title}</h3>
                  <p className="mb-4 line-clamp-2 text-slate-600 dark:text-slate-400">{blog.excerpt}</p>
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400"><Calendar className="mr-1 h-4 w-4"/>{formatDate(blog.publishedAt)}</div>
                </div>
              </Link>))}
          </div>
        </div>
      </section>)}

      {trendingBlogs.length > 0 && settings?.showTrendingSection !== false && (<section className="bg-white py-16 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 flex items-center gap-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
              <TrendingUp className="h-8 w-8 text-primary-600"/>
              Trending This Week
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {trendingBlogs.map((blog, index) => (<Link key={blog.id} to={`/blog/${blog.slug}`} className="card p-6 transition-shadow hover:shadow-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">{index + 1}</span>
                    <div>
                      <h3 className="mb-2 line-clamp-2 font-bold text-slate-900 dark:text-slate-100">{blog.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{blog.views} views</p>
                    </div>
                  </div>
                </Link>))}
            </div>
          </div>
        </section>)}

      {settings?.showNewsletterSection !== false && (<section className="bg-gradient-to-br from-primary-700 to-sky-500 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold md:text-4xl">Never Miss an Update</h2>
          <p className="mt-4 text-xl text-white/90">
            Subscribe to the newsletter and keep up with the latest articles.
          </p>
          <Link to="/subscribe" className="btn-primary mt-8 inline-flex items-center justify-center bg-white px-8 py-3 text-lg text-primary-700 hover:bg-slate-100">
            Subscribe Now
          </Link>
        </div>
      </section>)}
    </div>);
}
