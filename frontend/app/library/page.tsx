import type { Metadata } from "next";
import { ROUTES } from "@/constants/routes";
import { requireUserPage } from "@/lib/auth/user-page";
import { AppShell } from "@/widgets/app-shell/app-shell";
import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/ui/empty-state";

export const metadata: Metadata = {
  title: "Библиотека | Листория",
  description: "Сохранённые произведения."
};

export default async function Page() {
  await requireUserPage(ROUTES.LIBRARY);

  return (
    <AppShell>
      <section className="space-y-6">
        <header>
          <Badge>Личный раздел</Badge>
          <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">Библиотека</h1>
          <p className="mt-3 text-sm text-text-muted">Сохранённые произведения появятся здесь.</p>
        </header>
        <EmptyState title="Библиотека пока пуста" description="Таблица сохранённых произведений ещё не подключена. Авторские работы находятся в разделе «Мои работы»." />
      </section>
    </AppShell>
  );
}
