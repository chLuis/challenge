import { describe, expect, it } from "vitest";
import { isLowRating, ratingTone } from "@/lib/reviews/rating-tone";

describe("ratingTone", () => {
  it("reads single ratings as good, regular or bad", () => {
    expect([5, 4, 3, 2, 1].map(ratingTone)).toEqual(["good", "good", "regular", "bad", "bad"]);
  });

  it("uses the same scale for averages", () => {
    expect(ratingTone(3.63)).toBe("regular");
    expect(ratingTone(3.99)).toBe("regular");
    expect(ratingTone(2.9)).toBe("bad");
  });
});

describe("isLowRating", () => {
  it("flags one and two stars, and never a missing rating", () => {
    expect([1, 2, 3, null].map(isLowRating)).toEqual([true, true, false, false]);
  });
});
