import { formatRelativeDay } from "@/lib/format";

export function ReviewReply({ text, repliedAt }: { text: string; repliedAt: string }) {
  return (
    <div className="rounded-lg bg-bg px-3.5 py-3">
      <p className="text-xs text-muted">
        Respuesta del restaurante ·{" "}
        <time dateTime={repliedAt} suppressHydrationWarning>
          {formatRelativeDay(repliedAt)}
        </time>
      </p>
      <p className="mt-1 text-sm leading-relaxed">{text}</p>
    </div>
  );
}
