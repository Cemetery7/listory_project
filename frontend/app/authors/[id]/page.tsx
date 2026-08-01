import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, CalendarDays, Heart, UserRound, UsersRound } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { StoryCard } from "@/entities/work/components/story-card";
import { FollowButton } from "@/features/author-follow/follow-button";
import { isUuid } from "@/lib/api/validation";
import { getPublicAuthor } from "@/lib/authors/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { AppShell } from "@/widgets/app-shell/app-shell";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";

export const dynamic = "force-dynamic";

type AuthorPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { id } = await params;
  const author = isUuid(id) ? await getPublicAuthor(id) : null;
  return { title: author ? `${author.username} | Листория` : "Автор не найден | Листория" };
}

export default async function Page({ params }: AuthorPageProps) {
  const { id } = await params;

  if (!isUuid(id)) {
    notFound();
  }

  const user = await getCurrentUser().catch(() => null);
  const author = await getPublicAuthor(id, user?.id);

  if (!author) {
    notFound();
  }

  const ownProfile = user?.id === author.id;

  return (
    <AppShell>
      <section className="space-y-6">
        <Card className="p-5 md:p-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
              <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-lg bg-primary/15 text-primary">
                {author.avatar ? <Image alt={`Аватар ${author.username}`} className="h-full w-full object-cover" height={96} priority src={author.avatar} width={96} /> : <UserRound size={38} />}
              </div>
              <div className="min-w-0">
                <Badge>Автор Листории</Badge>
                <h1 className="mt-3 break-words text-4xl font-bold leading-tight md:text-5xl">{author.username}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">{author.bio?.trim() || "Автор пока не добавил описание профиля."}</p>
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-text-muted"><CalendarDays size={16} />На Листории с {formatDate(author.createdAt)}</p>
                {ownProfile ? <p className="mt-3 text-sm font-medium text-primary">Это ваш публичный профиль</p> : null}
              </div>
            </div>
            {ownProfile ? (
              <Link className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-medium transition hover:border-[color:var(--border-hover)]" href={ROUTES.PROFILE}>Редактировать профиль</Link>
            ) : (
              <FollowButton authenticated={Boolean(user?.status === "ACTIVE")} authorId={author.id} initialFollowing={author.following} />
            )}
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 border-t border-border pt-6 lg:grid-cols-5">
            <Stat icon={BookOpen} label="Произведения" value={author.storiesCount} />
            <Stat icon={UsersRound} label="Подписчики" value={author.followersCount} />
            <Stat icon={UserRound} label="Подписки" value={author.followingCount} />
            <Stat icon={Heart} label="Лайки работ" value={author.likesCount} />
            <Stat icon={BookOpen} label="Главы" value={author.stories.reduce((total, story) => total + story.chaptersCount, 0)} />
          </div>
        </Card>

        <section>
          <h2 className="text-2xl font-bold">Опубликованные произведения</h2>
          <p className="mt-2 text-sm text-text-muted">Публичные истории автора, сначала недавно обновлённые.</p>
          {author.stories.length ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {author.stories.map((story) => <StoryCard key={story.id} work={story} />)}
            </div>
          ) : (
            <div className="mt-5"><EmptyState title="Публичных произведений пока нет" description="Черновики и скрытые работы здесь не отображаются." /></div>
          )}
        </section>
      </section>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: number }) {
  return <div className="min-w-0 rounded-md bg-surface p-4"><Icon className="text-primary" size={18} /><p className="mt-3 text-xl font-bold">{value.toLocaleString("ru-RU")}</p><p className="mt-1 truncate text-xs text-text-muted">{label}</p></div>;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(date);
}
