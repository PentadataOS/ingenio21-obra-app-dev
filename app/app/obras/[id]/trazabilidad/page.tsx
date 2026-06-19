import { createSupabaseServer } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { PageHeader } from "@/components/ui/header";
import { Empty } from "@/components/ui/empty";
import { fmtDateTime } from "@/lib/format";

const evento: Record<string, string> = {
  obra_creada: "Obra creada", participante_asignado: "Persona añadida al equipo",
  punto_creado: "Punto creado", punto_validado: "Punto validado", punto_cerrado: "Punto cerrado", punto_descartado: "Punto descartado",
  incidencia_creada: "Incidencia creada", incidencia_en_revision: "Incidencia en revisión", incidencia_cerrada: "Incidencia cerrada", incidencia_descartada: "Incidencia descartada",
  comentario_creado: "Comentario añadido", archivo_preparado: "Evidencia preparada", archivo_subido: "Evidencia subida",
  obra_cerrada: "Obra cerrada", obra_reabierta: "Obra reabierta", expediente_regenerado: "Expediente regenerado",
  invitacion_creada: "Invitación creada", invitacion_aceptada: "Invitación aceptada",
};

export default async function Trazabilidad({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireProfile();
  const supabase = await createSupabaseServer();
  const { data: obra } = await supabase.from("obra").select("codigo").eq("id", id).maybeSingle();
  const { data } = await supabase
    .from("evento_trazabilidad")
    .select("id,tipo_evento,created_at,actor:perfil_usuario!evento_trazabilidad_actor_id_fkey(nombre,email)")
    .eq("obra_id", id).order("created_at", { ascending: false }).limit(150);
  const items = (data ?? []) as any[];

  return (
    <div>
      <PageHeader back={`/app/obras/${id}`} eyebrow={obra?.codigo} title="Trazabilidad" />
      <div className="px-4 pt-1">
        {items.length === 0 ? <Empty title="Sin actividad registrada" /> : (
          <ol className="relative ml-2 border-l border-line">
            {items.map((e) => (
              <li key={e.id} className="mb-4 ml-4">
                <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-brand-indigo" />
                <p className="text-sm font-medium">{evento[e.tipo_evento] ?? e.tipo_evento}</p>
                <p className="text-xs text-muted">{e.actor?.nombre ?? e.actor?.email ?? "—"} · {fmtDateTime(e.created_at)}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
