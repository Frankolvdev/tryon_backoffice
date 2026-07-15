import type {
  LucideIcon,
} from "lucide-react";

interface MonitoringMetricCardProps {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

export function MonitoringMetricCard({
  label,
  value,
  description,
  icon: Icon,
}: MonitoringMetricCardProps) {
  return (
    <article className="luxia-panel rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-700 uppercase">
            {label}
          </p>

          <p className="mt-4 text-2xl font-semibold text-white">
            {value}
          </p>

          <p className="mt-2 text-xs leading-5 text-zinc-600">
            {description}
          </p>
        </div>

        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-red-500/15 bg-red-950/15 text-red-400">
          <Icon size={18} />
        </div>
      </div>
    </article>
  );
}
