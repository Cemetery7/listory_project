"use client";

import { useMemo, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import type { Work } from "@/entities/work/types";
import { AppShell } from "@/widgets/app-shell/app-shell";
import { StoryCard } from "@/entities/work/components/story-card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Card } from "@/shared/ui/card";
import { Tag } from "@/shared/ui/tag";
import { FilterSidebar, type CatalogFilters } from "./filter-sidebar";

export function CatalogPage({ works, filters }: { works: Work[]; filters: CatalogFilters }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const filteredWorks = useMemo(() => {
    return works
      .filter((work) => {
        const matchesCategory = filters.category === "all" || work.category === filters.category;
        const matchesStatus = filters.status === "all" || work.status === filters.status;
        const matchesTag = filters.tag === "all" || work.tags.includes(filters.tag);

        return matchesCategory && matchesStatus && matchesTag;
      });
  }, [filters.category, filters.tag, works]);

  const updateFilters = (nextFilters: CatalogFilters) => {
    const params = new URLSearchParams();

    if (nextFilters.query) params.set("q", nextFilters.query);
    if (nextFilters.category !== "all") params.set("category", nextFilters.category);
    if (nextFilters.status !== "all") params.set("status", nextFilters.status);
    if (nextFilters.tag !== "all") params.set("tag", nextFilters.tag);
    if (nextFilters.sort !== "new") params.set("sort", nextFilters.sort);

    startTransition(() => {
      router.replace(`${pathname}${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
    });
  };

  return (
    <AppShell rightPanel={<FilterSidebar filters={filters} onChange={updateFilters} />}>
      <section className="space-y-6">
        <div>
          <p className="text-sm font-medium text-primary">Каталог</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight md:text-5xl">Найдите историю под настроение</h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-text-muted">
            Найдено произведений: {filteredWorks.length}
            {isPending ? <LoaderCircle aria-label="Загрузка" className="animate-spin text-primary" size={16} /> : null}
          </p>
        </div>

        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-text-primary">Сортировка</span>
            {sortOptions.map((sort) => (
              <Tag key={sort.value} label={sort.label} active={filters.sort === sort.value} onClick={() => updateFilters({ ...filters, sort: sort.value })} />
            ))}
          </div>
        </Card>

        {filteredWorks.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
            {filteredWorks.map((work) => (
              <StoryCard key={work.id} work={work} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={filters.query ? "Ничего не найдено" : "Произведений пока нет"}
            description={filters.query ? `По запросу «${filters.query}» нет подходящих произведений. Попробуйте изменить запрос или фильтры.` : "Опубликуйте первую историю, и она появится в каталоге."}
          />
        )}
      </section>
    </AppShell>
  );
}

const sortOptions: Array<{ label: string; value: CatalogFilters["sort"] }> = [
  { label: "Новые", value: "new" },
  { label: "По обновлению", value: "updated" }
];
