import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
};

export function Card({ className, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card shadow-card",
        interactive && "transition duration-200 hover:-translate-y-1 hover:border-[color:var(--border-hover)]",
        className
      )}
      {...props}
    />
  );
}
