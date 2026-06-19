import Link from "next/link";
import { Building2 } from "lucide-react";
import { createSupabaseServer } from "@/lib/supabase/server";
import { requireProfile, isAdmin } from "@/lib/auth";
import { ObraBadge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import NewObra from "@/components/app/new-obra";
import { PageHeader } from "@/components/ui/header";

type ObraRow = {
  id: string; codigo: string; nombre: string; direccion: string | null; estado: any;
  n_puntos: number; n_puntos_cerrados: number; n_incidencias_abiertas: number; n_participantes: number;
};

export default async function ObrasPage() {
  const profile = await requireProfile();
  const supabase = await createSupabaseServer();
  const { data } = await supabase.from("v_obra_resumen").select("*").order("created_at", { ascending: false });
  const obras = (data ?? []) as ObraRow[];

  return (
    <div>
      <PageHeader title="Obras" right={isAdmin(profile) ? <NewObra /> : undefined} />
      <div className="space-y-3 px-4 pt-1">
        {obras.length === 0 ? (
          <Empty icon={<Building2 className="h-6 w-6" />} title="Aún no hay obras" hint={isAdmin(profile) ? "Crea la primera con “Nueva obra”." : "Cuando te asignen a una obra, aparecerá aquí."} />
        ) : (
          obras.map((o) => (
            <Link key={o.id} href={`/app/obras/${o.id}`} className="block">
              <div className="card overflow-hidden">
                <div className="gradient-bg h-20 w-full opacity-90" />
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted">{o.codigo}</span>
                    <ObraBadge e={o.estado} />
                  </div>
                  <h3 className="mt-0.5 text-base font-semibold tracking-tight">{o.nombre}</h3>
                  {o.direccion && <p className="text-xs text-muted">{o.direccion}</p>}
                  <div className="mt-3 flex gap-4 text-xs text-muted">
                    <span><b className="text-ink">{o.n_puntos_cerrados}/{o.n_puntos}</b> puntos</span>
                    <span><b className="text-ink">{o.n_incidencias_abiertas}</b> incid. abiertas</span>
                    <span><b className="text-ink">{o.n_participantes}</b> equipo</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
