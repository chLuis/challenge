import { ReplyForm } from "@/components/reply-form";
import { Stars } from "@/components/stars";
import type { ReviewRow } from "@/lib/db/types";
import { formatRelativeDay } from "@/lib/format";
import type { LocationView } from "@/lib/reviews/repository";

interface ReviewCardProps {
  review: ReviewRow;
  location: LocationView | undefined;
  aiConfigured: boolean;
  onReplySaved: (author: string) => void;
}

export function ReviewCard({ review, location, aiConfigured, onReplySaved }: ReviewCardProps) {
  const answered = review.reply_text !== null && review.replied_at !== null;

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5 hover:shadow-sm hover:shadow-primary duration-200">
      <header className="flex items-start gap-3">
        <Initials name={review.author} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h3 className="font-medium">{review.author}</h3>
            <Stars rating={review.rating} />
          </div>
          <p className="mt-0.5 text-sm text-muted">
            {location ? `${location.name} · ${location.restaurantName}` : review.location_id}
            {" · "}
            <time dateTime={review.published_at} suppressHydrationWarning>
              {formatRelativeDay(review.published_at)}
            </time>
          </p>
        </div>
        {answered && <span className="shrink-0 text-xs text-muted">✓ Respondida</span>}
      </header>

      <div className="flex flex-col gap-4 sm:pl-12">
        {review.text ? (
          <p className="leading-relaxed">{review.text}</p>
        ) : (
          <p className="text-sm italic text-muted">Dejó la calificación sin comentario.</p>
        )}

        {answered ? (
          <div className="rounded-lg bg-bg px-3.5 py-3">
            <p className="text-xs text-muted">
              Respuesta del restaurante ·{" "}
              <time dateTime={review.replied_at!} suppressHydrationWarning>
                {formatRelativeDay(review.replied_at!)}
              </time>
            </p>
            <p className="mt-1 text-sm leading-relaxed">{review.reply_text}</p>
          </div>
        ) : (
          <ReplyForm
            reviewId={review.id}
            author={review.author}
            aiConfigured={aiConfigured}
            onSaved={() => onReplySaved(review.author)}
          />
        )}
      </div>
    </article>
  );
}

function Initials({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      aria-hidden
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-bg text-sm font-medium text-muted"
    >
      {initials}
    </span>
  );
}
