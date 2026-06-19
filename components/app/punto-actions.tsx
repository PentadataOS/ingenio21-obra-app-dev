"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lock, XCircle } from "lucide-react";
import { validarPunto, cerrarPunto, descartarPunto } from "@/lib/actions";

export default function PuntoActions({ obraId, puntoId, estado, esSuperior }: { obraId: string; puntoId: string; estado: string; esSuperior: boolean }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  if (!esSuperior || estado === "cerrado" || estado === "descartado") return null;

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setErr(null);
    start(async () => { const r = await fn(); if (!r.ok) setErr(r.error ?? "Error"); else router.refresh(); });
  };
  const descartar = () => {
    const motivo = window.prompt("Motivo del descarte:");
    if (motivo && motivo.trim()) run(() => descartarPunto(obraId, puntoId, motivo.trim()));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {estado === "pendiente_validacion" && (
          <button onClick={() => run(() => validarPunto(obraId, puntoId))} disabled={pending} className="gradient-bg flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50">
            <CheckCircle2 className="h-4 w-4" /> Validar punto
          </button>
        )}
        {estado === "abierto" && (
          <button onClick={() => run(() => cerrarPunto(obraId, puntoId))} disabled={pending} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-ok py-3 text-sm font-semibold text-white disabled:opacity-50">
            <Lock className="h-4 w-4" /> Cerrar punto
          </button>
        )}
        <button onClick={descartar} disabled={pending} className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-white px-4 py-3 text-sm font-medium text-danger disabled:opacity-50">
          <XCircle className="h-4 w-4" />
        </button>
      </div>
      {err && <p className="text-xs text-danger">{err}</p>}
    </div>
  );
}
