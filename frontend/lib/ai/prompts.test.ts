import assert from "node:assert/strict";
import test from "node:test";
import { baseSystemMessage, continuationPrompt, descriptionPrompt, tagsPrompt, titlePrompt } from "@/lib/ai/prompts";

const storyInput = {
  title: "история про отношения которые подходят к концу",
  description: "Двое понимают, что их общая история заканчивается.",
  genres: ["Романтика", "Драма"],
  tags: ["расставание"]
};

test("title prompt includes every story field and isolates user input", () => {
  const prompt = titlePrompt(storyInput).content;

  assert.match(prompt, /история про отношения которые подходят к концу/u);
  assert.match(prompt, /Двое понимают/u);
  assert.match(prompt, /Романтика/u);
  assert.match(prompt, /расставание/u);
  assert.match(prompt, /<story_input>[\s\S]*<\/story_input>/u);
  assert.match(prompt, /только на русском языке/iu);
  assert.match(prompt, /"suggestions"/u);
});

test("system and every operation prompt explicitly require Russian output", () => {
  const messages = [
    baseSystemMessage(),
    titlePrompt(storyInput),
    tagsPrompt(storyInput),
    descriptionPrompt(storyInput),
    continuationPrompt({ ...storyInput, chapterText: "Они молчали, уже зная ответ." })
  ];

  for (const message of messages) {
    assert.match(message.content, /русск|русском/iu);
  }
});
