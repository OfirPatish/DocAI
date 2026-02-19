import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="flex w-full flex-col">
      <header className="mb-6 sm:mb-8">
        <Skeleton className="h-7 w-48 sm:h-8 sm:w-56" aria-hidden />
        <Skeleton className="mt-1 h-4 w-72 sm:w-96" aria-hidden />
      </header>

      <div className="mb-6 sm:mb-8">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" aria-hidden />
            ))}
          </div>
          <Skeleton className="h-24 rounded-xl" aria-hidden />
        </div>
      </div>

      <div className="mb-6 grid gap-6 sm:mb-8 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" aria-hidden />
        <Skeleton className="h-80 rounded-xl" aria-hidden />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md rounded-lg" aria-hidden />
        <Skeleton className="h-96 w-full rounded-xl" aria-hidden />
      </div>
    </div>
  );
}
