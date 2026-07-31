import type { Metadata } from "next";
import { getPublishedStories, type StorySort } from "@/lib/stories/queries";
import { CatalogPage } from "@/widgets/catalog/catalog-page";
import type { CatalogFilters } from "@/widgets/catalog/filter-sidebar";
import { isStoryStatus } from "@/lib/stories/status";

export const metadata: Metadata = {
  title: "Каталог | Листория",
  description: "Поиск произведений по категориям, тегам и статусу."
};

export const dynamic = "force-dynamic";

type CatalogPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    status?: string;
    tag?: string;
    sort?: string;
  }>;
};

export default async function Page({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const filters: CatalogFilters = {
    query: params.q?.trim() ?? "",
    category: params.category ?? "all",
    status: normalizeStatus(params.status),
    tag: params.tag ?? "all",
    sort: normalizeSort(params.sort)
  };
  const works = await getPublishedStories({
    query: filters.query || undefined,
    status: filters.status === "all" ? undefined : filters.status,
    sort: filters.sort
  });

  return <CatalogPage filters={filters} works={works} />;
}

function normalizeStatus(status?: string): CatalogFilters["status"] {
  if (isStoryStatus(status) && status !== "draft") {
    return status;
  }

  return "all";
}

function normalizeSort(sort?: string): StorySort {
  return sort === "updated" ? "updated" : "new";
}
