"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Filters } from "@/components/filters";
import { LocationSummaries, type SummaryItem } from "@/components/location-summaries";
import { ReviewCard } from "@/components/review-card";
import { ThemeToggle } from "@/components/theme-toggle";
import type { ReviewRow } from "@/lib/db/types";
import { formatLongDate } from "@/lib/format";
import {
  countByStatus,
  filtersToQuery,
  hasNarrowingFilters,
  matchesFilters,
  parseFilters,
  type ReviewFilters,
} from "@/lib/reviews/filters";
import { isLowRating } from "@/lib/reviews/rating-tone";
import type { LocationView } from "@/lib/reviews/repository";
import { isAnswered, summarizeLocation, summarizeReviews } from "@/lib/reviews/summary";

interface InboxProps {
  locations: LocationView[];
  reviews: ReviewRow[];
  aiConfigured: boolean;
}

/**
 * The server sends every review once; filtering happens here. Filters live in
 * the URL through history.replaceState, which Next keeps in sync with
 * useSearchParams without a round trip to the server or the database.
 */
export function Inbox({ locations, reviews, aiConfigured }: InboxProps) {
  const searchParams = useSearchParams();
  const [notice, setNotice] = useState<string | null>(null);

  const filters = parseFilters(
    Object.fromEntries(searchParams),
    locations.map((location) => location.id),
  );
  const visible = reviews.filter((review) => matchesFilters(review, filters));
  const locationsById = new Map(locations.map((location) => [location.id, location]));
  const selectedLocation = filters.location ? locationsById.get(filters.location) : undefined;

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  return (
    <div className="flex flex-col gap-8">
      <Headline reviews={reviews} />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8">
        <aside aria-labelledby="summary-heading" className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-6">
          <h2 id="summary-heading" className="text-sm font-medium text-muted">
            Resumen por sede
          </h2>
          <LocationSummaries
            items={summaryItems(locations, reviews)}
            selected={filters.location}
            onSelect={(location) => applyFilters({ ...filters, location })}
          />
        </aside>

        <section aria-labelledby="list-heading" className="flex min-w-0 flex-col gap-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="list-heading" className="text-lg font-semibold tracking-tight">
              {selectedLocation ? `Reseñas de ${selectedLocation.name}` : "Reseñas de todas las sedes"}
            </h2>
            {selectedLocation && (
              <button
                type="button"
                onClick={() => applyFilters({ ...filters, location: null })}
                className="shrink-0 text-sm text-muted underline underline-offset-2 hover:text-text"
              >
                Ver todas las sedes
              </button>
            )}
          </div>

          <Filters filters={filters} counts={countByStatus(reviews, filters)} onChange={applyFilters} />

          {visible.length === 0 ? (
            <EmptyList
              filters={filters}
              hasAnyReview={reviews.length > 0}
              emptyLocation={emptyLocationName(filters, locations, reviews)}
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {visible.map((review) => (
                <li key={review.id}>
                  <ReviewCard
                    review={review}
                    location={locationsById.get(review.location_id)}
                    aiConfigured={aiConfigured}
                    onReplySaved={(author) => setNotice(`Guardamos la respuesta a ${author}.`)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-10 flex justify-center px-4">
        {notice && (
          <p className="rounded-full bg-primary px-4 py-2 text-sm text-primary-text shadow-lg">✓ {notice}</p>
        )}
      </div>
    </div>
  );
}

/** What the person came for, first: how much is left and where to start. */
function Headline({ reviews }: { reviews: ReviewRow[] }) {
  const pending = reviews.filter((review) => !isAnswered(review));
  const lowRated = pending.filter((review) => isLowRating(review.rating)).length;

  return (
    <header className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted first-letter:uppercase" suppressHydrationWarning>
          {formatLongDate(new Date())}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {pending.length === 0
            ? "Todo respondido"
            : `${pending.length} ${pending.length === 1 ? "reseña" : "reseñas"} sin responder`}
        </h1>
        <p className="text-muted">{headlineDetail(pending.length, lowRated)}</p>
      </div>
      <ThemeToggle />
    </header>
  );
}

function headlineDetail(pending: number, lowRated: number): string {
  if (pending === 0) return "Las reseñas nuevas van a aparecer acá cuando se importe el próximo archivo.";
  if (lowRated === 0) return "Ninguna es de 1 o 2 estrellas.";
  if (lowRated === 1) return "Una es de 1 o 2 estrellas: conviene empezar por esa.";
  return `${lowRated} son de 1 o 2 estrellas: conviene empezar por esas.`;
}

function summaryItems(locations: LocationView[], reviews: ReviewRow[]): SummaryItem[] {
  const restaurantCount = new Set(locations.map((location) => location.restaurantName)).size;

  return [
    {
      locationId: null,
      name: "Todas las sedes",
      detail: `${restaurantCount} ${restaurantCount === 1 ? "restaurante" : "restaurantes"} · ${locations.length} sedes`,
      summary: summarizeReviews(reviews),
    },
    ...locations.map((location) => ({
      locationId: location.id,
      name: location.name,
      detail: location.restaurantName,
      summary: summarizeLocation(location.id, reviews),
    })),
  ];
}

function applyFilters(filters: ReviewFilters) {
  const query = filtersToQuery(filters);
  window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
}

/** Name of the selected location when it has no reviews at all, whatever the other filters. */
function emptyLocationName(
  filters: ReviewFilters,
  locations: LocationView[],
  reviews: ReviewRow[],
): string | null {
  if (!filters.location) return null;
  if (reviews.some((review) => review.location_id === filters.location)) return null;
  return locations.find((location) => location.id === filters.location)?.name ?? null;
}

interface EmptyListProps {
  filters: ReviewFilters;
  hasAnyReview: boolean;
  emptyLocation: string | null;
}

function EmptyList({ filters, hasAnyReview, emptyLocation }: EmptyListProps) {
  if (!hasAnyReview) {
    return (
      <EmptyMessage title="Todavía no hay reseñas cargadas.">
        Importá el archivo con <code className="rounded bg-bg px-1">npm run import</code> y volvé a abrir esta página.
      </EmptyMessage>
    );
  }

  if (emptyLocation) {
    return (
      <EmptyMessage title={`${emptyLocation} todavía no tiene reseñas.`}>
        Cuando lleguen en el próximo archivo importado, van a aparecer acá.
      </EmptyMessage>
    );
  }

  if (!hasNarrowingFilters(filters) && filters.status === "sin-responder") {
    return <EmptyMessage title="No queda nada por responder.">Las reseñas nuevas van a aparecer acá.</EmptyMessage>;
  }

  return (
    <EmptyMessage title="Ninguna reseña coincide con estos filtros.">
      <button
        type="button"
        onClick={() => applyFilters({ ...filters, location: null, rating: null })}
        className="underline underline-offset-2"
      >
        Ver todas las sedes y calificaciones
      </button>
    </EmptyMessage>
  );
}

function EmptyMessage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted">{children}</p>
    </div>
  );
}
