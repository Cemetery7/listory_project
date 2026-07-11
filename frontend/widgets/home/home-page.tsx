import { getPublishedStories } from "@/lib/stories/queries";
import { AppShell } from "@/widgets/app-shell/app-shell";
import { EmptyState } from "@/shared/ui/empty-state";
import { CollectionsSection } from "./collections-section";
import { HeroBanner } from "./hero-banner";
import { RightPanel } from "./right-panel";
import { StorySection } from "./story-section";

export async function HomePage() {
  const works = await getPublishedStories();
  const popular = works.slice(0, 3);
  const fresh = works.slice(0, 3);
  const ongoing = works.filter((work) => work.status === "ongoing");
  const completed = works.filter((work) => work.status === "completed");

  return (
    <AppShell>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-10">
          <HeroBanner />
          {works.length > 0 ? (
            <>
              <StorySection id="popular" items={popular} title="Популярное" />
              <StorySection id="fresh" items={fresh} title="Новинки" />
              <StorySection id="ongoing" items={ongoing} title="Продолжаются" />
              <StorySection id="completed" items={completed} title="Завершённые" />
            </>
          ) : (
            <EmptyState title="Пока нет опубликованных произведений" description="Войдите в аккаунт и опубликуйте первую историю через редактор." buttonLabel="Создать произведение" />
          )}
          <CollectionsSection />
        </div>
        <RightPanel works={works} />
      </div>
    </AppShell>
  );
}
