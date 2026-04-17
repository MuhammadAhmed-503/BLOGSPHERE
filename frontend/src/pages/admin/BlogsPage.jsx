import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpenText, Calendar, Eye, Loader2, PencilLine, PlusCircle, Search, Star, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { deleteAdminBlog, fetchAdminBlogs, setBlogStatus } from '../../services/adminApi';
import { formatDate, truncateText } from '../../utils';
import { getAuthSession } from '../../services/auth';
export default function BlogsPage() {
    const session = getAuthSession();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [busyBlogId, setBusyBlogId] = useState(null);
    const loadBlogs = () => {
        void (async () => {
            if (!session?.token) {
                return;
            }
            setLoading(true);
            try {
                const response = await fetchAdminBlogs(session.token, { limit: 100 });
                setBlogs(response.posts);
            }
            catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to load blogs');
            }
            finally {
                setLoading(false);
            }
        })();
    };
    useEffect(() => {
        loadBlogs();
    }, [session?.token]);
    const counts = useMemo(() => ({
        total: blogs.length,
        published: blogs.filter((blog) => blog.status === 'published').length,
        draft: blogs.filter((blog) => blog.status === 'draft').length,
    }), [blogs]);
    const visibleBlogs = useMemo(() => {
        return blogs.filter((blog) => {
            const statusMatches = activeFilter === 'all' ? true : blog.status === activeFilter;
            const searchMatches = [blog.title, blog.category, ...(blog.tags ?? [])].join(' ').toLowerCase().includes(search.toLowerCase());
            return statusMatches && searchMatches;
        });
    }, [activeFilter, blogs, search]);
    const handleToggleStatus = (blog) => {
        if (!session?.token) {
            return;
        }
        void (async () => {
            setBusyBlogId(blog.id);
            try {
                const nextStatus = blog.status === 'published' ? 'draft' : 'published';
                await setBlogStatus(session.token, blog.id, nextStatus);
                toast.success(nextStatus === 'published' ? 'Blog published' : 'Blog unpublished');
                loadBlogs();
            }
            catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to update blog status');
            }
            finally {
                setBusyBlogId(null);
            }
        })();
    };
    const handleDelete = (blog) => {
        if (!session?.token || !window.confirm(`Delete "${blog.title}"? This cannot be undone.`)) {
            return;
        }
        void (async () => {
            setBusyBlogId(blog.id);
            try {
                await deleteAdminBlog(session.token, blog.id);
                toast.success('Blog deleted');
                loadBlogs();
            }
            catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to delete blog');
            }
            finally {
                setBusyBlogId(null);
            }
        })();
    };
    return (<div>
      <AdminPageHeader title="Blogs" subtitle="Review, search, publish, unpublish, and delete blog posts from one control surface." actions={<Link to="/admin/create" className="btn-primary inline-flex items-center gap-2"><PlusCircle className="h-4 w-4"/>Create New Blog</Link>}/>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="card p-5"><p className="text-sm text-slate-500 dark:text-slate-400">Total</p><p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{counts.total}</p></div>
        <div className="card p-5"><p className="text-sm text-slate-500 dark:text-slate-400">Published</p><p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">{counts.published}</p></div>
        <div className="card p-5"><p className="text-sm text-slate-500 dark:text-slate-400">Draft</p><p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">{counts.draft}</p></div>
      </div>

      <div className="card mb-6 p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400"/>
            <input className="input pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title or category"/>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'published', 'draft'].map((filter) => (<button key={filter} type="button" onClick={() => setActiveFilter(filter)} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeFilter === filter ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
                {filter === 'all' ? `All (${counts.total})` : filter === 'published' ? `Published (${counts.published})` : `Draft (${counts.draft})`}
              </button>))}
          </div>
        </div>
      </div>

      {loading ? (<div className="card p-6 text-slate-600 dark:text-slate-400">Loading blogs...</div>) : visibleBlogs.length === 0 ? (<div className="card flex flex-col items-center gap-4 p-10 text-center">
          <div className="rounded-full bg-primary-50 p-4 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300">
            <BookOpenIcon />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">No blogs found</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Try clearing the search or create a new post.</p>
          </div>
          <Link to="/admin/create" className="btn-primary inline-flex items-center gap-2"><PlusCircle className="h-4 w-4"/>Create New Blog</Link>
        </div>) : (<div className="space-y-4">
          {visibleBlogs.map((blog) => {
                const isBusy = busyBlogId === blog.id;
                return (<div key={blog.id} className="card overflow-hidden p-4 md:p-5">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="h-40 w-full flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100 md:h-28 md:w-32 dark:bg-slate-800">
                    {blog.coverImage ? <img src={blog.coverImage} alt={blog.title} className="h-full w-full object-cover"/> : <div className="flex h-full items-center justify-center text-slate-400"><ImageFallback /></div>}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className={`badge ${blog.status === 'published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'}`}>{blog.status ?? 'draft'}</span>
                      {blog.featured && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"><Star className="h-3 w-3"/>Featured</span>}
                      <span className="badge">{blog.category}</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{blog.title}</h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{truncateText(blog.excerpt, 180)}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4"/>{formatDate(blog.createdAt ?? blog.publishedAt)}</span>
                      <span className="inline-flex items-center gap-2"><Eye className="h-4 w-4"/>{blog.views} views</span>
                      <div className="flex flex-wrap gap-2">
                        {blog.tags.slice(0, 3).map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{tag}</span>)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 md:self-start">
                    <Link to={`/admin/edit/${blog.id}`} className="btn-secondary inline-flex items-center gap-2" aria-label={`Edit ${blog.title}`}>
                      <PencilLine className="h-4 w-4"/>Edit
                    </Link>

                    <button type="button" onClick={() => handleToggleStatus(blog)} disabled={isBusy} className="btn-outline inline-flex items-center gap-2">
                      {isBusy ? <Loader2 className="h-4 w-4 animate-spin"/> : blog.status === 'published' ? <ToggleRight className="h-4 w-4"/> : <ToggleLeft className="h-4 w-4"/>}
                      {blog.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>

                    {blog.status === 'published' && (<a href={`/blog/${blog.slug}`} target="_blank" rel="noreferrer" className="btn-secondary inline-flex items-center gap-2">
                        <Eye className="h-4 w-4"/>View
                      </a>)}

                    <button type="button" onClick={() => handleDelete(blog)} disabled={isBusy} className="btn-secondary inline-flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                      {isBusy ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
                      Delete
                    </button>
                  </div>
                </div>
              </div>);
            })}
        </div>)}
    </div>);
}
function BookOpenIcon() {
    return <BookOpenText className="h-6 w-6"/>;
}
function ImageFallback() {
    return <BookOpenText className="h-5 w-5"/>;
}
