import type { Metadata } from 'next';
import { Code, Rocket, Shield, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about our modern blogging platform built with Next.js, MongoDB, and TypeScript.',
};

export default function AboutPage() {
  const features = [
    {
      icon: <Rocket className="w-8 h-8" />,
      title: 'Lightning Fast',
      description: 'Built with Next.js 14 and optimized for performance with ISR and edge caching.',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure by Design',
      description: 'Enterprise-grade security with input sanitization, rate limiting, and CSRF protection.',
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: 'Modern Stack',
      description: 'TypeScript, MongoDB, Tailwind CSS, and all the latest web technologies.',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Scalable',
      description: 'Designed to handle 100k+ users with proper indexing and connection pooling.',
    },
  ];

  const technologies = [
    'Next.js 14',
    'TypeScript',
    'MongoDB',
    'Tailwind CSS',
    'NextAuth',
    'Zod',
    'Cloudinary',
    'Nodemailer',
    'Web Push API',
  ];

  return (
    <div className="min-h-screen py-16">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          About Our Platform
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
          A production-grade, scalable blogging platform built with modern best practices.
          This is not a demo project—it's designed to handle real-world traffic and serve
          100,000+ users with optimal performance and security.
        </p>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-12">
          Built for Scale
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="inline-flex p-4 bg-primary-100 dark:bg-primary-900 rounded-full text-primary-600 dark:text-primary-400 mb-4">
                {feature.icon}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="card p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Technology Stack
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Built with cutting-edge technologies to ensure performance, security, and scalability:
          </p>
          <div className="flex flex-wrap gap-3">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Core Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Advanced Admin Dashboard',
              'Nested Comment System',
              'Email Subscriptions',
              'Web Push Notifications',
              'SEO Optimization',
              'Dark Mode Support',
              'Rate Limiting',
              'Image Optimization',
              'Markdown Support',
              'Search & Filtering',
              'View Tracking',
              'Category & Tags',
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
              >
                <div className="w-2 h-2 bg-primary-600 rounded-full" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
