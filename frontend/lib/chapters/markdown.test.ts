import assert from "node:assert/strict";
import test from "node:test";
import { appendMarkdownContinuation, getMarkdownTextStats, hasMeaningfulMarkdownContent, markdownToPlainText, toggleHeading, toggleItalic, toggleList, toggleQuote } from "@/lib/chapters/markdown";
import { parseStoryEditorPayload } from "@/lib/stories/editor";

test("italic wraps a selection and toggles off around the same text", () => {
  const formatted = toggleItalic("Это важная фраза.", 4, 16);
  assert.equal(formatted.value, "Это *важная фраза*.");
  assert.deepEqual([formatted.selectionStart, formatted.selectionEnd], [5, 17]);

  const unformatted = toggleItalic(formatted.value, formatted.selectionStart, formatted.selectionEnd);
  assert.equal(unformatted.value, "Это важная фраза.");
  assert.deepEqual([unformatted.selectionStart, unformatted.selectionEnd], [4, 16]);
});

test("italic without selection inserts and selects a placeholder", () => {
  const result = toggleItalic("Начало ", 7, 7);
  assert.equal(result.value, "Начало *курсивный текст*");
  assert.equal(result.value.slice(result.selectionStart, result.selectionEnd), "курсивный текст");
});

test("heading toggles one or several selected lines", () => {
  const one = toggleHeading("Первая строка", 3, 3);
  assert.equal(one.value, "## Первая строка");
  assert.equal(toggleHeading(one.value, one.selectionStart, one.selectionEnd).value, "Первая строка");

  const several = toggleHeading("Первая\nВторая", 0, 14);
  assert.equal(several.value, "## Первая\n## Вторая");
});

test("list and quote markers toggle for multiple lines", () => {
  const list = toggleList("Первый\nВторой", 0, 13);
  assert.equal(list.value, "- Первый\n- Второй");
  assert.equal(toggleList(list.value, list.selectionStart, list.selectionEnd).value, "Первый\nВторой");

  const quote = toggleQuote("Однажды\nПотом", 0, 13);
  assert.equal(quote.value, "> Однажды\n> Потом");
  assert.equal(toggleQuote(quote.value, quote.selectionStart, quote.selectionEnd).value, "Однажды\nПотом");
});

test("plain text conversion removes formatting markers and detects real content", () => {
  const markdown = "## Заголовок\n\n*Важный текст*\n\n- Первый пункт\n> Цитата";
  assert.equal(markdownToPlainText(markdown), "Заголовок\n\nВажный текст\n\nПервый пункт\nЦитата");
  assert.equal(hasMeaningfulMarkdownContent(markdown), true);
  assert.equal(hasMeaningfulMarkdownContent("##\n*\n-\n>"), false);
});

test("character and word counts ignore Markdown markers", () => {
  assert.deepEqual(getMarkdownTextStats("## Заголовок\n\n*Текст*"), { characters: 16, words: 2 });
});

test("AI continuation is separated and closes unmatched italic", () => {
  assert.equal(appendMarkdownContinuation("Начало *мысли", "Продолжение."), "Начало *мысли*\n\nПродолжение.");
  assert.equal(appendMarkdownContinuation("- Первый пункт", "Продолжение."), "- Первый пункт\n\nПродолжение.");
});

test("server payload validation preserves Markdown and rejects marker-only chapters", () => {
  const basePayload = {
    title: "История",
    description: "Описание истории",
    status: "ongoing",
    cover: null
  };
  const content = "## Начало\n\n*Первый абзац*";
  const valid = parseStoryEditorPayload({ ...basePayload, chapters: [{ title: "Глава 1", content }] });

  assert.equal("data" in valid && valid.data.chapters[0].content, content);
  assert.equal("error" in parseStoryEditorPayload({ ...basePayload, chapters: [{ title: "Глава 1", content: "##\n*\n-\n>" }] }), true);
});
