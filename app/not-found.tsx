import type { Metadata } from 'next';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          className="btn-primary inline-block"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for could not be found.',
};
