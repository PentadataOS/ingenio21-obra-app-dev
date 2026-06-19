"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Sheet, Field, inputCls } from "@/components/ui/sheet";
import { crearPunto } from "@/lib/actions";

export default function NewPunto({ obraId }: { obraId: string }) {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit() {
    setError(null);
    start(async () => {
      const r = await crearPunto(obraId, { nombre, descripcion });
      if (!r.ok) { setError(r.error ?? "No se pudo crear"); return; }
      setOpen(false); setNombre(""); setDescripcion(""); router.refresh();
    });
  }
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-brand-indigo/40 bg-brand-indigo/5 py-3 text-sm font-medium text-brand-indigo">
        <Plus className="h-4 w-4" /> Nuevo punto
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Nuevo punto de control">
        <Field label="Nombre del punto"><input className={inputCls} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Forjado planta 2" /></Field>
        <Field label="Descripción (opcional)"><textarea className={inputCls} rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} /></Field>
        {error && <p className="mb-2 text-xs text-danger">{error}</p>}
        <button onClick={submit} disabled={!nombre || pending} className="gradient-bg mt-1 w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50">
          {pending ? "Creando…" : "Crear punto"}
        </button>
      </Sheet>
    </>
  );
}
