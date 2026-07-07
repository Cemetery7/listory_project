"use client";

import { useMemo, useState } from "react";
import { works } from "@/data/mock";
import { AppShell } from "@/widgets/app-shell/app-shell";
import { StoryCard } from "@/entities/work/components/story-card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Card } from "@/shared/ui/card";
import { Tag } from "@/shared/ui/tag";
import { FilterSidebar, type CatalogFilters } from "./filter-sidebar";

const initialFilters: CatalogFilters = {
  category: "all",
  status: "all",
  tag: "all",
  sort: "popular"
};

export function CatalogPage() {
  const [filters, setFilters] = useState<CatalogFilters>(initialFilters);

  const filteredWorks = useMemo(() => {
    return works
      .filter((work) => {
        const matchesCategory = filters.category === "all" || work.category === filters.category;
        const matchesStatus = filters.status === "all" || work.status === filters.status;
        const matchesTag = filters.tag === "all" || work.tags.includes(filters.tag);

        return matchesCategory && matchesStatus && matchesTag;
      })
      .sort((left, right) => {
        if (filters.sort === "views") {
          return parseMetric(right.views) - parseMetric(left.views);
        }

        if (filters.sort === "likes") {
          return parseMetric(right.likes) - parseMetric(left.likes);
        }

        if (filters.sort === "new" || filters.sort === "updated") {
          return Number(right.id) - Number(left.id);
        }

        return right.rating - left.rating;
      });
  }, [filters]);

  return (
    <AppShell rightPanel={<FilterSidebar filters={filters} onChange={setFilters} />}>
      <section className="space-y-6">
        <div>
          <p className="text-sm font-medium text-primary">Каталог</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight md:text-5xl">Найдите историю под настроение</h1>
          <p className="mt-3 text-sm text-text-muted">Найдено произведений: {filteredWorks.length}</p>
        </div>

        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-text-primary">Сортировка</span>
            {sortOptions.map((sort) => (
              <Tag key={sort.value} label={sort.label} active={filters.sort === sort.value} onClick={() => setFilters({ ...filters, sort: sort.value })} />
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
          <EmptyState title="По вашему запросу ничего не найдено." description="Попробуйте изменить фильтры." />
        )}
      </section>
    </AppShell>
  );
}

const sortOptions: Array<{ label: string; value: CatalogFilters["sort"] }> = [
  { label: "Популярные", value: "popular" },
  { label: "Новые", value: "new" },
  { label: "По просмотрам", value: "views" },
  { label: "По лайкам", value: "likes" },
  { label: "По обновлению", value: "updated" }
];

function parseMetric(value: string) {
  const normalized = value.toUpperCase();

  if (normalized.endsWith("K")) {
    return Number(normalized.replace("K", "")) * 1000;
  }

  return Number(normalized);
}
