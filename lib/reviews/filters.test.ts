import { describe, expect, it } from "vitest";
import { countByStatus, filtersToQuery, matchesFilters, parseFilters } from "@/lib/reviews/filters";

const locationIds = ["loc-1", "loc-2"];

function review(location_id: string, rating: number | null, answered: boolean) {
  return { location_id, rating, reply_text: answered ? "Gracias" : null };
}

describe("parseFilters", () => {
  it("shows unanswered reviews of every location when the URL has no filters", () => {
    expect(parseFilters({}, locationIds)).toEqual({ location: null, rating: null, status: "sin-responder" });
  });

  it("reads every filter from the URL", () => {
    const filters = parseFilters({ sede: "loc-2", calificacion: "1", estado: "respondidas" }, locationIds);

    expect(filters).toEqual({ location: "loc-2", rating: "1", status: "respondidas" });
  });

  it("ignores values it does not know instead of failing", () => {
    const filters = parseFilters({ sede: "loc-99", calificacion: "7", estado: "archivadas" }, locationIds);

    expect(filters).toEqual({ location: null, rating: null, status: "sin-responder" });
  });

  it("round-trips through the query string", () => {
    const filters = parseFilters({ sede: "loc-1", calificacion: "sin-calificacion", estado: "todas" }, locationIds);

    const query = Object.fromEntries(new URLSearchParams(filtersToQuery(filters)));

    expect(parseFilters(query, locationIds)).toEqual(filters);
  });

  it("leaves the default status out of the URL", () => {
    expect(filtersToQuery({ location: null, rating: null, status: "sin-responder" })).toBe("");
  });
});

describe("matchesFilters", () => {
  const reviews = [
    review("loc-1", 5, false),
    review("loc-1", 1, true),
    review("loc-1", null, false),
    review("loc-2", 1, false),
  ];

  it("combines location, rating and status", () => {
    const filters = { location: "loc-1", rating: "1", status: "respondidas" } as const;

    expect(reviews.filter((item) => matchesFilters(item, filters))).toEqual([reviews[1]]);
  });

  it("finds the reviews without a rating", () => {
    const filters = { location: null, rating: "sin-calificacion", status: "todas" } as const;

    expect(reviews.filter((item) => matchesFilters(item, filters))).toEqual([reviews[2]]);
  });

  it("counts each status within the other filters", () => {
    const counts = countByStatus(reviews, { location: "loc-1", rating: null, status: "sin-responder" });

    expect(counts).toEqual({ "sin-responder": 2, respondidas: 1, todas: 3 });
  });
});
