import { Sparkles } from "lucide-react";

interface TLDRBlockProps {
  bullets: string[] | null | undefined;
  className?: string;
}

export const TLDRBlock = ({ bullets, className = "" }: TLDRBlockProps) => {
  const cleaned = (bullets ?? []).map((b) => b.trim()).filter(Boolean);
  if (cleaned.length === 0) return null;

  return (
    <aside
      aria-label="TL;DR"
      className={`rounded-xl border border-primary/20 bg-primary/5 p-5 mb-8 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" aria-hidden />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary m-0">
          TL;DR
        </h2>
      </div>
      <ul className="space-y-2 list-disc list-outside pl-5 marker:text-primary text-sm sm:text-base text-foreground">
        {cleaned.map((bullet, i) => (
          <li key={i} className="leading-relaxed">
            {bullet}
          </li>
        ))}
      </ul>
    </aside>
  );
};
