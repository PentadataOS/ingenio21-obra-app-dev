import { requireProfile } from "@/lib/auth";
import BottomNav from "@/components/app/bottom-nav";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireProfile();
  return (
    <div className="mx-auto min-h-dvh max-w-md bg-surface">
      <main className="pb-28">{children}</main>
      <BottomNav />
    </div>
  );
}
