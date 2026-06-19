import { createSupabaseServer } from "@/lib/supabase/server";
import { requireProfile, isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/header";
import { Empty } from "@/components/ui/empty";
import PendienteItem from "@/components/app/pendiente-item";
import NewPendiente from "@/components/app/new-pendiente";

export default async function ObraPendientes({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createSupabaseServer();
  const { data: obra } = await supabase.from("obra").select("codigo,nombre,estado").eq("id", id).maybeSingle();
  const { data: part } = await supabase.from("obra_participante").select("rol_funcional").eq("obra_id", id).eq("perfil_id", profile.id).maybeSingle();
  const puedeOperar = (isAdmin(profile) || !!part) && obra?.estado !== "cerrada";

  const { data } = await supabase.from("pendiente").select("id,titulo,prioridad,estado").eq("obra_id", id).order("created_at", { ascending: false });
  const items = (data ?? []) as any[];
  const abiertos = items.filter((x) => x.estado === "abierto");
  const hechos = items.filter((x) => x.estado === "hecho");

  return (
    <div>
      <PageHeader back={`/app/obras/${id}`} eyebrow={obra?.codigo} title="Pendientes" />
      <div className="space-y-3 px-4 pt-1">
        {abiertos.length === 0 && hechos.length === 0 && <Empty title="Sin pendientes" />}
        {abiertos.map((x) => <PendienteItem key={x.id} id={x.id} titulo={x.titulo} prioridad={x.prioridad} hecho={false} />)}
        {hechos.length > 0 && <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted">Hechos</p>}
        {hechos.map((x) => <PendienteItem key={x.id} id={x.id} titulo={x.titulo} prioridad={x.prioridad} hecho />)}
        {puedeOperar && <div className="pt-1"><NewPendiente obraId={id} /></div>}
      </div>
    </div>
  );
}
