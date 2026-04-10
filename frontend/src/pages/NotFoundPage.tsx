import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="max-w-xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-primary-600 dark:text-primary-400">
          404
        </p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Page not found
        </h1>
        <p className="mb-8 text-lg text-slate-600 dark:text-slate-400">
          The page you are looking for does not exist in this React build.
        </p>
        <Link to="/" className="btn-primary px-6 py-3">
          Go Home
        </Link>
      </div>
    </div>
  );
}
