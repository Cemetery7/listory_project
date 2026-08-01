import assert from "node:assert/strict";
import test from "node:test";
import { OpenRouterProvider } from "@/lib/ai/openrouter-provider";
import { AIProviderRequestError, AIRateLimitError, AITimeoutError, AIUnavailableError } from "@/lib/ai/types";

const validTitles = JSON.stringify({
  suggestions: ["Последние дни любви", "Пока мы не расстались", "На исходе чувств"]
});

test("structured title generation retries once and never returns reasoning", { concurrency: false }, async () => {
  const bodies: Array<Record<string, unknown>> = [];
  const originalFetch = globalThis.fetch;
  process.env.OPENROUTER_API_KEY = "test-key";
  process.env.OPENROUTER_MODEL = "openrouter/free";

  globalThis.fetch = (async (_input, init) => {
    bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    const content = bodies.length === 1 ? "We need to output JSON array of strings" : validTitles;
    return new Response(JSON.stringify({ model: "test/free-model", choices: [{ message: { content, reasoning: "hidden" } }] }), { status: 200 });
  }) as typeof fetch;

  try {
    const result = await new OpenRouterProvider().suggestTitles({
      title: "история про отношения которые подходят к концу",
      genres: ["Романтика", "Драма"]
    });

    assert.deepEqual(result, ["Последние дни любви", "Пока мы не расстались", "На исходе чувств"]);
    assert.equal(bodies.length, 2);
    assert.deepEqual(bodies[0].response_format, { type: "json_object" });
    assert.equal(bodies[0].model, "openrouter/free");
    assert.equal(bodies[0].max_tokens, 400);
    assert.equal("reasoning" in bodies[0], false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("two invalid structured responses produce a controlled error", { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  process.env.OPENROUTER_API_KEY = "test-key";
  process.env.OPENROUTER_MODEL = "openrouter/free";

  globalThis.fetch = (async () => {
    calls += 1;
    return new Response(JSON.stringify({ choices: [{ message: { content: "exactly 3 elements, each a title" } }] }), { status: 200 });
  }) as typeof fetch;

  try {
    await assert.rejects(
      () => new OpenRouterProvider().suggestTitles({ title: "идея о расставании" }),
      (error: unknown) => error instanceof AIUnavailableError && error.message === "AI вернул неподходящий ответ. Попробуйте сгенерировать ещё раз."
    );
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("an empty first response is repaired once", { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  process.env.OPENROUTER_API_KEY = "test-key";

  globalThis.fetch = (async () => {
    calls += 1;
    const content = calls === 1 ? "" : validTitles;
    return new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 });
  }) as typeof fetch;

  try {
    assert.equal((await new OpenRouterProvider().suggestTitles({ title: "идея о расставании" })).length, 3);
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("description, tags and continuation accept validated Russian output", { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  const bodies: Array<Record<string, unknown>> = [];
  const contents = [
    "Двое близких людей понимают, что их отношения подошли к концу, и пытаются сохранить уважение друг к другу.",
    JSON.stringify({ suggestions: ["расставание", "сложные отношения", "драма"] }),
    "Она задержалась у двери и тихо произнесла слова, которые оба так долго боялись услышать."
  ];
  process.env.OPENROUTER_API_KEY = "test-key";

  globalThis.fetch = (async (_input, init) => {
    bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    return new Response(JSON.stringify({ choices: [{ message: { content: contents.shift() } }] }), { status: 200 });
  }) as typeof fetch;

  try {
    const provider = new OpenRouterProvider();
    assert.match(await provider.improveDescription({ description: "отношения заканчиваются" }), /отношения/u);
    assert.deepEqual(await provider.suggestTags({ title: "Последние дни любви" }), ["расставание", "сложные отношения", "драма"]);
    assert.match(await provider.continueChapter({ chapterText: "Они стояли у двери." }), /Она задержалась/u);
    assert.equal("response_format" in bodies[0], false);
    assert.deepEqual(bodies[1].response_format, { type: "json_object" });
    assert.equal("response_format" in bodies[2], false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("OpenRouter HTTP failures retain controlled error classes", { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  process.env.OPENROUTER_API_KEY = "test-key";
  const cases = [
    { status: 401, ErrorType: AIUnavailableError },
    { status: 402, ErrorType: AIUnavailableError },
    { status: 403, ErrorType: AIUnavailableError },
    { status: 429, ErrorType: AIRateLimitError },
    { status: 500, ErrorType: AIUnavailableError }
  ];

  try {
    for (const { status, ErrorType } of cases) {
      globalThis.fetch = (async () => new Response("{}", { status })) as typeof fetch;
      await assert.rejects(() => new OpenRouterProvider().suggestTitles({ title: "идея" }), ErrorType);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("timeout and network errors are controlled", { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  const originalSetTimeout = globalThis.setTimeout;
  process.env.OPENROUTER_API_KEY = "test-key";

  try {
    globalThis.setTimeout = ((callback: TimerHandler) => originalSetTimeout(callback, 1)) as typeof setTimeout;
    globalThis.fetch = ((_input, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    })) as typeof fetch;
    await assert.rejects(() => new OpenRouterProvider().suggestTitles({ title: "идея" }), AITimeoutError);

    globalThis.setTimeout = originalSetTimeout;
    globalThis.fetch = (async () => {
      throw new TypeError("network unavailable");
    }) as typeof fetch;
    await assert.rejects(() => new OpenRouterProvider().suggestTitles({ title: "идея" }), AIProviderRequestError);
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.setTimeout = originalSetTimeout;
  }
});
