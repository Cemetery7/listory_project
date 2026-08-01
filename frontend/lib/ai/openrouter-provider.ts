import { AI_CONFIG } from "@/lib/ai/config";
import { logAIProviderAttempt, type AIProviderAttempt } from "@/lib/ai/logging";
import { baseSystemMessage, continuationPrompt, descriptionPrompt, tagsPrompt, tagsRepairPrompt, titlePrompt, titleRepairPrompt, type AIMessage } from "@/lib/ai/prompts";
import { AIResponseValidationError, parseTagSuggestions, parseTitleSuggestions, validateRussianText } from "@/lib/ai/response-validation";
import { AIProviderRequestError, AIRateLimitError, AITimeoutError, AIUnavailableError, type AIOperation, type AIProvider, type AIRequestInput } from "@/lib/ai/types";

type OpenRouterResponse = {
  model?: string;
  choices?: Array<{
    message?: {
      content?: string;
      reasoning?: unknown;
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
    return this.completeStructured(
      "title",
      [baseSystemMessage(), titlePrompt(input)],
      titleRepairPrompt(),
      (content) => parseTitleSuggestions(content, input.title)
    );
  }

  async improveDescription(input: AIRequestInput) {
    return this.completeText("description", [baseSystemMessage(), descriptionPrompt(input)]);
  }

  async suggestTags(input: AIRequestInput) {
    return this.completeStructured("tags", [baseSystemMessage(), tagsPrompt(input)], tagsRepairPrompt(), parseTagSuggestions);
  }

  async continueChapter(input: AIRequestInput) {
    return this.completeText("continue", [baseSystemMessage(), continuationPrompt(input)]);
  }

  private async completeStructured(
    operation: "title" | "tags",
    messages: AIMessage[],
    repairPrompt: AIMessage,
    parse: (content: string) => string[]
  ) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const retried = attempt === 1;
      const completion = await this.complete(operation, retried ? [...messages, repairPrompt] : messages, retried);

      try {
        const result = parse(completion.content);
        logAIProviderAttempt({ ...completion.diagnostics, parseSuccess: true });
        return result;
      } catch (error) {
        if (!(error instanceof AIResponseValidationError)) {
          throw error;
        }

        logAIProviderAttempt({ ...completion.diagnostics, parseSuccess: false });
      }
    }

    throw new AIUnavailableError("AI вернул неподходящий ответ. Попробуйте сгенерировать ещё раз.");
  }

  private async completeText(operation: "description" | "continue", messages: AIMessage[]) {
    const completion = await this.complete(operation, messages, false);

    try {
      const result = validateRussianText(completion.content);
      logAIProviderAttempt({ ...completion.diagnostics, parseSuccess: true });
      return result;
    } catch (error) {
      if (!(error instanceof AIResponseValidationError)) {
        throw error;
      }

      logAIProviderAttempt({ ...completion.diagnostics, parseSuccess: false });
      throw new AIUnavailableError("AI вернул неподходящий ответ. Попробуйте сгенерировать ещё раз.");
    }
  }

  private async complete(operation: AIOperation, messages: AIMessage[], retried: boolean) {
    if (!this.apiKey) {
      throw new AIUnavailableError("AI временно недоступен: OpenRouter не настроен.");
    }

    const startedAt = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.REQUEST_TIMEOUT_MS);
    let providerStatus: number | undefined;
    let providerModel: string | undefined;

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "X-Title": this.appName
      };

      if (this.siteUrl) {
        headers["HTTP-Referer"] = this.siteUrl;
      }

      const requestBody: Record<string, unknown> = {
        model: this.model,
        messages,
        max_tokens: AI_CONFIG.MAX_TOKENS[operation],
        temperature: AI_CONFIG.TEMPERATURE
      };

      if (operation === "title" || operation === "tags") {
        requestBody.response_format = { type: "json_object" };
      }

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify(requestBody)
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
      } catch (error) {
        if (isAbortError(error)) {
          throw error;
        }

        throw new AIUnavailableError("OpenRouter вернул некорректный ответ.");
      }

      providerModel = typeof data.model === "string" ? data.model : undefined;

      if (data.error) {
        if (Number(data.error.code) === 429) {
          throw new AIRateLimitError();
        }

        throw new AIUnavailableError("OpenRouter не смог выполнить запрос.");
      }

      const content = data.choices?.[0]?.message?.content;

      return {
        content: typeof content === "string" ? content : "",
        diagnostics: {
          operation,
          status: providerStatus,
          durationMs: Date.now() - startedAt,
          model: providerModel,
          retried
        } satisfies Omit<AIProviderAttempt, "parseSuccess">
      };
    } catch (error) {
      logAIProviderAttempt({
        operation,
        status: providerStatus,
        durationMs: Date.now() - startedAt,
        model: providerModel,
        parseSuccess: false,
        retried
      });

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
