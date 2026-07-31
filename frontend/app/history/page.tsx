import type { Metadata } from "next";
import { ROUTES } from "@/constants/routes";
import { requireUserPage } from "@/lib/auth/user-page";
import { AppShell } from "@/widgets/app-shell/app-shell";
import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/ui/empty-state";

export const metadata: Metadata = {
  title: "История чтения | Листория",
  description: "История чтения произведений."
};

export default async function Page() {
  await requireUserPage(ROUTES.HISTORY);

  return (
    <AppShell>
      <section className="space-y-6">
        <header>
          <Badge>Личный раздел</Badge>
          <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">История чтения</h1>
          <p className="mt-3 text-sm text-text-muted">Недавно открытые главы появятся здесь.</p>
        </header>
        <EmptyState title="История пока пуста" description="Хранение прогресса чтения ещё не подключено и не подменяется произведениями автора." />
      </section>
    </AppShell>
  );
}
