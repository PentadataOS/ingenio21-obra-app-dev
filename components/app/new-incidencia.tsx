"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Sheet, Field, inputCls } from "@/components/ui/sheet";
import { crearIncidencia } from "@/lib/actions";

export default function NewIncidencia({ obraId, puntoId }: { obraId: string; puntoId: string }) {
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState("media");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit() {
    setErr(null);
    start(async () => {
      const r = await crearIncidencia(obraId, puntoId, { titulo, descripcion, prioridad });
      if (!r.ok) { setErr(r.error ?? "No se pudo crear"); return; }
      setOpen(false); setTitulo(""); setDescripcion(""); setPrioridad("media"); router.refresh();
    });
  }
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-danger/40 bg-danger/5 py-3 text-sm font-medium text-danger">
        <Plus className="h-4 w-4" /> Nueva incidencia
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Nueva incidencia">
        <Field label="Título"><input className={inputCls} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Fisura en pilar" /></Field>
        <Field label="Descripción (opcional)"><textarea className={inputCls} rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} /></Field>
        <Field label="Prioridad">
          <select className={inputCls} value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
            <option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option><option value="critica">Crítica</option>
          </select>
        </Field>
        {err && <p className="mb-2 text-xs text-danger">{err}</p>}
        <button onClick={submit} disabled={!titulo || pending} className="gradient-bg mt-1 w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Creando…" : "Crear incidencia"}</button>
      </Sheet>
    </>
  );
}
