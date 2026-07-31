import { AppShell } from "@/widgets/app-shell/app-shell";
import { Skeleton } from "@/shared/ui/skeleton";

export default function Loading() {
  return (
    <AppShell>
      <section className="space-y-6" aria-label="Загрузка каталога">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-full max-w-xl" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton className="h-[372px]" key={index} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
