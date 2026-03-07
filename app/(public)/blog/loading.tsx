export default function BlogListLoading() {
  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-80"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 animate-pulse">
            <div className="card p-6 mb-6">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              ))}
            </div>
          </aside>
          <div className="lg:col-span-3 space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-72 aspect-video bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-6 flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
