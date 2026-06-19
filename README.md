# SOIARQ Obra

App de **cierre documental de obra**: puntos de control, incidencias, evidencias y
generación de **expediente** con trazabilidad completa. Móvil primero.

Reconstrucción íntegra (v0.2) escrita por IA de extremo a extremo, con la lógica de
negocio y la seguridad **en la base de datos** (RLS + RPC), no en el cliente.

## Stack
- **Next.js 15** (App Router) + **React 19** + TypeScript
- **Supabase** (Postgres + Auth magic-link + Storage), `@supabase/ssr`
- **Tailwind CSS**
- `pdf-lib` + `jszip` para la generación del expediente
- Despliegue en **Vercel**

## Estructura
```
app/
  (público)        login, /auth/callback, /invitacion/[token]
  app/             zona privada (requiere sesión)
    obras/[id]/    detalle, puntos/[puntoId], incidencias/[incId],
                   cierre, expedientes, equipo, pendientes, trazabilidad
    pendientes/ perfil/ admin/
  api/expediente/[id]/generar   ruta que genera PDF + ZIP
components/        ui/ y app/ (sheets, badges, acciones, comentarios, evidencias…)
lib/               supabase/ (server, client, admin), actions.ts (RPCs), auth.ts, …
supabase/          notas y seed de la base de datos
```

## Puesta en marcha (local)
```bash
npm install
cp .env.example .env.local      # ya trae los valores públicos
npm run dev                      # http://localhost:3000
```

## Variables de entorno
| Variable | Para qué | Dónde |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto | pública |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clave publicable | pública |
| `NEXT_PUBLIC_SITE_URL` | base de los enlaces de acceso | por entorno |
| `SUPABASE_SERVICE_ROLE_KEY` | bootstrap de rol admin por email | **secreta**, opcional |
| `ADMIN_PENTADATA_EMAILS` / `ADMIN_INGENIO21_EMAILS` | quién es admin | config |

## Despliegue en Vercel
1. Sube este código a un repo de GitHub e impórtalo en Vercel (framework: Next.js).
2. En **Settings → Environment Variables** pega las variables de arriba
   (pon `NEXT_PUBLIC_SITE_URL` con tu dominio `https://TU-APP.vercel.app`).
3. **Importante (Supabase → Authentication → URL Configuration):** añade tu dominio de
   Vercel en *Site URL* y en *Redirect URLs* (`https://TU-APP.vercel.app/auth/callback`).
   Sin esto, los enlaces de acceso no validan en producción.
4. Redeploy.

## Acceso de demo
Login sin contraseña (magic-link). La base ya está sembrada:
- `j.campillo.m@gmail.com` → **administrador** (ve todas las obras).
- `sandraquilespsicologa@gmail.com` → **ingeniero jefe** de las obras de demo.

Escribe el correo en la pantalla de acceso y entra con el enlace que llega por email.

## Seguridad (resumen)
- RLS deny-by-default en todas las tablas; lectura por pertenencia a la obra.
- Transiciones críticas (validar/cerrar/incidencias/cierre) vía RPC `SECURITY DEFINER`
  con máquina de estados y trazabilidad.
- Storage privado con políticas por ruta `obras/{obra_id}/…`.
- `service_role` solo para un uso puntual de servidor (asignar rol admin por email).
