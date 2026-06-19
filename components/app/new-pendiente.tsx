"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Sheet, Field, inputCls } from "@/components/ui/sheet";
import { crearPendiente } from "@/lib/actions";

export default function NewPendiente({ obraId }: { obraId: string }) {
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [prioridad, setPrioridad] = useState("media");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  function submit() {
    setErr(null);
    start(async () => {
      const r = await crearPendiente(obraId, { titulo, prioridad });
      if (!r.ok) { setErr(r.error ?? "Error"); return; }
      setOpen(false); setTitulo(""); setPrioridad("media"); router.refresh();
    });
  }
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-brand-indigo/40 bg-brand-indigo/5 py-3 text-sm font-medium text-brand-indigo">
        <Plus className="h-4 w-4" /> Nuevo pendiente
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Nuevo pendiente">
        <Field label="¿Qué hay que hacer?"><input className={inputCls} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Llamar al proveedor" /></Field>
        <Field label="Prioridad"><select className={inputCls} value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
          <option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option><option value="critica">Crítica</option>
        </select></Field>
        {err && <p className="mb-2 text-xs text-danger">{err}</p>}
        <button onClick={submit} disabled={!titulo || pending} className="gradient-bg mt-1 w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Creando…" : "Crear"}</button>
      </Sheet>
    </>
  );
}
