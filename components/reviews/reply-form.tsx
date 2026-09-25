"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { DraftNotice } from "@/components/reviews/draft-notice";
import { Button } from "@/components/ui/button";
import { requestDraft, submitReply } from "@/lib/reviews/reply-api";
import { MAX_REPLY_LENGTH } from "@/lib/reviews/reply-input";
import { LoaderCircle, LucideSparkles } from "lucide-react";

/** Where the text in the field came from, so an unsaved model draft never looks like a reply. */
type Origin = "manual" | "ai" | "ai-edited";

interface ReplyFormProps {
  reviewId: string;
  author: string;
  aiConfigured: boolean;
}

export function ReplyForm({ reviewId, author, aiConfigured }: ReplyFormProps) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [origin, setOrigin] = useState<Origin>("manual");
  const [textBeforeDraft, setTextBeforeDraft] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, startTransition] = useTransition();

  const busy = generating || saving || isRefreshing;
  const isDraft = origin !== "manual";
  const fieldId = `reply-${reviewId}`;

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    const result = await requestDraft(reviewId);
    setGenerating(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }
    if (!isDraft) setTextBeforeDraft(text);
    setText(result.draft);
    setOrigin("ai");
  }

  function discardDraft() {
    setText(textBeforeDraft);
    setOrigin("manual");
    setError(null);
  }

  function handleChange(value: string) {
    setText(value);
    if (origin === "ai") setOrigin("ai-edited");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const failure = await submitReply(reviewId, text);
    setSaving(false);

    if (failure) {
      setError(failure);
    } else {
      toast.success(`Guardamos la respuesta a ${author}.`);
      startTransition(() => router.refresh());
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor={fieldId} className="text-xs font-medium text-muted">
        Tu respuesta a {author}
      </label>

      {isDraft && <DraftNotice edited={origin === "ai-edited"} disabled={busy} onDiscard={discardDraft} />}

      <textarea
        id={fieldId}
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        maxLength={MAX_REPLY_LENGTH}
        rows={isDraft ? 4 : 2}
        readOnly={generating}
        disabled={saving || isRefreshing}
        placeholder={generating ? "Generando un borrador…" : "Escribí la respuesta que se va a publicar."}
        aria-busy={generating}
        aria-invalid={error !== null}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={`w-full resize-y rounded-md border bg-surface px-3 py-2 text-sm leading-relaxed focus-visible:outline-2 focus-visible:outline-offset-1 disabled:opacity-60 ${
          isDraft
            ? "border-dashed border-draft focus-visible:outline-draft"
            : "border-border focus-visible:outline-primary"
        } ${generating ? "animate-pulse" : ""}`}
      />

      {error && (
        <p id={`${fieldId}-error`} role="alert" className="text-sm text-bad">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {!aiConfigured && (
          <p id={`${fieldId}-ai-missing`} className="mr-auto text-sm text-muted">
            Para generar borradores falta configurar GEMINI_API_KEY.
          </p>
        )}
        <Button
          type="button"
          variant="secondary"
          onClick={handleGenerate}
          disabled={!aiConfigured || busy}
          aria-describedby={aiConfigured ? undefined : `${fieldId}-ai-missing`}
        >
          {generateLabel({ aiConfigured, generating, isDraft })}
        </Button>
        <Button type="submit" disabled={busy || text.trim().length === 0}>
          {saving || isRefreshing ? <span className="flex items-center justify-center flex-nowrap gap-2"><LoaderCircle size={16} className="animate-spin"/> Guardando…</span> : "Guardar respuesta"}
        </Button>
      </div>
    </form>
  );
}

interface GenerateState {
  aiConfigured: boolean;
  generating: boolean;
  isDraft: boolean;
}

function generateLabel({ aiConfigured, generating, isDraft }: GenerateState) {
  if (!aiConfigured) return "IA no configurada";
  if (generating) return <span className="flex items-center justify-center flex-nowrap gap-2"><LoaderCircle size={16} className="animate-spin"/> Generando…</span>;
  return isDraft ? "Generar otro" : (<span className="flex items-center justify-center flex-nowrap gap-2"><LucideSparkles size={16} /> Generar con IA</span>);
}
