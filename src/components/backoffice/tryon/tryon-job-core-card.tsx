import type { ReactNode } from "react";

interface TryOnJobCoreCardProps {
  label: string;
  value: ReactNode;
  description?: string;
}

export function TryOnJobCoreCard({
  label,
  value,
  description,
}: TryOnJobCoreCardProps) {
  return (
    <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
      <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-700 uppercase">
        {label}
      </p>

      <div className="mt-3 break-words text-base font-semibold text-white">
        {value}
      </div>

      {description && (
        <p className="mt-2 text-xs leading-5 text-zinc-600">
          {description}
        </p>
      )}
    </article>
  );
}
