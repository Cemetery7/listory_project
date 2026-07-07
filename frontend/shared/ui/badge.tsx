import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full border border-border bg-surface px-3 text-xs font-medium text-text-secondary",
        className
      )}
      {...props}
    />
  );
}
