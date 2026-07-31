import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { requireUserPage } from "@/lib/auth/user-page";
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
  const user = await requireUserPage(ROUTES.PROFILE);
  const publishedStories = user.stories.filter((story) => story.status !== "draft" && story.visibility === "PUBLIC");

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

        {user.role === "ADMIN" ? (
          <Card className="border-primary/30 p-5 md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
                  <ShieldCheck size={21} />
                </div>
                <div>
                  <Badge>Доступ администратора</Badge>
                  <h2 className="mt-3 text-xl font-bold">Центр модерации</h2>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-text-muted">Управление произведениями, пользователями и журналом административных действий.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium transition hover:border-[color:var(--border-hover)]" href={ROUTES.ADMIN_WORKS}>
                  Работы
                </Link>
                <Link className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium transition hover:border-[color:var(--border-hover)]" href={ROUTES.ADMIN_USERS}>
                  Пользователи
                </Link>
                <Link className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-white shadow-hero transition hover:bg-primary-hover" href={ROUTES.ADMIN}>
                  Открыть модерацию
                </Link>
              </div>
            </div>
          </Card>
        ) : null}

        <Card className="p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">Опубликованные произведения</h2>
            <Link className="text-sm font-semibold text-primary hover:text-primary-hover" href={ROUTES.MY_WORKS}>
              Все мои работы
            </Link>
          </div>
          <div className="mt-5">
            {publishedStories.length > 0 ? (
              <div className="space-y-3">
                {publishedStories.map((story) => (
                  <Link href={ROUTES.work(story.id)} key={story.id} className="block rounded-md border border-border bg-surface p-4 transition hover:border-[color:var(--border-hover)]">
                    <p className="font-semibold text-text-primary">{story.title}</p>
                    <p className="mt-1 text-sm text-text-muted">{story.status}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState title="Опубликованных произведений пока нет" description="Черновики и скрытые работы доступны в разделе «Мои работы»." />
            )}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
