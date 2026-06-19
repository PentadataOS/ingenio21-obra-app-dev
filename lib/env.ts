export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function list(v: string | undefined) {
  return (v ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
}
export const ADMIN_PENTADATA = list(process.env.ADMIN_PENTADATA_EMAILS);
export const ADMIN_INGENIO21 = list(process.env.ADMIN_INGENIO21_EMAILS);
