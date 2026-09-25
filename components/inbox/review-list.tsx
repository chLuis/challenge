import { EmptyList } from "@/components/inbox/empty-list";
import { FilterBar } from "@/components/reviews/filter-bar";
import { ReviewCard } from "@/components/reviews/review-card";
import { countByStatus, matchesFilters } from "@/lib/reviews/filters";
import type { ReviewRow } from "@/types/db";
import type { LocationView, ReviewFilters } from "@/types/reviews";

interface ReviewListProps {
  filters: ReviewFilters;
  locations: LocationView[];
  reviews: ReviewRow[];
  aiConfigured: boolean;
  onFiltersChange: (filters: ReviewFilters) => void;
}

export function ReviewList({ filters, locations, reviews, aiConfigured, onFiltersChange }: ReviewListProps) {
  const visible = reviews.filter((review) => matchesFilters(review, filters));
  const locationsById = new Map(locations.map((location) => [location.id, location]));
  const selectedLocation = filters.location ? locationsById.get(filters.location) : undefined;

  return (
    <section aria-labelledby="list-heading" className="flex min-w-0 flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="list-heading" className="text-lg font-semibold tracking-tight">
          {selectedLocation ? `Reseñas de ${selectedLocation.name}` : "Reseñas de todas las sedes"}
        </h2>
        {selectedLocation && (
          <button
            type="button"
            onClick={() => onFiltersChange({ ...filters, location: null })}
            className="cursor-pointer shrink-0 text-sm text-muted underline underline-offset-2 hover:text-text"
          >
            Ver todas las sedes
          </button>
        )}
      </div>

      <FilterBar filters={filters} counts={countByStatus(reviews, filters)} onChange={onFiltersChange} />

      {visible.length === 0 ? (
        <EmptyList
          filters={filters}
          hasAnyReview={reviews.length > 0}
          emptyLocation={emptyLocationName(filters, locations, reviews)}
          onClearFilters={() => onFiltersChange({ ...filters, location: null, rating: null })}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((review) => (
            <li key={review.id}>
              <ReviewCard
                review={review}
                location={locationsById.get(review.location_id)}
                aiConfigured={aiConfigured}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Name of the selected location when it has no reviews at all, whatever the other filters. */
function emptyLocationName(filters: ReviewFilters, locations: LocationView[], reviews: ReviewRow[]): string | null {
  if (!filters.location) return null;
  if (reviews.some((review) => review.location_id === filters.location)) return null;
  return locations.find((location) => location.id === filters.location)?.name ?? null;
}
