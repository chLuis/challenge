import type { ReviewRow } from "@/lib/db/types";
import { isAnswered } from "@/lib/reviews/summary";

export const STATUS_OPTIONS = ["sin-responder", "respondidas", "todas"] as const;
export type StatusFilter = (typeof STATUS_OPTIONS)[number];

export const RATING_OPTIONS = ["1", "2", "3", "4", "5", "sin-calificacion"] as const;
export type RatingFilter = (typeof RATING_OPTIONS)[number];

export interface ReviewFilters {
  location: string | null;
  rating: RatingFilter | null;
  status: StatusFilter;
}

/** Opening the app with no filters shows what is left to answer. */
export const DEFAULT_STATUS: StatusFilter = "sin-responder";

type SearchParams = Record<string, string | string[] | undefined>;
type FilterableReview = Pick<ReviewRow, "location_id" | "rating" | "reply_text">;

/** Unknown or malformed values fall back to "no filter" instead of failing. */
export function parseFilters(params: SearchParams, locationIds: string[]): ReviewFilters {
  const location = first(params.sede);
  const rating = first(params.calificacion);
  const status = first(params.estado);

  return {
    location: location && locationIds.includes(location) ? location : null,
    rating: isOneOf(RATING_OPTIONS, rating) ? rating : null,
    status: isOneOf(STATUS_OPTIONS, status) ? status : DEFAULT_STATUS,
  };
}

export function filtersToQuery(filters: ReviewFilters): string {
  const query = new URLSearchParams();
  if (filters.location) query.set("sede", filters.location);
  if (filters.rating) query.set("calificacion", filters.rating);
  if (filters.status !== DEFAULT_STATUS) query.set("estado", filters.status);
  return query.toString();
}

export function matchesFilters(review: FilterableReview, filters: ReviewFilters): boolean {
  return (
    matchesLocation(review, filters.location) &&
    matchesRating(review, filters.rating) &&
    matchesStatus(review, filters.status)
  );
}

/** How many reviews each status option would show, keeping the other filters. */
export function countByStatus(
  reviews: FilterableReview[],
  filters: ReviewFilters,
): Record<StatusFilter, number> {
  const scoped = reviews.filter(
    (review) => matchesLocation(review, filters.location) && matchesRating(review, filters.rating),
  );
  const answered = scoped.filter(isAnswered).length;

  return {
    "sin-responder": scoped.length - answered,
    respondidas: answered,
    todas: scoped.length,
  };
}

export function hasNarrowingFilters(filters: ReviewFilters): boolean {
  return filters.location !== null || filters.rating !== null;
}

function matchesLocation(review: FilterableReview, location: string | null): boolean {
  return location === null || review.location_id === location;
}

function matchesRating(review: FilterableReview, rating: RatingFilter | null): boolean {
  if (rating === null) return true;
  if (rating === "sin-calificacion") return review.rating === null;
  return review.rating === Number(rating);
}

function matchesStatus(review: FilterableReview, status: StatusFilter): boolean {
  if (status === "todas") return true;
  return isAnswered(review) === (status === "respondidas");
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isOneOf<T extends string>(options: readonly T[], value: string | undefined): value is T {
  return value !== undefined && (options as readonly string[]).includes(value);
}
