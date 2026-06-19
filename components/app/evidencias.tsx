"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Upload, FileText, ImageIcon } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { prepararSubida, confirmarSubida, fallarSubida } from "@/lib/actions";
import { fmtBytes } from "@/lib/format";

type A = { id: string; nombre: string; tipo: string; size_bytes: number | null; storage_path: string };

async function compressImage(file: File): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const max = 1600; const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d"); if (!ctx) return file;
    ctx.drawImage(bmp, 0, 0, w, h);
    return await new Promise((res) => canvas.toBlob((b) => res(b ?? file), "image/jpeg", 0.82));
  } catch { return file; }
}

export default function Evidencias({ path, obraId, puntoId, incidenciaId, items, canUpload }: { path: string; obraId: string; puntoId?: string | null; incidenciaId?: string | null; items: A[]; canUpload: boolean }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFile(file?: File | null) {
    if (!file) return;
    setErr(null); setBusy(true);
    try {
      const isImg = file.type.startsWith("image/");
      const blob = isImg ? await compressImage(file) : file;
      const prep = await prepararSubida({ obraId, puntoId: puntoId ?? null, incidenciaId: incidenciaId ?? null, nombre: file.name, tipo: isImg ? "imagen" : "documento", mime: file.type || null, size: blob.size });
      if (!prep.ok || !prep.data) throw new Error(prep.error ?? "No se pudo preparar la subida");
      const d = prep.data as { storage_path: string; bucket: string; archivo_id: string };
      const supabase = createSupabaseBrowser();
      const up = await supabase.storage.from(d.bucket).upload(d.storage_path, blob, { contentType: file.type || "application/octet-stream", upsert: false });
      if (up.error) { await fallarSubida(d.archivo_id); throw up.error; }
      await confirmarSubida(path, d.archivo_id);
      router.refresh();
    } catch (e) { setErr(e instanceof Error ? e.message : "Error al subir"); }
    finally { setBusy(false); if (camRef.current) camRef.current.value = ""; if (fileRef.current) fileRef.current.value = ""; }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {items.map((a) => (
          <div key={a.id} className="flex flex-col items-center justify-center rounded-xl border border-line bg-white p-3 text-center shadow-card">
            {a.tipo === "imagen" ? <ImageIcon className="h-6 w-6 text-brand-indigo" /> : <FileText className="h-6 w-6 text-brand-indigo" />}
            <p className="mt-1 line-clamp-1 w-full text-[11px] font-medium">{a.nombre}</p>
            <p className="text-[10px] text-muted">{fmtBytes(a.size_bytes)}</p>
          </div>
        ))}
        {items.length === 0 && <p className="col-span-3 py-2 text-xs text-muted">Sin evidencias todavía.</p>}
      </div>

      {canUpload && (
        <div className="flex gap-2">
          <button onClick={() => camRef.current?.click()} disabled={busy} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line bg-white py-2.5 text-sm font-medium disabled:opacity-50">
            <Camera className="h-4 w-4 text-brand-indigo" /> Cámara
          </button>
          <button onClick={() => fileRef.current?.click()} disabled={busy} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line bg-white py-2.5 text-sm font-medium disabled:opacity-50">
            <Upload className="h-4 w-4 text-brand-indigo" /> {busy ? "Subiendo…" : "Archivo"}
          </button>
        </div>
      )}
      <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
      <input ref={fileRef} type="file" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
      {err && <p className="text-xs text-danger">{err}</p>}
    </div>
  );
}
