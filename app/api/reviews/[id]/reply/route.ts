import { NextResponse } from "next/server";
import { parseReplyInput } from "@/lib/reviews/reply-input";
import { saveReply } from "@/lib/reviews/repository";
import { MissingEnvError } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request, ctx: RouteContext<"/api/reviews/[id]/reply">) {
  const { id } = await ctx.params;

  const body: unknown = await request.json().catch(() => null);
  const input = parseReplyInput(body);
  if (!input.ok) return errorResponse(400, input.error);

  try {
    const result = await saveReply(createAdminClient(), id, input.value.text);
    if (result.ok) return NextResponse.json({ review: result.review });

    return result.reason === "not_found"
      ? errorResponse(404, `No existe la reseña ${id}.`)
      : errorResponse(409, "Esta reseña ya tiene una respuesta guardada.");
  } catch (error) {
    if (error instanceof MissingEnvError) return errorResponse(503, error.message);
    console.error(error);
    return errorResponse(502, "No pudimos guardar la respuesta. Probá de nuevo en un momento.");
  }
}

function errorResponse(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}
