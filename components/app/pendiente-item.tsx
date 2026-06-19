"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { togglePendiente } from "@/lib/actions";
import { PrioBadge } from "@/components/ui/badge";

export default function PendienteItem({ id, titulo, prioridad, hecho, sub }: { id: string; titulo: string; prioridad: string; hecho: boolean; sub?: string }) {
  const [done, setDone] = useState(hecho);
  const [, start] = useTransition();
  const router = useRouter();
  function toggle() { const nv = !done; setDone(nv); start(async () => { await togglePendiente(id, nv); router.refresh(); }); }
  return (
    <div className="row-tap">
      <button onClick={toggle} aria-label="Marcar" className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${done ? "gradient-bg border-transparent text-white" : "border-line"}`}>
        {done && <Check className="h-4 w-4" />}
      </button>
      <div className="min-w-0 flex-1">
        <span className={`block truncate text-sm ${done ? "text-muted line-through" : "font-medium"}`}>{titulo}</span>
        {sub && <span className="text-[11px] text-muted">{sub}</span>}
      </div>
      <PrioBadge p={prioridad as any} />
    </div>
  );
}
