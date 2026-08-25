/**
 * Route-segment loading skeleton for the authenticated app shell.
 * Next.js renders this INSTANTLY on any client-side navigation inside (app),
 * so clicks feel immediate instead of leaving the previous page frozen while
 * the next page's data fetches resolve.
 */
export default function AppLoading() {
  return (
    <div className="min-h-screen pb-16 bg-[var(--bg-canvas)] text-[var(--text-primary)]" aria-busy="true">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 animate-pulse">
        {/* Header strip */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-hairline)]">
          <div className="space-y-2 w-full max-w-xs">
            <div className="h-7 w-56 rounded-lg bg-[var(--bg-subtle)]" />
            <div className="h-3.5 w-72 rounded bg-[var(--bg-subtle)]" />
          </div>
          <div className="h-10 w-44 rounded-xl bg-[var(--bg-subtle)]" />
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-2">
              <div className="h-3 w-24 rounded bg-[var(--bg-subtle)]" />
              <div className="h-9 w-16 rounded-lg bg-[var(--bg-subtle)]" />
            </div>
          ))}
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="merix-card p-6 space-y-4"
              aria-hidden="true"
            >
              <div className="h-5 w-2/3 rounded bg-[var(--bg-subtle)]" />
              <div className="h-3.5 w-1/3 rounded bg-[var(--bg-subtle)]" />
              <div className="flex gap-1.5">
                <div className="h-6 w-16 rounded-md bg-[var(--bg-subtle)]" />
                <div className="h-6 w-20 rounded-md bg-[var(--bg-subtle)]" />
                <div className="h-6 w-14 rounded-md bg-[var(--bg-subtle)]" />
              </div>
              <div className="pt-3 border-t border-[var(--border-hairline)] flex justify-between">
                <div className="h-8 w-32 rounded-lg bg-[var(--bg-subtle)]" />
                <div className="h-8 w-28 rounded-lg bg-[var(--bg-subtle)]" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
