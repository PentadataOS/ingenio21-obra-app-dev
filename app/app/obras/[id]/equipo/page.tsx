import { createSupabaseServer } from "@/lib/supabase/server";
import { requireProfile, isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/header";
import { initials } from "@/lib/format";
import InviteMember from "@/components/app/invite-member";

const rolLabel: Record<string, string> = { ingeniero_jefe: "Ingeniero jefe", jefe_obra: "Jefe de obra", tecnico: "Técnico", colaborador: "Colaborador" };

export default async function Equipo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createSupabaseServer();
  const { data: obra } = await supabase.from("obra").select("codigo").eq("id", id).maybeSingle();
  const { data: part } = await supabase.from("obra_participante").select("rol_funcional").eq("obra_id", id).eq("perfil_id", profile.id).maybeSingle();
  const esSuperior = isAdmin(profile) || part?.rol_funcional === "ingeniero_jefe";

  const { data: miembros } = await supabase
    .from("obra_participante")
    .select("rol_funcional,perfil:perfil_usuario!obra_participante_perfil_id_fkey(nombre,email)")
    .eq("obra_id", id).eq("estado_acceso", "activo");
  const { data: invs } = esSuperior
    ? await supabase.from("invitacion_obra").select("email,rol_funcional").eq("obra_id", id).eq("estado", "pendiente")
    : { data: [] as any[] };

  return (
    <div>
      <PageHeader back={`/app/obras/${id}`} eyebrow={obra?.codigo} title="Equipo" right={esSuperior ? <InviteMember obraId={id} /> : undefined} />
      <div className="space-y-2 px-4 pt-1">
        {(miembros ?? []).map((m: any, i: number) => (
          <div key={i} className="row-tap">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-indigo/10 text-xs font-semibold text-brand-indigo">{initials(m.perfil?.nombre, m.perfil?.email)}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{m.perfil?.nombre ?? m.perfil?.email}</p>
              <p className="text-xs text-muted">{rolLabel[m.rol_funcional] ?? m.rol_funcional}</p>
            </div>
          </div>
        ))}
        {(invs ?? []).length > 0 && (
          <>
            <p className="pt-3 text-xs font-semibold uppercase tracking-wide text-muted">Invitaciones pendientes</p>
            {(invs ?? []).map((iv: any, i: number) => (
              <div key={i} className="row-tap opacity-70">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-line text-xs font-semibold text-muted">@</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{iv.email}</p>
                  <p className="text-xs text-muted">{rolLabel[iv.rol_funcional] ?? iv.rol_funcional} · pendiente</p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
