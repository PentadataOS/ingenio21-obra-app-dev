"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Sheet, Field, inputCls } from "@/components/ui/sheet";
import { crearObra } from "@/lib/actions";

export default function NewObra() {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit() {
    setError(null);
    start(async () => {
      const r = await crearObra({ nombre, direccion });
      if (!r.ok) { setError(r.error ?? "No se pudo crear"); return; }
      setOpen(false); setNombre(""); setDireccion(""); router.refresh();
    });
  }
  return (
    <>
      <button onClick={() => setOpen(true)} className="gradient-bg flex items-center gap-1 rounded-full px-3.5 py-2 text-xs font-semibold text-white">
        <Plus className="h-4 w-4" /> Nueva obra
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Nueva obra">
        <Field label="Nombre de la obra"><input className={inputCls} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Reforma C/ Mayor 12" /></Field>
        <Field label="Dirección (opcional)"><input className={inputCls} value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Valencia" /></Field>
        {error && <p className="mb-2 text-xs text-danger">{error}</p>}
        <button onClick={submit} disabled={!nombre || pending} className="gradient-bg mt-1 w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50">
          {pending ? "Creando…" : "Crear obra"}
        </button>
      </Sheet>
    </>
  );
}
