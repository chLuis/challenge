import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";

/** Uses the service_role key: only call it from server code, never from a client component. */
export function createAdminClient(): SupabaseClient {
  const [url, serviceRoleKey] = requireEnv(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);

  // Supabase shows the REST endpoint (…/rest/v1/) next to the project URL and
  // it is easy to copy that one; the client only wants the origin.
  return createClient(new URL(url).origin, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
