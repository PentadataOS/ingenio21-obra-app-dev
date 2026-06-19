import { FileText, Download } from "lucide-react";
import { createSupabaseServer } from "@/lib/supabase/server";
import { requireProfile, isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/header";
import { Empty } from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { signedUrl } from "@/lib/storage";
import { fmtDateTime, fmtBytes } from "@/lib/format";
import { GenerarButton, RegenerarButton } from "@/components/app/expediente-generar";

const estadoTone: Record<string, [any, string]> = { generando: ["warn", "Generando"], generado: ["ok", "Generado"], error: ["danger", "Error"] };

export default async function Expedientes({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createSupabaseServer();
  const { data: obra } = await supabase.from("obra").select("codigo,estado").eq("id", id).maybeSingle();
  const { data: part } = await supabase.from("obra_participante").select("rol_funcional").eq("obra_id", id).eq("perfil_id", profile.id).maybeSingle();
  const esSuperior = isAdmin(profile) || part?.rol_funcional === "ingeniero_jefe";

  const { data } = await supabase.from("expediente_obra").select("*").eq("obra_id", id).order("version", { ascending: false });
  const exps = (data ?? []) as any[];
  const withUrls = await Promise.all(exps.map(async (e) => ({
    ...e,
    pdfUrl: e.estado === "generado" ? await signedUrl("expedientes", e.pdf_path) : null,
    zipUrl: e.estado === "generado" ? await signedUrl("expedientes", e.zip_path) : null,
  })));

  return (
    <div>
      <PageHeader back={`/app/obras/${id}`} eyebrow={obra?.codigo} title="Expedientes" right={esSuperior && obra?.estado === "cerrada" ? <RegenerarButton obraId={id} /> : undefined} />
      <div className="space-y-3 px-4 pt-1">
        {withUrls.length === 0 ? <Empty icon={<FileText className="h-6 w-6" />} title="Sin expedientes" hint="Se crean al cerrar la obra." /> :
          withUrls.map((e) => (
            <div key={e.id} className="card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><span className="text-sm font-semibold">Versión {e.version}</span><Badge t={estadoTone[e.estado]?.[0] ?? "gray"}>{estadoTone[e.estado]?.[1] ?? e.estado}</Badge></div>
                {e.incluye_modelos_3d && <span className="text-[10px] text-muted">incluye 3D</span>}
              </div>
              <p className="mt-0.5 text-xs text-muted">{fmtDateTime(e.generated_at ?? e.created_at)}{e.size_bytes ? ` · ${fmtBytes(e.size_bytes)}` : ""}</p>
              {e.estado === "generado" && (
                <div className="mt-3 flex gap-2">
                  {e.pdfUrl && <a href={e.pdfUrl} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-white py-2 text-xs font-medium"><Download className="h-4 w-4 text-brand-indigo" /> PDF</a>}
                  {e.zipUrl && <a href={e.zipUrl} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-white py-2 text-xs font-medium"><Download className="h-4 w-4 text-brand-indigo" /> ZIP</a>}
                </div>
              )}
              {e.estado !== "generado" && esSuperior && <div className="mt-3"><GenerarButton expId={e.id} label={e.estado === "error" ? "Reintentar" : "Generar ahora"} /></div>}
              {e.estado === "error" && e.error_msg && <p className="mt-1 text-xs text-danger">{e.error_msg}</p>}
            </div>
          ))
        }
      </div>
    </div>
  );
}
