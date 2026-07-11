export type AIOperation = "title" | "description" | "tags" | "continue";

export type AIRequestInput = {
  title?: string;
  description?: string;
  genres?: string[];
  tags?: string[];
  chapterText?: string;
};

export type AIResult =
  | {
      operation: "title";
      suggestions: string[];
    }
  | {
      operation: "description";
      suggestion: string;
    }
  | {
      operation: "tags";
      suggestions: string[];
    }
  | {
      operation: "continue";
      suggestion: string;
    };

export interface AIProvider {
  suggestTitles(input: AIRequestInput): Promise<string[]>;
  improveDescription(input: AIRequestInput): Promise<string>;
  suggestTags(input: AIRequestInput): Promise<string[]>;
  continueChapter(input: AIRequestInput): Promise<string>;
}

export class AIUnavailableError extends Error {
  constructor(message = "AI временно недоступен.") {
    super(message);
    this.name = "AIUnavailableError";
  }
}

export class AITimeoutError extends Error {
  constructor(message = "AI отвечает слишком долго. Попробуйте еще раз.") {
    super(message);
    this.name = "AITimeoutError";
  }
}
