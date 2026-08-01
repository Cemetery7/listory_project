import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ChapterContent } from "@/entities/chapter/components/chapter-content";

test("chapter content renders supported Markdown without executing raw HTML", () => {
  const html = renderToStaticMarkup(
    <ChapterContent content={'## Заголовок\n\n*Курсив*\n\n- пункт\n\n> цитата\n\n<script>alert("x")</script>'} />
  );

  assert.match(html, /<h2/u);
  assert.match(html, /<em/u);
  assert.match(html, /<ul/u);
  assert.match(html, /<blockquote/u);
  assert.doesNotMatch(html, /<script[ >]/iu);
  assert.match(html, /&lt;script&gt;/u);
});

test("unsupported links and images do not become interactive content", () => {
  const html = renderToStaticMarkup(<ChapterContent content={'[ссылка](https://example.com)\n\n![картинка](https://example.com/image.png)'} />);
  assert.doesNotMatch(html, /<a[ >]|<img[ >]/iu);
});
