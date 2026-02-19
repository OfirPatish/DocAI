import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentDetailLoading() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4 py-3 sm:px-5 sm:py-3.5">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Skeleton className="size-9 shrink-0 rounded-lg" aria-hidden />
          <Skeleton className="h-5 min-w-0 flex-1 max-w-[200px] sm:max-w-[280px]" aria-hidden />
        </div>
        <Skeleton className="size-9 shrink-0 rounded-lg" aria-hidden />
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[2fr_3fr]">
        <div className="relative hidden min-h-0 flex-1 overflow-hidden border-border lg:block lg:border-r">
          <Skeleton className="size-full" aria-busy aria-label="Loading PDF" />
        </div>
        <div className="relative flex min-h-0 min-w-0 flex-col overflow-hidden">
          <div className="flex min-h-11 shrink-0 items-center border-b border-border px-4 pt-3 pb-0">
            <div className="flex gap-2 pb-3">
              <Skeleton className="h-6 w-20" aria-hidden />
              <Skeleton className="h-6 w-16" aria-hidden />
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden p-3 sm:p-5">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                <Skeleton className="size-8 shrink-0 rounded-md" aria-hidden />
                <Skeleton className="size-8 shrink-0 rounded-md" aria-hidden />
                <Skeleton className="h-8 w-20 shrink-0 rounded-lg" aria-hidden />
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className={i === 6 ? "h-4 w-2/3" : "h-4 w-full"} aria-hidden />
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
