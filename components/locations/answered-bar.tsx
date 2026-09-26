import { formatPercent } from "@/lib/format";
import { ReviewsSummary } from "@/types/reviews";

export default function AnsweredBar({ summary }: { summary: ReviewsSummary }) {
  const ratio = summary.answeredRatio ?? 0;
  return (
    <div>
      <div className="hidden lg:flex h-1.5 overflow-hidden rounded-full bg-border" aria-hidden>
        <div className="h-full rounded-full bg-primary" style={{ width: `${ratio * 100}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-muted tabular-nums flex flex-nowrap gap-1">
        {formatPercent(ratio)} respondidas<span className="hidden lg:flex"> · {summary.answeredCount} de {summary.reviewCount}</span>
      </p>
    </div>
  );
}