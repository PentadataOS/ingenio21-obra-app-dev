import Link from "next/link";
import { ShieldCheck, ChevronRight } from "lucide-react";
import { requireProfile, isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/header";
import { initials } from "@/lib/format";
import SignOut from "@/components/app/sign-out";

const rolLabel: Record<string, string> = {
  admin_pentadata: "Administrador · Pentadata", admin_ingenio21: "Administrador · Ingenio21", invitado: "Invitado",
};

export default async function PerfilPage() {
  const profile = await requireProfile();
  return (
    <div>
      <PageHeader title="Perfil" />
      <div className="px-4 pt-1">
        <div className="card flex items-center gap-4 p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-indigo/10 text-lg font-semibold text-brand-indigo">{initials(profile.nombre, profile.email)}</div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">{profile.nombre ?? "Sin nombre"}</p>
            <p className="truncate text-sm text-muted">{profile.email}</p>
            <p className="mt-1 text-xs text-brand-indigo">{rolLabel[profile.rol_global] ?? profile.rol_global}</p>
          </div>
        </div>

        {isAdmin(profile) && (
          <Link href="/app/admin" className="row-tap mt-4">
            <ShieldCheck className="h-5 w-5 text-brand-indigo" />
            <span className="flex-1 text-sm font-medium">Panel de administración</span>
            <ChevronRight className="h-5 w-5 text-muted" />
          </Link>
        )}

        <div className="mt-5"><SignOut /></div>
        <p className="mt-6 text-center text-[11px] text-muted">SOIARQ Obra · v0.2</p>
      </div>
    </div>
  );
}
