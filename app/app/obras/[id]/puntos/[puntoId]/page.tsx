import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createSupabaseServer } from "@/lib/supabase/server";
import { requireProfile, isAdmin } from "@/lib/auth";
import { PuntoBadge, IncBadge, PrioBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/header";
import PuntoActions from "@/components/app/punto-actions";
import Comentarios from "@/components/app/comentarios";
import Evidencias from "@/components/app/evidencias";
import NewIncidencia from "@/components/app/new-incidencia";

export default async function PuntoDetalle({ params }: { params: Promise<{ id: string; puntoId: string }> }) {
  const { id, puntoId } = await params;
  const profile = await requireProfile();
  const supabase = await createSupabaseServer();
  const path = `/app/obras/${id}/puntos/${puntoId}`;

  const { data: punto } = await supabase.from("punto_obra").select("*").eq("id", puntoId).maybeSingle();
  if (!punto) notFound();
  const { data: obra } = await supabase.from("obra").select("codigo,estado").eq("id", id).maybeSingle();
  const { data: part } = await supabase.from("obra_participante").select("rol_funcional").eq("obra_id", id).eq("perfil_id", profile.id).maybeSingle();

  const miRol = part?.rol_funcional as string | undefined;
  const esSuperior = isAdmin(profile) || miRol === "ingeniero_jefe";
  const puedeOperar = (isAdmin(profile) || !!miRol) && obra?.estado !== "cerrada";

  const [{ data: incs }, { data: coms }, { data: archivos }] = await Promise.all([
    supabase.from("incidencia").select("*").eq("punto_id", puntoId).order("created_at", { ascending: false }),
    supabase.from("comentario").select("id,cuerpo,created_at,edited_at,autor:perfil_usuario!comentario_autor_id_fkey(nombre,email)").eq("punto_id", puntoId).order("created_at"),
    supabase.from("archivos_documentales").select("id,nombre,tipo,size_bytes,storage_path").eq("punto_id", puntoId).eq("upload_status", "ready").order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <PageHeader back={`/app/obras/${id}`} eyebrow={`${obra?.codigo ?? ""} · ${punto.codigo}`} title={punto.nombre} right={<PuntoBadge e={punto.estado} />} />
      <div className="space-y-5 px-4">
        {punto.descripcion && <p className="text-sm text-ink/80">{punto.descripcion}</p>}

        <PuntoActions obraId={id} puntoId={puntoId} estado={punto.estado} esSuperior={esSuperior} />

        <section>
          <h2 className="mb-2 text-sm font-semibold">Incidencias</h2>
          <div className="space-y-2">
            {(incs ?? []).length === 0 && <p className="text-xs text-muted">Ninguna incidencia en este punto.</p>}
            {(incs ?? []).map((i: any) => (
              <Link key={i.id} href={`${path}/incidencias/${i.id}`} className="row-tap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-muted">{i.codigo}</span>
                    <IncBadge e={i.estado} /> <PrioBadge p={i.prioridad} />
                  </div>
                  <p className="truncate text-sm font-medium">{i.titulo}</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted" />
              </Link>
            ))}
            {punto.estado === "abierto" && puedeOperar && <div className="pt-1"><NewIncidencia obraId={id} puntoId={puntoId} /></div>}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold">Evidencias</h2>
          <Evidencias path={path} obraId={id} puntoId={puntoId} items={(archivos ?? []) as any} canUpload={puedeOperar} />
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold">Comentarios</h2>
          <Comentarios path={path} target="punto" targetId={puntoId} items={(coms ?? []) as any} canComment={puedeOperar && punto.estado !== "cerrado" && punto.estado !== "descartado"} />
        </section>
      </div>
    </div>
  );
}
