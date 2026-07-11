import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastProps = {
  message: string;
  visible: boolean;
};

export function Toast({ message, visible }: ToastProps) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "fixed bottom-6 left-4 right-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-lg border border-border bg-elevated px-4 py-3 text-sm font-medium text-text-primary shadow-floating transition duration-200 md:left-auto md:right-8 md:mx-0",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      )}
      role="status"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
        <CheckCircle2 size={18} />
      </span>
      {message}
    </div>
  );
}
