import { works } from "@/data/mock";
import { AppShell } from "@/widgets/app-shell/app-shell";
import { CollectionsSection } from "./collections-section";
import { HeroBanner } from "./hero-banner";
import { RightPanel } from "./right-panel";
import { StorySection } from "./story-section";

export function HomePage() {
  const popular = works.slice(0, 3);
  const fresh = [works[2], works[0], works[1]];
  const ongoing = works.filter((work) => work.status === "ongoing");
  const completed = works.filter((work) => work.status === "completed");

  return (
    <AppShell>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-10">
          <HeroBanner />
          <StorySection items={popular} title="Популярное" />
          <StorySection items={fresh} title="Новинки" />
          <StorySection items={ongoing} title="Продолжаются" />
          <StorySection items={completed} title="Завершённые" />
          <CollectionsSection />
        </div>
        <RightPanel />
      </div>
    </AppShell>
  );
}
