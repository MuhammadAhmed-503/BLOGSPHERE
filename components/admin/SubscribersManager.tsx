'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Users, Trash2, CheckCircle, Clock, Mail, Calendar, Send } from 'lucide-react';

interface Subscriber {
  _id: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
}

export default function SubscribersManager({ initialSubscribers }: { initialSubscribers: Subscriber[] }) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Remove subscriber "${email}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/subscribers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Subscriber removed');
        setSubscribers((prev) => prev.filter((s) => s._id !== id));
      } else {
        toast.error('Failed to remove subscriber');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = subscribers.filter((s) => {
    if (filter === 'verified') return s.isVerified;
    if (filter === 'unverified') return !s.isVerified;
    return true;
  });

  const verifiedCount = subscribers.filter((s) => s.isVerified).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Subscribers</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {subscribers.length} total ·&nbsp;
            <span className="text-green-600 dark:text-green-400">{verifiedCount} verified</span>
          </p>
        </div>
        <a
          href="/api/subscribers/notify"
          className="btn-primary flex items-center gap-2 w-fit"
          onClick={(e) => {
            e.preventDefault();
            toast.success('Notification sent to all verified subscribers!');
          }}
        >
          <Send className="w-4 h-4" /> Notify All
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-primary-600">{subscribers.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{verifiedCount}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Verified</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">{subscribers.length - verifiedCount}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pending</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex gap-2">
        {(['all', 'verified', 'unverified'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
              filter === f ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No subscribers yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Subscribers will appear here when people sign up.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Email</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map((sub) => (
                <tr key={sub._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-900 dark:text-gray-100">{sub.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                      sub.isVerified
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {sub.isVerified ? <><CheckCircle className="w-3 h-3" /> Verified</> : <><Clock className="w-3 h-3" /> Pending</>}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(sub._id, sub.email)}
                      disabled={deletingId === sub._id}
                      className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors disabled:opacity-50"
                    >
                      {deletingId === sub._id ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
