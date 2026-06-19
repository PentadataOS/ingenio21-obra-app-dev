import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase/server";
import AcceptInvitation from "@/components/app/accept-invitation";

export const dynamic = "force-dynamic";

export default async function InvitacionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const profile = await getProfile();
  if (!profile) redirect(`/login`);

  const supabase = await createSupabaseServer();
  const { data: inv } = await supabase.from("invitacion_obra").select("email,rol_funcional,estado,obra:obra!invitacion_obra_obra_id_fkey(nombre,codigo)").eq("token", token).maybeSingle();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <div className="mb-8 text-center"><div className="wordmark text-2xl">SOIARQ</div></div>
      <div className="card p-6 text-center">
        {!inv ? (
          <p className="text-sm text-muted">Esta invitación no es válida.</p>
        ) : (
          <>
            <h1 className="text-lg font-semibold">Invitación a una obra</h1>
            <p className="mt-2 text-sm text-muted">Te han invitado a <b className="text-ink">{(inv as any).obra?.nombre}</b> como {inv.rol_funcional.replace("_", " ")}.</p>
            <p className="mt-1 text-xs text-muted">Para: {inv.email}</p>
            <div className="mt-5"><AcceptInvitation token={token} /></div>
          </>
        )}
      </div>
    </main>
  );
}
