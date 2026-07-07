import { Clock3, Flame, PenLine, Sparkles } from "lucide-react";
import { authors, categories, tags, updates } from "@/data/mock";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

export function RightPanel() {
  return (
    <aside className="space-y-4 xl:sticky xl:top-[96px]">
      <section className="rounded-lg border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <Flame className="text-primary" size={18} />
          <h3 className="font-semibold">Популярные авторы</h3>
        </div>
        <div className="space-y-4">
          {authors.map((author) => (
            <div key={author.id} className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-xs font-bold text-white">{author.avatar}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{author.name}</p>
                <p className="text-xs text-text-muted">
                  {author.handle} · {author.worksCount} работ
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="text-primary" size={18} />
          <h3 className="font-semibold">Категории</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge key={category}>{category}</Badge>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5 shadow-card">
        <h3 className="mb-4 font-semibold">Популярные теги</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} className="hover:border-[color:var(--border-hover)] hover:text-primary">
              #{tag}
            </Badge>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <Clock3 className="text-primary" size={18} />
          <h3 className="font-semibold">Последние обновления</h3>
        </div>
        <div className="space-y-4">
          {updates.map((item) => (
            <div key={item.id} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-xs text-text-muted">
                {item.chapter} · {item.time}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-elevated p-5 shadow-card">
        <div className="mb-4 grid h-10 w-10 place-items-center rounded-md bg-primary/15 text-primary">
          <PenLine size={18} />
        </div>
        <h3 className="font-semibold">Опубликуйте первую главу</h3>
        <p className="mt-2 text-sm leading-6 text-text-secondary">AI подскажет теги, описание и короткое саммари для карточки.</p>
        <Button className="mt-4 w-full">Начать</Button>
      </section>
    </aside>
  );
}
