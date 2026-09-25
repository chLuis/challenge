import type { ReactNode } from "react";
import { formatLongDate } from "@/lib/format";
import { isLowRating } from "@/lib/reviews/rating-tone";
import { isAnswered } from "@/lib/reviews/summary";
import type { ReviewRow } from "@/types/db";

interface InboxHeaderProps {
  reviews: ReviewRow[];
  themeToggle: ReactNode;
}

/** What the person came for, first: how much is left and where to start. */
export function InboxHeader({ reviews, themeToggle }: InboxHeaderProps) {
  const pending = reviews.filter((review) => !isAnswered(review));
  const lowRated = pending.filter((review) => isLowRating(review.rating)).length;

  return (
    <header className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted first-letter:uppercase" suppressHydrationWarning>
          {formatLongDate(new Date())}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {pending.length === 0
            ? "No hay reseñas sin responder"
            : `${pending.length} ${pending.length === 1 ? "reseña" : "reseñas"} sin responder`}
        </h1>
        <p className="text-muted">{headlineDetail(pending.length, lowRated)}</p>
      </div>
      {themeToggle}
    </header>
  );
}

function headlineDetail(pending: number, lowRated: number): string {
  if (pending === 0) return "Las reseñas nuevas van a aparecer acá cuando se importe el próximo archivo.";
  if (lowRated === 0) return "Ninguna es de 1 o 2 estrellas.";
  if (lowRated === 1) return "Una es de 1 o 2 estrellas: conviene empezar por esa.";
  return `${lowRated} son de 1 o 2 estrellas: priorizar empezar por esas.`;
}
