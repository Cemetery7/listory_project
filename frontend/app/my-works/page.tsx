import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { requireUserPage } from "@/lib/auth/user-page";
import { AppShell } from "@/widgets/app-shell/app-shell";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { storyStatusLabel, isStoryStatus } from "@/lib/stories/status";

export const metadata: Metadata = {
  title: "Мои работы | Листория",
  description: "Произведения и черновики пользователя."
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await requireUserPage(ROUTES.MY_WORKS);

  return (
    <AppShell>
      <section className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge>Авторский раздел</Badge>
            <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">Мои работы</h1>
            <p className="mt-3 text-sm text-text-muted">Опубликованные произведения, скрытые работы и черновики.</p>
          </div>
          <Link className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-white shadow-hero" href={ROUTES.CREATE}>
            Создать произведение
          </Link>
        </header>

        {user.stories.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {user.stories.map((story) => (
              <Card className="p-5" key={story.id}>
                <div className="flex flex-wrap gap-2">
                  <Badge>{isStoryStatus(story.status) ? storyStatusLabel(story.status) : "В работе"}</Badge>
                  {story.visibility === "HIDDEN" ? <Badge>Скрыто модератором</Badge> : null}
                </div>
                <h2 className="mt-4 text-xl font-bold">{story.title}</h2>
                <p className="mt-2 text-sm text-text-muted">{story._count.chapters} {chapterWord(story._count.chapters)} · обновлено {formatDate(story.updatedAt)}</p>
                <div className="mt-4 flex flex-wrap gap-4">
                  <Link className="inline-flex text-sm font-semibold text-primary hover:text-primary-hover" href={ROUTES.editWork(story.id)}>Редактировать</Link>
                  {story.status !== "draft" && story.visibility === "PUBLIC" ? <Link className="inline-flex text-sm font-semibold text-text-secondary hover:text-primary" href={ROUTES.work(story.id)}>Открыть произведение</Link> : null}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="Работ пока нет" description="Создайте первое произведение и напишите начальную главу." />
        )}
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

function chapterWord(count: number) {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return "глав";
  if (mod10 === 1) return "глава";
  if (mod10 >= 2 && mod10 <= 4) return "главы";
  return "глав";
}
