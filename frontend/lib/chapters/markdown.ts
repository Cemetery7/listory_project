export type MarkdownEdit = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

export function toggleItalic(value: string, selectionStart: number, selectionEnd: number): MarkdownEdit {
  if (selectionStart === selectionEnd) {
    const placeholder = "курсивный текст";
    const insertion = `*${placeholder}*`;
    return {
      value: `${value.slice(0, selectionStart)}${insertion}${value.slice(selectionEnd)}`,
      selectionStart: selectionStart + 1,
      selectionEnd: selectionStart + 1 + placeholder.length
    };
  }

  const selected = value.slice(selectionStart, selectionEnd);

  if (selected.startsWith("*") && selected.endsWith("*") && selected.length > 2) {
    const unwrapped = selected.slice(1, -1);
    return {
      value: `${value.slice(0, selectionStart)}${unwrapped}${value.slice(selectionEnd)}`,
      selectionStart,
      selectionEnd: selectionStart + unwrapped.length
    };
  }

  if (selectionStart > 0 && selectionEnd < value.length && value[selectionStart - 1] === "*" && value[selectionEnd] === "*") {
    return {
      value: `${value.slice(0, selectionStart - 1)}${selected}${value.slice(selectionEnd + 1)}`,
      selectionStart: selectionStart - 1,
      selectionEnd: selectionEnd - 1
    };
  }

  return {
    value: `${value.slice(0, selectionStart)}*${selected}*${value.slice(selectionEnd)}`,
    selectionStart: selectionStart + 1,
    selectionEnd: selectionEnd + 1
  };
}

export function toggleHeading(value: string, selectionStart: number, selectionEnd: number) {
  return toggleLinePrefix(value, selectionStart, selectionEnd, "## ");
}

export function toggleList(value: string, selectionStart: number, selectionEnd: number) {
  return toggleLinePrefix(value, selectionStart, selectionEnd, "- ");
}

export function toggleQuote(value: string, selectionStart: number, selectionEnd: number) {
  return toggleLinePrefix(value, selectionStart, selectionEnd, "> ");
}

export function markdownToPlainText(value: string) {
  let result = value.replace(/\r\n?/g, "\n");

  for (let pass = 0; pass < 4; pass += 1) {
    const next = result.replace(/^ {0,3}(?:#{1,6}(?:[ \t]+|$)|>(?:[ \t]+|$)|[-+*](?:[ \t]+|$)|\d+[.)](?:[ \t]+|$))/gmu, "");
    if (next === result) break;
    result = next;
  }

  return result
    .replace(/!\[([^\]]*)\]\([^)]*\)/gu, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/gu, "$1")
    .replace(/<[^>\n]*>/gu, "")
    .replace(/[ *_~`]+(?=\n|$)/gmu, "")
    .replace(/[*_~`]/gu, "")
    .replace(/[ \t]+\n/gu, "\n")
    .trim();
}

export function hasMeaningfulMarkdownContent(value: string) {
  return /[\p{L}\p{N}]/u.test(markdownToPlainText(value));
}

export function getMarkdownTextStats(value: string) {
  const text = markdownToPlainText(value);
  return {
    characters: text.length,
    words: text.match(/[\p{L}\p{N}]+(?:[-'][\p{L}\p{N}]+)*/gu)?.length ?? 0
  };
}

export function appendMarkdownContinuation(value: string, continuation: string) {
  const base = closeUnmatchedItalic(value.trimEnd());
  const next = continuation.trim();

  if (!base) return next;
  if (!next) return base;
  return `${base}\n\n${next}`;
}

export function escapeRawHtml(value: string) {
  return value.replace(/&/gu, "&amp;").replace(/</gu, "&lt;");
}

function toggleLinePrefix(value: string, selectionStart: number, selectionEnd: number, prefix: string): MarkdownEdit {
  const lineStart = value.lastIndexOf("\n", Math.max(0, selectionStart - 1)) + 1;
  const effectiveEnd = selectionEnd > selectionStart && value[selectionEnd - 1] === "\n" ? selectionEnd - 1 : selectionEnd;
  const nextBreak = value.indexOf("\n", effectiveEnd);
  const lineEnd = nextBreak === -1 ? value.length : nextBreak;
  const block = value.slice(lineStart, lineEnd);
  const lines = block.split("\n");
  const removePrefix = lines.every((line) => line.startsWith(prefix));
  const transformed = lines.map((line) => (removePrefix ? line.slice(prefix.length) : `${prefix}${line}`)).join("\n");

  return {
    value: `${value.slice(0, lineStart)}${transformed}${value.slice(lineEnd)}`,
    selectionStart: lineStart,
    selectionEnd: lineStart + transformed.length
  };
}

function closeUnmatchedItalic(value: string) {
  const markers = value
    .replace(/\\\*/gu, "")
    .replace(/^ {0,3}\* /gmu, "")
    .replace(/\*\*/gu, "")
    .match(/\*/gu)?.length ?? 0;

  return markers % 2 === 1 ? `${value}*` : value;
}
