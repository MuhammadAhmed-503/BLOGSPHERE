export default function EditBlogLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-1"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
      </div>
      <div className="card p-6 space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div className="card p-6 space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
        <div className="h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      </div>
      <div className="card p-6 space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
        <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-6 h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="card p-6 h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}
