export default function PublicLoading() {
  return (
    <div className="min-h-screen">
      <div className="bg-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="h-12 bg-white/20 rounded w-80 mx-auto mb-6 animate-pulse"></div>
          <div className="h-6 bg-white/20 rounded w-96 mx-auto mb-8 animate-pulse"></div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
