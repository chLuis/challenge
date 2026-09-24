import { NextResponse } from "next/server";
import { buildDraftPrompt, cleanDraft } from "@/lib/ai/draft-prompt";
import { AiUnavailableError, generateText, isAiConfigured, type AiFailure } from "@/lib/ai/gemini";
import { MissingEnvError } from "@/lib/env";
import { findReviewWithPlace } from "@/lib/reviews/repository";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(_request: Request, ctx: RouteContext<"/api/reviews/[id]/draft">) {
  const { id } = await ctx.params;

  if (!isAiConfigured()) {
    return errorResponse(503, "La IA no está configurada: falta GEMINI_API_KEY en el servidor.");
  }

  let found;
  try {
    found = await findReviewWithPlace(createAdminClient(), id);
  } catch (error) {
    if (error instanceof MissingEnvError) return errorResponse(503, error.message);
    console.error(error);
    return errorResponse(502, "No pudimos leer la reseña. Probá de nuevo en un momento.");
  }

  if (!found) return errorResponse(404, `No existe la reseña ${id}.`);
  if (found.review.reply_text !== null) {
    return errorResponse(409, "Esta reseña ya tiene una respuesta guardada.");
  }

  const prompt = buildDraftPrompt({
    restaurantName: found.restaurantName,
    locationName: found.locationName,
    author: found.review.author,
    rating: found.review.rating,
    text: found.review.text,
  });

  try {
    const draft = cleanDraft(await generateText(prompt));
    if (!draft) return errorResponse(502, "El modelo devolvió una respuesta vacía. Probá generar de nuevo.");
    return NextResponse.json({ draft });
  } catch (error) {
    console.error(error);
    const failure = error instanceof AiUnavailableError ? error.failure : "failed";
    return errorResponse(failure === "busy" ? 503 : 502, AI_FAILURE_MESSAGES[failure]);
  }
}

const AI_FAILURE_MESSAGES: Record<AiFailure, string> = {
  busy: "El modelo está saturado en este momento. Probá de nuevo en unos minutos o escribí la respuesta a mano.",
  timeout: "El modelo tardó demasiado en responder. Probá de nuevo o escribí la respuesta a mano.",
  failed: "El modelo no pudo generar el borrador. Probá de nuevo o escribí la respuesta a mano.",
};

function errorResponse(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}
