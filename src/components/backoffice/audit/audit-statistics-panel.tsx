import {
  Activity,
  CheckCircle2,
  RotateCcw,
  ShieldAlert,
  Undo2,
} from "lucide-react";

import type {
  AuditAdvancedStatisticsResponse,
} from "@/types/admin-audit-operations";

interface AuditStatisticsPanelProps {
  statistics: AuditAdvancedStatisticsResponse;
}

export function AuditStatisticsPanel({
  statistics,
}: AuditStatisticsPanelProps) {
  const metrics = [
    {
      label: "Entradas",
      value: statistics.total_entries,
      icon: Activity,
    },
    {
      label: "Exitosas",
      value: statistics.successful_entries,
      icon: CheckCircle2,
    },
    {
      label: "Fallidas",
      value: statistics.failed_entries,
      icon: ShieldAlert,
    },
    {
      label: "Restaurables",
      value: statistics.restorable_entries,
      icon: Undo2,
    },
    {
      label: "Restauraciones",
      value: statistics.restoration_entries,
      icon: RotateCcw,
    },
  ];

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              key={metric.label}
              className="luxia-panel rounded-2xl p-5"
            >
              <Icon
                size={18}
                className="text-red-400"
              />

              <p className="mt-4 text-xs text-zinc-600">
                {metric.label}
              </p>

              <p className="mt-2 text-2xl font-semibold text-white">
                {metric.value.toLocaleString(
                  "es-MX",
                )}
              </p>
            </article>
          );
        })}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-3">
        <article className="luxia-panel rounded-3xl p-6">
          <h2 className="font-semibold text-white">
            Tasa de éxito
          </h2>

          <p className="mt-4 text-4xl font-semibold text-emerald-400">
            {statistics.success_rate.toLocaleString(
              "es-MX",
              {
                maximumFractionDigits: 2,
              },
            )}
            %
          </p>

          <p className="mt-3 text-xs leading-6 text-zinc-600">
            Periodo analizado:{" "}
            {statistics.period_days} días.
          </p>
        </article>

        <article className="luxia-panel rounded-3xl p-6">
          <h2 className="font-semibold text-white">
            Acciones principales
          </h2>

          <div className="mt-5 space-y-3">
            {statistics.top_actions.map(
              (item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/6 bg-black/20 px-4 py-3"
                >
                  <span className="truncate text-xs text-zinc-500">
                    {item.key}
                  </span>

                  <span className="text-sm font-semibold text-white">
                    {item.total}
                  </span>
                </div>
              ),
            )}

            {statistics.top_actions.length ===
              0 && (
              <p className="text-sm text-zinc-600">
                Sin datos.
              </p>
            )}
          </div>
        </article>

        <article className="luxia-panel rounded-3xl p-6">
          <h2 className="font-semibold text-white">
            Entidades principales
          </h2>

          <div className="mt-5 space-y-3">
            {statistics.top_entity_types.map(
              (item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/6 bg-black/20 px-4 py-3"
                >
                  <span className="truncate text-xs text-zinc-500">
                    {item.key}
                  </span>

                  <span className="text-sm font-semibold text-white">
                    {item.total}
                  </span>
                </div>
              ),
            )}

            {statistics.top_entity_types
              .length === 0 && (
              <p className="text-sm text-zinc-600">
                Sin datos.
              </p>
            )}
          </div>
        </article>
      </section>
    </>
  );
}
