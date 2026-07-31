"use client";

import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readApiError } from "@/lib/api/request";
import { Button } from "@/shared/ui/button";

export function WorkActions({ id, hidden }: { id: string; hidden: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const changeVisibility = async () => {
    setPending(true);
    setError("");

    const response = await fetch(`/api/admin/works/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: hidden ? "restore" : "hide" })
    });

    if (!response.ok) {
      setError(await readApiError(response, "Не удалось изменить видимость."));
      setPending(false);
      return;
    }

    router.refresh();
    setPending(false);
  };

  const deleteStory = async () => {
    if (!window.confirm("Удалить произведение и все его главы? Это действие нельзя отменить.")) {
      return;
    }

    setPending(true);
    setError("");
    const response = await fetch(`/api/admin/works/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      setError(await readApiError(response, "Не удалось удалить произведение."));
      setPending(false);
      return;
    }

    router.refresh();
    setPending(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button disabled={pending} onClick={() => void changeVisibility()} size="sm" type="button" variant="secondary">
          {hidden ? <Eye size={16} /> : <EyeOff size={16} />}
          {hidden ? "Вернуть" : "Скрыть"}
        </Button>
        <Button disabled={pending} onClick={() => void deleteStory()} size="sm" type="button" variant="outline">
          <Trash2 size={16} />
          Удалить
        </Button>
      </div>
      {error ? <p className="text-xs text-primary">{error}</p> : null}
    </div>
  );
}
