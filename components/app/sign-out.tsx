"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function SignOut() {
  const router = useRouter();
  async function out() {
    const s = createSupabaseBrowser();
    await s.auth.signOut();
    router.push("/login"); router.refresh();
  }
  return (
    <button onClick={out} className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-white py-3 text-sm font-medium text-danger">
      <LogOut className="h-4 w-4" /> Cerrar sesión
    </button>
  );
}
