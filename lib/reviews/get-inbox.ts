import { connection } from "next/server";
import { MissingEnvError } from "@/lib/env";
import { loadInbox } from "@/lib/reviews/repository";
import { createAdminClient } from "@/lib/supabase/admin";
import type { InboxResult } from "@/types/reviews";

export async function getInbox(): Promise<InboxResult> {
  await connection();

  try {
    return { ok: true, inbox: await loadInbox(createAdminClient()) };
  } catch (error) {
    if (error instanceof MissingEnvError) return { ok: false, missing: error.missing };
    throw error;
  }
}
