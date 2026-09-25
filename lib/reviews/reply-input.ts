import { z } from "zod";
import type { ParseResult, ReplyInput } from "@/types/reviews";

export const MAX_REPLY_LENGTH = 2000;

export const replyInputSchema = z.object(
  {
    text: z
      .string({ error: "Falta el texto de la respuesta." })
      .trim()
      .min(1, "La respuesta no puede estar vacía.")
      .max(MAX_REPLY_LENGTH, `La respuesta no puede superar los ${MAX_REPLY_LENGTH} caracteres.`),
  },
  { error: 'Mandá un JSON con la forma { "text": "..." }.' },
);

export function parseReplyInput(body: unknown): ParseResult<ReplyInput> {
  const result = replyInputSchema.safeParse(body);
  if (result.success) return { ok: true, value: result.data };
  return { ok: false, error: result.error.issues[0]?.message ?? "Datos inválidos." };
}
