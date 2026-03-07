export default function BlogDetailLoading() {
  return (
    <article className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="flex gap-2 mb-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
        <div className="flex gap-4 mb-8">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
        <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl mb-8"></div>
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" style={{ width: `${70 + Math.random() * 30}%` }}></div>
          ))}
        </div>
      </div>
    </article>
  );
}
