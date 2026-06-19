# Arquitectura — SOIARQ Obra

## Principio
La **lógica de negocio y la seguridad viven en la base de datos**. El cliente nunca
escribe directamente las transiciones de estado: invoca RPCs `SECURITY DEFINER` que
validan permisos, estado y trazabilidad. Lectura por RLS según pertenencia a la obra.

## Capas
- **UI (Next.js/React)**: server components para leer (RLS aplica), client components
  para formularios y acciones. Sin acceso a `service_role` desde el navegador.
- **Server Actions (`lib/actions.ts`)**: única vía de mutación; llaman a las RPCs.
- **Postgres (Supabase)**: tablas con RLS deny-by-default, helpers `app_*`, RPCs de
  obra/punto/incidencia/comentario/archivo/cierre, vistas de resumen, trazabilidad.
- **Storage privado**: políticas por ruta `obras/{obra_id}/…`; subida preparar→subir→confirmar.

## Flujos clave
- **Punto**: crear → validar → (incidencias) → cerrar. Cerrar exige incidencias resueltas.
- **Cierre de obra**: *preflight* (críticos bloquean, advertencias avisan) → congela
  snapshot inmutable → expediente `generando` → la ruta `/api/expediente/[id]/generar`
  produce PDF + ZIP y marca `generado`. Versionado v1, v2, v3…
- **Roles**: admin global (Pentadata/Ingenio21) ve todo; por obra: ingeniero jefe
  (superior), jefe de obra, técnico, colaborador.
