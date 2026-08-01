"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, UserPlus } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { readApiError } from "@/lib/api/request";
import { Button } from "@/shared/ui/button";

export function FollowButton({ authorId, authenticated, initialFollowing, onCountChange }: { authorId: string; authenticated: boolean; initialFollowing: boolean; onCountChange?: (count: number) => void }) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const toggleFollow = async () => {
    if (!authenticated) {
      router.push(`${ROUTES.LOGIN}?next=${encodeURIComponent(ROUTES.author(authorId))}`);
      return;
    }

    const previous = following;
    const next = !previous;
    setFollowing(next);
    setPending(true);
    setError("");

    try {
      const response = await fetch(`/api/authors/${authorId}/follow`, { method: next ? "POST" : "DELETE" });

      if (!response.ok) {
        setFollowing(previous);
        setError(await readApiError(response, "Не удалось изменить подписку."));
        return;
      }

      const result = (await response.json()) as { data: { following: boolean; followers_count: number } };
      setFollowing(result.data.following);
      onCountChange?.(result.data.followers_count);
      router.refresh();
    } catch {
      setFollowing(previous);
      setError("Сервер недоступен. Попробуйте ещё раз.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button disabled={pending} onClick={() => void toggleFollow()} type="button" variant={following ? "secondary" : "primary"}>
        {following ? <UserCheck size={17} /> : <UserPlus size={17} />}
        {pending ? "Сохраняем..." : following ? "Вы отслеживаете" : "Отслеживать автора"}
      </Button>
      {error ? <p className="max-w-xs text-sm text-primary" role="alert">{error}</p> : null}
    </div>
  );
}
