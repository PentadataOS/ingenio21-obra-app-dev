import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SERVICE_ROLE_KEY } from "@/lib/env";

// SOLO servidor. Uso puntual permitido (D1): bootstrap de rol por env.
export function createSupabaseAdmin() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
