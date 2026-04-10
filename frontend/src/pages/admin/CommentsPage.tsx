import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { approveAdminComment, deleteAdminComment, fetchAdminComments } from '../../lib/adminApi';
import { formatDate, truncateText } from '../../lib/utils';
import { getAuthSession } from '../../lib/auth';
import type { CommentItem } from '../../types';

type CommentFilter = 'all' | 'pending' | 'approved';

export default function CommentsPage() {
  const session = getAuthSession();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CommentFilter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadComments = () => {
    void (async () => {
      if (!session?.token) {
        return;
      }

      setLoading(true);

      try {
        const items = await fetchAdminComments(session.token);
        setComments(items);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load comments');
      } finally {
        setLoading(false);
      }
    })();
  };

  useEffect(() => {
    loadComments();
  }, [session?.token]);

  const counts = useMemo(() => ({
    total: comments.length,
    pending: comments.filter((comment) => comment.status === 'pending').length,
    approved: comments.filter((comment) => comment.status === 'approved').length,
  }), [comments]);

  const visibleComments = useMemo(() => {
    return comments.filter((comment) => filter === 'all' ? true : comment.status === filter);
  }, [comments, filter]);

  const handleApprove = (comment: CommentItem) => {
    if (!session?.token) {
      return;
    }

    void (async () => {
      setBusyId(comment.id);
      try {
        await approveAdminComment(session.token, comment.id);
        toast.success('Comment approved');
        loadComments();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to approve comment');
      } finally {
        setBusyId(null);
      }
    })();
  };

  const handleDelete = (comment: CommentItem) => {
    if (!session?.token || !window.confirm('Delete this comment? This action cannot be undone.')) {
      return;
    }

    void (async () => {
      setBusyId(comment.id);
      try {
        await deleteAdminComment(session.token, comment.id);
        toast.success('Comment deleted');
        loadComments();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete comment');
      } finally {
        setBusyId(null);
      }
    })();
  };

  return (
    <div>
      <AdminPageHeader title="Comments" subtitle="Moderate reader discussion, approve pending replies, and clear spam." />

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="card p-5"><p className="text-sm text-slate-500 dark:text-slate-400">Total comments</p><p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{counts.total}</p></div>
        <div className="card p-5"><p className="text-sm text-slate-500 dark:text-slate-400">Pending</p><p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">{counts.pending}</p></div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(['all', 'pending', 'approved'] as CommentFilter[]).map((option) => (
          <button key={option} type="button" onClick={() => setFilter(option)} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${filter === option ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
            {option === 'all' ? `All (${counts.total})` : option === 'pending' ? `Pending (${counts.pending})` : `Approved (${counts.approved})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-6 text-slate-600 dark:text-slate-400">Loading comments...</div>
      ) : visibleComments.length === 0 ? (
        <div className="card p-6 text-slate-600 dark:text-slate-400">No comments found for this filter.</div>
      ) : (
        <div className="space-y-4">
          {visibleComments.map((comment) => {
            const isBusy = busyId === comment.id;

            return (
              <div key={comment.id} className={`card border-l-4 p-5 ${comment.status === 'pending' ? 'border-l-amber-400' : 'border-l-emerald-500'}`}>
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{comment.postTitle ?? comment.postSlug}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDate(comment.createdAt ?? new Date().toISOString())}</p>
                  </div>
                  <span className={`badge ${comment.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'}`}>{comment.status}</span>
                </div>

                <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{truncateText(comment.content, 500)}</p>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <span>{comment.authorName}</span>
                  <span>{comment.authorEmail}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {comment.status === 'pending' && (
                    <button type="button" onClick={() => handleApprove(comment)} disabled={isBusy} className="btn-primary inline-flex items-center gap-2">
                      {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}Approve
                    </button>
                  )}
                  <button type="button" onClick={() => handleDelete(comment)} disabled={isBusy} className="btn-secondary inline-flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                    {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
