import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { ADMIN_PENTADATA, ADMIN_INGENIO21, SERVICE_ROLE_KEY } from "@/lib/env";
import type { Perfil, RolGlobal } from "@/lib/types";

async function bootstrapRole(id: string, email: string) {
  const e = email.toLowerCase();
  let target: RolGlobal | null = null;
  if (ADMIN_PENTADATA.includes(e)) target = "admin_pentadata";
  else if (ADMIN_INGENIO21.includes(e)) target = "admin_ingenio21";
  if (!target || !SERVICE_ROLE_KEY) return;
  try {
    const admin = createSupabaseAdmin();
    const { data } = await admin.from("perfil_usuario").select("rol_global").eq("id", id).maybeSingle();
    if (data && data.rol_global !== target) {
      await admin.from("perfil_usuario").update({ rol_global: target }).eq("id", id);
    }
  } catch {
    // best-effort; nunca rompe el login
  }
}

export async function getProfile(): Promise<Perfil | null> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  await bootstrapRole(user.id, user.email ?? "");
  const { data } = await supabase.from("perfil_usuario").select("*").eq("id", user.id).maybeSingle();
  return (data as Perfil) ?? null;
}

export async function requireProfile(): Promise<Perfil> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  return profile;
}

export function isAdmin(p: Perfil) {
  return p.rol_global === "admin_pentadata" || p.rol_global === "admin_ingenio21";
}
