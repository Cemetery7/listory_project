import React from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { escapeRawHtml } from "@/lib/chapters/markdown";
import { cn } from "@/lib/utils";

type ChapterContentProps = {
  className?: string;
  content: string;
};

const allowedElements = ["h2", "p", "em", "strong", "ul", "ol", "li", "blockquote", "br"];

export function ChapterContent({ className, content }: ChapterContentProps) {
  return (
    <div className={cn("min-w-0 break-words", className)}>
      <ReactMarkdown
        allowedElements={allowedElements}
        components={{
          h2: ({ children }) => <h2 className="mb-4 mt-8 break-words text-[1.35em] font-bold leading-tight first:mt-0">{children}</h2>,
          p: ({ children }) => <p className="my-5 whitespace-pre-wrap break-words first:mt-0 last:mb-0">{children}</p>,
          em: ({ children }) => <em className="italic">{children}</em>,
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          ul: ({ children }) => <ul className="my-5 list-disc space-y-2 pl-6">{children}</ul>,
          ol: ({ children }) => <ol className="my-5 list-decimal space-y-2 pl-6">{children}</ol>,
          li: ({ children }) => <li className="break-words pl-1">{children}</li>,
          blockquote: ({ children }) => <blockquote className="my-6 border-l-4 border-primary bg-elevated px-4 py-1 text-[color:var(--text-secondary)]">{children}</blockquote>
        }}
        remarkPlugins={[remarkGfm, remarkBreaks]}
        skipHtml
        unwrapDisallowed
      >
        {escapeRawHtml(content)}
      </ReactMarkdown>
    </div>
  );
}
