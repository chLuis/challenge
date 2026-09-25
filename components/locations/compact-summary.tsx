import { TONE_TEXT } from "@/components/ui/stars";
import { formatAverage, formatPercent } from "@/lib/format";
import { ratingTone } from "@/lib/reviews/rating-tone";
import type { ReviewsSummary, SummaryItem } from "@/types/reviews";

/** Mobile, full-width row: name on the left, average and share answered on the right. */
export function CompactOverall({ item }: { item: SummaryItem }) {
  const { summary } = item;
  return (
    <div className="flex h-full items-center justify-between gap-3 lg:hidden">
      <div className="min-w-0">
        <p className="font-medium">{item.name}</p>
        <p className="truncate text-xs text-muted">{item.detail}</p>
      </div>
      <div className="shrink-0 text-right">
        <CompactAverage summary={summary} size="text-2xl" />
        {summary.answeredRatio !== null && (
          <p className="text-xs text-muted tabular-nums">{formatPercent(summary.answeredRatio)} respondidas</p>
        )}
      </div>
    </div>
  );
}

/** Mobile, one third of a row: name, average and what is left to answer. */
export function CompactLocation({ item }: { item: SummaryItem }) {
  const { summary } = item;
  const pending = summary.reviewCount - summary.answeredCount;

  return (
    <div className="flex h-full flex-col justify-between lg:hidden">
      <p className="truncate text-sm font-medium">{item.name}</p>
      {summary.reviewCount === 0 ? (
        <p className="text-xs text-muted">Sin reseñas todavía</p>
      ) : (
        <>
          <CompactAverage summary={summary} size="text-xl" />
          <p className="truncate text-xs text-muted tabular-nums">
            {pending === 0 ? "Todo respondido" : `${pending} ${pending === 1 ? "pendiente" : "pendientes"}`}
          </p>
        </>
      )}
    </div>
  );
}

function CompactAverage({ summary, size }: { summary: ReviewsSummary; size: string }) {
  if (summary.averageRating === null) {
    return <p className="text-xs text-muted">Sin calificaciones</p>;
  }
  return (
    <p className={`font-semibold leading-none tracking-tight tabular-nums ${size}`}>
      {formatAverage(summary.averageRating)}
      <span aria-hidden className={`ml-1 text-base ${TONE_TEXT[ratingTone(summary.averageRating)]}`}>
        ★
      </span>
    </p>
  );
}
