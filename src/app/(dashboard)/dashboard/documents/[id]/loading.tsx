import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentDetailLoading() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-2.5 sm:px-5 sm:py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Skeleton className="size-9 shrink-0 rounded-lg" />
          <Skeleton className="h-5 min-w-0 flex-1 max-w-[240px]" />
        </div>
        <Skeleton className="h-9 w-24 shrink-0" />
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-2">
        <div className="relative hidden min-h-0 flex-col overflow-hidden lg:flex">
          <div className="flex shrink-0 items-center gap-2 border-b border-border bg-background px-4 py-2.5 lg:border-r">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="min-h-0 flex-1 overflow-hidden bg-muted/30 p-3">
            <Skeleton className="size-full rounded-lg" aria-busy aria-label="Loading PDF" />
          </div>
        </div>
        <div className="relative flex min-h-0 min-w-0 flex-col overflow-hidden">
          <div className="flex shrink-0 items-center border-b border-border px-4 pt-3 pb-0">
            <div className="flex gap-2 pb-3">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-14" />
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-6 w-20" />
                <div className="flex items-center gap-1.5">
                  <Skeleton className="size-8 rounded-md" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className={i === 6 ? "h-4 w-2/3" : "h-4 w-full"} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
