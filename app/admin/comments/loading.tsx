export default function CommentsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
      <div className="card p-4 flex gap-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24" />)}
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
