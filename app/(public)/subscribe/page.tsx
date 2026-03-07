import type { Metadata } from 'next';
import SubscribeForm from '@/components/SubscribeForm';
import { Mail, Bell, Shield, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Subscribe',
  description: 'Subscribe to our newsletter and never miss an update. Get the latest articles delivered to your inbox.',
};

export default function SubscribePage() {
  const benefits = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Updates',
      description: 'Get notified when we publish new articles',
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: 'Push Notifications',
      description: 'Optional browser notifications for instant updates',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Privacy First',
      description: 'We never share your email with third parties',
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Unsubscribe Anytime',
      description: 'Easy one-click unsubscribe in every email',
    },
  ];

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Subscribe to Our Newsletter
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Join thousands of readers and get the latest articles delivered to your inbox
          </p>
        </div>

        {/* Subscribe Form */}
        <div className="card p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Get Started
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Enter your email below to receive our latest content directly in your inbox.
            We&apos;ll send you a verification email to confirm your subscription.
          </p>
          <SubscribeForm />
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="card p-6 flex items-start gap-4"
            >
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg text-primary-600 dark:text-primary-400">
                {benefit.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                How often will I receive emails?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You&apos;ll receive an email whenever we publish a new article. We typically publish 2-3 times per week, so you won&apos;t be overwhelmed with emails.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Can I unsubscribe at any time?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Absolutely! Every email includes an unsubscribe link. You can also manage your subscription preferences at any time.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Is my email address safe?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! We take privacy seriously. Your email will never be shared with third parties or used for any purpose other than sending you our content updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
