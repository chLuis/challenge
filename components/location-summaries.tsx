import { TONE_TEXT } from "@/components/stars";
import { formatAverage, formatPercent } from "@/lib/format";
import { ratingTone } from "@/lib/reviews/rating-tone";
import type { ReviewsSummary } from "@/lib/reviews/summary";

export interface SummaryItem {
  /** null stands for "every location". */
  locationId: string | null;
  name: string;
  detail: string;
  summary: ReviewsSummary;
}

interface LocationSummariesProps {
  items: SummaryItem[];
  selected: string | null;
  onSelect: (locationId: string | null) => void;
}

/**
 * The summary doubles as the location filter: picking a card narrows the list to it.
 * Below lg it has two rows of the same height, "every location" on its own and
 * the locations side by side, so nothing scrolls sideways; each card then shows
 * a compact version of its numbers.
 */
export function LocationSummaries({ items, selected, onSelect }: LocationSummariesProps) {
  return (
    <ul className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-1">
      {items.map((item) => (
        <li key={item.locationId ?? "all"} className={item.locationId === null ? "col-span-3 lg:col-span-1" : ""}>
          <SummaryCard
            item={item}
            selected={selected === item.locationId}
            onSelect={() => onSelect(item.locationId)}
          />
        </li>
      ))}
    </ul>
  );
}

function SummaryCard({ item, selected, onSelect }: { item: SummaryItem; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`h-24 w-full rounded-xl border bg-surface p-3 text-left shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-4 lg:h-auto lg:p-4 ${
        selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-muted"
      }`}
    >
      {item.locationId === null ? <CompactOverall item={item} /> : <CompactLocation item={item} />}
      <FullCard item={item} />
    </button>
  );
}

/** Mobile, full-width row: name on the left, average and share answered on the right. */
function CompactOverall({ item }: { item: SummaryItem }) {
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
function CompactLocation({ item }: { item: SummaryItem }) {
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

/** Desktop sidebar: every number, stacked. */
function FullCard({ item }: { item: SummaryItem }) {
  const { summary } = item;
  const pending = summary.reviewCount - summary.answeredCount;

  return (
    <div className="hidden flex-col gap-3 lg:flex">
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium">{item.name}</p>
          {pending > 0 && (
            <span className="shrink-0 rounded-full bg-bg px-2 py-0.5 text-xs font-medium tabular-nums">
              {pending} sin responder
            </span>
          )}
        </div>
        <p className="text-xs text-muted">{item.detail}</p>
      </div>

      {summary.reviewCount === 0 ? (
        <p className="text-sm text-muted">Sin reseñas todavía: no hay promedio que mostrar.</p>
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
      <span aria-hidden className={`text-lg ${TONE_TEXT[ratingTone(summary.averageRating)]}`}>
        ★
      </span>
      <span className="ml-1 text-xs text-muted">
        promedio de {summary.ratedCount} {summary.ratedCount === 1 ? "calificación" : "calificaciones"}
      </span>
    </div>
  );
}

function AnsweredBar({ summary }: { summary: ReviewsSummary }) {
  const ratio = summary.answeredRatio ?? 0;
  return (
    <div>
      <div className="h-1.5 overflow-hidden rounded-full bg-border" aria-hidden>
        <div className="h-full rounded-full bg-primary" style={{ width: `${ratio * 100}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-muted tabular-nums">
        {formatPercent(ratio)} respondidas · {summary.answeredCount} de {summary.reviewCount}
      </p>
    </div>
  );
}
