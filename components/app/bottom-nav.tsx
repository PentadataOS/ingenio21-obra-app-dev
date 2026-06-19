"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building2, Plus, ListChecks, User } from "lucide-react";

const left = [
  { href: "/app", label: "Inicio", icon: Home, exact: true },
  { href: "/app/obras", label: "Obras", icon: Building2 },
];
const right = [
  { href: "/app/pendientes", label: "Pendientes", icon: ListChecks },
  { href: "/app/perfil", label: "Perfil", icon: User },
];

export default function BottomNav() {
  const path = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? path === href : path === href || path.startsWith(href + "/");
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-line bg-white/90 px-2 backdrop-blur">
      <div className="grid grid-cols-5 items-center pb-[max(env(safe-area-inset-bottom),0.4rem)]">
        {left.map((t) => <Tab key={t.href} {...t} active={isActive(t.href, t.exact)} />)}
        <div className="flex justify-center">
          <Link href="/app/obras" aria-label="Acciones"
            className="gradient-bg -mt-7 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg shadow-indigo-500/30">
            <Plus className="h-7 w-7" />
          </Link>
        </div>
        {right.map((t) => <Tab key={t.href} {...t} active={isActive(t.href)} />)}
      </div>
    </nav>
  );
}

function Tab({ href, label, icon: Icon, active }: { href: string; label: string; icon: any; active: boolean }) {
  return (
    <Link href={href} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] ${active ? "text-brand-indigo" : "text-muted"}`}>
      <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
      {label}
    </Link>
  );
}
