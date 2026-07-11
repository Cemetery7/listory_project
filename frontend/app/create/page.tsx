import type { Metadata } from "next";
import { CreateStoryPage } from "@/widgets/create/create-story-page";

export const metadata: Metadata = {
  title: "Создание произведения | Листория",
  description: "Редактор нового произведения и первой главы."
};

export default function Page() {
  return <CreateStoryPage />;
}
