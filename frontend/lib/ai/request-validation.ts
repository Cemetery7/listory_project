import type { AIOperation, AIRequestInput } from "@/lib/ai/types";

export function validateAIRequest(operation: AIOperation, payload: AIRequestInput) {
  if (operation === "title" && !payload.title?.trim() && !payload.description?.trim()) {
    return "Сначала опишите идею произведения или введите рабочее название.";
  }

  if (operation === "description" && !payload.description?.trim()) {
    return "Сначала напишите хотя бы несколько слов описания.";
  }

  if (operation === "tags" && !payload.title?.trim() && !payload.description?.trim()) {
    return "Для подбора тегов добавьте название или описание.";
  }

  if (operation === "continue" && !payload.chapterText?.trim()) {
    return "Сначала напишите несколько строк главы.";
  }

  return "";
}
