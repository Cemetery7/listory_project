"use client";

import { AppShell } from "@/widgets/app-shell/app-shell";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <AppShell>
      <div className="space-y-4">
        <EmptyState title="Каталог временно недоступен" description="Не удалось загрузить произведения. Проверьте соединение и попробуйте ещё раз." />
        <div className="flex justify-center">
          <Button onClick={reset}>Повторить</Button>
        </div>
      </div>
    </AppShell>
  );
}
