import { connection } from "next/server";
import { Inbox } from "@/components/inbox";
import { SetupNotice } from "@/components/setup-notice";
import { isAiConfigured } from "@/lib/ai/gemini";
import { MissingEnvError } from "@/lib/env";
import { loadInbox } from "@/lib/reviews/repository";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function InboxPage() {
  // Reviews change outside Next (imports, replies), so never serve a prerendered copy.
  await connection();

  let db;
  try {
    db = createAdminClient();
  } catch (error) {
    if (error instanceof MissingEnvError) return <SetupNotice missing={error.missing} />;
    throw error;
  }

  const inbox = await loadInbox(db);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6">
      <Inbox locations={inbox.locations} reviews={inbox.reviews} aiConfigured={isAiConfigured()} />
    </main>
  );
}
