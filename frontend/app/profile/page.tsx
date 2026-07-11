import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/lib/auth/session";
import { AppShell } from "@/widgets/app-shell/app-shell";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { LogoutButton } from "./logout-button";

export const metadata: Metadata = {
  title: "Профиль | Листория",
  description: "Профиль пользователя Листории."
};

export default async function Page() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell>
      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge>Профиль</Badge>
            <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">{user.username}</h1>
            <p className="mt-2 text-sm text-text-muted">{user.email}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-medium transition duration-200 hover:border-[color:var(--border-hover)]" href={ROUTES.HOME}>
              На главную
            </Link>
            <LogoutButton />
          </div>
        </div>

        <Card className="p-5 md:p-6">
          <h2 className="text-2xl font-bold">Мои произведения</h2>
          <div className="mt-5">
            {user.stories.length > 0 ? (
              <div className="space-y-3">
                {user.stories.map((story) => (
                  <div key={story.id} className="rounded-md border border-border bg-surface p-4">
                    <p className="font-semibold text-text-primary">{story.title}</p>
                    <p className="mt-1 text-sm text-text-muted">{story.status}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Произведений пока нет" description="Редактор уже готов к следующему Sprint, но создание пока не подключено к базе." />
            )}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
