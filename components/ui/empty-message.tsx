import type { ReactNode } from "react";

export function EmptyMessage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted">{children}</p>
    </div>
  );
}
