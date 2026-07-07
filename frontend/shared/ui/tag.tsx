import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TagBaseProps = {
  label: string;
  active?: boolean;
};

type ButtonTagProps = TagBaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { onClick: () => void };
type SpanTagProps = TagBaseProps & HTMLAttributes<HTMLSpanElement> & { onClick?: undefined };

export function Tag(props: ButtonTagProps | SpanTagProps) {
  const { label, active = false, className, ...restProps } = props;
  const classes = cn(
    "inline-flex h-8 items-center rounded-full border border-border px-3 text-xs font-medium transition duration-200",
    active ? "border-primary bg-primary text-white" : "bg-surface text-text-secondary hover:border-[color:var(--border-hover)] hover:text-primary",
    className
  );

  if (props.onClick) {
    return (
      <button className={classes} type="button" {...(restProps as ButtonHTMLAttributes<HTMLButtonElement>)}>
        {label}
      </button>
    );
  }

  return (
    <span className={classes} {...(restProps as HTMLAttributes<HTMLSpanElement>)}>
      {label}
    </span>
  );
}
