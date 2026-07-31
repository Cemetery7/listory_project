import { OpenRouterProvider } from "@/lib/ai/openrouter-provider";
import type { AIProvider } from "@/lib/ai/types";

let provider: AIProvider | null = null;

export function getAIProvider() {
  provider ??= new OpenRouterProvider();
  return provider;
}
