import type { Work } from "@/entities/work/types";
import { SectionHeader } from "./section-header";
import { StoryCard } from "./story-card";

export function StorySection({ title, items }: { title: string; items: Work[] }) {
  return (
    <section>
      <SectionHeader title={title} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((work) => (
          <StoryCard key={work.id} work={work} />
        ))}
      </div>
    </section>
  );
}
