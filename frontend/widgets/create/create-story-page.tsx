"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Check, FileText, Send, Sparkles } from "lucide-react";
import { AppShell } from "@/widgets/app-shell/app-shell";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Tag } from "@/shared/ui/tag";
import { Textarea } from "@/shared/ui/textarea";
import { Toast } from "@/shared/ui/toast";
import type { AIOperation } from "@/lib/ai/types";
import { isStoryStatus, type StoryStatus } from "@/lib/stories/status";
import { AISuggestionPanel, fetchAI, useAICooldown } from "@/widgets/story-editor/ai-client";
import { ChapterDraftsEditor, createChapterDraft, type ChapterDraft } from "@/widgets/story-editor/chapter-drafts-editor";
import { StoryCoverField } from "@/widgets/story-editor/story-cover-field";
import { cn } from "@/lib/utils";

const notice = "Функция будет подключена в следующем Sprint.";

const genreOptions = ["Романтика", "Драма", "Фэнтези", "Приключения", "Повседневность", "Детектив"];
const tagOptions = ["slow burn", "уют", "тайны", "дружба", "магия", "новый мир", "hurt/comfort"];

type StoryDraft = {
  title: string;
  description: string;
  status: StoryStatus;
  cover: string | null;
};

export function CreateStoryPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [storyDraft, setStoryDraft] = useState<StoryDraft>({
    title: "",
    description: "",
    status: "ongoing",
    cover: null
  });
  const [chapters, setChapters] = useState<ChapterDraft[]>(() => [createChapterDraft(1)]);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState(notice);

  const showToast = (message = notice) => {
    setToastMessage(message);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 2600);
  };

  return (
    <AppShell rightPanel={<CreationGuide step={step} />}>
      <div className="space-y-6">
        <header className="space-y-4">
          <Badge>Новый сценарий</Badge>
          <div>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">Создание произведения</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted">
              Заполните карточку истории, затем переходите к первой главе и публикации.
            </p>
          </div>
          <StepTabs step={step} />
        </header>

        {step === 1 ? (
          <StoryInfoForm
            initialDraft={storyDraft}
            onToast={showToast}
            onNext={(draft) => {
              setStoryDraft(draft);
              setStep(2);
            }}
          />
        ) : (
          <CreateChaptersStep chapters={chapters} onChange={setChapters} onToast={showToast} storyDraft={storyDraft} />
        )}
      </div>
      <Toast message={toastMessage} visible={toastVisible} />
    </AppShell>
  );
}

function StoryInfoForm({
  initialDraft,
  onNext,
  onToast
}: {
  initialDraft: StoryDraft;
  onNext: (draft: StoryDraft) => void;
  onToast: (message?: string) => void;
}) {
  const [title, setTitle] = useState(initialDraft.title);
  const [description, setDescription] = useState(initialDraft.description);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(["Романтика", "Драма"]);
  const [selectedTags, setSelectedTags] = useState<string[]>(["slow burn", "уют"]);
  const [tagItems, setTagItems] = useState(tagOptions);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [descriptionSuggestion, setDescriptionSuggestion] = useState("");
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [loadingOperation, setLoadingOperation] = useState<AIOperation | null>(null);
  const [cover, setCover] = useState<string | null>(initialDraft.cover);
  const [coverPending, setCoverPending] = useState(false);
  const aiRequestPending = useRef(false);
  const { cooldowns, startCooldown } = useAICooldown();

  const requestAI = async (operation: AIOperation) => {
    if (aiRequestPending.current || loadingOperation || cooldowns[operation] > 0) {
      return;
    }

    aiRequestPending.current = true;
    if (operation === "title") {
      setTitleSuggestions([]);
    }

    if (operation === "description") {
      setDescriptionSuggestion("");
    }

    if (operation === "tags") {
      setTagSuggestions([]);
    }

    setLoadingOperation(operation);

    try {
      const result = await fetchAI({
        operation,
        title,
        description,
        genres: selectedGenres,
        tags: selectedTags
      });

      if (result.operation === "title") {
        setTitleSuggestions(result.suggestions);
      }

      if (result.operation === "description") {
        setDescriptionSuggestion(result.suggestion);
      }

      if (result.operation === "tags") {
        setTagSuggestions(result.suggestions);
      }

      startCooldown(operation);
    } catch (error) {
      onToast(error instanceof Error ? error.message : "AI временно недоступен.");
    } finally {
      aiRequestPending.current = false;
      setLoadingOperation(null);
    }
  };

  const applyTagSuggestion = (tag: string) => {
    if (!tagItems.includes(tag)) {
      setTagItems((items) => [...items, tag]);
    }

    if (!selectedTags.includes(tag)) {
      setSelectedTags((items) => [...items, tag]);
    }
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        onNext({
          title: title.trim(),
          description: description.trim(),
          status: normalizeStatus(String(formData.get("status") ?? "ongoing")),
          cover
        });
      }}
    >
      <Card className="p-5 md:p-6">
        <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
          <StoryCoverField onChange={setCover} onPendingChange={setCoverPending} onToast={(message) => onToast(message)} value={cover} />

          <div className="grid content-start gap-4">
            <Field
              action={
                <AIActionButton
                  cooldown={cooldowns.title}
                  disabled={loadingOperation !== null}
                  loading={loadingOperation === "title"}
                  label="Предложить названия"
                  onClick={() => void requestAI("title")}
                />
              }
              label="Название"
            >
              <Input name="title" onChange={(event) => setTitle(event.target.value)} placeholder="Например: Дом на краю звезд" value={title} />
            </Field>
            <Field
              action={
                <AIActionButton
                  cooldown={cooldowns.description}
                  disabled={loadingOperation !== null}
                  loading={loadingOperation === "description"}
                  label="Улучшить описание"
                  onClick={() => void requestAI("description")}
                />
              }
              label="Краткое описание"
            >
              <Textarea className="min-h-[132px]" name="description" onChange={(event) => setDescription(event.target.value)} placeholder="О чем эта история и почему ее стоит открыть?" value={description} />
              {descriptionSuggestion ? (
                <AISuggestionPanel actionLabel="Вставить описание" onApply={() => setDescription(descriptionSuggestion)}>
                  {descriptionSuggestion}
                </AISuggestionPanel>
              ) : null}
            </Field>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Категория">
              <Select name="category" defaultValue="">
                <option value="" disabled>
                  Выберите категорию
                </option>
                <option>Оригинальное произведение</option>
                <option>Фанфик</option>
                <option>Поэзия</option>
                <option>Мини</option>
              </Select>
            </Field>
            <Field label="Статус">
              <Select name="status" defaultValue={initialDraft.status}>
                <option value="draft">Черновик</option>
                <option value="ongoing">В работе</option>
                <option value="completed">Завершено</option>
              </Select>
            </Field>
            <Field label="Возрастной рейтинг">
              <Select name="rating" defaultValue="12+">
                <option>0+</option>
                <option>6+</option>
                <option>12+</option>
                <option>16+</option>
                <option>18+</option>
              </Select>
            </Field>
            <Field label="Язык">
              <Select name="language" defaultValue="Русский">
                <option>Русский</option>
                <option>Английский</option>
                <option>Испанский</option>
              </Select>
            </Field>
            <Field label="Фандом">
              <Input name="fandom" placeholder="Оригинальный мир или название фандома" />
            </Field>
            <Field label="Персонажи">
              <Input name="characters" placeholder="Имена через запятую" />
            </Field>
            <Field label="Пейринги" className="md:col-span-2 xl:col-span-3">
              <Input name="pairings" placeholder="Например: героиня / герой, команда & наставник" />
            </Field>
        </div>
      </Card>

      <Card className="space-y-5 p-5 md:p-6">
        <TokenField label="Жанры" items={genreOptions} selectedItems={selectedGenres} onToggle={setSelectedGenres} />
        <TokenField
          action={
            <AIActionButton
              cooldown={cooldowns.tags}
              disabled={loadingOperation !== null}
              loading={loadingOperation === "tags"}
              label="Предложить теги"
              onClick={() => void requestAI("tags")}
            />
          }
          label="Теги"
          items={tagItems}
          selectedItems={selectedTags}
          onToggle={setSelectedTags}
        />
        <AISuggestionList items={tagSuggestions} onPick={applyTagSuggestion} />
      </Card>

      <div className="flex justify-end">
        <Button disabled={coverPending} size="lg" type="submit">
          {coverPending ? "Загружаем обложку..." : "Перейти к первой главе"}
          <BookOpen size={18} />
        </Button>
      </div>
      <TitleSuggestionModal
        cooldown={cooldowns.title}
        loading={loadingOperation === "title"}
        onClose={() => setTitleSuggestions([])}
        onGenerateMore={() => void requestAI("title")}
        onSelect={(item) => {
          setTitle(item);
          setTitleSuggestions([]);
        }}
        open={titleSuggestions.length > 0}
        suggestions={titleSuggestions}
      />
    </form>
  );
}

function CreateChaptersStep({
  chapters,
  onChange,
  onToast,
  storyDraft
}: {
  chapters: ChapterDraft[];
  onChange: (chapters: ChapterDraft[]) => void;
  onToast: (message?: string) => void;
  storyDraft: StoryDraft;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [chapterErrors, setChapterErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  const publishStory = async () => {
    setError("");
    const nextErrors = Object.fromEntries(chapters.filter((chapter) => !chapter.content.trim()).map((chapter) => [chapter.clientId, "Текст главы обязателен."]));
    setChapterErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      setError("Заполните текст каждой главы.");
      return;
    }

    setPending(true);

    const response = await fetch("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...storyDraft,
        chapters: chapters.map((chapter) => ({ title: chapter.title, content: chapter.content }))
      })
    });
    const result = (await response.json()) as { data?: { story?: { id: string } }; error?: { message: string } };
    setPending(false);

    if (!response.ok || !result.data?.story?.id) {
      setError(result.error?.message ?? "Не удалось опубликовать произведение.");
      return;
    }

    router.push(`/works/${result.data.story.id}`);
    router.refresh();
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Шаг 2</p>
        <h2 className="mt-1 text-2xl font-bold">Главы произведения</h2>
        <p className="mt-2 text-sm text-text-muted">Добавьте главы, расположите их в нужном порядке и подготовьте текст к публикации.</p>
      </div>

      <ChapterDraftsEditor chapters={chapters} description={storyDraft.description} errors={chapterErrors} onChange={onChange} onToast={(message) => onToast(message)} storyTitle={storyDraft.title} />

      {error ? <p className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-primary">{error}</p> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button disabled={pending} size="lg" type="button" onClick={() => void publishStory()}>
          <Send size={18} />
          Опубликовать произведение
        </Button>
      </div>
    </section>
  );
}

function CreationGuide({ step }: { step: 1 | 2 }) {
  return (
    <Card className="space-y-5 p-5">
      <div>
        <p className="text-sm font-semibold text-text-primary">Процесс публикации</p>
        <p className="mt-2 text-sm leading-6 text-text-muted">Два спокойных шага: сначала карточка произведения, затем главы.</p>
      </div>
      <div className="space-y-3">
        <GuideItem active={step === 1} done={step > 1} title="Информация" description="Название, описание, категории и метаданные." />
        <GuideItem active={step === 2} done={false} title="Главы" description="Тексты, порядок глав и публикация." />
      </div>
      <div className="rounded-md border border-border bg-surface p-4 text-sm leading-6 text-text-muted">
        Произведение и все главы сохранятся вместе. Статус «Черновик» скроет работу от читателей.
      </div>
    </Card>
  );
}

function Field({ label, action, className, children }: { label: string; action?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("block space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-text-primary">{label}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

function TokenField({
  label,
  action,
  items,
  selectedItems,
  onToggle
}: {
  label: string;
  action?: React.ReactNode;
  items: string[];
  selectedItems: string[];
  onToggle: (items: string[]) => void;
}) {
  const toggleItem = (item: string) => {
    if (selectedItems.includes(item)) {
      onToggle(selectedItems.filter((selectedItem) => selectedItem !== item));
      return;
    }

    onToggle([...selectedItems, item]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-text-primary">{label}</p>
        {action}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Tag key={item} label={item} active={selectedItems.includes(item)} onClick={() => toggleItem(item)} />
        ))}
      </div>
    </div>
  );
}

function AIActionButton({
  cooldown,
  disabled,
  label,
  loading,
  onClick
}: {
  cooldown: number;
  disabled: boolean;
  label: string;
  loading: boolean;
  onClick: () => void;
}) {
  const isDisabled = disabled || loading || cooldown > 0;

  return (
    <button
      aria-label={label}
      className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-border bg-elevated px-2 text-sm font-semibold text-primary transition duration-200 hover:border-[color:var(--border-hover)] hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isDisabled}
      title={label}
      type="button"
      onClick={onClick}
    >
      {loading ? "..." : cooldown > 0 ? `${cooldown} сек` : <Sparkles size={15} />}
    </button>
  );
}

function AISuggestionList({ items, onPick }: { items: string[]; onPick: (item: string) => void }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 rounded-md border border-border bg-surface p-3">
      {items.map((item) => (
        <button
          key={item}
          className="rounded-full border border-border bg-elevated px-3 py-1.5 text-xs font-semibold text-text-secondary transition duration-200 hover:border-primary hover:text-primary"
          type="button"
          onClick={() => onPick(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function TitleSuggestionModal({
  cooldown,
  loading,
  onClose,
  onGenerateMore,
  onSelect,
  open,
  suggestions
}: {
  cooldown: number;
  loading: boolean;
  onClose: () => void;
  onGenerateMore: () => void;
  onSelect: (title: string) => void;
  open: boolean;
  suggestions: string[];
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-5 shadow-floating md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">AI-подбор</p>
            <h2 className="mt-1 text-2xl font-bold text-text-primary">Варианты названия</h2>
          </div>
          <Button size="sm" type="button" variant="ghost" onClick={onClose}>
            Закрыть
          </Button>
        </div>

        <div className="mt-5 grid gap-3">
          {suggestions.map((suggestion) => (
            <div key={suggestion} className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-base font-semibold text-text-primary">{suggestion}</p>
              <Button size="sm" type="button" variant="secondary" onClick={() => onSelect(suggestion)}>
                Выбрать
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button size="sm" type="button" variant="secondary" onClick={onClose}>
            Закрыть
          </Button>
          <Button disabled={loading || cooldown > 0} size="sm" type="button" onClick={onGenerateMore}>
            <Sparkles size={15} />
            {loading ? "Думаю..." : cooldown > 0 ? `Повторить через ${cooldown} сек` : "Сгенерировать еще"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StepTabs({ step }: { step: 1 | 2 }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <StepCard active={step === 1} done={step > 1} icon={FileText} title="1. Информация" />
      <StepCard active={step === 2} done={false} icon={BookOpen} title="2. Главы" />
    </div>
  );
}

function StepCard({ active, done, icon: Icon, title }: { active: boolean; done: boolean; icon: typeof FileText; title: string }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-card", active && "border-primary")}>
      <span className={cn("grid h-10 w-10 place-items-center rounded-md bg-elevated text-text-muted", active && "bg-primary text-white", done && "bg-primary/15 text-primary")}>
        {done ? <Check size={18} /> : <Icon size={18} />}
      </span>
      <span className="text-sm font-semibold text-text-primary">{title}</span>
    </div>
  );
}

function GuideItem({ active, done, title, description }: { active: boolean; done: boolean; title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <span className={cn("mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border text-xs font-bold text-text-muted", active && "border-primary bg-primary text-white", done && "border-primary bg-primary/15 text-primary")}>
        {done ? <Check size={14} /> : null}
      </span>
      <div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="mt-1 text-sm leading-6 text-text-muted">{description}</p>
      </div>
    </div>
  );
}

function normalizeStatus(status: string) {
  return isStoryStatus(status) ? status : "ongoing";
}
