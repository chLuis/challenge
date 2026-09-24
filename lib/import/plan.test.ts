import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { ReviewRow } from "@/lib/db/types";
import { parseExportFile } from "@/lib/import/export-file";
import { planImport } from "@/lib/import/plan";
import { summarizeLocation } from "@/lib/reviews/summary";

const restaurants = [{ id: "rest-1", name: "La Parrilla del Sur" }];
const locations = [{ id: "loc-1", restaurant_id: "rest-1", name: "Palermo" }];

function exportReview(overrides: Record<string, unknown> = {}) {
  return {
    id: "rv-1",
    location_id: "loc-1",
    author: "Ana B.",
    rating: 4,
    text: "Buen lugar.",
    published_at: "2026-09-01T10:00:00Z",
    updated_at: "2026-09-01T10:00:00Z",
    reply: null,
    ...overrides,
  };
}

function parse(reviews: unknown[]) {
  return parseExportFile({ restaurants, locations, reviews });
}

function applied(plan: ReturnType<typeof planImport>, before: ReviewRow[] = []): ReviewRow[] {
  const byId = new Map(before.map((row) => [row.id, row]));
  for (const row of [...plan.toCreate, ...plan.toUpdate]) byId.set(row.id, row);
  return [...byId.values()];
}

describe("planImport", () => {
  it("creates new reviews on the first run and writes nothing on the second", () => {
    const file = parse([exportReview(), exportReview({ id: "rv-2", reply: { text: "Gracias", replied_at: "2026-09-02T10:00:00Z" } })]);

    const first = planImport(file, []);
    const second = planImport(file, applied(first));

    expect(first.toCreate.map((row) => row.id)).toEqual(["rv-1", "rv-2"]);
    expect(second.toCreate).toEqual([]);
    expect(second.toUpdate).toEqual([]);
    expect(second.unchanged).toEqual(["rv-1", "rv-2"]);
  });

  it("treats the same instant written with a different offset as unchanged", () => {
    const file = parse([exportReview()]);
    const stored = { ...planImport(file, []).toCreate[0], published_at: "2026-09-01T10:00:00+00:00", updated_at: "2026-09-01T10:00:00+00:00" };

    expect(planImport(file, [stored]).unchanged).toEqual(["rv-1"]);
  });

  it("keeps the version with the newest updated_at when an id repeats, whatever the order", () => {
    const older = exportReview({ rating: 1, text: "Llegó frío." });
    const newer = exportReview({ rating: 3, text: "Me devolvieron el envío.", updated_at: "2026-09-03T10:00:00Z" });

    for (const reviews of [[older, newer], [newer, older]]) {
      const plan = planImport(parse(reviews), []);

      expect(plan.toCreate).toHaveLength(1);
      expect(plan.toCreate[0].rating).toBe(3);
      expect(plan.duplicates).toEqual(["rv-1"]);
    }
  });

  it("updates a stored review when the file brings a newer edit", () => {
    const stored = planImport(parse([exportReview()]), []).toCreate;
    const edited = parse([exportReview({ rating: 2, updated_at: "2026-09-05T10:00:00Z" })]);

    const plan = planImport(edited, stored);

    expect(plan.toUpdate).toHaveLength(1);
    expect(plan.toUpdate[0].rating).toBe(2);
  });

  it("does not revert a stored review with an older file", () => {
    const stored = planImport(parse([exportReview({ rating: 2, updated_at: "2026-09-05T10:00:00Z" })]), []).toCreate;

    const plan = planImport(parse([exportReview()]), stored);

    expect(plan.toUpdate).toEqual([]);
    expect(plan.unchanged).toEqual(["rv-1"]);
  });

  it("does not erase a reply saved from the app when the file has none", () => {
    const [created] = planImport(parse([exportReview()]), []).toCreate;
    const answered = { ...created, reply_text: "Gracias Ana", replied_at: "2026-09-10T10:00:00.000Z" };

    const plan = planImport(parse([exportReview()]), [answered]);

    expect(plan.toUpdate).toEqual([]);
    expect(plan.unchanged).toEqual(["rv-1"]);
  });

  it("skips a review whose location does not exist and never creates the location", () => {
    const plan = planImport(parse([exportReview({ id: "rv-301", location_id: "loc-99" })]), []);

    expect(plan.toCreate).toEqual([]);
    expect(plan.skipped).toEqual([{ id: "rv-301", reason: "la sede loc-99 no existe" }]);
    expect(plan.locations.map((location) => location.id)).toEqual(["loc-1"]);
  });

  it("imports a review without rating and reports invalid ones without stopping", () => {
    const plan = planImport(parse([exportReview({ rating: null }), exportReview({ id: "rv-2", rating: 7 })]), []);

    expect(plan.toCreate.map((row) => [row.id, row.rating])).toEqual([["rv-1", null]]);
    expect(plan.skipped).toHaveLength(1);
    expect(plan.skipped[0].id).toBe("rv-2");
  });
});

describe("the export file from the brief", () => {
  const file = parseExportFile(JSON.parse(readFileSync("reviews.json", "utf8")));
  const reviews = planImport(file, []).toCreate;

  it("gives Palermo an average of 3.63 over eight rated reviews", () => {
    const palermo = summarizeLocation("loc-1", reviews);

    expect(palermo.ratedCount).toBe(8);
    expect(palermo.averageRating).toBeCloseTo(3.625);
  });

  it("gives Centro six reviews and an average of 3.67", () => {
    const centro = summarizeLocation("loc-3", reviews);

    expect(centro.reviewCount).toBe(6);
    expect(centro.averageRating).toBeCloseTo(3.667, 3);
  });

  it("leaves Belgrano without data", () => {
    expect(summarizeLocation("loc-2", reviews).averageRating).toBeNull();
  });
});
