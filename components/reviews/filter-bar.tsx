import { RATING_OPTIONS, STATUS_OPTIONS } from "@/lib/reviews/filters";
import type { RatingFilter, ReviewFilters, StatusFilter } from "@/types/reviews";

const STATUS_LABELS: Record<StatusFilter, string> = {
  "sin-responder": "Sin responder",
  respondidas: "Respondidas",
  todas: "Todas",
};

const RATING_LABELS: Record<RatingFilter, string> = {
  "5": "5 estrellas",
  "4": "4 estrellas",
  "3": "3 estrellas",
  "2": "2 estrellas",
  "1": "1 estrella",
  "sin-calificacion": "Sin calificación",
};

interface FilterBarProps {
  filters: ReviewFilters;
  counts: Record<StatusFilter, number>;
  onChange: (filters: ReviewFilters) => void;
}

/** Status and rating. The location is picked from the summary cards. */
export function FilterBar({ filters, counts, onChange }: FilterBarProps) {
  function update(change: Partial<ReviewFilters>) {
    onChange({ ...filters, ...change });
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div role="group" aria-label="Estado" className="flex rounded-lg border border-border bg-surface p-1 shadow-sm">
        {STATUS_OPTIONS.map((status) => {
          const selected = filters.status === status;
          return (
            <button
              key={status}
              type="button"
              aria-pressed={selected}
              onClick={() => update({ status })}
              className={`cursor-pointer flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-md px-1.5 py-1.5 text-xs transition-colors md:flex-none md:gap-1.5 md:px-3 sm:text-sm ${
                selected ? "bg-primary text-primary-text" : "text-muted hover:text-text"
              }`}
            >
              {STATUS_LABELS[status]}
              <span className="tabular-nums border rounded-full w-7 h-7 flex items-center justify-center">{counts[status]}</span>
            </button>
          );
        })}
      </div>

      <label className="flex items-center gap-2 text-sm text-muted">
        Calificación
        <select
          className="h-12.5 rounded-lg border border-border bg-surface px-2.5 text-sm text-text shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          value={filters.rating ?? ""}
          onChange={(event) => update({ rating: (event.target.value || null) as RatingFilter | null })}
        >
          <option value="">Todas</option>
          {RATING_OPTIONS.map((rating) => (
            <option key={rating} value={rating}>
              {RATING_LABELS[rating]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
