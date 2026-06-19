import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ListChecks, FileArchive, History, Users } from "lucide-react";
import { createSupabaseServer } from "@/lib/supabase/server";
import { requireProfile, isAdmin } from "@/lib/auth";
import { ObraBadge, PuntoBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/header";
import { Empty } from "@/components/ui/empty";
import NewPunto from "@/components/app/new-punto";

type PuntoRow = { id: string; codigo: string; nombre: string; estado: any; n_incidencias_abiertas: number; n_evidencias: number };

export default async function ObraDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createSupabaseServer();

  const { data: obra } = await supabase.from("v_obra_resumen").select("*").eq("id", id).maybeSingle();
  if (!obra) notFound();

  const { data: part } = await supabase.from("obra_participante").select("rol_funcional").eq("obra_id", id).eq("perfil_id", profile.id).maybeSingle();
  const miRol = part?.rol_funcional as string | undefined;
  const esSuperior = isAdmin(profile) || miRol === "ingeniero_jefe";
  const puedeOperar = (isAdmin(profile) || !!miRol) && obra.estado !== "cerrada";

  const { data: puntosData } = await supabase.from("v_punto_resumen").select("*").eq("obra_id", id).order("codigo");
  const puntos = (puntosData ?? []) as PuntoRow[];

  return (
    <div>
      <PageHeader back="/app/obras" eyebrow={obra.codigo} title={obra.nombre} right={<ObraBadge e={obra.estado} />} />

      <div className="px-4">
        <div className="gradient-bg mb-4 flex items-end rounded-2xl p-4 text-white shadow-card" style={{ minHeight: 96 }}>
          <div>
            {obra.direccion && <p className="text-xs text-white/80">{obra.direccion}</p>}
            <div className="mt-1 flex gap-4 text-sm">
              <span><b>{obra.n_puntos_cerrados}/{obra.n_puntos}</b> puntos</span>
              <span><b>{obra.n_incidencias_abiertas}</b> incid.</span>
              <span><b>{obra.n_participantes}</b> equipo</span>
            </div>
          </div>
        </div>

        {esSuperior && obra.estado !== "cerrada" && (
          <Link href={`/app/obras/${id}/cierre`} className="mb-4 flex items-center justify-between rounded-2xl border border-brand-indigo/30 bg-brand-indigo/5 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-brand-indigo">Cerrar y generar expediente</p>
              <p className="text-xs text-muted">Revisa el prevuelo de cierre.</p>
            </div>
            <ChevronRight className="h-5 w-5 text-brand-indigo" />
          </Link>
        )}

        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Puntos de control</h2>
        </div>
        <div className="space-y-2.5">
          {puntos.length === 0 ? (
            <Empty title="Sin puntos todavía" hint={puedeOperar ? "Crea el primer punto de control." : undefined} />
          ) : (
            puntos.map((p) => (
              <Link key={p.id} href={`/app/obras/${id}/puntos/${p.id}`} className="row-tap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-muted">{p.codigo}</span>
                    <PuntoBadge e={p.estado} />
                  </div>
                  <p className="truncate text-sm font-medium">{p.nombre}</p>
                  <p className="text-xs text-muted">{p.n_incidencias_abiertas} incid. abiertas · {p.n_evidencias} evidencias</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted" />
              </Link>
            ))
          )}
          {puedeOperar && <div className="pt-1"><NewPunto obraId={id} /></div>}
        </div>

        <div className="mt-5 space-y-2.5">
          <SectionRow href={`/app/obras/${id}/pendientes`} icon={<ListChecks className="h-5 w-5" />} label="Pendientes" />
          <SectionRow href={`/app/obras/${id}/expedientes`} icon={<FileArchive className="h-5 w-5" />} label="Expedientes" hint={`${obra.n_expedientes}`} />
          <SectionRow href={`/app/obras/${id}/equipo`} icon={<Users className="h-5 w-5" />} label="Equipo" hint={`${obra.n_participantes}`} />
          <SectionRow href={`/app/obras/${id}/trazabilidad`} icon={<History className="h-5 w-5" />} label="Trazabilidad" />
        </div>
      </div>
    </div>
  );
}

function SectionRow({ href, icon, label, hint }: { href: string; icon: React.ReactNode; label: string; hint?: string }) {
  return (
    <Link href={href} className="row-tap">
      <div className="text-brand-indigo">{icon}</div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {hint && <span className="text-xs text-muted">{hint}</span>}
      <ChevronRight className="h-5 w-5 text-muted" />
    </Link>
  );
}
