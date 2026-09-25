import type { SupabaseClient } from "@supabase/supabase-js";
import { parseExportFile } from "@/lib/import/export-file";
import { planImport } from "@/lib/import/plan";
import { REVIEW_COLUMNS } from "@/lib/reviews/repository";
import type { ReviewRow } from "@/types/db";
import type { ImportPlan } from "@/types/import";

export async function runImport(db: SupabaseClient, raw: unknown): Promise<ImportPlan> {
  const file = parseExportFile(raw);
  const plan = planImport(file, await fetchReviews(db));
  await applyPlan(db, plan);
  return plan;
}

async function fetchReviews(db: SupabaseClient): Promise<ReviewRow[]> {
  const { data, error } = await db.from("reviews").select(REVIEW_COLUMNS);
  if (error) throw new Error(`No se pudieron leer las reseñas: ${error.message}`);
  return data as ReviewRow[];
}

// Restaurants and locations go first so the reviews' foreign keys resolve.
// The writes are not in one transaction; if one fails, running the import
// again finishes the job because every step is idempotent.
async function applyPlan(db: SupabaseClient, plan: ImportPlan): Promise<void> {
  await upsert(db, "restaurants", plan.restaurants);
  await upsert(db, "locations", plan.locations);
  await upsert(db, "reviews", [...plan.toCreate, ...plan.toUpdate]);
}

async function upsert(db: SupabaseClient, table: string, rows: object[]): Promise<void> {
  if (rows.length === 0) return;
  const { error } = await db.from(table).upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`No se pudo escribir en ${table}: ${error.message}`);
}
