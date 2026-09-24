import type { ReviewRow } from "@/lib/db/types";

type SummarizableReview = Pick<ReviewRow, "location_id" | "rating" | "reply_text">;

export interface ReviewsSummary {
  reviewCount: number;
  ratedCount: number;
  /** null when none of the reviews has a rating: there is no average to show. */
  averageRating: number | null;
  answeredCount: number;
  /** Between 0 and 1. null when there are no reviews. */
  answeredRatio: number | null;
}

export interface LocationSummary extends ReviewsSummary {
  locationId: string;
}

export function isAnswered(review: Pick<ReviewRow, "reply_text">): boolean {
  return review.reply_text !== null;
}

export function summarizeReviews(reviews: Omit<SummarizableReview, "location_id">[]): ReviewsSummary {
  const ratings = reviews.flatMap((review) => (review.rating === null ? [] : [review.rating]));
  const answeredCount = reviews.filter(isAnswered).length;

  return {
    reviewCount: reviews.length,
    ratedCount: ratings.length,
    averageRating: ratings.length === 0 ? null : sum(ratings) / ratings.length,
    answeredCount,
    answeredRatio: reviews.length === 0 ? null : answeredCount / reviews.length,
  };
}

export function summarizeLocation(
  locationId: string,
  reviews: SummarizableReview[],
): LocationSummary {
  const own = reviews.filter((review) => review.location_id === locationId);
  return { locationId, ...summarizeReviews(own) };
}

export function summarizeLocations(
  locationIds: string[],
  reviews: SummarizableReview[],
): LocationSummary[] {
  return locationIds.map((id) => summarizeLocation(id, reviews));
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
