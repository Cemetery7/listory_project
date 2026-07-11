"use client";

import { BookOpen, SlidersHorizontal, Sparkles, Tags } from "lucide-react";
import { Card } from "@/shared/ui/card";
import { Tag } from "@/shared/ui/tag";

export type CatalogFilters = {
  category: string;
  status: "all" | "ongoing" | "completed";
  tag: string;
  sort: "popular" | "new" | "views" | "likes" | "updated";
};

type FilterSidebarProps = {
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
};

const statusOptions: Array<{ label: string; value: CatalogFilters["status"] }> = [
  { label: "Все", value: "all" },
  { label: "В процессе", value: "ongoing" },
  { label: "Завершено", value: "completed" }
];
const categories = ["Оригинальные"];
const tags = ["в процессе", "завершено", "черновик"];

export function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  return (
    <aside className="space-y-4">
      <Card className="p-5">
        <div className="mb-5 flex items-center gap-2">
          <BookOpen className="text-primary" size={18} />
          <h2 className="text-lg font-semibold">Категории</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Tag label="Все" active={filters.category === "all"} onClick={() => onChange({ ...filters, category: "all" })} />
          {categories.map((category) => (
            <Tag key={category} label={category} active={filters.category === category} onClick={() => onChange({ ...filters, category })} />
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-5 flex items-center gap-2">
          <SlidersHorizontal className="text-primary" size={18} />
          <h2 className="text-lg font-semibold">Фильтры</h2>
        </div>
        <FilterGroup title="Статус">
          {statusOptions.map((status) => (
            <Tag key={status.value} label={status.label} active={filters.status === status.value} onClick={() => onChange({ ...filters, status: status.value })} />
          ))}
        </FilterGroup>
      </Card>

      <Card className="p-5">
        <div className="mb-5 flex items-center gap-2">
          <Tags className="text-primary" size={18} />
          <h2 className="text-lg font-semibold">Популярные теги</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Tag label="Все" active={filters.tag === "all"} onClick={() => onChange({ ...filters, tag: "all" })} />
          {tags.map((tag) => (
            <Tag key={tag} label={`#${tag}`} active={filters.tag === tag} onClick={() => onChange({ ...filters, tag })} />
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4 grid h-10 w-10 place-items-center rounded-md bg-primary/15 text-primary">
          <Sparkles size={18} />
        </div>
        <h2 className="text-lg font-semibold">AI рекомендует</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">Начните с фэнтези и приключений: эти истории чаще всего дочитывают до конца.</p>
      </Card>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border py-5 first:border-t-0 first:pt-0 last:pb-0">
      <h3 className="mb-3 text-sm font-semibold text-text-primary">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}
