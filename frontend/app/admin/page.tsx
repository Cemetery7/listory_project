import type { Metadata } from "next";
import { FileText, ScrollText, UsersRound } from "lucide-react";
import { requireAdminPage } from "@/lib/auth/admin-page";
import { prisma } from "@/lib/prisma";
import { Card } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";

export const metadata: Metadata = {
  title: "Администрирование | Листория",
  description: "Обзор модерации Листории."
};

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdminPage("/admin");

  const [usersCount, storiesCount, hiddenStoriesCount, logs] = await Promise.all([
    prisma.user.count(),
    prisma.story.count(),
    prisma.story.count({ where: { visibility: "HIDDEN" } }),
    prisma.adminAuditLog.findMany({
      take: 30,
      orderBy: { createdAt: "desc" },
      include: {
        actor: {
          select: {
            username: true
          }
        }
      }
    })
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={UsersRound} label="Пользователи" value={usersCount} />
        <StatCard icon={FileText} label="Произведения" value={storiesCount} />
        <StatCard icon={ScrollText} label="Скрыто" value={hiddenStoriesCount} />
      </div>

      <Card className="p-5 md:p-6">
        <h2 className="text-2xl font-bold">Журнал действий</h2>
        <div className="mt-5">
          {logs.length ? (
            <div className="divide-y divide-border">
              {logs.map((log) => (
                <div className="grid gap-1 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4" key={log.id}>
                  <div>
                    <p className="font-semibold text-text-primary">{actionLabel(log.action)}</p>
                    <p className="mt-1 text-sm text-text-muted">
                      {log.actor.username} · {log.targetType} · {log.targetId}
                    </p>
                  </div>
                  <time className="text-sm text-text-muted">{formatDate(log.createdAt)}</time>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Журнал пока пуст" description="Здесь появятся действия администраторов." />
          )}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof UsersRound; label: string; value: number }) {
  return (
    <Card className="p-5">
      <Icon className="text-primary" size={20} />
      <p className="mt-4 text-sm text-text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </Card>
  );
}

function actionLabel(action: string) {
  const labels: Record<string, string> = {
    STORY_HIDDEN: "Произведение скрыто",
    STORY_RESTORED: "Произведение возвращено",
    STORY_DELETED: "Произведение удалено",
    USER_BLOCKED: "Пользователь заблокирован",
    USER_UNBLOCKED: "Пользователь разблокирован"
  };

  return labels[action] ?? action;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}
