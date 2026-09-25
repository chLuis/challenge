import { ReplyForm } from "@/components/reviews/reply-form";
import { ReviewReply } from "@/components/reviews/review-reply";
import { Initials } from "@/components/ui/initials";
import { Stars } from "@/components/ui/stars";
import { formatRelativeDay } from "@/lib/format";
import type { ReviewRow } from "@/types/db";
import type { LocationView } from "@/types/reviews";

interface ReviewCardProps {
  review: ReviewRow;
  location: LocationView | undefined;
  aiConfigured: boolean;
}

export function ReviewCard({ review, location, aiConfigured }: ReviewCardProps) {
  const reply =
    review.reply_text !== null && review.replied_at !== null
      ? { text: review.reply_text, repliedAt: review.replied_at }
      : null;

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
        {reply && <span className="shrink-0 text-xs text-muted">✓ Respondida</span>}
      </header>

      <div className="flex flex-col gap-4 sm:pl-12">
        {review.text ? (
          <p className="leading-relaxed">{review.text}</p>
        ) : (
          <p className="text-sm italic text-muted">Dejó la calificación sin comentario.</p>
        )}

        {reply ? (
          <ReviewReply text={reply.text} repliedAt={reply.repliedAt} />
        ) : (
          <ReplyForm reviewId={review.id} author={review.author} aiConfigured={aiConfigured} />
        )}
      </div>
    </article>
  );
}
