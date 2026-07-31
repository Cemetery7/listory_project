import type { Metadata } from "next";
import { ROUTES } from "@/constants/routes";
import { requireUserPage } from "@/lib/auth/user-page";
import { AppShell } from "@/widgets/app-shell/app-shell";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { LogoutButton } from "@/app/profile/logout-button";

export const metadata: Metadata = {
  title: "Настройки | Листория",
  description: "Настройки аккаунта."
};

export default async function Page() {
  const user = await requireUserPage(ROUTES.SETTINGS);

  return (
    <AppShell>
      <section className="space-y-6">
        <header>
          <Badge>Аккаунт</Badge>
          <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">Настройки</h1>
          <p className="mt-3 text-sm text-text-muted">Основная информация и управление сессией.</p>
        </header>

        <Card className="p-5 md:p-6">
          <h2 className="text-2xl font-bold">Данные аккаунта</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-text-muted">Имя пользователя</dt>
              <dd className="mt-1 font-semibold">{user.username}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-muted">Email</dt>
              <dd className="mt-1 break-all font-semibold">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-muted">Статус</dt>
              <dd className="mt-1 font-semibold">{user.status === "ACTIVE" ? "Активен" : "Заблокирован"}</dd>
            </div>
          </dl>
          <div className="mt-6 border-t border-border pt-5">
            <LogoutButton />
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
