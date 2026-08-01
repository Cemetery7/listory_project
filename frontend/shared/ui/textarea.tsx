import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      className={cn(
        "w-full resize-none rounded-md border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none transition duration-200 placeholder:text-text-muted focus:border-primary focus:shadow-hero disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
