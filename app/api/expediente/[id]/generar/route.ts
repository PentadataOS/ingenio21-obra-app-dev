import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import JSZip from "jszip";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function line(page: any, font: any, text: string, x: number, y: number, size: number, color = rgb(0.1, 0.1, 0.17)) {
  page.drawText(text.length > 92 ? text.slice(0, 90) + "…" : text, { x, y, size, font, color });
}

async function buildPdf(snap: any, version: number): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const obra = snap?.obra ?? {};
  const resumen = snap?.resumen ?? {};
  const puntos: any[] = snap?.puntos ?? [];

  let page = pdf.addPage([595, 842]);
  const { width, height } = page.getSize();
  // Banda de marca
  page.drawRectangle({ x: 0, y: height - 120, width, height: 120, color: rgb(0.31, 0.27, 0.85) });
  page.drawText("SOIARQ", { x: 40, y: height - 64, size: 26, font: bold, color: rgb(1, 1, 1) });
  page.drawText("OBRA  ·  EXPEDIENTE DE CIERRE", { x: 40, y: height - 88, size: 10, font, color: rgb(0.9, 0.92, 1) });

  let y = height - 160;
  line(page, bold, `${obra.codigo ?? ""}  ·  ${obra.nombre ?? ""}`, 40, y, 16); y -= 22;
  if (obra.direccion) { line(page, font, String(obra.direccion), 40, y, 11, rgb(0.42, 0.45, 0.5)); y -= 18; }
  line(page, font, `Versión ${version}  ·  Generado ${new Date().toLocaleString("es-ES")}`, 40, y, 10, rgb(0.42, 0.45, 0.5)); y -= 28;

  line(page, bold, "Resumen", 40, y, 12); y -= 18;
  line(page, font, `Puntos: ${resumen.puntos_cerrados ?? 0} cerrados de ${resumen.puntos_total ?? 0}`, 40, y, 11); y -= 16;
  line(page, font, `Incidencias registradas: ${resumen.incidencias_total ?? 0}`, 40, y, 11); y -= 16;
  line(page, font, `Evidencias documentales: ${resumen.archivos_total ?? 0}`, 40, y, 11); y -= 26;

  line(page, bold, "Puntos de control", 40, y, 12); y -= 18;
  for (const p of puntos) {
    const pt = p?.punto ?? {};
    const nInc = (p?.incidencias ?? []).length;
    const nEv = (p?.archivos ?? []).length;
    if (y < 70) { page = pdf.addPage([595, 842]); y = height - 60; }
    line(page, bold, `${pt.codigo ?? ""}  ${pt.nombre ?? ""}`, 40, y, 11); y -= 15;
    line(page, font, `Estado: ${pt.estado ?? ""}  ·  ${nInc} incidencias  ·  ${nEv} evidencias`, 48, y, 10, rgb(0.42, 0.45, 0.5)); y -= 18;
  }
  if (y < 60) { page = pdf.addPage([595, 842]); y = height - 60; }
  page.drawText("Documento generado automáticamente desde el snapshot inmutable de cierre.", { x: 40, y: 40, size: 8, font, color: rgb(0.6, 0.62, 0.66) });
  return await pdf.save();
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServer();
  const { data: exp, error } = await supabase.from("expediente_obra").select("*").eq("id", id).maybeSingle();
  if (error || !exp) return NextResponse.json({ error: "Expediente no encontrado" }, { status: 404 });

  try {
    const snap = exp.snapshot_json;
    const pdfBytes = await buildPdf(snap, exp.version);
    const zip = new JSZip();
    zip.file("expediente.pdf", pdfBytes);
    zip.file("manifest.json", JSON.stringify(snap, null, 2));
    zip.file("LEEME.txt", `Expediente de ${snap?.obra?.codigo ?? ""} — versión ${exp.version}\nGenerado el ${new Date().toLocaleString("es-ES")}\nSnapshot inmutable de cierre.`);
    const zipBytes = await zip.generateAsync({ type: "uint8array" });

    const base = `obras/${exp.obra_id}/v${exp.version}`;
    const pdfPath = `${base}/expediente.pdf`;
    const zipPath = `${base}/expediente.zip`;
    const up1 = await supabase.storage.from("expedientes").upload(pdfPath, pdfBytes, { contentType: "application/pdf", upsert: true });
    const up2 = await supabase.storage.from("expedientes").upload(zipPath, zipBytes, { contentType: "application/zip", upsert: true });
    if (up1.error || up2.error) throw new Error(up1.error?.message || up2.error?.message);

    const mark = await supabase.rpc("marcar_expediente", { p_exp: id, p_estado: "generado", p_pdf: pdfPath, p_zip: zipPath, p_manifest: null, p_size: zipBytes.length, p_error: null });
    if (mark.error) throw new Error(mark.error.message);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error de generación";
    await supabase.rpc("marcar_expediente", { p_exp: id, p_estado: "error", p_pdf: null, p_zip: null, p_manifest: null, p_size: null, p_error: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
