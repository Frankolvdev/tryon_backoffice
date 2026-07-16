"use client";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Coins,
  Database,
  DollarSign,
  LoaderCircle,
  RefreshCcw,
  Sparkles,
  TrendingUp,
  UserRoundCheck,
  Users,
  XCircle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { AnalyticsLineChart } from "@/components/backoffice/analytics/analytics-line-chart";
import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  AnalyticsResponse,
} from "@/types/admin-analytics";

function percent(
  value: number,
  total: number,
): string {
  if (total <= 0) return "0%";

  return `${(
    (value / total) *
    100
  ).toFixed(1)}%`;
}

function moneyFromCents(
  value: number,
): string {
  return new Intl.NumberFormat(
    "es-MX",
    {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    },
  ).format(value / 100);
}

export default function AnalyticsPage() {
  const [days, setDays] =
    useState(30);
  const [analytics, setAnalytics] =
    useState<AnalyticsResponse | null>(
      null,
    );
  const [isLoading, setIsLoading] =
    useState(true);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      setAnalytics(
        await browserApiRequest<AnalyticsResponse>(
          `/api/admin/analytics?days=${days}`,
        ),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar la analítica.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  const summaryCards = useMemo(() => {
    if (!analytics) return [];

    const summary = analytics.summary;

    return [
      {
        label: "Usuarios",
        value:
          summary.total_users.toLocaleString(
            "es-MX",
          ),
        detail: `${summary.active_users.toLocaleString(
          "es-MX",
        )} activos`,
        icon: Users,
      },
      {
        label: "Usuarios activos",
        value:
          summary.active_users.toLocaleString(
            "es-MX",
          ),
        detail: percent(
          summary.active_users,
          summary.total_users,
        ),
        icon: UserRoundCheck,
      },
      {
        label: "Jobs Try-On",
        value:
          summary.total_tryon_jobs.toLocaleString(
            "es-MX",
          ),
        detail: `${percent(
          summary.completed_tryon_jobs,
          summary.total_tryon_jobs,
        )} completados`,
        icon: Sparkles,
      },
      {
        label: "Completados",
        value:
          summary.completed_tryon_jobs.toLocaleString(
            "es-MX",
          ),
        detail: "Jobs exitosos",
        icon: CheckCircle2,
      },
      {
        label: "Fallidos",
        value:
          summary.failed_tryon_jobs.toLocaleString(
            "es-MX",
          ),
        detail: percent(
          summary.failed_tryon_jobs,
          summary.total_tryon_jobs,
        ),
        icon: XCircle,
      },
      {
        label: "Tokens emitidos",
        value:
          summary.total_tokens_issued.toLocaleString(
            "es-MX",
          ),
        detail: "Créditos acumulados",
        icon: Coins,
      },
      {
        label: "Tokens consumidos",
        value:
          summary.total_tokens_consumed.toLocaleString(
            "es-MX",
          ),
        detail: percent(
          summary.total_tokens_consumed,
          summary.total_tokens_issued,
        ),
        icon: Activity,
      },
      {
        label: "Archivos",
        value:
          summary.total_storage_files.toLocaleString(
            "es-MX",
          ),
        detail: "Almacenamiento registrado",
        icon: Database,
      },
    ];
  }, [analytics]);

  return (
    <div>
      <section className="luxia-panel rounded-3xl p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Principal
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-white">
              Analítica
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
              Métricas consolidadas de
              usuarios, Try-On, tokens,
              costos GPU y almacenamiento.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={days}
              onChange={(event) =>
                setDays(
                  Number(
                    event.target.value,
                  ),
                )
              }
              className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
            >
              <option value={7}>
                Últimos 7 días
              </option>
              <option value={30}>
                Últimos 30 días
              </option>
              <option value={90}>
                Últimos 90 días
              </option>
              <option value={180}>
                Últimos 180 días
              </option>
              <option value={365}>
                Últimos 365 días
              </option>
            </select>

            <button
              type="button"
              onClick={() => void load()}
              disabled={isLoading}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400 disabled:opacity-50"
            >
              <RefreshCcw
                size={16}
                className={
                  isLoading
                    ? "animate-spin"
                    : undefined
                }
              />
              Actualizar
            </button>
          </div>
        </div>
      </section>

      {isLoading && (
        <section className="luxia-panel mt-5 flex min-h-80 items-center justify-center rounded-3xl">
          <LoaderCircle className="animate-spin text-red-500" />
        </section>
      )}

      {!isLoading &&
        errorMessage && (
          <section className="luxia-panel mt-5 rounded-3xl p-6">
            <div className="flex items-start gap-3 rounded-2xl border border-red-500/15 bg-red-950/15 p-5">
              <AlertTriangle
                size={19}
                className="mt-0.5 shrink-0 text-red-400"
              />
              <p className="text-sm leading-6 text-red-300">
                {errorMessage}
              </p>
            </div>
          </section>
        )}

      {!isLoading &&
        analytics && (
          <>
            <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map(
                (card) => {
                  const Icon = card.icon;

                  return (
                    <article
                      key={card.label}
                      className="luxia-panel rounded-2xl p-5"
                    >
                      <Icon
                        size={18}
                        className="text-red-400"
                      />
                      <p className="mt-4 text-xs text-zinc-600">
                        {card.label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {card.value}
                      </p>
                      <p className="mt-2 text-[10px] text-zinc-700">
                        {card.detail}
                      </p>
                    </article>
                  );
                },
              )}
            </section>

            <section className="mt-5 grid gap-4 lg:grid-cols-2">
              <article className="luxia-panel rounded-3xl p-6">
                <div className="flex items-center gap-3">
                  <DollarSign
                    size={19}
                    className="text-red-400"
                  />
                  <h2 className="font-semibold text-white">
                    Costo GPU acumulado
                  </h2>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/7 bg-black/20 p-4">
                    <p className="text-xs text-zinc-600">
                      Estimado
                    </p>
                    <p className="mt-2 text-xl font-semibold text-white">
                      {moneyFromCents(
                        analytics.summary
                          .estimated_gpu_cost_cents,
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/7 bg-black/20 p-4">
                    <p className="text-xs text-zinc-600">
                      Real
                    </p>
                    <p className="mt-2 text-xl font-semibold text-white">
                      {moneyFromCents(
                        analytics.summary
                          .actual_gpu_cost_cents,
                      )}
                    </p>
                  </div>
                </div>
              </article>

              <article className="luxia-panel rounded-3xl p-6">
                <div className="flex items-center gap-3">
                  <TrendingUp
                    size={19}
                    className="text-red-400"
                  />
                  <h2 className="font-semibold text-white">
                    Rendimiento Try-On
                  </h2>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/7 bg-black/20 p-4">
                    <p className="text-xs text-zinc-600">
                      Éxito
                    </p>
                    <p className="mt-2 text-xl font-semibold text-emerald-400">
                      {percent(
                        analytics.summary
                          .completed_tryon_jobs,
                        analytics.summary
                          .total_tryon_jobs,
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/7 bg-black/20 p-4">
                    <p className="text-xs text-zinc-600">
                      Fallo
                    </p>
                    <p className="mt-2 text-xl font-semibold text-red-400">
                      {percent(
                        analytics.summary
                          .failed_tryon_jobs,
                        analytics.summary
                          .total_tryon_jobs,
                      )}
                    </p>
                  </div>
                </div>
              </article>
            </section>

            <section className="mt-5 grid gap-5 2xl:grid-cols-2">
              <AnalyticsLineChart
                title="Nuevos usuarios"
                description={`Registros diarios durante los últimos ${days} días.`}
                series={[
                  {
                    label: "Usuarios",
                    points:
                      analytics.users_by_day,
                  },
                ]}
              />

              <AnalyticsLineChart
                title="Jobs de Try-On"
                description={`Jobs creados diariamente durante los últimos ${days} días.`}
                series={[
                  {
                    label: "Jobs",
                    points:
                      analytics.tryon_jobs_by_day,
                  },
                ]}
              />

              <AnalyticsLineChart
                title="Movimiento de tokens"
                description="Tokens emitidos frente a tokens consumidos por día."
                series={[
                  {
                    label: "Emitidos",
                    points:
                      analytics.tokens_issued_by_day,
                  },
                  {
                    label: "Consumidos",
                    points:
                      analytics.tokens_consumed_by_day,
                  },
                ]}
              />

              <AnalyticsLineChart
                title="Costos GPU"
                description="Costo estimado y costo real registrados diariamente."
                valueFormatter={
                  moneyFromCents
                }
                series={[
                  {
                    label: "Estimado",
                    points:
                      analytics.gpu_costs_by_day.map(
                        (point) => ({
                          date: point.date,
                          value:
                            point.estimated_gpu_cost_cents,
                        }),
                      ),
                  },
                  {
                    label: "Real",
                    points:
                      analytics.gpu_costs_by_day.map(
                        (point) => ({
                          date: point.date,
                          value:
                            point.actual_gpu_cost_cents,
                        }),
                      ),
                  },
                ]}
              />
            </section>
          </>
        )}
    </div>
  );
}
