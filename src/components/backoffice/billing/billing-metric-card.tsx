import type {
  LucideIcon,
} from "lucide-react";

interface BillingMetricCardProps {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

export function BillingMetricCard({
  label,
  value,
  description,
  icon: Icon,
}: BillingMetricCardProps) {
  return (
    <article className="luxia-panel rounded-2xl p-5">
      <div className="flex size-10 items-center justify-center rounded-xl border border-red-500/15 bg-red-950/20 text-red-400">
        <Icon size={17} />
      </div>

      <p className="mt-4 text-xs text-zinc-600">
        {label}
      </p>

      <p className="mt-2 break-words text-2xl font-semibold text-white">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-zinc-700">
        {description}
      </p>
    </article>
  );
}
