import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function PageHeader({ back, title, eyebrow, right }: { back?: string; title: string; eyebrow?: string; right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 -mx-0 flex items-center gap-2 bg-surface/85 px-4 py-3 backdrop-blur">
      {back && (
        <Link href={back} className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full text-ink/70 active:bg-line">
          <ChevronLeft className="h-6 w-6" />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        {eyebrow && <div className="truncate text-[11px] font-medium uppercase tracking-wide text-muted">{eyebrow}</div>}
        <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
      </div>
      {right}
    </header>
  );
}
