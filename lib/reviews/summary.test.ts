import { describe, expect, it } from "vitest";
import { summarizeLocation, summarizeLocations, summarizeReviews } from "@/lib/reviews/summary";

function review(rating: number | null, answered = false, location_id = "loc-1") {
  return { location_id, rating, reply_text: answered ? "Gracias" : null };
}

describe("summarizeLocation", () => {
  it("has no average and no answered ratio when the location has no reviews", () => {
    const summary = summarizeLocation("loc-2", [review(5, true)]);

    expect(summary.reviewCount).toBe(0);
    expect(summary.averageRating).toBeNull();
    expect(summary.answeredRatio).toBeNull();
  });

  it("leaves an unrated review out of the average but counts it in the total", () => {
    const summary = summarizeLocation("loc-1", [review(4), review(2), review(null, true)]);

    expect(summary.reviewCount).toBe(3);
    expect(summary.ratedCount).toBe(2);
    expect(summary.averageRating).toBe(3);
    expect(summary.answeredRatio).toBeCloseTo(1 / 3);
  });

  it("has no average when none of its reviews has a rating", () => {
    const summary = summarizeLocation("loc-1", [review(null), review(null)]);

    expect(summary.reviewCount).toBe(2);
    expect(summary.averageRating).toBeNull();
  });

  it("averages the ratings and reports the share of answered reviews", () => {
    const summary = summarizeLocation("loc-1", [review(5, true), review(4), review(1, true), review(2)]);

    expect(summary.averageRating).toBe(3);
    expect(summary.answeredCount).toBe(2);
    expect(summary.answeredRatio).toBe(0.5);
  });

  it("ignores reviews that belong to other locations", () => {
    const summary = summarizeLocation("loc-1", [review(5), review(1, false, "loc-3")]);

    expect(summary.reviewCount).toBe(1);
    expect(summary.averageRating).toBe(5);
  });
});

describe("summarizeReviews", () => {
  it("summarizes reviews from every location together", () => {
    const summary = summarizeReviews([review(5, true), review(2, false, "loc-3"), review(null, false, "loc-3")]);

    expect(summary.reviewCount).toBe(3);
    expect(summary.averageRating).toBe(3.5);
    expect(summary.answeredRatio).toBeCloseTo(1 / 3);
  });

  it("has no data at all when there are no reviews", () => {
    expect(summarizeReviews([])).toMatchObject({ averageRating: null, answeredRatio: null });
  });
});

describe("summarizeLocations", () => {
  it("returns a summary for every location, including those without reviews", () => {
    const summaries = summarizeLocations(["loc-1", "loc-2"], [review(5)]);

    expect(summaries.map((summary) => summary.locationId)).toEqual(["loc-1", "loc-2"]);
    expect(summaries[1].averageRating).toBeNull();
  });
});
