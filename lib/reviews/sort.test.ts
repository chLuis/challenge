import { describe, expect, it } from "vitest";
import { sortByUrgency } from "@/lib/reviews/sort";

function review(id: string, rating: number | null, publishedDay: number, answered = false) {
  return {
    id,
    rating,
    published_at: `2026-09-${String(publishedDay).padStart(2, "0")}T12:00:00Z`,
    reply_text: answered ? "Gracias" : null,
  };
}

function ids(reviews: { id: string }[]) {
  return reviews.map((item) => item.id);
}

describe("sortByUrgency", () => {
  it("puts pending reviews with fewer stars first", () => {
    const sorted = sortByUrgency([review("five", 5, 1), review("two", 2, 1), review("one", 1, 1), review("three", 3, 1)]);

    expect(ids(sorted)).toEqual(["one", "two", "three", "five"]);
  });

  it("puts the oldest first among pending reviews with the same stars", () => {
    const sorted = sortByUrgency([review("newer", 1, 10), review("older", 1, 2)]);

    expect(ids(sorted)).toEqual(["older", "newer"]);
  });

  it("leaves answered reviews below every pending one, newest first", () => {
    const sorted = sortByUrgency([
      review("answered-old", 1, 1, true),
      review("pending", 5, 3),
      review("answered-new", 1, 9, true),
    ]);

    expect(ids(sorted)).toEqual(["pending", "answered-new", "answered-old"]);
  });

  it("puts a pending review without rating after the rated ones", () => {
    const sorted = sortByUrgency([review("unrated", null, 1), review("five", 5, 9)]);

    expect(ids(sorted)).toEqual(["five", "unrated"]);
  });

  it("does not reorder the array it receives", () => {
    const reviews = [review("five", 5, 1), review("one", 1, 1)];

    sortByUrgency(reviews);

    expect(ids(reviews)).toEqual(["five", "one"]);
  });
});
