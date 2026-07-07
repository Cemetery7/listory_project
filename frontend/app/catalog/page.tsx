import type { Metadata } from "next";
import { CatalogPage } from "@/widgets/catalog/catalog-page";

export const metadata: Metadata = {
  title: "Каталог | Листория",
  description: "Поиск произведений по категориям, тегам и статусу."
};

export default function Page() {
  return <CatalogPage />;
}
