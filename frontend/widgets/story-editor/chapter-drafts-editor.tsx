"use client";

import { useState } from "react";
import { AlignLeft, ArrowDown, ArrowUp, Heading2, Italic, List, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { AISuggestionPanel, fetchAI, useAICooldown } from "@/widgets/story-editor/ai-client";

export type ChapterDraft = {
  clientId: string;
  id?: string;
  title: string;
  content: string;
};

export function createChapterDraft(order: number): ChapterDraft {
  return {
    clientId: crypto.randomUUID(),
    title: `Глава ${order}`,
    content: ""
  };
}

export function ChapterDraftsEditor({
  chapters,
  description,
  errors = {},
  onChange,
  onToast,
  storyTitle
}: {
  chapters: ChapterDraft[];
  description: string;
  errors?: Record<string, string>;
  onChange: (chapters: ChapterDraft[]) => void;
  onToast: (message: string) => void;
  storyTitle: string;
}) {
  const [aiChapterId, setAiChapterId] = useState<string | null>(null);
  const [continuations, setContinuations] = useState<Record<string, string>>({});
  const { cooldowns, startCooldown } = useAICooldown();

  const updateChapter = (clientId: string, patch: Partial<ChapterDraft>) => {
    onChange(chapters.map((chapter) => (chapter.clientId === clientId ? { ...chapter, ...patch } : chapter)));
  };

  const removeChapter = (index: number) => {
    if (chapters.length === 1) {
      onToast("В произведении должна остаться хотя бы одна глава.");
      return;
    }

    const chapter = chapters[index];
    if ((chapter.title.trim() || chapter.content.trim()) && !window.confirm(`Удалить главу «${chapter.title || index + 1}»?`)) return;
    onChange(chapters.filter((_, chapterIndex) => chapterIndex !== index));
  };

  const moveChapter = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= chapters.length) return;
    const reordered = [...chapters];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    onChange(reordered);
  };

  const continueChapter = async (chapter: ChapterDraft) => {
    if (aiChapterId || cooldowns.continue > 0) return;
    setAiChapterId(chapter.clientId);

    try {
      const result = await fetchAI({
        operation: "continue",
        title: storyTitle,
        description,
        chapterText: chapter.content
      });
      if (result.operation === "continue") {
        setContinuations((current) => ({ ...current, [chapter.clientId]: result.suggestion }));
      }
      startCooldown("continue");
    } catch (error) {
      onToast(error instanceof Error ? error.message : "AI временно недоступен.");
    } finally {
      setAiChapterId(null);
    }
  };

  return (
    <div className="min-w-0 space-y-5">
      {chapters.map((chapter, index) => (
        <Card className="min-w-0 p-4 sm:p-5 md:p-6" key={chapter.clientId}>
          <div className="mb-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-primary">Глава {index + 1}</p>
              <p className="mt-1 truncate text-sm text-text-muted">{chapter.content.length.toLocaleString("ru-RU")} символов</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <IconButton disabled={index === 0} label="Поднять главу" onClick={() => moveChapter(index, -1)}><ArrowUp size={17} /></IconButton>
              <IconButton disabled={index === chapters.length - 1} label="Опустить главу" onClick={() => moveChapter(index, 1)}><ArrowDown size={17} /></IconButton>
              <IconButton disabled={chapters.length === 1} label="Удалить главу" onClick={() => removeChapter(index)}><Trash2 size={17} /></IconButton>
            </div>
          </div>

          <div className="min-w-0 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-text-primary">Название главы</span>
              <Input onChange={(event) => updateChapter(chapter.clientId, { title: event.target.value })} placeholder={`Глава ${index + 1}`} value={chapter.title} />
            </label>

            <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-md border border-border bg-elevated p-2">
              {toolbarItems.map((item) => (
                <button key={item.label} aria-label={item.label} className="grid h-9 w-9 place-items-center rounded-sm text-text-secondary transition hover:bg-surface hover:text-primary" title={item.label} type="button">
                  <item.icon size={17} />
                </button>
              ))}
              <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
              <Button className="max-w-full" disabled={Boolean(aiChapterId) || cooldowns.continue > 0} size="sm" type="button" variant="outline" onClick={() => void continueChapter(chapter)}>
                <Sparkles size={16} />
                <span className="truncate">{aiChapterId === chapter.clientId ? "Думаю..." : cooldowns.continue > 0 ? `Повторить через ${cooldowns.continue} сек` : "Продолжить"}</span>
              </Button>
            </div>

            <Textarea className="min-h-[360px] w-full min-w-0 text-base leading-8" onChange={(event) => updateChapter(chapter.clientId, { content: event.target.value })} placeholder="Начните писать главу..." value={chapter.content} />
            {errors[chapter.clientId] ? <p className="text-sm font-medium text-primary">{errors[chapter.clientId]}</p> : null}
            {continuations[chapter.clientId] ? (
              <AISuggestionPanel actionLabel="Вставить продолжение" onApply={() => {
                updateChapter(chapter.clientId, { content: `${chapter.content.trimEnd()}\n\n${continuations[chapter.clientId]}`.trimStart() });
                setContinuations((current) => ({ ...current, [chapter.clientId]: "" }));
              }}>
                {continuations[chapter.clientId]}
              </AISuggestionPanel>
            ) : null}
          </div>
        </Card>
      ))}

      <Button className="w-full sm:w-auto" type="button" variant="secondary" onClick={() => onChange([...chapters, createChapterDraft(chapters.length + 1)])}>
        <Plus size={17} />
        Добавить главу
      </Button>
    </div>
  );
}

function IconButton({ children, disabled, label, onClick }: { children: React.ReactNode; disabled?: boolean; label: string; onClick: () => void }) {
  return <button aria-label={label} className="grid h-9 w-9 place-items-center rounded-md border border-border bg-elevated text-text-secondary transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-40" disabled={disabled} title={label} type="button" onClick={onClick}>{children}</button>;
}

const toolbarItems = [
  { label: "Заголовок", icon: Heading2 },
  { label: "Курсив", icon: Italic },
  { label: "Список", icon: List },
  { label: "Выравнивание", icon: AlignLeft }
];
