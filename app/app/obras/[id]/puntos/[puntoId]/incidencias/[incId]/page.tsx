import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { requireProfile, isAdmin } from "@/lib/auth";
import { IncBadge, PrioBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/header";
import { fmtDate } from "@/lib/format";
import IncidenciaActions from "@/components/app/incidencia-actions";
import Comentarios from "@/components/app/comentarios";
import Evidencias from "@/components/app/evidencias";

const prioBar: Record<string, string> = { baja: "bg-slate-300", media: "bg-indigo-400", alta: "bg-amber-400", critica: "bg-rose-500" };

export default async function IncidenciaDetalle({ params }: { params: Promise<{ id: string; puntoId: string; incId: string }> }) {
  const { id, puntoId, incId } = await params;
  const profile = await requireProfile();
  const supabase = await createSupabaseServer();
  const path = `/app/obras/${id}/puntos/${puntoId}/incidencias/${incId}`;

  const { data: inc } = await supabase.from("incidencia").select("*").eq("id", incId).maybeSingle();
  if (!inc) notFound();
  const { data: obra } = await supabase.from("obra").select("codigo,estado").eq("id", id).maybeSingle();
  const { data: part } = await supabase.from("obra_participante").select("rol_funcional").eq("obra_id", id).eq("perfil_id", profile.id).maybeSingle();
  const miRol = part?.rol_funcional as string | undefined;
  const puedeOperar = (isAdmin(profile) || !!miRol) && obra?.estado !== "cerrada";

  const [{ data: coms }, { data: archivos }] = await Promise.all([
    supabase.from("comentario").select("id,cuerpo,created_at,edited_at,autor:perfil_usuario!comentario_autor_id_fkey(nombre,email)").eq("incidencia_id", incId).order("created_at"),
    supabase.from("archivos_documentales").select("id,nombre,tipo,size_bytes,storage_path").eq("incidencia_id", incId).eq("upload_status", "ready").order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <PageHeader back={`/app/obras/${id}/puntos/${puntoId}`} eyebrow={`${obra?.codigo ?? ""} · ${inc.codigo}`} title={inc.titulo} right={<IncBadge e={inc.estado} />} />
      <div className="space-y-5 px-4">
        <div className="card overflow-hidden">
          <div className={`h-1.5 w-full ${prioBar[inc.prioridad] ?? "bg-slate-300"}`} />
          <div className="p-4">
            <div className="flex items-center gap-2"><PrioBadge p={inc.prioridad} /><IncBadge e={inc.estado} /></div>
            {inc.descripcion && <p className="mt-2 text-sm text-ink/80">{inc.descripcion}</p>}
            {inc.vencimiento && <p className="mt-2 text-xs text-muted">Vencimiento: {fmtDate(inc.vencimiento)}</p>}
          </div>
        </div>

        <IncidenciaActions path={path} id={incId} estado={inc.estado} puedeGestionar={puedeOperar} />

        <section>
          <h2 className="mb-2 text-sm font-semibold">Evidencias</h2>
          <Evidencias path={path} obraId={id} incidenciaId={incId} items={(archivos ?? []) as any} canUpload={puedeOperar && inc.estado !== "cerrada" && inc.estado !== "descartada"} />
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold">Comentarios</h2>
          <Comentarios path={path} target="incidencia" targetId={incId} items={(coms ?? []) as any} canComment={puedeOperar && inc.estado !== "cerrada" && inc.estado !== "descartada"} />
        </section>
      </div>
    </div>
  );
}
