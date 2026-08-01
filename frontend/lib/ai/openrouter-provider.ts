import { AI_CONFIG } from "@/lib/ai/config";
import { baseSystemMessage, continuationPrompt, descriptionPrompt, tagsPrompt, titlePrompt, type AIMessage } from "@/lib/ai/prompts";
import { AIProviderRequestError, AIRateLimitError, AITimeoutError, AIUnavailableError, type AIOperation, type AIProvider, type AIRequestInput } from "@/lib/ai/types";

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    code?: number | string;
    message?: string;
  };
};

export class OpenRouterProvider implements AIProvider {
  private readonly apiKey = process.env.OPENROUTER_API_KEY;
  private readonly apiUrl = process.env.OPENROUTER_API_URL ?? AI_CONFIG.DEFAULT_OPENROUTER_API_URL;
  private readonly model = process.env.OPENROUTER_MODEL ?? AI_CONFIG.DEFAULT_OPENROUTER_MODEL;
  private readonly siteUrl = normalizeHttpUrl(process.env.OPENROUTER_SITE_URL);
  private readonly appName = normalizeAsciiHeader(process.env.OPENROUTER_APP_NAME);

  async suggestTitles(input: AIRequestInput) {
    const content = await this.complete("title", [baseSystemMessage(), titlePrompt(input)]);
    const suggestions = parseStringList(content).slice(0, AI_CONFIG.TITLE_VARIANTS);

    if (suggestions.length !== AI_CONFIG.TITLE_VARIANTS) {
      throw new AIUnavailableError("AI не смог подготовить варианты названия. Попробуйте ещё раз.");
    }

    return suggestions;
  }

  async improveDescription(input: AIRequestInput) {
    return cleanText(await this.complete("description", [baseSystemMessage(), descriptionPrompt(input)]));
  }

  async suggestTags(input: AIRequestInput) {
    return parseStringList(await this.complete("tags", [baseSystemMessage(), tagsPrompt(input)])).slice(0, AI_CONFIG.TAG_LIMIT);
  }

  async continueChapter(input: AIRequestInput) {
    return cleanText(await this.complete("continue", [baseSystemMessage(), continuationPrompt(input)]));
  }

  private async complete(operation: AIOperation, messages: AIMessage[]) {
    if (!this.apiKey) {
      throw new AIUnavailableError("AI временно недоступен: OpenRouter не настроен.");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.REQUEST_TIMEOUT_MS);
    let providerStatus: number | undefined;

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "X-Title": this.appName
      };

      if (this.siteUrl) {
        headers["HTTP-Referer"] = this.siteUrl;
      }

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: AI_CONFIG.MAX_TOKENS[operation],
          temperature: AI_CONFIG.TEMPERATURE
        })
      });
      providerStatus = response.status;

      if (response.status === 401 || response.status === 403) {
        throw new AIUnavailableError("AI временно недоступен: проверьте ключ и права OpenRouter.");
      }

      if (response.status === 402) {
        throw new AIUnavailableError("AI временно недоступен: на OpenRouter недостаточно средств.");
      }

      if (response.status === 408) {
        throw new AITimeoutError();
      }

      if (response.status === 429) {
        throw new AIRateLimitError();
      }

      if (response.status >= 500) {
        throw new AIUnavailableError("OpenRouter или выбранная модель временно недоступны.");
      }

      if (!response.ok) {
        throw new AIUnavailableError("OpenRouter отклонил запрос. Проверьте модель и настройки.");
      }

      let data: OpenRouterResponse;

      try {
        data = (await response.json()) as OpenRouterResponse;
      } catch {
        throw new AIUnavailableError("OpenRouter вернул некорректный ответ.");
      }

      if (data.error) {
        if (Number(data.error.code) === 429) {
          throw new AIRateLimitError();
        }

        throw new AIUnavailableError("OpenRouter не смог выполнить запрос.");
      }

      const content = data.choices?.[0]?.message?.content;

      if (typeof content !== "string" || !content.trim()) {
        throw new AIUnavailableError("OpenRouter вернул пустой ответ.");
      }

      return content;
    } catch (error) {
      if (isAbortError(error)) {
        throw new AITimeoutError();
      }

      if (error instanceof AIUnavailableError || error instanceof AITimeoutError || error instanceof AIRateLimitError) {
        throw error;
      }

      throw new AIProviderRequestError(providerStatus);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

function normalizeAsciiHeader(value?: string) {
  const candidate = value?.trim();
  return candidate && /^[\x20-\x7E]+$/.test(candidate) ? candidate : AI_CONFIG.DEFAULT_OPENROUTER_APP_NAME;
}

function normalizeHttpUrl(value?: string) {
  if (!value?.trim()) return undefined;

  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function isAbortError(error: unknown) {
  return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}

function parseStringList(content: string) {
  const trimmed = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

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
