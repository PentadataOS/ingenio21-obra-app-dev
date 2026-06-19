"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";

export type ActionResult = { ok: boolean; error?: string; data?: unknown };

async function call(fn: string, args: Record<string, unknown>): Promise<ActionResult> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.rpc(fn, args);
  return error ? { ok: false, error: error.message } : { ok: true, data };
}

/* ---------- Obras ---------- */
export async function crearObra(p: { nombre: string; direccion?: string; descripcion?: string }) {
  const r = await call("crear_obra", { p_nombre: p.nombre, p_direccion: p.direccion || null, p_descripcion: p.descripcion || null });
  revalidatePath("/app/obras"); revalidatePath("/app"); return r;
}
export async function cerrarObra(obraId: string, incluye3d: boolean) {
  const r = await call("cerrar_obra", { p_obra: obraId, p_incluye_3d: incluye3d });
  revalidatePath(`/app/obras/${obraId}`); return r;
}
export async function reabrirObra(obraId: string, motivo: string) {
  const r = await call("reabrir_obra", { p_obra: obraId, p_motivo: motivo });
  revalidatePath(`/app/obras/${obraId}`); return r;
}
export async function regenerarExpediente(obraId: string, incluye3d: boolean) {
  const r = await call("regenerar_expediente", { p_obra: obraId, p_incluye_3d: incluye3d });
  revalidatePath(`/app/obras/${obraId}`); return r;
}

/* ---------- Puntos ---------- */
export async function crearPunto(obraId: string, p: { nombre: string; descripcion?: string }) {
  const r = await call("crear_punto", { p_obra: obraId, p_nombre: p.nombre, p_descripcion: p.descripcion || null });
  revalidatePath(`/app/obras/${obraId}`); return r;
}
export async function validarPunto(obraId: string, puntoId: string) {
  const r = await call("validar_punto", { p_punto: puntoId });
  revalidatePath(`/app/obras/${obraId}/puntos/${puntoId}`); revalidatePath(`/app/obras/${obraId}`); return r;
}
export async function cerrarPunto(obraId: string, puntoId: string) {
  const r = await call("cerrar_punto", { p_punto: puntoId });
  revalidatePath(`/app/obras/${obraId}/puntos/${puntoId}`); revalidatePath(`/app/obras/${obraId}`); return r;
}
export async function descartarPunto(obraId: string, puntoId: string, motivo: string) {
  const r = await call("descartar_punto", { p_punto: puntoId, p_motivo: motivo });
  revalidatePath(`/app/obras/${obraId}`); return r;
}

/* ---------- Incidencias ---------- */
export async function crearIncidencia(obraId: string, puntoId: string, p: { titulo: string; descripcion?: string; prioridad: string; vencimiento?: string }) {
  const r = await call("crear_incidencia", { p_punto: puntoId, p_titulo: p.titulo, p_descripcion: p.descripcion || null, p_prioridad: p.prioridad, p_responsable: null, p_vencimiento: p.vencimiento || null });
  revalidatePath(`/app/obras/${obraId}/puntos/${puntoId}`); return r;
}
export async function revisarIncidencia(path: string, id: string) { const r = await call("revisar_incidencia", { p_incidencia: id }); revalidatePath(path); return r; }
export async function cerrarIncidencia(path: string, id: string) { const r = await call("cerrar_incidencia", { p_incidencia: id }); revalidatePath(path); return r; }
export async function descartarIncidencia(path: string, id: string, motivo: string) { const r = await call("descartar_incidencia", { p_incidencia: id, p_motivo: motivo }); revalidatePath(path); return r; }

/* ---------- Comentarios ---------- */
export async function crearComentario(path: string, target: "obra" | "punto" | "incidencia", targetId: string, cuerpo: string) {
  const r = await call("crear_comentario", { p_target_type: target, p_target_id: targetId, p_cuerpo: cuerpo }); revalidatePath(path); return r;
}
export async function editarComentario(path: string, id: string, cuerpo: string) { const r = await call("editar_comentario", { p_id: id, p_cuerpo: cuerpo }); revalidatePath(path); return r; }

/* ---------- Archivos (subida firmada) ---------- */
export async function prepararSubida(a: { obraId: string; puntoId?: string | null; incidenciaId?: string | null; nombre: string; descripcion?: string | null; tipo: string; mime?: string | null; size?: number | null }) {
  return call("preparar_subida_archivo", { p_obra: a.obraId, p_punto: a.puntoId ?? null, p_incidencia: a.incidenciaId ?? null, p_nombre: a.nombre, p_descripcion: a.descripcion ?? null, p_tipo: a.tipo, p_mime: a.mime ?? null, p_size: a.size ?? null });
}
export async function confirmarSubida(path: string, archivoId: string) { const r = await call("confirmar_subida_archivo", { p_archivo: archivoId }); revalidatePath(path); return r; }
export async function fallarSubida(archivoId: string) { return call("fallar_subida_archivo", { p_archivo: archivoId }); }

/* ---------- Pendientes (insert vía sesión + RLS) ---------- */
export async function crearPendiente(obraId: string, p: { titulo: string; prioridad: string }) {
  const supabase = await createSupabaseServer();
  const { error } = await supabase.from("pendiente").insert({ obra_id: obraId, titulo: p.titulo, prioridad: p.prioridad });
  revalidatePath("/app/pendientes"); revalidatePath(`/app/obras/${obraId}`);
  return error ? { ok: false, error: error.message } : { ok: true };
}
export async function togglePendiente(id: string, hecho: boolean) {
  const supabase = await createSupabaseServer();
  const { error } = await supabase.from("pendiente").update({ estado: hecho ? "hecho" : "abierto", completed_at: hecho ? new Date().toISOString() : null }).eq("id", id);
  revalidatePath("/app/pendientes");
  return error ? { ok: false, error: error.message } : { ok: true };
}

/* ---------- Participantes ---------- */
export async function asignarParticipante(obraId: string, perfilId: string, rol: string) {
  const r = await call("asignar_participante", { p_obra: obraId, p_perfil: perfilId, p_rol: rol }); revalidatePath(`/app/obras/${obraId}`); return r;
}

/* ---------- Invitaciones ---------- */
export async function invitarAObra(obraId: string, email: string, rol: string) {
  const r = await call("invitar_a_obra", { p_obra: obraId, p_email: email, p_rol: rol });
  revalidatePath(`/app/obras/${obraId}/equipo`); return r;
}
export async function aceptarInvitacion(token: string) {
  return call("aceptar_invitacion", { p_token: token });
}
