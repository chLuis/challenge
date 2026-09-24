import type { SupabaseClient } from "@supabase/supabase-js";
import type { LocationRow, RestaurantRow, ReviewRow } from "@/lib/db/types";

export const REVIEW_COLUMNS =
  "id, location_id, author, rating, text, published_at, updated_at, reply_text, replied_at";

export interface LocationView {
  id: string;
  name: string;
  restaurantName: string;
}

export interface Inbox {
  locations: LocationView[];
  reviews: ReviewRow[];
}

export async function loadInbox(db: SupabaseClient): Promise<Inbox> {
  const [restaurants, locations, reviews] = await Promise.all([
    db.from("restaurants").select("id, name").order("name"),
    db.from("locations").select("id, restaurant_id, name").order("name"),
    db.from("reviews").select(REVIEW_COLUMNS).order("published_at", { ascending: false }),
  ]);

  const error = restaurants.error ?? locations.error ?? reviews.error;
  if (error) throw new Error(`No se pudieron leer los datos: ${error.message}`);

  const restaurantNames = new Map(
    (restaurants.data as RestaurantRow[]).map((restaurant) => [restaurant.id, restaurant.name]),
  );

  return {
    locations: (locations.data as LocationRow[]).map((location) => ({
      id: location.id,
      name: location.name,
      restaurantName: restaurantNames.get(location.restaurant_id) ?? "",
    })),
    reviews: reviews.data as ReviewRow[],
  };
}

export interface ReviewWithPlace {
  review: ReviewRow;
  locationName: string;
  restaurantName: string;
}

interface ReviewWithPlaceRow extends ReviewRow {
  location: { name: string; restaurant: { name: string } | null } | null;
}

export async function findReviewWithPlace(
  db: SupabaseClient,
  reviewId: string,
): Promise<ReviewWithPlace | null> {
  const { data, error } = await db
    .from("reviews")
    .select(`${REVIEW_COLUMNS}, location:locations(name, restaurant:restaurants(name))`)
    .eq("id", reviewId)
    .maybeSingle<ReviewWithPlaceRow>();

  if (error) throw new Error(`No se pudo leer la reseña: ${error.message}`);
  if (!data) return null;

  const { location, ...review } = data;
  return {
    review,
    locationName: location?.name ?? "",
    restaurantName: location?.restaurant?.name ?? "",
  };
}

export type SaveReplyResult =
  | { ok: true; review: ReviewRow }
  | { ok: false; reason: "not_found" | "already_answered" };

/**
 * Only writes when the review has no reply yet, so two people answering at
 * the same time cannot overwrite each other.
 */
export async function saveReply(
  db: SupabaseClient,
  reviewId: string,
  text: string,
  now: Date = new Date(),
): Promise<SaveReplyResult> {
  const { data, error } = await db
    .from("reviews")
    .update({ reply_text: text, replied_at: now.toISOString() })
    .eq("id", reviewId)
    .is("reply_text", null)
    .select(REVIEW_COLUMNS)
    .maybeSingle();

  if (error) throw new Error(`No se pudo guardar la respuesta: ${error.message}`);
  if (data) return { ok: true, review: data as ReviewRow };

  const exists = await reviewExists(db, reviewId);
  return { ok: false, reason: exists ? "already_answered" : "not_found" };
}

async function reviewExists(db: SupabaseClient, reviewId: string): Promise<boolean> {
  const { data, error } = await db.from("reviews").select("id").eq("id", reviewId).maybeSingle();
  if (error) throw new Error(`No se pudo leer la reseña: ${error.message}`);
  return data !== null;
}
