import { isStoryStatus, type StoryStatus } from "@/lib/stories/status";
import { hasMeaningfulMarkdownContent } from "@/lib/chapters/markdown";

export type StoryChapterInput = {
  id?: string;
  title: string;
  content: string;
};

export type StoryEditorInput = {
  title: string;
  description: string;
  status: StoryStatus;
  cover: string | null;
  chapters: StoryChapterInput[];
};

type ParseResult =
  | { data: StoryEditorInput }
  | { error: string };

export function parseStoryEditorPayload(value: unknown): ParseResult {
  if (!isRecord(value)) {
    return { error: "Некорректный запрос." };
  }

  const title = readTrimmedString(value.title);
  const description = readTrimmedString(value.description);

  if (!title) return { error: "Название обязательно." };
  if (!description) return { error: "Описание обязательно." };
  if (!isStoryStatus(value.status)) return { error: "Выберите корректный статус произведения." };

  const cover = parseCover(value.cover);

  if (cover === undefined) {
    return { error: "Некорректный URL обложки." };
  }

  if (!Array.isArray(value.chapters) || value.chapters.length === 0) {
    return { error: "Добавьте хотя бы одну главу." };
  }

  const chapters: StoryChapterInput[] = [];

  for (const [index, item] of value.chapters.entries()) {
    if (!isRecord(item)) {
      return { error: `Проверьте данные главы ${index + 1}.` };
    }

    const id = readTrimmedString(item.id) || undefined;
    const title = readTrimmedString(item.title) || `Глава ${index + 1}`;
    const content = readTrimmedString(item.content);

    if (!hasMeaningfulMarkdownContent(content)) {
      return { error: `Добавьте текст главы ${index + 1}, а не только разметку.` };
    }

    chapters.push({ id, title, content });
  }

  const ids = chapters.flatMap((chapter) => (chapter.id ? [chapter.id] : []));

  if (new Set(ids).size !== ids.length) {
    return { error: "Одна глава не может встречаться в списке несколько раз." };
  }

  return {
    data: {
      title,
      description,
      status: value.status,
      cover,
      chapters
    }
  };
}

function parseCover(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".public.blob.vercel-storage.com") ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function readTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
