import { ApiError, GoogleGenAI, ThinkingLevel } from "@google/genai";
import type { DraftPrompt } from "@/lib/ai/draft-prompt";
import { requireEnv } from "@/lib/env";

// Older models (gemini-2.5-flash) are closed to new API keys; GEMINI_MODEL
// lets the deploy switch without a code change.
const DEFAULT_MODEL = "gemini-3.6-flash";
const TIMEOUT_MS = 30_000;

export type AiFailure = "busy" | "timeout" | "failed";

export class AiUnavailableError extends Error {
  constructor(readonly failure: AiFailure, options?: ErrorOptions) {
    super(`AI provider unavailable: ${failure}`, options);
  }
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/** Server only: the API key must never reach the browser. */
export async function generateText(prompt: DraftPrompt): Promise<string> {
  const [apiKey] = requireEnv(["GEMINI_API_KEY"]);
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
      contents: prompt.user,
      config: {
        systemInstruction: prompt.system,
        temperature: 0.7,
        // A three-sentence reply needs no reasoning, and thinking only adds latency.
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        abortSignal: AbortSignal.timeout(TIMEOUT_MS),
      },
    });
    return response.text ?? "";
  } catch (error) {
    throw new AiUnavailableError(classify(error), { cause: error });
  }
}

function classify(error: unknown): AiFailure {
  if (error instanceof ApiError && (error.status === 429 || error.status === 503)) return "busy";
  if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) return "timeout";
  return "failed";
}
