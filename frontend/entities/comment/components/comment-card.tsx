import { UserRound } from "lucide-react";
import type { StoryComment } from "@/entities/comment/types";
import { Card } from "@/shared/ui/card";

export function CommentCard({ comment }: { comment: StoryComment }) {
  return (
    <Card className="p-4 md:p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
          <UserRound size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-text-primary">{comment.author.username}</p>
            <time className="text-xs text-text-muted" dateTime={comment.createdAt.toISOString()}>
              {formatCommentDate(comment.createdAt)}
            </time>
          </div>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-text-secondary">{comment.content}</p>
        </div>
      </div>
    </Card>
  );
}

function formatCommentDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
