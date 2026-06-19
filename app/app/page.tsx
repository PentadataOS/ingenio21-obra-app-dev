import Link from "next/link";
import { Building2, ListChecks, ChevronRight } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function Inicio() {
  const profile = await requireProfile();
  const supabase = await createSupabaseServer();
  const nombre = profile.nombre?.split(" ")[0] ?? "bienvenida";

  const [{ count: nObras }, { count: nPend }] = await Promise.all([
    supabase.from("obra").select("id", { count: "exact", head: true }),
    supabase.from("pendiente").select("id", { count: "exact", head: true }).eq("estado", "abierto"),
  ]);

  return (
    <div className="px-4 pt-5">
      <header className="mb-5 flex items-center justify-between">
        <div className="wordmark text-xl">SOIARQ</div>
        <span className="text-sm text-muted">Obra</span>
      </header>
      <h1 className="text-2xl font-semibold tracking-tight">Hola, {nombre}</h1>
      <p className="mb-5 text-sm text-muted">Este es el resumen de tu actividad.</p>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/app/obras" className="card p-4">
          <Building2 className="mb-2 h-6 w-6 text-brand-indigo" />
          <div className="text-2xl font-semibold">{nObras ?? 0}</div>
          <div className="text-xs text-muted">Obras</div>
        </Link>
        <Link href="/app/pendientes" className="card p-4">
          <ListChecks className="mb-2 h-6 w-6 text-brand-indigo" />
          <div className="text-2xl font-semibold">{nPend ?? 0}</div>
          <div className="text-xs text-muted">Pendientes</div>
        </Link>
      </div>

      <Link href="/app/obras" className="row-tap mt-4">
        <Building2 className="h-5 w-5 text-brand-indigo" />
        <span className="flex-1 text-sm font-medium">Ver mis obras</span>
        <ChevronRight className="h-5 w-5 text-muted" />
      </Link>
    </div>
  );
}
