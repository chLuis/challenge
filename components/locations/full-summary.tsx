import { TONE_TEXT } from "@/components/ui/stars";
import { formatAverage } from "@/lib/format";
import { ratingTone } from "@/lib/reviews/rating-tone";
import type { ReviewsSummary, SummaryItem } from "@/types/reviews";
import AnsweredBar from "./answered-bar";

export function FullSummary({ item }: { item: SummaryItem }) {
  const { summary } = item;
  const pending = summary.reviewCount - summary.answeredCount;

  return (
    <div className="hidden flex-col gap-3 lg:flex">
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium">{item.name}</p>
          {pending > 0 && (
            <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums bg-pending text-pending-text">
              {pending} sin responder
            </span>
          )}
        </div>
        <p className="text-xs text-muted">{item.detail}</p>
      </div>

      {summary.reviewCount === 0 ? (
        <p className="text-sm text-muted">Sin reseñas: no hay promedio que mostrar.</p>
      ) : (
        <>
          <Average summary={summary} />
          <AnsweredBar summary={summary} />
        </>
      )}
    </div>
  );
}

function Average({ summary }: { summary: ReviewsSummary }) {
  if (summary.averageRating === null) {
    return <p className="text-sm text-muted">Ninguna reseña tiene calificación todavía.</p>;
  }

  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-3xl font-semibold tracking-tight tabular-nums">{formatAverage(summary.averageRating)}</span>
      <span aria-hidden className={`text-2xl ${TONE_TEXT[ratingTone(summary.averageRating)]}`}>
        ★
      </span>
      <span className="ml-1 text-xs text-muted">
        promedio de {summary.ratedCount} {summary.ratedCount === 1 ? "calificación" : "calificaciones"}
      </span>
    </div>
  );
}

