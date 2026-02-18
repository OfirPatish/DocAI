import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-8">
      <div>
        <Skeleton className="h-8 w-48 sm:h-9 sm:w-64" />
        <Skeleton className="mt-1 h-4 w-72 sm:w-80" />
      </div>
      <section className="flex flex-col gap-3">
        <Skeleton className="min-h-[160px] w-full rounded-2xl sm:min-h-[200px]" />
      </section>
      <section className="flex flex-col gap-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-36 sm:h-7 sm:w-40" />
            <Skeleton className="h-5 w-8 shrink-0 rounded-full" />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <Skeleton className="h-9 w-full sm:w-64" />
            <Skeleton className="h-9 w-28 shrink-0" />
          </div>
        </div>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <li key={i}>
              <div className="overflow-hidden rounded-xl border border-border">
                <Skeleton className="aspect-[2/1] w-full rounded-none" />
                <div className="flex flex-col p-4">
                  <Skeleton className="mx-auto h-4 w-3/4" />
                  <div className="mt-4 flex justify-between pt-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="size-8 rounded-md shrink-0" />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
