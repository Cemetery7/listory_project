import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, UserRound } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { getStoryById } from "@/lib/stories/queries";
import { AppShell } from "@/widgets/app-shell/app-shell";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { cn } from "@/lib/utils";

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
  const story = await getStoryById(id);

  if (!story) {
    notFound();
  }

  return (
    <AppShell>
      <section className="space-y-6">
        <Card className="overflow-hidden">
          <div className={cn("h-64", story.cover ?? "cover-aurora")} />
          <div className="p-5 md:p-7">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge>{statusLabel(story.status)}</Badge>
              <Badge>{story.chapters.length} глав</Badge>
            </div>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">{story.title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-text-secondary">{story.description}</p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-text-muted">
              <span className="inline-flex items-center gap-2">
                <UserRound size={16} />
                {story.author.username}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={16} />
                {formatDate(story.createdAt)}
              </span>
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

function statusLabel(status: string) {
  if (status === "completed") {
    return "Завершено";
  }

  if (status === "draft") {
    return "Черновик";
  }

  return "В процессе";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}
