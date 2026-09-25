import { SummaryCard } from "@/components/locations/summary-card";
import { summarizeLocation, summarizeReviews } from "@/lib/reviews/summary";
import type { ReviewRow } from "@/types/db";
import type { LocationView, SummaryItem } from "@/types/reviews";

interface LocationSummariesProps {
  locations: LocationView[];
  reviews: ReviewRow[];
  selected: string | null;
  onSelect: (locationId: string | null) => void;
}

/**
 * The summary doubles as the location filter: picking a card narrows the list to it.
 * Below lg it has two rows of the same height, "every location" on its own and
 * the locations side by side, so nothing scrolls sideways; each card then shows
 * a compact version of its numbers.
 */
export function LocationSummaries({ locations, reviews, selected, onSelect }: LocationSummariesProps) {
  return (
    <ul className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-1">
      {summaryItems(locations, reviews).map((item) => (
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
