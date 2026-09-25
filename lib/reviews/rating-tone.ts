import type { RatingTone } from "@/types/reviews";

/**
 * One scale for single ratings and for averages, so the same color always
 * means the same thing: 4 or more is good, from 3 is regular, below 3 is bad.
 */
export function ratingTone(value: number): RatingTone {
  if (value >= 4) return "good";
  if (value >= 3) return "regular";
  return "bad";
}

export function isLowRating(rating: number | null): boolean {
  return rating !== null && rating <= 2;
}
