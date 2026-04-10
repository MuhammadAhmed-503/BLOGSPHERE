import { Bell, CheckCircle, Mail, Shield } from 'lucide-react';
import SubscribeForm from '../components/SubscribeForm';

const benefits = [
  { icon: <Mail className="h-6 w-6" />, title: 'Email Updates', description: 'Get notified when new articles are published.' },
  { icon: <Bell className="h-6 w-6" />, title: 'Push Notifications', description: 'Optional browser alerts for instant updates.' },
  { icon: <Shield className="h-6 w-6" />, title: 'Privacy First', description: 'Subscription data stays local in this React demo.' },
  { icon: <CheckCircle className="h-6 w-6" />, title: 'Unsubscribe Anytime', description: 'Remove yourself from the local list whenever you want.' },
];

export default function SubscribePage() {
  return (
    <div className="min-h-screen py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-5xl">
            Subscribe to Our Newsletter
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Join readers who want the latest posts without checking back every day.
          </p>
        </div>

        <div className="card mb-12 p-8">
          <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">Get Started</h2>
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            Enter your email and save a local demo subscription in the browser.
          </p>
          <SubscribeForm />
        </div>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="card flex items-start gap-4 p-6">
              <div className="rounded-lg bg-primary-100 p-3 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                {benefit.icon}
              </div>
              <div>
                <h3 className="mb-2 font-bold text-slate-900 dark:text-slate-100">{benefit.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-8">
          <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Frequently Asked Questions</h2>
          <div className="space-y-6 text-slate-600 dark:text-slate-400">
            <div>
              <h3 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">How often will I receive emails?</h3>
              <p>You will get updates whenever new posts are published.</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">Can I unsubscribe at any time?</h3>
              <p>Yes. This version stores subscriptions locally, so you can clear them from the browser whenever needed.</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">Is my email address safe?</h3>
              <p>The React scaffold does not send data to a server. It only stores the email in local browser storage.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
