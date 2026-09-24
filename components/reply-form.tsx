"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/button";
import { MAX_REPLY_LENGTH } from "@/lib/reviews/reply-input";

/** Where the text in the field came from, so an unsaved model draft never looks like a reply. */
type Origin = "manual" | "ai" | "ai-edited";

interface ReplyFormProps {
  reviewId: string;
  author: string;
  aiConfigured: boolean;
  onSaved: () => void;
}

export function ReplyForm({ reviewId, author, aiConfigured, onSaved }: ReplyFormProps) {
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
      onSaved();
      startTransition(() => router.refresh());
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor={fieldId} className="text-xs font-medium text-muted">
        Tu respuesta a {author}
      </label>

      {isDraft && (
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-md bg-draft-soft px-3 py-2 text-sm text-draft">
          <p>
            <span aria-hidden>✦ </span>
            {origin === "ai" ? "Borrador escrito por IA" : "Borrador de IA con tus cambios"}. Todavía no se guardó:
            revisalo antes de guardar.
          </p>
          <button type="button" onClick={discardDraft} disabled={busy} className="underline underline-offset-2">
            Descartar borrador
          </button>
        </div>
      )}

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
          {saving || isRefreshing ? "Guardando…" : "Guardar respuesta"}
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
  if (generating) return "Generando…";
  return isDraft ? "Generar otro" : "Generar con IA";
}

async function requestDraft(reviewId: string): Promise<{ draft: string } | { error: string }> {
  try {
    const response = await fetch(`/api/reviews/${encodeURIComponent(reviewId)}/draft`, { method: "POST" });
    const body: { draft?: string; error?: string } | null = await response.json().catch(() => null);

    if (response.ok && body?.draft) return { draft: body.draft };
    return { error: body?.error ?? "No pudimos generar el borrador. Probá de nuevo." };
  } catch {
    return { error: "No hay conexión. Probá generar de nuevo en un momento." };
  }
}

/** Returns an error message to show, or null when the reply was saved. */
async function submitReply(reviewId: string, text: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/reviews/${encodeURIComponent(reviewId)}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (response.ok) return null;

    const body: { error?: string } | null = await response.json().catch(() => null);
    return body?.error ?? "No pudimos guardar la respuesta. Probá de nuevo.";
  } catch {
    return "No hay conexión. Tu texto sigue acá; probá guardar de nuevo.";
  }
}
