export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-6">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        ))}
      </div>
      <div className="card p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
