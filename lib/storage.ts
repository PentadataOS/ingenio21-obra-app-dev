import { createSupabaseServer } from "@/lib/supabase/server";

export async function signedUrl(bucket: string, path?: string | null, expiresIn = 3600) {
  if (!path) return null;
  try {
    const supabase = await createSupabaseServer();
    const { data } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
    return data?.signedUrl ?? null;
  } catch { return null; }
}
