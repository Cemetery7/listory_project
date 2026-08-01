"use client";

import { useEffect, useState } from "react";
import { AlignJustify, Minus, Moon, Plus, Sun } from "lucide-react";
import { ChapterContent } from "@/entities/chapter/components/chapter-content";
import { cn } from "@/lib/utils";
import { Card } from "@/shared/ui/card";

type FontSize = "small" | "medium" | "large";
type ReaderWidth = "narrow" | "medium" | "wide";
type ReaderTheme = "light" | "dark";

type ReaderPreferences = {
  fontSize: FontSize;
  width: ReaderWidth;
  theme: ReaderTheme;
};

type ChapterReaderProps = {
  chapterTitle: string;
  content: string;
  storyTitle: string;
};

const storageKey = "listoria_reader_preferences";
const fontSizes: FontSize[] = ["small", "medium", "large"];
const defaultPreferences: ReaderPreferences = {
  fontSize: "medium",
  width: "medium",
  theme: "light"
};

const fontClasses: Record<FontSize, string> = {
  small: "text-base leading-8",
  medium: "text-lg leading-9",
  large: "text-xl leading-10"
};

const widthClasses: Record<ReaderWidth, string> = {
  narrow: "max-w-[700px]",
  medium: "max-w-[760px]",
  wide: "max-w-[800px]"
};

export function ChapterReader({ chapterTitle, content, storyTitle }: ChapterReaderProps) {
  const [preferences, setPreferences] = useState<ReaderPreferences>(defaultPreferences);

  useEffect(() => {
    const savedPreferences = window.localStorage.getItem(storageKey);

    if (!savedPreferences) {
      return;
    }

    try {
      const parsed = JSON.parse(savedPreferences) as Partial<ReaderPreferences>;
      setPreferences({
        fontSize: fontSizes.includes(parsed.fontSize as FontSize) ? (parsed.fontSize as FontSize) : defaultPreferences.fontSize,
        width: ["narrow", "medium", "wide"].includes(parsed.width ?? "") ? (parsed.width as ReaderWidth) : defaultPreferences.width,
        theme: parsed.theme === "dark" ? "dark" : "light"
      });
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  const updatePreferences = (nextPreferences: ReaderPreferences) => {
    setPreferences(nextPreferences);
    window.localStorage.setItem(storageKey, JSON.stringify(nextPreferences));
  };

  const changeFontSize = (direction: -1 | 1) => {
    const currentIndex = fontSizes.indexOf(preferences.fontSize);
    const nextIndex = Math.min(fontSizes.length - 1, Math.max(0, currentIndex + direction));
    updatePreferences({ ...preferences, fontSize: fontSizes[nextIndex] });
  };

  return (
    <section className={cn("mx-auto w-full transition-[max-width] duration-200", widthClasses[preferences.width])}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-surface p-2">
        <div className="flex items-center gap-1" aria-label="Размер текста">
          <button
            aria-label="Уменьшить текст"
            className="grid h-10 w-10 place-items-center rounded-sm text-text-secondary transition hover:bg-elevated hover:text-primary disabled:opacity-40"
            disabled={preferences.fontSize === "small"}
            onClick={() => changeFontSize(-1)}
            title="Уменьшить текст"
            type="button"
          >
            <Minus size={17} />
          </button>
          <span className="min-w-10 text-center text-sm font-semibold text-text-primary">Аа</span>
          <button
            aria-label="Увеличить текст"
            className="grid h-10 w-10 place-items-center rounded-sm text-text-secondary transition hover:bg-elevated hover:text-primary disabled:opacity-40"
            disabled={preferences.fontSize === "large"}
            onClick={() => changeFontSize(1)}
            title="Увеличить текст"
            type="button"
          >
            <Plus size={17} />
          </button>
        </div>

        <div className="flex items-center gap-1" aria-label="Ширина текста">
          <AlignJustify className="mx-2 text-text-muted" size={17} />
          {(["narrow", "medium", "wide"] as ReaderWidth[]).map((width) => (
            <button
              aria-label={widthLabel(width)}
              className={cn(
                "h-10 rounded-sm px-3 text-xs font-semibold text-text-secondary transition hover:bg-elevated hover:text-text-primary",
                preferences.width === width && "bg-primary text-white hover:bg-primary hover:text-white"
              )}
              key={width}
              onClick={() => updatePreferences({ ...preferences, width })}
              type="button"
            >
              {widthShortLabel(width)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1" aria-label="Тема чтения">
          <button
            aria-label="Светлая тема чтения"
            className={readerOptionClass(preferences.theme === "light")}
            onClick={() => updatePreferences({ ...preferences, theme: "light" })}
            title="Светлая тема"
            type="button"
          >
            <Sun size={17} />
          </button>
          <button
            aria-label="Тёмная тема чтения"
            className={readerOptionClass(preferences.theme === "dark")}
            onClick={() => updatePreferences({ ...preferences, theme: "dark" })}
            title="Тёмная тема"
            type="button"
          >
            <Moon size={17} />
          </button>
        </div>
      </div>

      <Card className={cn("p-5 transition-colors md:p-8", preferences.theme === "dark" ? "reader-dark" : "reader-light")}>
        <p className="text-sm font-medium text-primary">{storyTitle}</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">{chapterTitle}</h1>
        <ChapterContent className={cn("mt-8 text-[color:var(--reader-text)]", fontClasses[preferences.fontSize])} content={content} />
      </Card>
    </section>
  );
}

function readerOptionClass(active: boolean) {
  return cn(
    "grid h-10 w-10 place-items-center rounded-sm text-text-secondary transition hover:bg-elevated hover:text-primary",
    active && "bg-primary text-white hover:bg-primary hover:text-white"
  );
}

function widthLabel(width: ReaderWidth) {
  if (width === "narrow") return "Узкая область текста";
  if (width === "wide") return "Широкая область текста";
  return "Средняя область текста";
}

function widthShortLabel(width: ReaderWidth) {
  if (width === "narrow") return "Узко";
  if (width === "wide") return "Широко";
  return "Средне";
}
