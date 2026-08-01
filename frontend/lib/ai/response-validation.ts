import { AI_CONFIG } from "@/lib/ai/config";

const CYRILLIC_PATTERN = /[А-Яа-яЁё]/u;
const SERVICE_MARKERS = /(?:json|array|output|elements?|strings?|title|instruction|prompt|system|assistant|we\s+need|exactly)/iu;
const STRUCTURE_MARKERS = /[`{}\[\]#*]/u;
const SERVICE_TEXT_START = /^(?:we\s+need|i\s+need|the\s+user|here(?:'s|\s+is)|certainly|sure|output|instruction|prompt|system|assistant|вот\s+(?:улучшенное\s+описание|продолжение)|конечно(?:[,.!:\s]|$)|я\s+(?:улучшил|продолжу))/iu;
const COMMON_ENGLISH_TAGS = new Set([
  "angst",
  "au",
  "canon",
  "comfort",
  "dark academia",
  "enemies to lovers",
  "fluff",
  "found family",
  "friends to lovers",
  "hurt/comfort",
  "ooc",
  "slow burn"
]);

export class AIResponseValidationError extends Error {
  constructor() {
    super("AI response validation failed.");
    this.name = "AIResponseValidationError";
  }
}

export function parseTitleSuggestions(content: string, sourceTitle?: string) {
  const suggestions = parseSuggestionsObject(content);

  if (suggestions.length !== AI_CONFIG.TITLE_VARIANTS || !suggestions.every((item) => typeof item === "string")) {
    throw new AIResponseValidationError();
  }

  const normalizedSource = normalizeForComparison(sourceTitle ?? "");
  const normalized = new Set<string>();
  const validated = suggestions.map((item) => {
    const value = item.trim();
    const comparisonValue = normalizeForComparison(value);

    if (
      !value ||
      item !== value ||
      /[\r\n]/u.test(item) ||
      countWords(value) > AI_CONFIG.TITLE_MAX_WORDS ||
      !CYRILLIC_PATTERN.test(value) ||
      SERVICE_MARKERS.test(value) ||
      STRUCTURE_MARKERS.test(value) ||
      normalized.has(comparisonValue) ||
      (normalizedSource && comparisonValue === normalizedSource)
    ) {
      throw new AIResponseValidationError();
    }

    normalized.add(comparisonValue);
    return value;
  });

  return validated;
}

export function parseTagSuggestions(content: string) {
  const suggestions = parseSuggestionsObject(content);

  if (!suggestions.length || !suggestions.every((item) => typeof item === "string")) {
    throw new AIResponseValidationError();
  }

  const normalized = new Set<string>();
  const validated: string[] = [];

  for (const item of suggestions) {
    const value = item.trim();
    const comparisonValue = normalizeForComparison(value);
    const isSupportedLanguage = CYRILLIC_PATTERN.test(value) || COMMON_ENGLISH_TAGS.has(comparisonValue);

    if (
      !value ||
      item !== value ||
      value.length > 60 ||
      /[\r\n]/u.test(item) ||
      STRUCTURE_MARKERS.test(value) ||
      SERVICE_MARKERS.test(value) ||
      !isSupportedLanguage ||
      normalized.has(comparisonValue)
    ) {
      continue;
    }

    normalized.add(comparisonValue);
    validated.push(value);

    if (validated.length === AI_CONFIG.TAG_LIMIT) {
      break;
    }
  }

  if (!validated.length) {
    throw new AIResponseValidationError();
  }

  return validated;
}

export function validateRussianText(content: string) {
  const value = content.trim();

  if (
    !value ||
    !CYRILLIC_PATTERN.test(value) ||
    !isPredominantlyRussian(value) ||
    SERVICE_TEXT_START.test(value) ||
    /(?:we\s+need\s+to|json\s+(?:array|object)|system\s+prompt|internal\s+(?:reasoning|instruction))/iu.test(value) ||
    /```|^\s{0,3}#{1,6}\s|\*\*/mu.test(value)
  ) {
    throw new AIResponseValidationError();
  }

  return value;
}

function parseSuggestionsObject(content: string): unknown[] {
  const normalized = unwrapSingleJsonFence(content);
  let parsed: unknown;

  try {
    parsed = JSON.parse(normalized) as unknown;
  } catch {
    throw new AIResponseValidationError();
  }

  if (!isRecord(parsed) || Object.keys(parsed).length !== 1 || !("suggestions" in parsed) || !Array.isArray(parsed.suggestions)) {
    throw new AIResponseValidationError();
  }

  return parsed.suggestions;
}

function unwrapSingleJsonFence(content: string) {
  const trimmed = content.trim();
  const fenced = trimmed.match(/^```json\s*([\s\S]*?)\s*```$/iu);
  return fenced ? fenced[1].trim() : trimmed;
}

function normalizeForComparison(value: string) {
  return value.trim().replace(/\s+/gu, " ").toLocaleLowerCase("ru-RU");
}

function countWords(value: string) {
  return value.split(/\s+/u).filter(Boolean).length;
}

function isPredominantlyRussian(value: string) {
  const cyrillicLetters = value.match(/[А-Яа-яЁё]/gu)?.length ?? 0;
  const latinLetters = value.match(/[A-Za-z]/g)?.length ?? 0;
  return cyrillicLetters > 0 && cyrillicLetters >= latinLetters * 3;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
