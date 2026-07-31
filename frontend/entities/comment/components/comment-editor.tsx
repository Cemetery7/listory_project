"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Send } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { readApiError } from "@/lib/api/request";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Textarea } from "@/shared/ui/textarea";
import { Toast } from "@/shared/ui/toast";

export function CommentEditor({ storyId, authenticated }: { storyId: string; authenticated: boolean }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  if (!authenticated) {
    const nextPath = ROUTES.workComments(storyId);

    return (
      <Card className="flex flex-col items-start gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <h2 className="text-xl font-bold">Присоединитесь к обсуждению</h2>
          <p className="mt-1 text-sm text-text-muted">Читать комментарии можно без аккаунта, для ответа потребуется вход.</p>
        </div>
        <Link className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-white shadow-hero transition hover:bg-primary-hover" href={`${ROUTES.LOGIN}?next=${encodeURIComponent(nextPath)}`}>
          Войти и написать
        </Link>
      </Card>
    );
  }

  const submitComment = async () => {
    const normalizedContent = content.trim();

    if (!normalizedContent) {
      showMessage("Напишите текст комментария.");
      return;
    }

    setPending(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          story_id: storyId,
          content: normalizedContent
        })
      });

      if (!response.ok) {
        showMessage(await readApiError(response, "Не удалось отправить комментарий."));
        return;
      }

      setContent("");
      router.refresh();
    } catch {
      showMessage("Сервер недоступен. Попробуйте ещё раз.");
    } finally {
      setPending(false);
    }
  };

  const showMessage = (nextMessage: string) => {
    setMessage(nextMessage);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 2600);
  };

  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Оставить комментарий</h2>
        <span className="text-xs text-text-muted">{content.length}/2000</span>
      </div>
      <Textarea className="mt-4 min-h-32" maxLength={2000} onChange={(event) => setContent(event.target.value)} placeholder="Поделитесь впечатлением о произведении..." value={content} />
      <div className="mt-4 flex justify-end">
        <Button disabled={pending || !content.trim()} onClick={() => void submitComment()} type="button">
          <Send size={17} />
          {pending ? "Отправляем..." : "Опубликовать"}
        </Button>
      </div>
      <Toast message={message} visible={toastVisible} />
    </Card>
  );
}
