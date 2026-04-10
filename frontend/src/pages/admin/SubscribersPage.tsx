import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, MailPlus, Trash2, Clock3 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { deleteAdminSubscriber, fetchAdminSubscribers, notifyAdminSubscribers } from '../../lib/adminApi';
import { formatDate } from '../../lib/utils';
import { getAuthSession } from '../../lib/auth';
import type { NewsletterSubscriber } from '../../types';

type SubscriberFilter = 'all' | 'verified' | 'unverified';

export default function SubscribersPage() {
  const session = getAuthSession();
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SubscriberFilter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notifying, setNotifying] = useState(false);

  const loadSubscribers = () => {
    void (async () => {
      if (!session?.token) {
        return;
      }

      setLoading(true);
      try {
        const items = await fetchAdminSubscribers(session.token);
        setSubscribers(items);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load subscribers');
      } finally {
        setLoading(false);
      }
    })();
  };

  useEffect(() => {
    loadSubscribers();
  }, [session?.token]);

  const counts = useMemo(() => ({
    total: subscribers.length,
    verified: subscribers.filter((subscriber) => subscriber.verificationStatus !== 'pending').length,
    pending: subscribers.filter((subscriber) => subscriber.verificationStatus === 'pending').length,
  }), [subscribers]);

  const visibleSubscribers = useMemo(() => {
    return subscribers.filter((subscriber) => {
      if (filter === 'all') {
        return true;
      }

      if (filter === 'verified') {
        return subscriber.verificationStatus !== 'pending';
      }

      return subscriber.verificationStatus === 'pending';
    });
  }, [filter, subscribers]);

  const handleDelete = (subscriber: NewsletterSubscriber) => {
    if (!session?.token || !window.confirm(`Delete subscriber ${subscriber.email}?`)) {
      return;
    }

    void (async () => {
      setBusyId(subscriber.id);
      try {
        await deleteAdminSubscriber(session.token, subscriber.id);
        toast.success('Subscriber removed');
        loadSubscribers();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete subscriber');
      } finally {
        setBusyId(null);
      }
    })();
  };

  const handleNotifyAll = () => {
    if (!session?.token) {
      return;
    }

    void (async () => {
      setNotifying(true);
      try {
        const result = await notifyAdminSubscribers(session.token, {
          subject: 'Latest update from BlogSphere',
          message: 'A new update is available in the admin panel.',
        });
        toast.success(`Notification sent to ${result.sentTo} subscribers`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to send notifications');
      } finally {
        setNotifying(false);
      }
    })();
  };

  return (
    <div>
      <AdminPageHeader
        title="Subscribers"
        subtitle="Manage newsletter subscribers, remove records, and send broadcast notifications."
        actions={<button type="button" onClick={handleNotifyAll} disabled={notifying} className="btn-primary inline-flex items-center gap-2"><MailPlus className="h-4 w-4" />{notifying ? 'Sending...' : 'Notify All'}</button>}
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="card p-5"><p className="text-sm text-slate-500 dark:text-slate-400">Total</p><p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{counts.total}</p></div>
        <div className="card p-5"><p className="text-sm text-slate-500 dark:text-slate-400">Verified</p><p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">{counts.verified}</p></div>
        <div className="card p-5"><p className="text-sm text-slate-500 dark:text-slate-400">Pending</p><p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">{counts.pending}</p></div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(['all', 'verified', 'unverified'] as SubscriberFilter[]).map((option) => (
          <button key={option} type="button" onClick={() => setFilter(option)} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${filter === option ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
            {option === 'all' ? `All (${counts.total})` : option === 'verified' ? `Verified (${counts.verified})` : `Unverified (${counts.pending})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-6 text-slate-600 dark:text-slate-400">Loading subscribers...</div>
      ) : visibleSubscribers.length === 0 ? (
        <div className="card p-6 text-slate-600 dark:text-slate-400">No subscribers match the current filter.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-950/40">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {visibleSubscribers.map((subscriber) => {
                  const isBusy = busyId === subscriber.id;
                  const isVerified = subscriber.verificationStatus !== 'pending';

                  return (
                    <tr key={subscriber.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">{subscriber.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${isVerified ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'}`}>
                          {isVerified ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                          {isVerified ? 'verified' : 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{formatDate(subscriber.subscribedAt ?? subscriber.createdAt ?? new Date().toISOString())}</td>
                      <td className="px-6 py-4 text-right">
                        <button type="button" onClick={() => handleDelete(subscriber)} disabled={isBusy} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-slate-700 dark:text-red-400 dark:hover:bg-red-950/20">
                          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
