"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Heading2, Italic, List, Quote } from "lucide-react";
import { ChapterContent } from "@/entities/chapter/components/chapter-content";
import { hasMeaningfulMarkdownContent, toggleHeading, toggleItalic, toggleList, toggleQuote, type MarkdownEdit } from "@/lib/chapters/markdown";
import { cn } from "@/lib/utils";
import { Textarea } from "@/shared/ui/textarea";

export type MarkdownChapterEditorProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
};

type EditorMode = "edit" | "preview";
type FormatAction = "heading" | "italic" | "list" | "quote";

const formatButtons = [
  { action: "heading" as const, label: "Заголовок второго уровня", icon: Heading2 },
  { action: "italic" as const, label: "Курсив", icon: Italic },
  { action: "list" as const, label: "Маркированный список", icon: List },
  { action: "quote" as const, label: "Цитата", icon: Quote }
];

export function MarkdownChapterEditor({ value, onChange, error, placeholder = "Начните писать главу..." }: MarkdownChapterEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<EditorMode>("edit");

  const applyFormat = (action: FormatAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const format = action === "heading" ? toggleHeading : action === "italic" ? toggleItalic : action === "list" ? toggleList : toggleQuote;
    applyEdit(format(value, textarea.selectionStart, textarea.selectionEnd));
  };

  const applyEdit = (edit: MarkdownEdit) => {
    onChange(edit.value);
    window.requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(edit.selectionStart, edit.selectionEnd);
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "i") {
      event.preventDefault();
      applyFormat("italic");
    }
  };

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-elevated p-2">
        <div aria-label="Форматирование главы" className="flex min-w-0 flex-wrap items-center gap-1" role="toolbar">
          {formatButtons.map((item) => (
            <button
              aria-label={item.label}
              className="grid h-9 w-9 place-items-center rounded-sm text-text-secondary transition hover:bg-surface hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40"
              disabled={mode !== "edit"}
              key={item.action}
              title={item.label}
              type="button"
              onClick={() => applyFormat(item.action)}
            >
              <item.icon size={17} />
            </button>
          ))}
        </div>

        <div aria-label="Режим редактора" className="flex max-w-full rounded-md border border-border bg-surface p-1">
          <ModeButton active={mode === "edit"} label="Редактирование" onClick={() => setMode("edit")} />
          <ModeButton active={mode === "preview"} label="Предпросмотр" onClick={() => setMode("preview")} />
        </div>
      </div>

      {mode === "edit" ? (
        <Textarea
          aria-invalid={Boolean(error)}
          className="min-h-[360px] w-full min-w-0 text-base leading-8"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          ref={textareaRef}
          value={value}
        />
      ) : (
        <div className="min-h-[360px] min-w-0 overflow-hidden rounded-md border border-border bg-surface p-4 text-base leading-8 text-text-primary sm:p-5">
          {hasMeaningfulMarkdownContent(value) ? <ChapterContent content={value} /> : <p className="text-sm text-text-muted">Начните писать главу, чтобы увидеть предпросмотр.</p>}
        </div>
      )}

      {error ? <p className="text-sm font-medium text-primary">{error}</p> : null}
    </div>
  );
}

function ModeButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        "min-h-8 min-w-0 rounded-sm px-2.5 text-xs font-semibold text-text-secondary transition hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-3",
        active && "bg-primary text-white hover:text-white"
      )}
      title={label}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
