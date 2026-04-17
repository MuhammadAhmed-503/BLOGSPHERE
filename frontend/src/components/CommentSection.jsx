import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { createPostComment, fetchPostComments } from '../services/api';
export default function CommentSection({ slug }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        authorName: '',
        authorEmail: '',
        content: '',
    });
    const loadComments = () => {
        void (async () => {
            setLoading(true);
            try {
                const items = await fetchPostComments(slug);
                setComments(items);
            }
            finally {
                setLoading(false);
            }
        })();
    };
    useEffect(() => {
        loadComments();
    }, [slug]);
    const handleSubmit = (event) => {
        void (async () => {
            event.preventDefault();
            try {
                await createPostComment(slug, {
                    authorName: formData.authorName.trim(),
                    authorEmail: formData.authorEmail.trim(),
                    content: formData.content.trim(),
                });
                toast.success('Comment submitted for review.');
                setFormData({ authorName: '', authorEmail: '', content: '' });
            }
            catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to submit comment');
            }
        })();
    };
    return (<section className="mx-auto mt-16 max-w-4xl border-t border-slate-200 px-4 pt-12 dark:border-slate-800 sm:px-6 lg:px-8">
      <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Comments</h2>

      <form onSubmit={handleSubmit} className="card mb-8 space-y-3 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input className="input" placeholder="Your name" value={formData.authorName} onChange={(event) => setFormData((prev) => ({ ...prev, authorName: event.target.value }))} required/>
          <input type="email" className="input" placeholder="Your email" value={formData.authorEmail} onChange={(event) => setFormData((prev) => ({ ...prev, authorEmail: event.target.value }))} required/>
        </div>
        <textarea className="input min-h-[110px]" placeholder="Write your comment" value={formData.content} onChange={(event) => setFormData((prev) => ({ ...prev, content: event.target.value }))} required/>
        <button type="submit" className="btn-primary">Submit Comment</button>
      </form>

      {loading ? (<p className="text-slate-600 dark:text-slate-400">Loading comments...</p>) : comments.length === 0 ? (<p className="text-slate-600 dark:text-slate-400">No approved comments yet.</p>) : (<div className="space-y-4">
          {comments.map((comment) => (<div key={comment.id} className="card p-4">
              <div className="mb-2 flex items-center justify-between gap-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{comment.authorName}</h3>
                {comment.createdAt && (<span className="text-xs text-slate-500 dark:text-slate-400">{new Date(comment.createdAt).toLocaleString()}</span>)}
              </div>
              <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{comment.content}</p>
            </div>))}
        </div>)}
    </section>);
}
