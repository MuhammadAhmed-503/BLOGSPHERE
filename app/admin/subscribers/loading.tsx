export default function SubscribersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <div key={i} className="card p-4 h-20 bg-gray-200 dark:bg-gray-700" />)}
      </div>
      <div className="card overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
