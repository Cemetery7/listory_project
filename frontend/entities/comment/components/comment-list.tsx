import { MessageCircle } from "lucide-react";
import type { StoryComment } from "@/entities/comment/types";
import { CommentCard } from "./comment-card";

export function CommentList({ comments, authenticated, storyId }: { comments: StoryComment[]; authenticated: boolean; storyId: string }) {
  if (comments.length === 0) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-border bg-card px-6 py-10 text-center shadow-card">
        <div className="grid h-12 w-12 place-items-center rounded-md bg-primary/15 text-primary">
          <MessageCircle size={21} />
        </div>
        <h2 className="mt-4 text-xl font-bold">Комментариев пока нет</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-text-muted">Начните обсуждение произведения и поделитесь впечатлением с другими читателями.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <CommentCard authenticated={authenticated} comment={comment} key={comment.id} storyId={storyId} />
      ))}
    </div>
  );
}
