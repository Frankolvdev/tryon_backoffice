import {
  Coins,
  Cpu,
  Gauge,
  TimerReset,
} from "lucide-react";

import {
  formatTryOnDuration,
  formatTryOnMoneyFromCents,
} from "@/lib/tryon/format";
import { cn } from "@/lib/utils";

import type {
  TryOnJobSummary,
} from "@/types/admin-tryon";

interface TryOnJobMetricsPanelProps {
  job: TryOnJobSummary;
}

function calculateDifference(
  actual: number | null,
  estimated: number | null,
): number | null {
  if (
    actual === null ||
    estimated === null
  ) {
    return null;
  }

  return actual - estimated;
}

function calculateElapsedSeconds(
  createdAt: string,
  completedAt: string | null,
): number | null {
  if (!completedAt) {
    return null;
  }

  const start = new Date(createdAt);
  const end = new Date(completedAt);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return null;
  }

  return Math.max(
    Math.round(
      (end.getTime() - start.getTime()) /
        1000,
    ),
    0,
  );
}

function DifferenceValue({
  value,
  suffix,
}: {
  value: number | null;
  suffix: string;
}) {
  if (value === null) {
    return (
      <span className="text-zinc-600">
        No disponible
      </span>
    );
  }

  const positive = value > 0;
  const negative = value < 0;

  return (
    <span
      className={cn(
        positive && "text-red-400",
        negative && "text-emerald-400",
        !positive &&
          !negative &&
          "text-zinc-300",
      )}
    >
      {positive ? "+" : ""}
      {value.toLocaleString("es-MX")}
      {suffix}
    </span>
  );
}

export function TryOnJobMetricsPanel({
  job,
}: TryOnJobMetricsPanelProps) {
  const gpuSecondsDifference =
    calculateDifference(
      job.actual_gpu_seconds,
      job.estimated_gpu_seconds,
    );

  const gpuCostDifference =
    calculateDifference(
      job.actual_gpu_cost_cents,
      job.estimated_gpu_cost_cents,
    );

  const elapsedSeconds =
    calculateElapsedSeconds(
      job.created_at,
      job.completed_at,
    );

  return (
    <section className="luxia-panel mt-5 rounded-3xl p-6">
      <div className="flex items-center gap-3">
        <Gauge className="text-red-400" />

        <div>
          <h2 className="font-semibold text-white">
            Métricas del trabajo
          </h2>

          <p className="mt-1 text-xs text-zinc-600">
            Comparación entre estimaciones y consumo
            real registrado por el backend.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
          <Cpu
            size={18}
            className="text-red-400"
          />

          <p className="mt-4 text-xs text-zinc-600">
            GPU estimada
          </p>

          <p className="mt-2 text-xl font-semibold text-white">
            {formatTryOnDuration(
              job.estimated_gpu_seconds,
            )}
          </p>
        </article>

        <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
          <Cpu
            size={18}
            className="text-red-400"
          />

          <p className="mt-4 text-xs text-zinc-600">
            GPU real
          </p>

          <p className="mt-2 text-xl font-semibold text-white">
            {formatTryOnDuration(
              job.actual_gpu_seconds,
            )}
          </p>
        </article>

        <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
          <Coins
            size={18}
            className="text-red-400"
          />

          <p className="mt-4 text-xs text-zinc-600">
            Costo estimado
          </p>

          <p className="mt-2 text-xl font-semibold text-white">
            {formatTryOnMoneyFromCents(
              job.estimated_gpu_cost_cents,
            )}
          </p>
        </article>

        <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
          <Coins
            size={18}
            className="text-red-400"
          />

          <p className="mt-4 text-xs text-zinc-600">
            Costo real
          </p>

          <p className="mt-2 text-xl font-semibold text-white">
            {formatTryOnMoneyFromCents(
              job.actual_gpu_cost_cents,
            )}
          </p>
        </article>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
          <p className="text-xs text-zinc-600">
            Diferencia de tiempo GPU
          </p>

          <p className="mt-3 text-lg font-semibold">
            <DifferenceValue
              value={gpuSecondsDifference}
              suffix=" s"
            />
          </p>
        </article>

        <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
          <p className="text-xs text-zinc-600">
            Diferencia de costo GPU
          </p>

          <p className="mt-3 text-lg font-semibold">
            {gpuCostDifference === null ? (
              <span className="text-zinc-600">
                No disponible
              </span>
            ) : (
              <span
                className={cn(
                  gpuCostDifference > 0 &&
                    "text-red-400",
                  gpuCostDifference < 0 &&
                    "text-emerald-400",
                  gpuCostDifference === 0 &&
                    "text-zinc-300",
                )}
              >
                {gpuCostDifference > 0
                  ? "+"
                  : ""}
                {formatTryOnMoneyFromCents(
                  gpuCostDifference,
                )}
              </span>
            )}
          </p>
        </article>

        <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
          <div className="flex items-center gap-2">
            <TimerReset
              size={16}
              className="text-red-400"
            />

            <p className="text-xs text-zinc-600">
              Tiempo total registrado
            </p>
          </div>

          <p className="mt-3 text-lg font-semibold text-white">
            {formatTryOnDuration(
              elapsedSeconds,
            )}
          </p>
        </article>
      </div>

      <div className="mt-5 rounded-2xl border border-white/6 bg-black/20 p-4 text-xs leading-6 text-zinc-600">
        Los tiempos GPU provienen directamente de los
        campos estimados y reales del job. El tiempo
        total se calcula entre la creación y la fecha
        de finalización cuando ambas fechas están
        disponibles.
      </div>
    </section>
  );
}
