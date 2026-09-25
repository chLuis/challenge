import type { reviewSchema } from "@/lib/import/export-file";
import type { z } from "zod";
import type { LocationRow, RestaurantRow, ReviewRow } from "@/types/db";

export type ExportReview = z.infer<typeof reviewSchema>;

export interface SkippedItem {
  id: string;
  reason: string;
}

export interface ParsedExport {
  restaurants: RestaurantRow[];
  locations: LocationRow[];
  reviews: ExportReview[];
  invalidReviews: SkippedItem[];
}

export interface ImportPlan {
  restaurants: RestaurantRow[];
  locations: LocationRow[];
  toCreate: ReviewRow[];
  toUpdate: ReviewRow[];
  unchanged: string[];
  skipped: SkippedItem[];
  /** Ids that appeared more than once in the file; only the newest version is kept. */
  duplicates: string[];
}
