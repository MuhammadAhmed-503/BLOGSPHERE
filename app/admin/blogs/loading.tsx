export default function BlogsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
      </div>
      <div className="card p-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-6">
          <div className="flex gap-4">
            <div className="w-48 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
