import { z } from "zod";
import type { LocationRow, RestaurantRow } from "@/lib/db/types";

const timestamp = z.iso.datetime({ offset: true });

const restaurantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

const locationSchema = z.object({
  id: z.string().min(1),
  restaurant_id: z.string().min(1),
  name: z.string().min(1),
});

const replySchema = z.object({
  text: z.string().trim().min(1),
  replied_at: timestamp,
});

const reviewSchema = z.object({
  id: z.string().min(1),
  location_id: z.string().min(1),
  author: z.string().trim().min(1),
  rating: z.number().int().min(1).max(5).nullish().transform((rating) => rating ?? null),
  text: z.string().nullish().transform((text) => text?.trim() ?? ""),
  published_at: timestamp,
  updated_at: timestamp,
  reply: replySchema.nullish().transform((reply) => reply ?? null),
});

// Reviews are validated one by one so a single bad row is reported instead of
// aborting the whole import.
const exportFileSchema = z.object({
  restaurants: z.array(restaurantSchema),
  locations: z.array(locationSchema),
  reviews: z.array(z.unknown()),
});

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

export class ExportFormatError extends Error {}

export function parseExportFile(raw: unknown): ParsedExport {
  const file = exportFileSchema.safeParse(raw);
  if (!file.success) {
    throw new ExportFormatError(`El archivo no tiene el formato esperado: ${z.prettifyError(file.error)}`);
  }

  const reviews: ExportReview[] = [];
  const invalidReviews: SkippedItem[] = [];

  for (const candidate of file.data.reviews) {
    const review = reviewSchema.safeParse(candidate);
    if (review.success) {
      reviews.push(review.data);
    } else {
      invalidReviews.push({
        id: readId(candidate),
        reason: `datos inválidos: ${describeIssues(review.error)}`,
      });
    }
  }

  return {
    restaurants: file.data.restaurants,
    locations: file.data.locations,
    reviews,
    invalidReviews,
  };
}

function readId(candidate: unknown): string {
  if (typeof candidate === "object" && candidate !== null && "id" in candidate) {
    const { id } = candidate;
    if (typeof id === "string" && id.length > 0) return id;
  }
  return "(sin id)";
}

function describeIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "reseña"}: ${issue.message}`)
    .join("; ");
}
