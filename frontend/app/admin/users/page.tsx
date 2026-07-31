import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth/admin-page";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { UserActions } from "@/widgets/admin/user-actions";

export const metadata: Metadata = {
  title: "Управление пользователями | Листория",
  description: "Пользователи Листории."
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const currentAdmin = await requireAdminPage("/admin/users");
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      status: true,
      blockedReason: true,
      createdAt: true,
      _count: {
        select: {
          stories: true
        }
      }
    }
  });

  return (
    <Card className="p-5 md:p-6">
      <div>
        <h2 className="text-2xl font-bold">Пользователи</h2>
        <p className="mt-2 text-sm text-text-muted">Всего: {users.length}</p>
      </div>

      <div className="mt-5">
        {users.length ? (
          <div className="space-y-3">
            {users.map((user) => (
              <article className="grid gap-4 rounded-md border border-border bg-surface p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center" key={user.id}>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-text-primary">{user.username}</h3>
                    <Badge>{user.role}</Badge>
                    <Badge>{user.status === "BLOCKED" ? "Заблокирован" : "Активен"}</Badge>
                  </div>
                  <p className="mt-2 break-all text-sm text-text-muted">{user.email}</p>
                  <p className="mt-1 text-sm text-text-muted">Произведений: {user._count.stories}</p>
                  {user.blockedReason ? <p className="mt-2 text-sm text-text-secondary">Причина: {user.blockedReason}</p> : null}
                </div>
                <UserActions blocked={user.status === "BLOCKED"} id={user.id} isCurrentUser={user.id === currentAdmin.id} />
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Пользователей нет" description="Зарегистрированные пользователи появятся здесь." />
        )}
      </div>
    </Card>
  );
}
