export type RolGlobal = "admin_pentadata" | "admin_ingenio21" | "invitado";
export type RolFuncional = "ingeniero_jefe" | "jefe_obra" | "tecnico" | "colaborador";
export type EstadoObra = "activa" | "en_revision" | "cerrada";
export type EstadoPunto = "pendiente_validacion" | "abierto" | "cerrado" | "descartado";
export type EstadoIncidencia = "abierta" | "en_revision" | "cerrada" | "descartada";
export type Prioridad = "baja" | "media" | "alta" | "critica";
export type EstadoArchivo = "pending" | "ready" | "failed";
export type TipoArchivo = "imagen" | "documento" | "otro";
export type EstadoExpediente = "generando" | "generado" | "error";
export type EstadoInforme = "generando" | "generado" | "error";
export type EstadoPendiente = "abierto" | "hecho";

export interface Perfil { id: string; email: string; nombre: string | null; rol_global: RolGlobal; }
export interface Obra {
  id: string; codigo: string; nombre: string; direccion: string | null; descripcion: string | null;
  estado: EstadoObra; cover_path: string | null; created_at: string; closed_at: string | null;
}
export interface Punto {
  id: string; obra_id: string; codigo: string; nombre: string; descripcion: string | null;
  estado: EstadoPunto; cover_path: string | null; created_at: string;
}
export interface Incidencia {
  id: string; obra_id: string; punto_id: string; codigo: string; titulo: string; descripcion: string | null;
  prioridad: Prioridad; estado: EstadoIncidencia; responsable_id: string | null; vencimiento: string | null; created_at: string;
}
export interface Comentario {
  id: string; obra_ctx_id: string; obra_id: string | null; punto_id: string | null; incidencia_id: string | null;
  autor_id: string; cuerpo: string; created_at: string; edited_at: string | null;
}
export interface Archivo {
  id: string; obra_id: string; punto_id: string | null; incidencia_id: string | null; nombre: string;
  descripcion: string | null; tipo: TipoArchivo; mime_type: string | null; size_bytes: number | null;
  storage_path: string; upload_status: EstadoArchivo; uploaded_by: string | null; created_at: string;
}
export interface Pendiente {
  id: string; obra_id: string; titulo: string; descripcion: string | null; prioridad: Prioridad;
  estado: EstadoPendiente; asignado_a: string | null; due_date: string | null; created_at: string;
}
export interface Expediente {
  id: string; obra_id: string; version: number; tipo: string; estado: EstadoExpediente;
  pdf_path: string | null; zip_path: string | null; size_bytes: number | null;
  incluye_modelos_3d: boolean; created_at: string; generated_at: string | null;
}
