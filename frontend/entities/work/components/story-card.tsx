import Link from "next/link";
import { Eye, Heart, MessageCircle, Star } from "lucide-react";
import type { Work } from "@/entities/work/types";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";

type StoryCardProps = {
  work: Work;
};

export function StoryCard({ work }: StoryCardProps) {
  return (
    <Link aria-label={`Открыть произведение ${work.title}`} className="block h-full" href={ROUTES.work(work.id)}>
      <Card className="group flex h-[372px] flex-col overflow-hidden" interactive>
        <div className={cn("relative h-36 shrink-0", work.coverClass)}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/38 to-transparent transition duration-200 group-hover:from-black/24" />
          <Badge className="absolute left-4 top-4 border-white/16 bg-black/20 text-white backdrop-blur-[16px]">
            {work.status === "completed" ? "Завершено" : "В процессе"}
          </Badge>
          <div className="absolute bottom-4 left-4 flex items-center gap-1 text-sm font-semibold text-white">
            <Star size={16} />
            {work.rating}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-4">
          <p className="mb-2 text-xs font-medium text-primary">{work.category}</p>
          <h3 className="line-clamp-2 text-lg font-bold leading-tight">{work.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-secondary">{work.description}</p>

          <div className="mt-3 flex h-7 flex-wrap gap-2 overflow-hidden">
            {work.tags.slice(0, 3).map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3 text-xs text-text-muted">
            <span className="truncate">{work.author}</span>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <Eye size={14} />
                {work.views}
              </span>
              <span className="inline-flex items-center gap-1">
                <Heart size={14} />
                {work.likes}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageCircle size={14} />
                {work.commentsCount}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
