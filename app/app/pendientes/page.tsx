import { ListChecks } from "lucide-react";
import { createSupabaseServer } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { PageHeader } from "@/components/ui/header";
import { Empty } from "@/components/ui/empty";
import PendienteItem from "@/components/app/pendiente-item";

const order = ["critica", "alta", "media", "baja"] as const;
const label: Record<string, string> = { critica: "Crítica", alta: "Alta", media: "Media", baja: "Baja" };

export default async function PendientesPage() {
  await requireProfile();
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("pendiente")
    .select("id,titulo,prioridad,estado,obra:obra!pendiente_obra_id_fkey(nombre,codigo)")
    .eq("estado", "abierto").order("created_at", { ascending: false });
  const items = (data ?? []) as any[];

  return (
    <div>
      <PageHeader title="Mis pendientes" />
      <div className="space-y-5 px-4 pt-1">
        {items.length === 0 ? (
          <Empty icon={<ListChecks className="h-6 w-6" />} title="Todo al día" hint="No tienes pendientes abiertos." />
        ) : (
          order.map((p) => {
            const grp = items.filter((x) => x.prioridad === p);
            if (!grp.length) return null;
            return (
              <section key={p}>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{label[p]}</h2>
                <div className="space-y-2">
                  {grp.map((x) => <PendienteItem key={x.id} id={x.id} titulo={x.titulo} prioridad={x.prioridad} hecho={false} sub={x.obra?.nombre} />)}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
