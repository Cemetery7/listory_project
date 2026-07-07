import { ArrowRight } from "lucide-react";

export function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h2 className="text-[28px] font-bold leading-tight">{title}</h2>
      <button className="inline-flex items-center gap-2 text-sm font-medium text-primary transition duration-200 hover:text-primary-hover" type="button">
        Смотреть все
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
