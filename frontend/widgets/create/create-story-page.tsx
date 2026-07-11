"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlignLeft, BookOpen, Check, FileText, Heading2, ImagePlus, Italic, List, Save, Send, Sparkles } from "lucide-react";
import { AppShell } from "@/widgets/app-shell/app-shell";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Tag } from "@/shared/ui/tag";
import { Textarea } from "@/shared/ui/textarea";
import { Toast } from "@/shared/ui/toast";
import { AI_CONFIG } from "@/lib/ai/config";
import type { AIResult, AIOperation } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

const notice = "Функция будет подключена в следующем Sprint.";

const genreOptions = ["Романтика", "Драма", "Фэнтези", "Приключения", "Повседневность", "Детектив"];
const tagOptions = ["slow burn", "уют", "тайны", "дружба", "магия", "новый мир", "hurt/comfort"];

type StoryDraft = {
  title: string;
  description: string;
  status: string;
};

export function CreateStoryPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [storyDraft, setStoryDraft] = useState<StoryDraft>({
    title: "",
    description: "",
    status: "ongoing"
  });
  const [chapterText, setChapterText] = useState("");
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
              Заполните карточку истории, затем сразу переходите к первой главе. Данные пока не отправляются на сервер.
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
          <ChapterEditor chapterText={chapterText} onChapterTextChange={setChapterText} onToast={showToast} storyDraft={storyDraft} />
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
  const { cooldowns, startCooldown } = useAICooldown();

  const requestAI = async (operation: AIOperation) => {
    if (loadingOperation || cooldowns[operation] > 0) {
      return;
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
          status: normalizeStatus(String(formData.get("status") ?? "ongoing"))
        });
      }}
    >
      <Card className="p-5 md:p-6">
        <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
          <label className="group flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-elevated px-5 text-center transition duration-200 hover:border-[color:var(--border-hover)]">
            <span className="grid h-14 w-14 place-items-center rounded-md bg-primary/15 text-primary">
              <ImagePlus size={24} />
            </span>
            <span className="mt-4 text-sm font-semibold text-text-primary">Обложка</span>
            <span className="mt-2 text-xs leading-5 text-text-muted">PNG или JPG. Загрузка будет подключена позже.</span>
            <input className="sr-only" type="file" accept="image/png,image/jpeg" />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
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
              className="md:col-span-2"
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
              className="md:col-span-2"
            >
              <Textarea className="min-h-[132px]" name="description" onChange={(event) => setDescription(event.target.value)} placeholder="О чем эта история и почему ее стоит открыть?" value={description} />
              {descriptionSuggestion ? (
                <AISuggestionPanel actionLabel="Вставить описание" onApply={() => setDescription(descriptionSuggestion)}>
                  {descriptionSuggestion}
                </AISuggestionPanel>
              ) : null}
            </Field>
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
                <option value="ongoing">В процессе</option>
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
            <Field label="Пейринги" className="md:col-span-2">
              <Input name="pairings" placeholder="Например: героиня / герой, команда & наставник" />
            </Field>
          </div>
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
        <Button size="lg" type="submit">
          Перейти к первой главе
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

function ChapterEditor({
  chapterText,
  onChapterTextChange,
  onToast,
  storyDraft
}: {
  chapterText: string;
  onChapterTextChange: (value: string) => void;
  onToast: (message?: string) => void;
  storyDraft: StoryDraft;
}) {
  const router = useRouter();
  const [chapterTitle, setChapterTitle] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [continuation, setContinuation] = useState("");
  const [aiPending, setAiPending] = useState(false);
  const { cooldowns, startCooldown } = useAICooldown();

  const continueChapter = async () => {
    if (aiPending || cooldowns.continue > 0) {
      return;
    }

    setAiPending(true);

    try {
      const result = await fetchAI({
        operation: "continue",
        title: storyDraft.title,
        description: storyDraft.description,
        chapterText
      });

      if (result.operation === "continue") {
        setContinuation(result.suggestion);
      }

      startCooldown("continue");
    } catch (error) {
      onToast(error instanceof Error ? error.message : "AI временно недоступен.");
    } finally {
      setAiPending(false);
    }
  };

  const publishStory = async () => {
    setError("");
    setPending(true);

    const response = await fetch("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...storyDraft,
        chapterTitle,
        chapterContent: chapterText
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
      <Card className="p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Шаг 2</p>
            <h2 className="mt-1 text-2xl font-bold">Первая глава</h2>
          </div>
          <Badge>{chapterText.length.toLocaleString("ru-RU")} символов</Badge>
        </div>

        <div className="space-y-4">
          <Field label="Название главы">
            <Input name="chapterTitle" onChange={(event) => setChapterTitle(event.target.value)} placeholder="Глава 1. Начало" value={chapterTitle} />
          </Field>

          <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-elevated p-2">
            {toolbarItems.map((item) => (
              <button
                key={item.label}
                aria-label={item.label}
                className="grid h-9 w-9 place-items-center rounded-sm text-text-secondary transition duration-200 hover:bg-surface hover:text-primary"
                type="button"
              >
                <item.icon size={17} />
              </button>
            ))}
            <span className="mx-1 h-5 w-px bg-border" />
            <Button disabled={aiPending || cooldowns.continue > 0} size="sm" type="button" variant="outline" onClick={() => void continueChapter()}>
              <Sparkles size={16} />
              {aiPending ? "Думаю..." : cooldowns.continue > 0 ? `Повторить через ${cooldowns.continue} сек` : "Продолжить"}
            </Button>
          </div>

          <Textarea
            className="min-h-[420px] text-base leading-8"
            name="chapterText"
            onChange={(event) => onChapterTextChange(event.target.value)}
            placeholder="Начните писать первую главу..."
            value={chapterText}
          />
          {continuation ? (
            <AISuggestionPanel
              actionLabel="Вставить продолжение"
              onApply={() => {
                onChapterTextChange(`${chapterText.trimEnd()}\n\n${continuation}`.trimStart());
                setContinuation("");
              }}
            >
              {continuation}
            </AISuggestionPanel>
          ) : null}
        </div>
      </Card>

      {error ? <p className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-primary">{error}</p> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button size="lg" variant="secondary" type="button" onClick={() => onToast()}>
          <Save size={18} />
          Сохранить черновик
        </Button>
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
        <p className="mt-2 text-sm leading-6 text-text-muted">Два спокойных шага: сначала карточка произведения, затем первая глава.</p>
      </div>
      <div className="space-y-3">
        <GuideItem active={step === 1} done={step > 1} title="Информация" description="Название, описание, категории и метаданные." />
        <GuideItem active={step === 2} done={false} title="Первая глава" description="Заголовок главы, текст и публикация." />
      </div>
      <div className="rounded-md border border-border bg-surface p-4 text-sm leading-6 text-text-muted">
        Сохранение и публикация пока показывают уведомление. Подключение API запланировано на следующий Sprint.
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

function AISuggestionPanel({ actionLabel, children, onApply }: { actionLabel: string; children: string; onApply: () => void }) {
  return (
    <div className="space-y-3 rounded-md border border-border bg-surface p-4">
      <p className="whitespace-pre-wrap text-sm leading-6 text-text-secondary">{children}</p>
      <Button size="sm" type="button" variant="secondary" onClick={onApply}>
        <Check size={15} />
        {actionLabel}
      </Button>
    </div>
  );
}

async function fetchAI(payload: { operation: AIOperation; title?: string; description?: string; genres?: string[]; tags?: string[]; chapterText?: string }) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const result = (await response.json()) as { data?: AIResult; error?: { message: string } };

  if (!response.ok || !result.data) {
    throw new Error(result.error?.message ?? "AI временно недоступен.");
  }

  return result.data;
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

function useAICooldown() {
  const [cooldowns, setCooldowns] = useState<Record<AIOperation, number>>({
    title: 0,
    description: 0,
    tags: 0,
    continue: 0
  });

  useEffect(() => {
    if (!Object.values(cooldowns).some(Boolean)) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCooldowns((currentCooldowns) => ({
        title: Math.max(currentCooldowns.title - 1, 0),
        description: Math.max(currentCooldowns.description - 1, 0),
        tags: Math.max(currentCooldowns.tags - 1, 0),
        continue: Math.max(currentCooldowns.continue - 1, 0)
      }));
    }, AI_CONFIG.COOLDOWN_TICK_MS);

    return () => window.clearInterval(intervalId);
  }, [cooldowns]);

  const startCooldown = (operation: AIOperation) => {
    setCooldowns((currentCooldowns) => ({
      ...currentCooldowns,
      [operation]: Math.ceil(AI_CONFIG.AI_COOLDOWN_MS / 1000)
    }));
  };

  return { cooldowns, startCooldown };
}

function StepTabs({ step }: { step: 1 | 2 }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <StepCard active={step === 1} done={step > 1} icon={FileText} title="1. Информация" />
      <StepCard active={step === 2} done={false} icon={BookOpen} title="2. Первая глава" />
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

const toolbarItems = [
  { label: "Заголовок", icon: Heading2 },
  { label: "Курсив", icon: Italic },
  { label: "Список", icon: List },
  { label: "Выравнивание", icon: AlignLeft }
];

function normalizeStatus(status: string) {
  if (status === "completed" || status === "draft") {
    return status;
  }

  return "ongoing";
}
