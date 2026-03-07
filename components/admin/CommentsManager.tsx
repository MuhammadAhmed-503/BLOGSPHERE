'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { MessageSquare, Trash2, Check, Calendar, User } from 'lucide-react';

interface Comment {
  _id: string;
  blogId: string;
  blogTitle: string;
  name: string;
  email: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
}

export default function CommentsManager({ initialComments }: { initialComments: Comment[] }) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [actionId, setActionId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/comments/${id}/approve`, { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        toast.success('Comment approved');
        setComments((prev) => prev.map((c) => c._id === id ? { ...c, isApproved: true } : c));
        router.refresh();
      } else {
        toast.error(result.message || 'Failed to approve');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    setActionId(id);
    try {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        toast.success('Comment deleted');
        setComments((prev) => prev.filter((c) => c._id !== id));
        router.refresh();
      } else {
        toast.error(result.message || 'Failed to delete');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setActionId(null);
    }
  };

  const filtered = comments.filter((c) => {
    if (filter === 'pending') return !c.isApproved;
    if (filter === 'approved') return c.isApproved;
    return true;
  });

  const pendingCount = comments.filter((c) => !c.isApproved).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Comments</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {comments.length} total
            {pendingCount > 0 && <span className="ml-2 text-yellow-600 dark:text-yellow-400 font-medium">· {pendingCount} pending approval</span>}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex gap-2">
        {(['all', 'pending', 'approved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
              filter === f ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
            }`}
          >
            {f} {f === 'pending' ? `(${pendingCount})` : f === 'approved' ? `(${comments.length - pendingCount})` : `(${comments.length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No comments found</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((comment) => (
            <div key={comment._id} className={`card p-5 border-l-4 ${comment.isApproved ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      comment.isApproved
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {comment.isApproved ? 'Approved' : 'Pending'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      on: <span className="font-medium text-gray-700 dark:text-gray-300">{comment.blogTitle}</span>
                    </span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 mb-3">{comment.content}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {comment.name}</span>
                    <span>{comment.email}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 items-start flex-shrink-0">
                  {!comment.isApproved && (
                    <button
                      onClick={() => handleApprove(comment._id)}
                      disabled={actionId === comment._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
                    >
                      {actionId === comment._id ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(comment._id)}
                    disabled={actionId === comment._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    {actionId === comment._id ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
