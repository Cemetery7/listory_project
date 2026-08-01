"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { UserRound } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { StoryComment } from "@/entities/comment/types";
import { Card } from "@/shared/ui/card";
import { CommentEditor } from "./comment-editor";

export function CommentCard({ comment, authenticated, storyId, nested = false }: { comment: StoryComment; authenticated: boolean; storyId: string; nested?: boolean }) {
  const [replying, setReplying] = useState(false);

  const content = (
      <div className="flex items-start gap-3">
        <Link aria-label={`Профиль автора ${comment.author.username}`} className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-md bg-primary/15 text-primary" href={ROUTES.author(comment.author.id)}>
          {comment.author.avatar ? <Image alt="" className="h-full w-full object-cover" height={40} src={comment.author.avatar} width={40} /> : <UserRound size={18} />}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link className="font-semibold text-text-primary transition hover:text-primary" href={ROUTES.author(comment.author.id)}>{comment.author.username}</Link>
            <time className="text-xs text-text-muted" dateTime={comment.createdAt.toISOString()}>
              {formatCommentDate(comment.createdAt)}
            </time>
          </div>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-text-secondary">{comment.content}</p>
          <button className="mt-3 text-sm font-medium text-primary hover:text-primary-hover" onClick={() => setReplying((value) => !value)} type="button">{replying ? "Отмена" : "Ответить"}</button>
          {replying ? <div className="mt-4 border-t border-border pt-4"><CommentEditor authenticated={authenticated} embedded onSubmitted={() => setReplying(false)} parentId={comment.id} storyId={storyId} /></div> : null}
          {comment.replies?.length ? <div className="mt-4 space-y-3 border-l-2 border-border pl-3 sm:pl-4">{comment.replies.map((reply) => <CommentCard authenticated={authenticated} comment={reply} key={reply.id} nested storyId={storyId} />)}</div> : null}
        </div>
      </div>
  );

  return nested ? <div className="rounded-md bg-surface p-3 sm:p-4">{content}</div> : <Card className="p-4 md:p-5">{content}</Card>;
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
