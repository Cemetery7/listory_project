import { BookMarked, WandSparkles } from "lucide-react";
import { SectionHeader } from "./section-header";

const collections = [
  {
    title: "Для долгого вечера",
    description: "Медленные истории с атмосферой, тайнами и уютным темпом.",
    icon: BookMarked
  },
  {
    title: "AI рекомендует",
    description: "Подборка по тегам: фэнтези, приключения, сильная героиня.",
    icon: WandSparkles
  }
];

export function CollectionsSection() {
  return (
    <section>
      <SectionHeader title="Подборки" />
      <div className="grid gap-4 md:grid-cols-2">
        {collections.map((collection) => (
          <article
            className="rounded-lg border border-border bg-card p-5 shadow-card transition duration-200 hover:-translate-y-1 hover:border-[color:var(--border-hover)]"
            key={collection.title}
          >
            <div className="mb-5 grid h-11 w-11 place-items-center rounded-md bg-primary/15 text-primary">
              <collection.icon size={20} />
            </div>
            <h3 className="text-xl font-bold leading-tight">{collection.title}</h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{collection.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
