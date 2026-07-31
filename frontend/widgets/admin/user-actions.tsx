"use client";

import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readApiError } from "@/lib/api/request";
import { Button } from "@/shared/ui/button";

export function UserActions({ id, blocked, isCurrentUser }: { id: string; blocked: boolean; isCurrentUser: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const updateStatus = async () => {
    const reason = blocked ? undefined : window.prompt("Причина блокировки (необязательно):") ?? undefined;

    if (!blocked && reason === undefined) {
      return;
    }

    setPending(true);
    setError("");

    const response = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: blocked ? "unblock" : "block",
        reason
      })
    });

    if (!response.ok) {
      setError(await readApiError(response, "Не удалось изменить статус пользователя."));
      setPending(false);
      return;
    }

    router.refresh();
    setPending(false);
  };

  return (
    <div className="space-y-2">
      <Button disabled={pending || isCurrentUser} onClick={() => void updateStatus()} size="sm" type="button" variant="secondary">
        {blocked ? <LockKeyholeOpen size={16} /> : <LockKeyhole size={16} />}
        {blocked ? "Разблокировать" : "Заблокировать"}
      </Button>
      {isCurrentUser ? <p className="text-xs text-text-muted">Собственный аккаунт нельзя заблокировать.</p> : null}
      {error ? <p className="text-xs text-primary">{error}</p> : null}
    </div>
  );
}
