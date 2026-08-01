import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { getStoryById } from "@/lib/stories/queries";
import { AppShell } from "@/widgets/app-shell/app-shell";
import { ChapterReader } from "@/widgets/reader/chapter-reader";
import { StoryViewTracker } from "@/widgets/reader/story-view-tracker";

export const dynamic = "force-dynamic";

type ReaderPageProps = {
  params: Promise<{
    id: string;
    chapterId: string;
  }>;
};

export async function generateMetadata({ params }: ReaderPageProps): Promise<Metadata> {
  const { id, chapterId } = await params;
  const story = await getStoryById(id);
  const chapter = story?.chapters.find((item) => item.id === chapterId);

  return {
    title: chapter ? `${chapter.title} | ${story?.title}` : "Чтение | Листория",
    description: story?.description ?? "Режим чтения."
  };
}

export default async function Page({ params }: ReaderPageProps) {
  const { id, chapterId } = await params;
  const story = await getStoryById(id);
  const chapterIndex = story?.chapters.findIndex((item) => item.id === chapterId) ?? -1;
  const chapter = story?.chapters[chapterIndex];

  if (!story || !chapter) {
    notFound();
  }

  const previousChapter = story.chapters[chapterIndex - 1];
  const nextChapter = story.chapters[chapterIndex + 1];

  return (
    <AppShell>
      <article className="mx-auto max-w-5xl space-y-6">
        <StoryViewTracker storyId={story.id} />
        <Link className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover" href={ROUTES.work(story.id)}>
          <ArrowLeft size={16} />
          К произведению
        </Link>

        <ChapterReader chapterTitle={chapter.title} content={chapter.content} storyTitle={story.title} />

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          {previousChapter ? (
            <Link className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-5 text-sm font-medium" href={ROUTES.readChapter(story.id, previousChapter.id)}>
              <ArrowLeft size={16} />
              Предыдущая глава
            </Link>
          ) : (
            <span />
          )}
          {nextChapter ? (
            <Link className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-white shadow-hero" href={ROUTES.readChapter(story.id, nextChapter.id)}>
              Следующая глава
              <ArrowRight size={16} />
            </Link>
          ) : null}
        </div>
      </article>
    </AppShell>
  );
}
