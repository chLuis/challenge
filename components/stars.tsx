import { ratingTone, type RatingTone } from "@/lib/reviews/rating-tone";

export const TONE_TEXT: Record<RatingTone, string> = {
  good: "text-good",
  regular: "text-regular",
  bad: "text-bad",
};

export function Stars({ rating }: { rating: number | null }) {
  if (rating === null) {
    return <span className="rounded-full bg-bg px-2 py-0.5 text-xs text-muted">Sin calificación</span>;
  }

  const filled = TONE_TEXT[ratingTone(rating)];
  return (
    <span role="img" aria-label={`${rating} de 5 estrellas`} className="inline-flex text-sm leading-none tracking-tight">
      {[1, 2, 3, 4, 5].map((position) => (
        <span key={position} aria-hidden className={position <= rating ? filled : "text-border"}>
          ★
        </span>
      ))}
    </span>
  );
}
