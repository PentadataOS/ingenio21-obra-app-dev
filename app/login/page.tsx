"use client";
import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setLoading(true); setError(null);
    try {
      const supabase = createSupabaseBrowser();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar el enlace");
    } finally { setLoading(false); }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <div className="mb-10 text-center">
        <div className="wordmark text-3xl">SOIARQ</div>
        <div className="mt-1 text-lg tracking-wide text-ink/70">Obra</div>
        <p className="mt-3 text-sm text-muted">Cierre documental, simple y confiable.</p>
      </div>

      {sent ? (
        <div className="card p-6 text-center">
          <h2 className="text-base font-semibold">Revisa tu correo</h2>
          <p className="mt-2 text-sm text-muted">
            Te enviamos un enlace de acceso a <span className="font-medium text-ink">{email}</span>.
            Ábrelo en este dispositivo para entrar.
          </p>
        </div>
      ) : (
        <div className="card p-6">
          <label className="text-xs font-medium text-muted">Tu correo</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@empresa.com"
            className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-sm outline-none focus:border-brand-indigo"
            onKeyDown={(e) => e.key === "Enter" && email && send()}
          />
          {error && <p className="mt-2 text-xs text-danger">{error}</p>}
          <button
            onClick={send} disabled={!email || loading}
            className="gradient-bg mt-4 w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Enviando…" : "Enviar enlace de acceso"}
          </button>
          <p className="mt-3 text-center text-[11px] text-muted">Sin contraseñas. Entras con un enlace seguro.</p>
        </div>
      )}
    </main>
  );
}
