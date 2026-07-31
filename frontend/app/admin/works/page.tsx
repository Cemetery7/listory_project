import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth/admin-page";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { WorkActions } from "@/widgets/admin/work-actions";

export const metadata: Metadata = {
  title: "Модерация произведений | Листория",
  description: "Управление произведениями Листории."
};

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdminPage("/admin/works");

  const stories = await prisma.story.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      author: {
        select: {
          username: true
        }
      },
      _count: {
        select: {
          chapters: true
        }
      }
    }
  });

  return (
    <Card className="p-5 md:p-6">
      <div>
        <h2 className="text-2xl font-bold">Произведения</h2>
        <p className="mt-2 text-sm text-text-muted">Всего: {stories.length}</p>
      </div>

      <div className="mt-5">
        {stories.length ? (
          <div className="space-y-3">
            {stories.map((story) => (
              <article className="grid gap-4 rounded-md border border-border bg-surface p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center" key={story.id}>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-text-primary">{story.title}</h3>
                    <Badge>{story.visibility === "HIDDEN" ? "Скрыто" : "Опубликовано"}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">
                    {story.author.username} · {story._count.chapters} глав · {story.status}
                  </p>
                </div>
                <WorkActions hidden={story.visibility === "HIDDEN"} id={story.id} />
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Произведений нет" description="Опубликованные произведения появятся здесь." />
        )}
      </div>
    </Card>
  );
}
