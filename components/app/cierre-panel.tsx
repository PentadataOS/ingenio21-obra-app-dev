"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cerrarObra } from "@/lib/actions";

export default function CierrePanel({ obraId, puedeCerrar }: { obraId: string; puedeCerrar: boolean }) {
  const [inc3d, setInc3d] = useState(false);
  const [step, setStep] = useState<"idle" | "cerrando" | "generando">("idle");
  const [err, setErr] = useState<string | null>(null);
  const [, start] = useTransition();
  const router = useRouter();

  function run() {
    setErr(null);
    start(async () => {
      setStep("cerrando");
      const r = await cerrarObra(obraId, inc3d);
      if (!r.ok) { setErr(r.error ?? "No se pudo cerrar"); setStep("idle"); return; }
      const expId = r.data as string;
      setStep("generando");
      try { await fetch(`/api/expediente/${expId}/generar`, { method: "POST" }); } catch {}
      router.push(`/app/obras/${obraId}/expedientes`); router.refresh();
    });
  }
  return (
    <div className="card p-4">
      <label className="flex items-center justify-between py-1">
        <span className="text-sm">Incluir modelos 3D</span>
        <input type="checkbox" checked={inc3d} onChange={(e) => setInc3d(e.target.checked)} className="h-5 w-5 accent-[#4f46e5]" />
      </label>
      <button onClick={run} disabled={!puedeCerrar || step !== "idle"} className="gradient-bg mt-3 w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50">
        {step === "cerrando" ? "Cerrando obra…" : step === "generando" ? "Generando expediente…" : "Cerrar y generar expediente"}
      </button>
      {!puedeCerrar && <p className="mt-2 text-center text-xs text-muted">Resuelve los puntos críticos para poder cerrar.</p>}
      {err && <p className="mt-2 text-center text-xs text-danger">{err}</p>}
    </div>
  );
}
