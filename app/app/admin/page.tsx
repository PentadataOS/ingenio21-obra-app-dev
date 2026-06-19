import { redirect } from "next/navigation";
import { Users, Building2, History } from "lucide-react";
import { requireProfile, isAdmin } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/header";
import { ObraBadge } from "@/components/ui/badge";
import { initials, fmtDateTime } from "@/lib/format";

const rolLabel: Record<string, string> = { admin_pentadata: "Admin Pentadata", admin_ingenio21: "Admin Ingenio21", invitado: "Invitado" };
const evento: Record<string, string> = {
  obra_creada: "Obra creada", punto_creado: "Punto creado", punto_validado: "Punto validado", punto_cerrado: "Punto cerrado",
  incidencia_creada: "Incidencia creada", incidencia_cerrada: "Incidencia cerrada", obra_cerrada: "Obra cerrada", comentario_creado: "Comentario",
};

export default async function Admin() {
  const profile = await requireProfile();
  if (!isAdmin(profile)) redirect("/app");
  const supabase = await createSupabaseServer();
  const [{ data: users }, { data: obras }, { data: eventos }] = await Promise.all([
    supabase.from("perfil_usuario").select("id,nombre,email,rol_global").order("created_at"),
    supabase.from("obra").select("id,codigo,nombre,estado").order("created_at", { ascending: false }),
    supabase.from("evento_trazabilidad").select("id,tipo_evento,created_at,actor:perfil_usuario!evento_trazabilidad_actor_id_fkey(nombre,email)").order("created_at", { ascending: false }).limit(40),
  ]);

  return (
    <div>
      <PageHeader back="/app/perfil" title="Administración" />
      <div className="space-y-6 px-4 pt-1">
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><Users className="h-4 w-4 text-brand-indigo" /> Usuarios ({(users ?? []).length})</h2>
          <div className="space-y-2">
            {(users ?? []).map((u: any) => (
              <div key={u.id} className="row-tap">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-indigo/10 text-[11px] font-semibold text-brand-indigo">{initials(u.nombre, u.email)}</div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{u.nombre ?? u.email}</p><p className="truncate text-xs text-muted">{u.email}</p></div>
                <span className="text-[11px] text-muted">{rolLabel[u.rol_global] ?? u.rol_global}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><Building2 className="h-4 w-4 text-brand-indigo" /> Obras ({(obras ?? []).length})</h2>
          <div className="space-y-2">
            {(obras ?? []).map((o: any) => (
              <a key={o.id} href={`/app/obras/${o.id}`} className="row-tap">
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{o.nombre}</p><p className="text-xs text-muted">{o.codigo}</p></div>
                <ObraBadge e={o.estado} />
              </a>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><History className="h-4 w-4 text-brand-indigo" /> Actividad global</h2>
          <div className="space-y-1.5">
            {(eventos ?? []).map((e: any) => (
              <div key={e.id} className="flex items-center justify-between gap-2 px-1 text-sm">
                <span className="truncate">{evento[e.tipo_evento] ?? e.tipo_evento}</span>
                <span className="shrink-0 text-[11px] text-muted">{e.actor?.nombre ?? e.actor?.email ?? "—"} · {fmtDateTime(e.created_at)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
