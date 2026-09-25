"use client";

import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { InboxHeader } from "@/components/inbox/inbox-header";
import { ReviewList } from "@/components/inbox/review-list";
import { LocationSummaries } from "@/components/locations/location-summaries";
import { filtersToQuery, parseFilters } from "@/lib/reviews/filters";
import type { ReviewRow } from "@/types/db";
import type { LocationView, ReviewFilters } from "@/types/reviews";

interface InboxProps {
  locations: LocationView[];
  reviews: ReviewRow[];
  aiConfigured: boolean;
  themeToggle: ReactNode;
}

export function Inbox({ locations, reviews, aiConfigured, themeToggle }: InboxProps) {
  const searchParams = useSearchParams();
  const filters = parseFilters(
    Object.fromEntries(searchParams),
    locations.map((location) => location.id),
  );

  return (
    <div className="flex flex-col gap-1 lg:gap-4">
      <InboxHeader reviews={reviews} themeToggle={themeToggle} />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8">
        <aside aria-labelledby="summary-heading" className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-6">
          <h2 id="summary-heading" className="text-sm font-medium text-muted">
            Resumen por sede
          </h2>
          <LocationSummaries
            locations={locations}
            reviews={reviews}
            selected={filters.location}
            onSelect={(location) => applyFilters({ ...filters, location })}
          />
        </aside>

        <ReviewList
          filters={filters}
          locations={locations}
          reviews={reviews.sort((a, b) => Number(a.rating) - Number(b.rating))}
          aiConfigured={aiConfigured}
          onFiltersChange={applyFilters}
        />
      </div>
    </div>
  );
}

function applyFilters(filters: ReviewFilters) {
  const query = filtersToQuery(filters);
  window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
}
