import connectDB from '@/lib/db';
import Subscriber from '@/models/Subscriber';
import SubscribersManager from '@/components/admin/SubscribersManager';

export const dynamic = 'force-dynamic';

export default async function AdminSubscribersPage() {

  await connectDB();

  const rawSubs = await Subscriber.find({})
    .select('email isVerified subscribedAt createdAt')
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  const subscribers = rawSubs.map((s: Record<string, unknown>) => ({
    _id: String(s._id),
    email: String(s.email ?? ''),
    isVerified: Boolean(s.isVerified),
    createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : String(s.createdAt ?? ''),
  }));

  return <SubscribersManager initialSubscribers={subscribers} />;
}
