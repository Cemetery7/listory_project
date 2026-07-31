"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { StoryStatus } from "@/lib/stories/status";
import { AppShell } from "@/widgets/app-shell/app-shell";
import { ChapterDraftsEditor, type ChapterDraft } from "@/widgets/story-editor/chapter-drafts-editor";
import { StoryCoverField } from "@/widgets/story-editor/story-cover-field";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { Toast } from "@/shared/ui/toast";

type EditableStory = {
  id: string;
  title: string;
  description: string;
  status: StoryStatus;
  cover: string | null;
  visibility: "PUBLIC" | "HIDDEN";
  chapters: Array<{
    id: string;
    title: string;
    content: string;
  }>;
};

export function EditStoryPage({ initialStory }: { initialStory: EditableStory }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialStory.title);
  const [description, setDescription] = useState(initialStory.description);
  const [status, setStatus] = useState<StoryStatus>(initialStory.status);
  const [cover, setCover] = useState(initialStory.cover);
  const [coverPending, setCoverPending] = useState(false);
  const [chapters, setChapters] = useState<ChapterDraft[]>(() => initialStory.chapters.map((chapter) => ({ ...chapter, clientId: crypto.randomUUID() })));
  const [chapterErrors, setChapterErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const save = async () => {
    const nextErrors = Object.fromEntries(chapters.filter((chapter) => !chapter.content.trim()).map((chapter) => [chapter.clientId, "Текст главы обязателен."]));
    setChapterErrors(nextErrors);
    setError("");

    if (!title.trim() || !description.trim() || Object.keys(nextErrors).length) {
      setError("Заполните название, описание и текст каждой главы.");
      return;
    }

    setPending(true);
    const response = await fetch(`/api/stories/${initialStory.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        status,
        cover,
        chapters: chapters.map(({ id, title: chapterTitle, content }) => ({ id, title: chapterTitle, content }))
      })
    });
    const result = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    setPending(false);

    if (!response.ok) {
      setError(result?.error?.message ?? "Не удалось сохранить изменения.");
      return;
    }

    showToast("Изменения сохранены.");
    router.refresh();
  };

  return (
    <AppShell>
      <div className="min-w-0 space-y-6">
        <header>
          <div className="flex flex-wrap gap-2">
            <Badge>Редактор произведения</Badge>
            {initialStory.visibility === "HIDDEN" ? <Badge>Скрыто модератором</Badge> : null}
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">Редактирование</h1>
          <p className="mt-3 text-sm leading-6 text-text-muted">Метаданные, главы и их порядок сохраняются одной операцией.</p>
        </header>

        {initialStory.visibility === "HIDDEN" ? (
          <p className="rounded-md border border-border bg-surface p-4 text-sm leading-6 text-text-secondary">Работа скрыта модератором. Изменения сохранятся, но публикация останется скрытой до решения администратора.</p>
        ) : null}

        <Card className="p-5 md:p-6">
          <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
            <StoryCoverField onChange={setCover} onPendingChange={setCoverPending} onToast={showToast} value={cover} />
            <div className="grid content-start gap-4">
              <label className="block space-y-2"><span className="text-sm font-semibold">Название</span><Input onChange={(event) => setTitle(event.target.value)} value={title} /></label>
              <label className="block space-y-2"><span className="text-sm font-semibold">Краткое описание</span><Textarea className="min-h-[132px]" onChange={(event) => setDescription(event.target.value)} value={description} /></label>
              <label className="block max-w-sm space-y-2"><span className="text-sm font-semibold">Статус</span><Select onChange={(event) => setStatus(event.target.value as StoryStatus)} value={status}><option value="draft">Черновик</option><option value="ongoing">В работе</option><option value="completed">Завершено</option></Select></label>
            </div>
          </div>
        </Card>

        <ChapterDraftsEditor chapters={chapters} description={description} errors={chapterErrors} onChange={setChapters} onToast={showToast} storyTitle={title} />

        {error ? <p className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-primary">{error}</p> : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={() => router.push(ROUTES.MY_WORKS)}>К моим работам</Button>
          <Button disabled={pending || coverPending} type="button" onClick={() => void save()}><Save size={17} />{pending ? "Сохраняем..." : "Сохранить изменения"}</Button>
        </div>
      </div>
      <Toast message={toast} visible={Boolean(toast)} />
    </AppShell>
  );
}
