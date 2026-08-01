import assert from "node:assert/strict";
import test from "node:test";
import { validateAIRequest } from "@/lib/ai/request-validation";
import { AIResponseValidationError, parseTagSuggestions, parseTitleSuggestions, validateRussianText } from "@/lib/ai/response-validation";

const validTitles = JSON.stringify({
  suggestions: ["Последние дни любви", "Пока мы не расстались", "На исходе чувств"]
});

test("accepts three unique Russian titles related to the supplied idea", () => {
  assert.deepEqual(parseTitleSuggestions(validTitles, "история про отношения которые подходят к концу"), [
    "Последние дни любви",
    "Пока мы не расстались",
    "На исходе чувств"
  ]);
});

test("rejects reasoning text and a bare JSON array", () => {
  assert.throws(
    () => parseTitleSuggestions("We need to output JSON array of strings\nexactly 3 elements\neach a title"),
    AIResponseValidationError
  );
  assert.throws(() => parseTitleSuggestions('["Первое название","Второе название"]'), AIResponseValidationError);
});

test("rejects duplicate, long and service-like titles", () => {
  assert.throws(
    () => parseTitleSuggestions(JSON.stringify({ suggestions: ["Последние дни", "последние дни", "Последний разговор"] })),
    AIResponseValidationError
  );
  assert.throws(
    () => parseTitleSuggestions(JSON.stringify({ suggestions: ["Слишком длинное название из шести разных слов", "Второй шанс", "Последний разговор"] })),
    AIResponseValidationError
  );
  assert.throws(
    () => parseTitleSuggestions(JSON.stringify({ suggestions: ["JSON title", "Второй шанс", "Последний разговор"] })),
    AIResponseValidationError
  );
});

test("accepts a single outer JSON fence and filters invalid tags", () => {
  const response = '```json\n{"suggestions":["расставание","сложные отношения","slow burn","JSON output","расставание"]}\n```';
  assert.deepEqual(parseTagSuggestions(response), ["расставание", "сложные отношения", "slow burn"]);
});

test("Russian prose validation blocks model commentary and Markdown", () => {
  assert.equal(validateRussianText("Они остановились у двери, не решаясь произнести последние слова."), "Они остановились у двери, не решаясь произнести последние слова.");
  assert.throws(() => validateRussianText("We need to continue the chapter"), AIResponseValidationError);
  assert.throws(() => validateRussianText("This response is mostly English, но здесь есть несколько русских слов."), AIResponseValidationError);
  assert.throws(() => validateRussianText("Вот продолжение: они подошли к двери."), AIResponseValidationError);
  assert.throws(() => validateRussianText("## Продолжение\nОни подошли к двери."), AIResponseValidationError);
});

test("title generation requires an idea or description", () => {
  assert.equal(validateAIRequest("title", { title: "  ", description: "" }), "Сначала опишите идею произведения или введите рабочее название.");
  assert.equal(validateAIRequest("title", { title: "идея о расставании" }), "");
});
