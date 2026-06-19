import { notFound, redirect } from "next/navigation";
import { AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { createSupabaseServer } from "@/lib/supabase/server";
import { requireProfile, isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/header";
import CierrePanel from "@/components/app/cierre-panel";

export default async function CierrePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createSupabaseServer();
  const { data: obra } = await supabase.from("obra").select("codigo,nombre,estado").eq("id", id).maybeSingle();
  if (!obra) notFound();
  const { data: part } = await supabase.from("obra_participante").select("rol_funcional").eq("obra_id", id).eq("perfil_id", profile.id).maybeSingle();
  const esSuperior = isAdmin(profile) || part?.rol_funcional === "ingeniero_jefe";
  if (!esSuperior) redirect(`/app/obras/${id}`);
  if (obra.estado === "cerrada") redirect(`/app/obras/${id}/expedientes`);

  const { data: pf } = await supabase.rpc("preflight_obra", { p_obra: id });
  const criticos: any[] = pf?.criticos ?? [];
  const advertencias: any[] = pf?.advertencias ?? [];
  const verificados: number = pf?.verificados ?? 0;
  const puede = !!pf?.puede_cerrar;

  return (
    <div>
      <PageHeader back={`/app/obras/${id}`} eyebrow={obra.codigo} title="Prevuelo de cierre" />
      <div className="space-y-4 px-4">
        <div className="card flex items-center gap-4 p-5">
          <div className={`flex h-20 w-20 items-center justify-center rounded-full border-[6px] ${puede ? "border-ok" : criticos.length ? "border-danger" : "border-warn"}`}>
            <div className="text-center"><div className="text-xl font-bold">{verificados}</div><div className="text-[9px] text-muted">verificados</div></div>
          </div>
          <div>
            <p className="text-sm font-semibold">{puede ? "Lista para cerrar" : "Aún no se puede cerrar"}</p>
            <p className="text-xs text-muted">{criticos.length} críticos · {advertencias.length} advertencias</p>
          </div>
        </div>

        {criticos.length > 0 && (
          <section>
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-danger"><AlertCircle className="h-4 w-4" /> Acciones requeridas</h2>
            <div className="space-y-2">{criticos.map((c, i) => (<div key={i} className="flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/5 px-3 py-2.5 text-sm"><span className="flex-1">{c.msg}</span><span className="text-xs font-semibold text-danger">{c.n}</span></div>))}</div>
          </section>
        )}
        {advertencias.length > 0 && (
          <section>
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-warn"><AlertTriangle className="h-4 w-4" /> Advertencias</h2>
            <div className="space-y-2">{advertencias.map((a, i) => (<div key={i} className="flex items-center gap-2 rounded-xl border border-warn/20 bg-warn/5 px-3 py-2.5 text-sm"><span className="flex-1">{a.msg}</span><span className="text-xs font-semibold text-warn">{a.n}</span></div>))}</div>
          </section>
        )}
        {puede && criticos.length === 0 && advertencias.length === 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-ok/20 bg-ok/5 px-3 py-2.5 text-sm text-ok"><CheckCircle2 className="h-4 w-4" /> Todo verificado. Sin observaciones.</div>
        )}

        <CierrePanel obraId={id} puedeCerrar={puede} />
      </div>
    </div>
  );
}
