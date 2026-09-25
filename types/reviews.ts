import type { RATING_OPTIONS, STATUS_OPTIONS } from "@/lib/reviews/filters";
import type { replyInputSchema } from "@/lib/reviews/reply-input";
import type { z } from "zod";
import type { ReviewRow } from "@/types/db";

export type StatusFilter = (typeof STATUS_OPTIONS)[number];
export type RatingFilter = (typeof RATING_OPTIONS)[number];

export interface ReviewFilters {
  location: string | null;
  rating: RatingFilter | null;
  status: StatusFilter;
}

export type RatingTone = "good" | "regular" | "bad";

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

/** One card of the summary sidebar. */
export interface SummaryItem {
  /** null stands for "every location". */
  locationId: string | null;
  name: string;
  detail: string;
  summary: ReviewsSummary;
}

export interface LocationView {
  id: string;
  name: string;
  restaurantName: string;
}

export interface InboxData {
  locations: LocationView[];
  reviews: ReviewRow[];
}

/** Either the data, or the environment variables that keep the app from reading it. */
export type InboxResult = { ok: true; inbox: InboxData } | { ok: false; missing: string[] };

export interface ReviewWithPlace {
  review: ReviewRow;
  locationName: string;
  restaurantName: string;
}

export type SaveReplyResult =
  | { ok: true; review: ReviewRow }
  | { ok: false; reason: "no_se_encontro" | "ya_respondida" };

export type ReplyInput = z.infer<typeof replyInputSchema>;

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };
