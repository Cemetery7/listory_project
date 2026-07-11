import type { Metadata } from "next";
import { Suspense } from "react";
import { getPublishedStories } from "@/lib/stories/queries";
import { CatalogPage } from "@/widgets/catalog/catalog-page";

export const metadata: Metadata = {
  title: "Каталог | Листория",
  description: "Поиск произведений по категориям, тегам и статусу."
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const works = await getPublishedStories();

  return (
    <Suspense fallback={null}>
      <CatalogPage works={works} />
    </Suspense>
  );
}
