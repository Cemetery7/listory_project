import type { AIOperation } from "@/lib/ai/types";

export const AI_CONFIG = {
  TITLE_VARIANTS: 3,
  TITLE_MAX_WORDS: 5,
  TAG_LIMIT: 8,
  DESCRIPTION_MIN_WORDS: 120,
  DESCRIPTION_MAX_WORDS: 150,
  CONTINUATION_MIN_WORDS: 150,
  CONTINUATION_MAX_WORDS: 200,
  TITLE_INPUT_MAX_CHARS: 160,
  DESCRIPTION_INPUT_MAX_CHARS: 2000,
  MAX_CONTEXT_CHARS: 5000,
  REQUEST_TIMEOUT_MS: 15000,
  AI_COOLDOWN_MS: 3000,
  COOLDOWN_TICK_MS: 1000,
  RATE_LIMIT_WINDOW_MS: 60000,
  RATE_LIMIT_PER_MINUTE: 8,
  DEFAULT_KODIK_API_URL: "https://api.kodikrouter.com/v1/chat/completions",
  DEFAULT_KODIK_MODEL: "kodikrouter/default",
  TEMPERATURE: 0.7,
  MAX_TOKENS: {
    title: 90,
    description: 260,
    tags: 120,
    continue: 380
  } satisfies Record<AIOperation, number>
} as const;
