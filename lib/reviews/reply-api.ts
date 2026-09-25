/** Browser calls to the review API routes. They never throw: failures come back as messages to show. */

export async function requestDraft(reviewId: string): Promise<{ draft: string } | { error: string }> {
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
export async function submitReply(reviewId: string, text: string): Promise<string | null> {
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
