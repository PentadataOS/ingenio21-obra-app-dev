import type { EstadoPunto, EstadoIncidencia, EstadoObra, Prioridad } from "@/lib/types";

const tone: Record<string, string> = {
  ok: "bg-emerald-50 text-emerald-700",
  warn: "bg-amber-50 text-amber-700",
  review: "bg-orange-50 text-orange-700",
  danger: "bg-rose-50 text-rose-700",
  info: "bg-indigo-50 text-indigo-700",
  gray: "bg-slate-100 text-slate-600",
};

export function Badge({ t, children }: { t: keyof typeof tone; children: React.ReactNode }) {
  return <span className={`pill ${tone[t]}`}>{children}</span>;
}

const estadoObra: Record<EstadoObra, [keyof typeof tone, string]> = {
  activa: ["info", "Activa"], en_revision: ["review", "En revisión"], cerrada: ["gray", "Cerrada"],
};
const estadoPunto: Record<EstadoPunto, [keyof typeof tone, string]> = {
  pendiente_validacion: ["warn", "Pendiente"], abierto: ["info", "Abierto"],
  cerrado: ["ok", "Cerrado"], descartado: ["gray", "Descartado"],
};
const estadoInc: Record<EstadoIncidencia, [keyof typeof tone, string]> = {
  abierta: ["danger", "Abierta"], en_revision: ["review", "En revisión"],
  cerrada: ["ok", "Cerrada"], descartada: ["gray", "Descartada"],
};
const prio: Record<Prioridad, [keyof typeof tone, string]> = {
  baja: ["gray", "Baja"], media: ["info", "Media"], alta: ["warn", "Alta"], critica: ["danger", "Crítica"],
};

export const ObraBadge = ({ e }: { e: EstadoObra }) => <Badge t={estadoObra[e][0]}>{estadoObra[e][1]}</Badge>;
export const PuntoBadge = ({ e }: { e: EstadoPunto }) => <Badge t={estadoPunto[e][0]}>{estadoPunto[e][1]}</Badge>;
export const IncBadge = ({ e }: { e: EstadoIncidencia }) => <Badge t={estadoInc[e][0]}>{estadoInc[e][1]}</Badge>;
export const PrioBadge = ({ p }: { p: Prioridad }) => <Badge t={prio[p][0]}>{prio[p][1]}</Badge>;
