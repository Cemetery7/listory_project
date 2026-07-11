import Link from "next/link";
import { Clock3, Flame, PenLine, Sparkles } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { Work } from "@/entities/work/types";
import { Badge } from "@/shared/ui/badge";

const categories = ["Оригинальные", "В процессе", "Завершено"];
const tags = ["в процессе", "завершено", "черновик"];

export function RightPanel({ works }: { works: Work[] }) {
  const authors = Array.from(new Set(works.map((work) => work.author))).slice(0, 3);
  const updates = works.slice(0, 3);

  return (
    <aside className="space-y-4 xl:sticky xl:top-[96px]">
      <section className="rounded-lg border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <Flame className="text-primary" size={18} />
          <h3 className="font-semibold">Популярные авторы</h3>
        </div>
        <div className="space-y-4">
          {authors.length > 0 ? authors.map((author) => (
            <div key={author} className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-xs font-bold text-white">{author.slice(0, 2).toUpperCase()}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{author}</p>
                <p className="text-xs text-text-muted">
                  Автор Листории
                </p>
              </div>
            </div>
          )) : <p className="text-sm leading-6 text-text-muted">Авторы появятся после первой публикации.</p>}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="text-primary" size={18} />
          <h3 className="font-semibold">Категории</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link href={`${ROUTES.CATALOG}?category=${encodeURIComponent(category)}`} key={category}>
              <Badge className="transition duration-200 hover:border-[color:var(--border-hover)] hover:text-primary">{category}</Badge>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5 shadow-card">
        <h3 className="mb-4 font-semibold">Популярные теги</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link href={`${ROUTES.CATALOG}?tag=${encodeURIComponent(tag)}`} key={tag}>
              <Badge className="transition duration-200 hover:border-[color:var(--border-hover)] hover:text-primary">#{tag}</Badge>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <Clock3 className="text-primary" size={18} />
          <h3 className="font-semibold">Последние обновления</h3>
        </div>
        <div className="space-y-4">
          {updates.length > 0 ? updates.map((item) => (
            <Link href={ROUTES.work(item.id)} key={item.id} className="block border-b border-border pb-4 transition duration-200 hover:text-primary last:border-b-0 last:pb-0">
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-xs text-text-muted">
                {item.chaptersCount} глав · {item.updatedAt}
              </p>
            </Link>
          )) : <p className="text-sm leading-6 text-text-muted">Обновления появятся после публикаций.</p>}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-elevated p-5 shadow-card">
        <div className="mb-4 grid h-10 w-10 place-items-center rounded-md bg-primary/15 text-primary">
          <PenLine size={18} />
        </div>
        <h3 className="font-semibold">Опубликуйте первую главу</h3>
        <p className="mt-2 text-sm leading-6 text-text-secondary">AI подскажет теги, описание и короткое саммари для карточки.</p>
        <Link
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-white shadow-hero transition duration-200 hover:bg-primary-hover"
          href={ROUTES.CREATE}
        >
          Начать
        </Link>
      </section>
    </aside>
  );
}
