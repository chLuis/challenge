import type { LocationRow, RestaurantRow, ReviewRow } from "@/lib/db/types";
import type { ExportReview, ParsedExport, SkippedItem } from "@/lib/import/export-file";

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

type Reply = Pick<ReviewRow, "reply_text" | "replied_at">;

/**
 * Decides what an import has to write, given the file and what the database
 * already holds. Running it against its own result yields no writes, which is
 * what makes the import idempotent.
 */
export function planImport(file: ParsedExport, existing: ReviewRow[]): ImportPlan {
  const skipped: SkippedItem[] = [...file.invalidReviews];

  const restaurantIds = new Set(file.restaurants.map((restaurant) => restaurant.id));
  const locations = file.locations.filter((location) => {
    if (restaurantIds.has(location.restaurant_id)) return true;
    skipped.push({
      id: location.id,
      reason: `la sede apunta al restaurante ${location.restaurant_id}, que no existe`,
    });
    return false;
  });
  const locationIds = new Set(locations.map((location) => location.id));

  const { latest, duplicates } = keepLatestVersions(file.reviews);
  const existingById = new Map(existing.map((review) => [review.id, review]));

  const toCreate: ReviewRow[] = [];
  const toUpdate: ReviewRow[] = [];
  const unchanged: string[] = [];

  for (const review of latest) {
    if (!locationIds.has(review.location_id)) {
      skipped.push({ id: review.id, reason: `la sede ${review.location_id} no existe` });
      continue;
    }

    const incoming = toReviewRow(review);
    const current = existingById.get(review.id);

    if (!current) {
      toCreate.push(incoming);
      continue;
    }

    const merged = mergeWithExisting(incoming, current);
    if (isSameReview(merged, current)) {
      unchanged.push(review.id);
    } else {
      toUpdate.push(merged);
    }
  }

  return {
    restaurants: file.restaurants,
    locations,
    toCreate,
    toUpdate,
    unchanged,
    skipped,
    duplicates,
  };
}

function keepLatestVersions(reviews: ExportReview[]) {
  const latestById = new Map<string, ExportReview>();
  const duplicates = new Set<string>();

  for (const review of reviews) {
    const previous = latestById.get(review.id);
    if (previous) duplicates.add(review.id);
    if (!previous || toTime(review.updated_at) >= toTime(previous.updated_at)) {
      latestById.set(review.id, review);
    }
  }

  return { latest: [...latestById.values()], duplicates: [...duplicates] };
}

function toReviewRow(review: ExportReview): ReviewRow {
  return {
    id: review.id,
    location_id: review.location_id,
    author: review.author,
    rating: review.rating,
    text: review.text,
    published_at: toIso(review.published_at),
    updated_at: toIso(review.updated_at),
    reply_text: review.reply?.text ?? null,
    replied_at: review.reply ? toIso(review.reply.replied_at) : null,
  };
}

/**
 * The content comes from whichever side has the newest updated_at, so an old
 * export never reverts an edit. The reply is resolved on its own: a missing
 * reply in the file never erases one saved from the app.
 */
function mergeWithExisting(incoming: ReviewRow, current: ReviewRow): ReviewRow {
  const content = toTime(current.updated_at) > toTime(incoming.updated_at) ? current : incoming;
  return { ...content, ...newestReply(current, incoming) };
}

function newestReply(current: Reply, incoming: Reply): Reply {
  if (current.replied_at === null) return pickReply(incoming);
  if (incoming.replied_at === null) return pickReply(current);
  return toTime(incoming.replied_at) > toTime(current.replied_at)
    ? pickReply(incoming)
    : pickReply(current);
}

function pickReply({ reply_text, replied_at }: Reply): Reply {
  return { reply_text, replied_at };
}

function isSameReview(a: ReviewRow, b: ReviewRow): boolean {
  return (
    a.location_id === b.location_id &&
    a.author === b.author &&
    a.rating === b.rating &&
    a.text === b.text &&
    a.reply_text === b.reply_text &&
    sameInstant(a.published_at, b.published_at) &&
    sameInstant(a.updated_at, b.updated_at) &&
    sameInstant(a.replied_at, b.replied_at)
  );
}

// Postgres returns "2026-09-02T19:40:00+00:00" for what the file writes as
// "2026-09-02T19:40:00Z", so timestamps are compared as instants, not strings.
function sameInstant(a: string | null, b: string | null): boolean {
  if (a === null || b === null) return a === b;
  return toTime(a) === toTime(b);
}

function toTime(timestamp: string): number {
  return new Date(timestamp).getTime();
}

function toIso(timestamp: string): string {
  return new Date(timestamp).toISOString();
}
