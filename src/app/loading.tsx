export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Header skeleton */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div>
                <div className="h-5 w-28 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-3 w-44 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mt-1.5" />
              </div>
            </div>
            <div className="w-6 h-6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Title skeleton */}
        <div className="mb-8">
          <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        </div>

        {/* Category filter skeleton */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse"
              style={{ width: `${80 + i * 20}px` }}
            />
          ))}
        </div>

        {/* Search bar skeleton */}
        <div className="h-12 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse mb-6" />

        {/* Job cards skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5"
            >
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-2 bg-zinc-300 dark:bg-zinc-700 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-1" />
                  <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-3" />
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                    <div className="h-3 w-12 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  </div>
                  <div className="flex gap-1.5 mt-3">
                    <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
                    <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
