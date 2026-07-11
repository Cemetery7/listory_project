import { AI_CONFIG } from "@/lib/ai/config";
import { baseSystemMessage, continuationPrompt, descriptionPrompt, tagsPrompt, titlePrompt, type AIMessage } from "@/lib/ai/prompts";
import { AITimeoutError, AIUnavailableError, type AIOperation, type AIProvider, type AIRequestInput } from "@/lib/ai/types";

type KodikResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
    text?: string;
  }>;
  output_text?: string;
  text?: string;
};

export class KodikProvider implements AIProvider {
  private readonly apiKey = process.env.KODIK_API_KEY;
  private readonly apiUrl = process.env.KODIK_API_URL ?? AI_CONFIG.DEFAULT_KODIK_API_URL;
  private readonly model = process.env.KODIK_MODEL ?? AI_CONFIG.DEFAULT_KODIK_MODEL;

  async suggestTitles(input: AIRequestInput) {
    const content = await this.complete("title", [baseSystemMessage(), titlePrompt(input)]);
    const suggestions = parseStringList(content).slice(0, AI_CONFIG.TITLE_VARIANTS);

    if (suggestions.length !== AI_CONFIG.TITLE_VARIANTS) {
      throw new Error("AI не смог подготовить варианты названия. Попробуйте еще раз.");
    }

    return suggestions;
  }

  async improveDescription(input: AIRequestInput) {
    const content = await this.complete("description", [baseSystemMessage(), descriptionPrompt(input)]);

    return cleanText(content);
  }

  async suggestTags(input: AIRequestInput) {
    const content = await this.complete("tags", [baseSystemMessage(), tagsPrompt(input)]);

    return parseStringList(content).slice(0, AI_CONFIG.TAG_LIMIT);
  }

  async continueChapter(input: AIRequestInput) {
    const content = await this.complete("continue", [baseSystemMessage(), continuationPrompt(input)]);

    return cleanText(content);
  }

  private async complete(operation: AIOperation, messages: AIMessage[]) {
    if (!this.apiKey) {
      throw new AIUnavailableError();
    }

    const controller = new AbortController();
    const timeoutId = windowSafeSetTimeout(() => controller.abort(), AI_CONFIG.REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: AI_CONFIG.MAX_TOKENS[operation],
          temperature: AI_CONFIG.TEMPERATURE
        })
      });

      if (!response.ok) {
        throw new Error("AI не смог подготовить ответ. Попробуйте позже.");
      }

      const data = (await response.json()) as KodikResponse;
      const content = data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text ?? data.output_text ?? data.text;

      if (!content) {
        throw new Error("AI не смог подготовить ответ. Попробуйте позже.");
      }

      return content;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new AITimeoutError();
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

function parseStringList(content: string) {
  const trimmed = content.trim();

  try {
    const parsed = JSON.parse(trimmed) as unknown;

    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string").map(cleanText).filter(Boolean);
    }
  } catch {
    return trimmed
      .split(/\n|,|;/)
      .map((item) => cleanText(item.replace(/^[-*\d.)\s]+/, "")))
      .filter(Boolean);
  }

  return [];
}

function cleanText(value: string) {
  return value.trim().replace(/^["'«]+|["'»]+$/g, "").trim();
}

function windowSafeSetTimeout(callback: () => void, timeout: number) {
  return setTimeout(callback, timeout);
}
