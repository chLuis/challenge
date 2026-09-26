import { isAnswered } from "@/lib/reviews/summary";
import type { ReviewRow } from "@/types/db";

type SortableReview = Pick<ReviewRow, "rating" | "published_at" | "reply_text">;

export function sortByUrgency<T extends SortableReview>(reviews: T[]): T[] {
  return reviews.toSorted(compareByUrgency);
}

function compareByUrgency(a: SortableReview, b: SortableReview): number {
  const answeredA = isAnswered(a);
  const answeredB = isAnswered(b);
  if (answeredA !== answeredB) return answeredA ? 1 : -1;
  if (answeredA) return toTime(b.published_at) - toTime(a.published_at);

  return ratingRank(a.rating) - ratingRank(b.rating) || toTime(a.published_at) - toTime(b.published_at);
}

const UNRATED_RANK = 6;

function ratingRank(rating: number | null): number {
  return rating ?? UNRATED_RANK;
}

function toTime(timestamp: string): number {
  return new Date(timestamp).getTime();
}
