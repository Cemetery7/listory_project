import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Eye, UserRound } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/lib/auth/session";
import { getStoryById, isStoryCoverUrl } from "@/lib/stories/queries";
import { AppShell } from "@/widgets/app-shell/app-shell";
import { StoryActions } from "@/widgets/work/story-actions";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { cn } from "@/lib/utils";
import { isStoryStatus, storyStatusLabel } from "@/lib/stories/status";

export const dynamic = "force-dynamic";

type StoryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const story = await getStoryById(id);

  return {
    title: story ? `${story.title} | Листория` : "Произведение | Листория",
    description: story?.description ?? "Страница произведения."
  };
}

export default async function Page({ params }: StoryPageProps) {
  const { id } = await params;
  const user = await getCurrentUser().catch(() => null);
  const story = await getStoryById(id, user?.id);

  if (!story) {
    notFound();
  }

  const coverUrl = isStoryCoverUrl(story.cover) ? story.cover : null;

  return (
    <AppShell>
      <section className="space-y-6">
        <Card className="overflow-hidden">
          <div className={cn("relative h-64", coverUrl ? "bg-elevated" : story.cover ?? "cover-aurora")}>
            {coverUrl ? <Image alt={`Обложка произведения «${story.title}»`} className="object-cover" fill priority sizes="(max-width: 1024px) 100vw, 900px" src={coverUrl} /> : null}
          </div>
          <div className="p-5 md:p-7">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge>{isStoryStatus(story.status) ? storyStatusLabel(story.status) : "В работе"}</Badge>
              <Badge>{story.chapters.length} глав</Badge>
            </div>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">{story.title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-text-secondary">{story.description}</p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-text-muted">
              <Link className="inline-flex items-center gap-2 transition hover:text-primary" href={ROUTES.author(story.author.id)}>
                <UserRound size={16} />
                {story.author.username}
              </Link>
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={16} />
                {formatDate(story.createdAt)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Eye size={16} />
                {story._count.views} просмотров
              </span>
            </div>
            <div className="mt-6 border-t border-border pt-5">
              <StoryActions
                authenticated={Boolean(user && user.status === "ACTIVE")}
                commentsCount={story._count.comments}
                initialLiked={story.likes.length > 0}
                initialLikesCount={story._count.likes}
                storyId={story.id}
              />
            </div>
          </div>
        </Card>

        <Card className="p-5 md:p-6">
          <h2 className="text-2xl font-bold">Главы</h2>
          <div className="mt-5 space-y-3">
            {story.chapters.map((chapter) => (
              <Link
                className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface p-4 transition duration-200 hover:border-[color:var(--border-hover)] hover:text-primary"
                href={ROUTES.readChapter(story.id, chapter.id)}
                key={chapter.id}
              >
                <span className="font-semibold">{chapter.title}</span>
                <span className="text-sm text-text-muted">Читать</span>
              </Link>
            ))}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}
