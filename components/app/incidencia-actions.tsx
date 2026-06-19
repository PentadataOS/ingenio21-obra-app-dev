"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { revisarIncidencia, cerrarIncidencia, descartarIncidencia } from "@/lib/actions";

export default function IncidenciaActions({ path, id, estado, puedeGestionar }: { path: string; id: string; estado: string; puedeGestionar: boolean }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  if (!puedeGestionar || estado === "cerrada" || estado === "descartada") return null;

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setErr(null);
    start(async () => { const r = await fn(); if (!r.ok) setErr(r.error ?? "Error"); else router.refresh(); });
  };
  const descartar = () => { const m = window.prompt("Motivo del descarte:"); if (m && m.trim()) run(() => descartarIncidencia(path, id, m.trim())); };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {estado === "abierta" && (
          <button onClick={() => run(() => revisarIncidencia(path, id))} disabled={pending} className="flex-1 rounded-xl border border-line bg-white py-2.5 text-sm font-medium text-review disabled:opacity-50">Pasar a revisión</button>
        )}
        <button onClick={() => run(() => cerrarIncidencia(path, id))} disabled={pending} className="flex-1 rounded-xl bg-ok py-2.5 text-sm font-semibold text-white disabled:opacity-50">Cerrar incidencia</button>
        <button onClick={descartar} disabled={pending} className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium text-danger disabled:opacity-50">Descartar</button>
      </div>
      {err && <p className="text-xs text-danger">{err}</p>}
    </div>
  );
}
