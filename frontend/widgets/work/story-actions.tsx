"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Award, Heart, MessageCircle } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { readApiError } from "@/lib/api/request";
import { Button } from "@/shared/ui/button";
import { Toast } from "@/shared/ui/toast";
import { cn } from "@/lib/utils";

type StoryActionsProps = {
  storyId: string;
  initialLikesCount: number;
  initialLiked: boolean;
  commentsCount: number;
  authenticated: boolean;
};

export function StoryActions({ storyId, initialLikesCount, initialLiked, commentsCount, authenticated }: StoryActionsProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const commentsHref = ROUTES.workComments(storyId);

  const showMessage = (nextMessage: string) => {
    setMessage(nextMessage);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 2600);
  };

  const toggleLike = async () => {
    if (!authenticated) {
      router.push(`${ROUTES.LOGIN}?next=${encodeURIComponent(ROUTES.work(storyId))}`);
      return;
    }

    setPending(true);

    try {
      const response = await fetch(`/api/stories/${storyId}/like`, {
        method: liked ? "DELETE" : "POST"
      });

      if (!response.ok) {
        showMessage(await readApiError(response, "Не удалось обновить лайк."));
        return;
      }

      const result = (await response.json()) as { data?: { liked?: boolean; likes_count?: number } };
      setLiked(Boolean(result.data?.liked));
      setLikesCount(result.data?.likes_count ?? likesCount);
      router.refresh();
    } catch {
      showMessage("Сервер недоступен. Попробуйте ещё раз.");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button className={cn(liked && "border-primary bg-primary/15 text-primary")} disabled={pending} onClick={() => void toggleLike()} type="button" variant="secondary">
          <Heart className={liked ? "fill-current" : undefined} size={18} />
          {liked ? "Вам нравится" : "Нравится"}
          <span className="text-xs text-text-muted">{likesCount}</span>
        </Button>
        <Link
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-5 text-sm font-medium text-text-primary transition hover:border-[color:var(--border-hover)]"
          href={commentsHref}
        >
          <MessageCircle size={18} />
          Комментарии
          <span className="text-xs text-text-muted">{commentsCount}</span>
        </Link>
        <Button disabled title="Платные награды появятся в одном из следующих обновлений" type="button" variant="secondary">
          <Award size={18} />
          Наградить
          <span className="text-xs text-text-muted">Скоро</span>
        </Button>
      </div>
      <Toast message={message} visible={toastVisible} />
    </>
  );
}
