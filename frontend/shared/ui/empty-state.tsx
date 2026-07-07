import { BookOpen } from "lucide-react";
import { Button } from "./button";
import { Card } from "./card";

type EmptyStateProps = {
  title: string;
  description: string;
  buttonLabel?: string;
};

export function EmptyState({ title, description, buttonLabel }: EmptyStateProps) {
  return (
    <Card className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-5 grid h-14 w-14 place-items-center rounded-lg bg-primary/15 text-primary">
        <BookOpen size={24} />
      </div>
      <h2 className="text-2xl font-bold leading-tight">{title}</h2>
      <p className="mt-3 max-w-[420px] text-sm leading-6 text-text-secondary">{description}</p>
      {buttonLabel ? <Button className="mt-6">{buttonLabel}</Button> : null}
    </Card>
  );
}
