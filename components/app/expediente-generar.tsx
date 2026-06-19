"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { regenerarExpediente } from "@/lib/actions";

export function GenerarButton({ expId, label }: { expId: string; label: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function go() {
    setBusy(true);
    try { await fetch(`/api/expediente/${expId}/generar`, { method: "POST" }); } catch {}
    setBusy(false); router.refresh();
  }
  return <button onClick={go} disabled={busy} className="rounded-lg bg-brand-indigo px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">{busy ? "Generando…" : label}</button>;
}

export function RegenerarButton({ obraId }: { obraId: string }) {
  const [busy, setBusy] = useState(false);
  const [, start] = useTransition();
  const router = useRouter();
  function go() {
    setBusy(true);
    start(async () => {
      const r = await regenerarExpediente(obraId, false);
      if (r.ok) { const id = r.data as string; try { await fetch(`/api/expediente/${id}/generar`, { method: "POST" }); } catch {} }
      setBusy(false); router.refresh();
    });
  }
  return <button onClick={go} disabled={busy} className="flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium"><RefreshCw className="h-4 w-4 text-brand-indigo" /> {busy ? "…" : "Regenerar"}</button>;
}
