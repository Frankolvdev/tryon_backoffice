import type {
  LucideIcon,
} from "lucide-react";

interface BillingBreakdownItem {
  label: string;
  value: string;
}

interface BillingBreakdownPanelProps {
  title: string;
  description: string;
  icon: LucideIcon;
  items: BillingBreakdownItem[];
}

export function BillingBreakdownPanel({
  title,
  description,
  icon: Icon,
  items,
}: BillingBreakdownPanelProps) {
  return (
    <section className="luxia-panel rounded-3xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-red-500/15 bg-red-950/20 text-red-400">
          <Icon size={19} />
        </div>

        <div>
          <h2 className="font-semibold text-white">
            {title}
          </h2>

          <p className="mt-1 text-xs leading-5 text-zinc-600">
            {description}
          </p>
        </div>
      </div>

      <dl className="mt-5 space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-4 rounded-xl border border-white/6 bg-black/20 px-4 py-3"
          >
            <dt className="text-xs text-zinc-600">
              {item.label}
            </dt>

            <dd className="text-sm font-semibold text-zinc-300">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
