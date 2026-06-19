# Base de datos (Supabase)

Proyecto: `ktbelswvfevqeomqnesk` — ya provisionado, con RLS, RPCs y datos de demo.

## Migraciones (aplicadas, en el historial del proyecto)
1. `reset_public_schema`
2. `v0_2_estructura_completa` — 12 tablas, enums, integridad (FK compuesta punto↔obra), buckets
3. `v0_2_nucleo_seguridad_rpcs` — helpers de seguridad, RLS, RPCs de obra/punto/incidencia
4. `v0_2_comentarios_archivos` — comentarios 3 niveles + subida firmada + políticas de storage
5. `v0_2_cierre_preflight_expediente` — cierre, preflight, informe/expediente (snapshot)
6. `v0_2_vistas_resumen` — vistas con `security_invoker`
7. `v0_2_invitaciones` — invitar / aceptar invitación

Para exportarlas como ficheros: `supabase link` + `supabase db pull`.

## Seed
`seed.sql` recrea 5 usuarios (con identidad email confirmada), 3 obras de demo y su
contenido. Idempotente: no hace nada si ya existen obras.
