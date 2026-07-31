import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { CommentEditor } from "@/entities/comment/components/comment-editor";
import { CommentList } from "@/entities/comment/components/comment-list";
import { getCurrentUser } from "@/lib/auth/session";
import { getPublicStoryComments } from "@/lib/comments/queries";
import { AppShell } from "@/widgets/app-shell/app-shell";
import { Badge } from "@/shared/ui/badge";

export const dynamic = "force-dynamic";

type CommentsPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: CommentsPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getPublicStoryComments(id);

  return {
    title: result ? `Комментарии к «${result.story.title}» | Листория` : "Комментарии | Листория"
  };
}

export default async function Page({ params }: CommentsPageProps) {
  const { id } = await params;
  const [result, user] = await Promise.all([getPublicStoryComments(id), getCurrentUser().catch(() => null)]);

  if (!result) {
    notFound();
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-4xl space-y-6">
        <Link className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-primary" href={ROUTES.work(id)}>
          <ArrowLeft size={17} />
          К произведению
        </Link>

        <header>
          <Badge>Обсуждение</Badge>
          <h1 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">Комментарии к «{result.story.title}»</h1>
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-text-muted">
            <MessageCircle size={16} />
            {result.comments.length} {commentCountLabel(result.comments.length)}
          </p>
        </header>

        <CommentEditor authenticated={Boolean(user && user.status === "ACTIVE")} storyId={id} />
        <CommentList comments={result.comments} />
      </section>
    </AppShell>
  );
}

function commentCountLabel(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return "комментариев";
  if (last === 1) return "комментарий";
  if (last >= 2 && last <= 4) return "комментария";
  return "комментариев";
}
