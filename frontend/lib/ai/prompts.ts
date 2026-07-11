import { AI_CONFIG } from "@/lib/ai/config";
import type { AIRequestInput } from "@/lib/ai/types";

export type AIMessage = {
  role: "system" | "user";
  content: string;
};

export function baseSystemMessage(): AIMessage {
  return {
    role: "system",
    content: [
      "Ты литературный AI-помощник платформы Листория.",
      "Помогай автору развить его собственную идею, но не заменяй автора.",
      "Не используй Markdown.",
      "Не используй нумерацию.",
      "Не добавляй пояснения.",
      "Не объясняй свои действия.",
      "Возвращай только запрошенный формат."
    ].join(" ")
  };
}

export function titlePrompt(input: AIRequestInput): AIMessage {
  return {
    role: "user",
    content: [
      `Верни ровно ${AI_CONFIG.TITLE_VARIANTS} варианта названия для художественного произведения.`,
      `Каждый вариант максимум ${AI_CONFIG.TITLE_MAX_WORDS} слов.`,
      "Без кавычек.",
      "Без нумерации.",
      "Без пояснений.",
      "Только JSON-массив строк.",
      `Описание: ${input.description || "не указано"}`,
      `Жанры: ${formatList(input.genres)}`
    ].join("\n")
  };
}

export function descriptionPrompt(input: AIRequestInput): AIMessage {
  return {
    role: "user",
    content: [
      "Улучши существующее описание произведения.",
      "Сохрани стиль автора и исходный смысл.",
      `Объем: ${AI_CONFIG.DESCRIPTION_MIN_WORDS}-${AI_CONFIG.DESCRIPTION_MAX_WORDS} слов.`,
      "Без пояснений.",
      "Верни только готовое описание.",
      `Название: ${input.title || "не указано"}`,
      `Описание: ${input.description || ""}`
    ].join("\n")
  };
}

export function tagsPrompt(input: AIRequestInput): AIMessage {
  return {
    role: "user",
    content: [
      `Предложи максимум ${AI_CONFIG.TAG_LIMIT} тегов для произведения.`,
      "Используй название, описание и жанры.",
      "Без пояснений.",
      "Только JSON-массив строк.",
      `Название: ${input.title || "не указано"}`,
      `Описание: ${input.description || "не указано"}`,
      `Жанры: ${formatList(input.genres)}`
    ].join("\n")
  };
}

export function continuationPrompt(input: AIRequestInput): AIMessage {
  return {
    role: "user",
    content: [
      `Продолжи главу примерно на ${AI_CONFIG.CONTINUATION_MIN_WORDS}-${AI_CONFIG.CONTINUATION_MAX_WORDS} слов.`,
      "Сохрани стиль автора.",
      "Не заканчивай историю.",
      "Не повторяй уже написанное.",
      "Не используй заголовки.",
      "Верни только текст продолжения.",
      `Название: ${input.title || "не указано"}`,
      `Описание: ${input.description || "не указано"}`,
      `Последний фрагмент главы:\n${limitContext(input.chapterText || "")}`
    ].join("\n")
  };
}

export function limitContext(text: string) {
  return text.slice(-AI_CONFIG.MAX_CONTEXT_CHARS);
}

function formatList(items?: string[]) {
  return items?.length ? items.join(", ") : "не указаны";
}
