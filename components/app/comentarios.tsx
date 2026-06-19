"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { crearComentario } from "@/lib/actions";
import { initials, fmtDateTime } from "@/lib/format";

type C = { id: string; cuerpo: string; created_at: string; edited_at: string | null; autor?: { nombre: string | null; email: string | null } | null };

export default function Comentarios({ path, target, targetId, items, canComment }: { path: string; target: "obra" | "punto" | "incidencia"; targetId: string; items: C[]; canComment: boolean }) {
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function add() {
    setErr(null);
    start(async () => {
      const r = await crearComentario(path, target, targetId, text.trim());
      if (!r.ok) { setErr(r.error ?? "Error"); return; }
      setText(""); router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="text-xs text-muted">Sin comentarios todavía.</p>}
      {items.map((c) => (
        <div key={c.id} className="flex gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-indigo/10 text-[11px] font-semibold text-brand-indigo">{initials(c.autor?.nombre, c.autor?.email)}</div>
          <div className="min-w-0 flex-1 rounded-2xl border border-line bg-white px-3.5 py-2.5 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-xs font-medium">{c.autor?.nombre ?? c.autor?.email ?? "—"}</span>
              <span className="shrink-0 text-[10px] text-muted">{fmtDateTime(c.created_at)}{c.edited_at ? " · editado" : ""}</span>
            </div>
            <p className="mt-0.5 whitespace-pre-wrap text-sm text-ink/90">{c.cuerpo}</p>
          </div>
        </div>
      ))}
      {canComment && (
        <div className="flex items-end gap-2 pt-1">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={1} placeholder="Escribe un comentario…" className="flex-1 resize-none rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-indigo" />
          <button onClick={add} disabled={!text.trim() || pending} className="gradient-bg rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Enviar</button>
        </div>
      )}
      {err && <p className="text-xs text-danger">{err}</p>}
    </div>
  );
}
