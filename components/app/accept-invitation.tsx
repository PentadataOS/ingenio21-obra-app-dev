"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { aceptarInvitacion } from "@/lib/actions";

export default function AcceptInvitation({ token }: { token: string }) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  function accept() {
    setErr(null);
    start(async () => {
      const r = await aceptarInvitacion(token);
      if (!r.ok) { setErr(r.error ?? "Error"); return; }
      router.push(`/app/obras/${r.data}`); router.refresh();
    });
  }
  return (
    <div>
      <button onClick={accept} disabled={pending} className="gradient-bg w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Aceptando…" : "Aceptar invitación"}</button>
      {err && <p className="mt-2 text-center text-xs text-danger">{err}</p>}
    </div>
  );
}
