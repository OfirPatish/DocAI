import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <header className="space-y-1">
        <Skeleton className="h-8 w-32 sm:h-9 sm:w-40" />
        <Skeleton className="h-4 w-56" />
      </header>
      <section className="space-y-6">
        <Skeleton className="h-[140px] w-full rounded-xl" />
        <Skeleton className="h-[260px] w-full rounded-xl" />
        <Skeleton className="h-[120px] w-full rounded-xl" />
      </section>
      <Skeleton className="mx-auto h-3 w-64" />
    </div>
  );
}
