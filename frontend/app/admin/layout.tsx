import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { requireAdminPage } from "@/lib/auth/admin-page";
import { AppShell } from "@/widgets/app-shell/app-shell";
import { AdminNavigation } from "@/widgets/admin/admin-navigation";
import { Badge } from "@/shared/ui/badge";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminPage("/admin");

  return (
    <AppShell>
      <section className="space-y-6">
        <header className="space-y-4">
          <Badge>
            <ShieldCheck className="mr-2" size={14} />
            Администрирование
          </Badge>
          <div>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">Панель модерации</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted">Управление пользователями, произведениями и журналом действий.</p>
          </div>
          <AdminNavigation />
        </header>
        {children}
      </section>
    </AppShell>
  );
}
