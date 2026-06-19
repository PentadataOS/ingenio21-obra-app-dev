"use client";
import { useState, useTransition } from "react";
import { UserPlus, Copy, Check } from "lucide-react";
import { Sheet, Field, inputCls } from "@/components/ui/sheet";
import { invitarAObra } from "@/lib/actions";

export default function InviteMember({ obraId }: { obraId: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("tecnico");
  const [link, setLink] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  function submit() {
    setErr(null);
    start(async () => {
      const r = await invitarAObra(obraId, email, rol);
      if (!r.ok) { setErr(r.error ?? "Error"); return; }
      const token = (r.data as { token?: string } | undefined)?.token;
      setLink(`${window.location.origin}/invitacion/${token}`);
    });
  }
  function copy() { if (link) { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); } }

  return (
    <>
      <button onClick={() => { setOpen(true); setLink(null); setEmail(""); setErr(null); }} className="flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium">
        <UserPlus className="h-4 w-4 text-brand-indigo" /> Invitar
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Invitar a la obra">
        {!link ? (
          <>
            <Field label="Correo de la persona"><input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="persona@empresa.com" /></Field>
            <Field label="Rol"><select className={inputCls} value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="ingeniero_jefe">Ingeniero jefe</option><option value="jefe_obra">Jefe de obra</option><option value="tecnico">Técnico</option><option value="colaborador">Colaborador</option>
            </select></Field>
            {err && <p className="mb-2 text-xs text-danger">{err}</p>}
            <button onClick={submit} disabled={!email || pending} className="gradient-bg mt-1 w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Generando…" : "Generar invitación"}</button>
          </>
        ) : (
          <>
            <p className="mb-2 text-sm text-muted">Comparte este enlace. Solo funcionará con el correo invitado.</p>
            <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5">
              <span className="min-w-0 flex-1 truncate text-xs">{link}</span>
              <button onClick={copy} className="shrink-0 text-brand-indigo">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button>
            </div>
            <button onClick={() => setOpen(false)} className="mt-3 w-full rounded-xl border border-line py-2.5 text-sm font-medium">Hecho</button>
          </>
        )}
      </Sheet>
    </>
  );
}
