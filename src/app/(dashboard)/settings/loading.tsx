import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col">
      <header className="mb-6 sm:mb-8">
        <Skeleton className="h-7 w-24 sm:h-8 sm:w-28" aria-hidden />
        <Skeleton className="mt-1 h-4 w-56" aria-hidden />
      </header>

      <div className="flex flex-col gap-6">
        <Skeleton className="h-[120px] w-full rounded-xl" aria-hidden />
        <Skeleton className="h-[220px] w-full rounded-xl" aria-hidden />
        <Skeleton className="h-[100px] w-full rounded-xl" aria-hidden />
        <Skeleton className="h-[90px] w-full rounded-xl" aria-hidden />
      </div>

      <footer className="mt-8 border-t border-border pt-6 sm:mt-10 sm:pt-8">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-3 w-72" aria-hidden />
          <div className="flex gap-4">
            <Skeleton className="h-3 w-12" aria-hidden />
            <Skeleton className="h-3 w-14" aria-hidden />
          </div>
        </div>
      </footer>
    </div>
  );
}
