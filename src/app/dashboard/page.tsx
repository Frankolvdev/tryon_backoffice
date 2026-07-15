"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Coins,
  Cpu,
  Database,
  Files,
  Gauge,
  HardDrive,
  LoaderCircle,
  RefreshCcw,
  Server,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { DashboardAnalyticsChart } from "@/components/dashboard/dashboard-analytics-chart";
import { browserApiRequest } from "@/lib/api/browser-api";
import { cn } from "@/lib/utils";

import type {
  AdminDashboardResponse,
  AnalyticsResponse,
  MonitoringResponse,
  ServiceHealthResponse,
} from "@/types/admin";

interface DashboardData {
  dashboard: AdminDashboardResponse;
  analytics: AnalyticsResponse;
  monitoring: MonitoringResponse;
}

interface MetricCardProps {
  label: string;
  value: string;
  description: string;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
}

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
}: MetricCardProps) {
  return (
    <article className="luxia-panel group relative overflow-hidden rounded-2xl p-5">
      <div className="pointer-events-none absolute -top-14 -right-14 size-32 rounded-full bg-red-900/10 blur-3xl transition group-hover:bg-red-800/20" />

      <div className="relative flex items-start justify-between gap-5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-600 uppercase">
            {label}
          </p>

          <p className="mt-4 truncate text-3xl font-semibold tracking-tight text-white">
            {value}
          </p>

          <p className="mt-2 text-xs leading-5 text-zinc-600">
            {description}
          </p>
        </div>

        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-red-500/15 bg-red-950/20 text-red-400 shadow-[0_0_30px_rgba(185,28,28,0.12)]">
          <Icon size={20} />
        </div>
      </div>
    </article>
  );
}

function formatInteger(value: number): string {
  return new Intl.NumberFormat(
    "es-MX",
  ).format(value);
}

function formatCurrencyFromCents(
  value: number,
): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "USD",
  }).format(value / 100);
}

function calculatePercentage(
  part: number,
  total: number,
): number {
  if (total <= 0) {
    return 0;
  }

  return Math.min(
    Math.max((part / total) * 100, 0),
    100,
  );
}

function isHealthyStatus(
  status: string,
): boolean {
  const normalizedStatus =
    status.toLowerCase();

  return [
    "ok",
    "healthy",
    "online",
    "ready",
    "connected",
    "available",
    "running",
    "operational",
  ].some((value) =>
    normalizedStatus.includes(value),
  );
}

interface ServiceStatusRowProps {
  service: ServiceHealthResponse;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
}

function ServiceStatusRow({
  service,
  icon: Icon,
}: ServiceStatusRowProps) {
  const healthy = isHealthyStatus(
    service.status,
  );

  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-4 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/7 bg-white/[0.025] text-zinc-500">
          <Icon size={16} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-300">
            {service.service}
          </p>

          <p className="mt-1 truncate text-[11px] text-zinc-700">
            Servicio local
          </p>
        </div>
      </div>

      <div
        className={cn(
          "flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase",
          healthy
            ? "border-emerald-500/15 bg-emerald-950/20 text-emerald-400"
            : "border-red-500/15 bg-red-950/20 text-red-400",
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full",
            healthy
              ? "bg-emerald-400"
              : "bg-red-400",
          )}
        />

        {service.status}
      </div>
    </div>
  );
}

function JobProgressRing({
  dashboard,
}: {
  dashboard: AdminDashboardResponse;
}) {
  const total =
    dashboard.total_tryon_jobs;

  const completedPercentage =
    calculatePercentage(
      dashboard.completed_tryon_jobs,
      total,
    );

  const failedPercentage =
    calculatePercentage(
      dashboard.failed_tryon_jobs,
      total,
    );

  const queuedPercentage =
    calculatePercentage(
      dashboard.queued_tryon_jobs,
      total,
    );

  const radius = 58;
  const circumference =
    2 * Math.PI * radius;

  const completedOffset =
    circumference -
    (completedPercentage / 100) *
      circumference;

  return (
    <div>
      <div className="relative mx-auto size-40">
        <svg
          viewBox="0 0 140 140"
          className="size-full -rotate-90"
          aria-label="Progreso de trabajos Try-On"
        >
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="11"
          />

          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#b91c1c"
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={
              completedOffset
            }
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-semibold text-white">
            {formatInteger(total)}
          </p>

          <p className="mt-1 text-[10px] tracking-[0.18em] text-zinc-600 uppercase">
            Total
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-zinc-500">
            <span className="size-2 rounded-full bg-red-600" />
            Completados
          </span>

          <span className="font-medium text-zinc-300">
            {formatInteger(
              dashboard.completed_tryon_jobs,
            )}{" "}
            <span className="text-zinc-700">
              {completedPercentage.toFixed(1)}%
            </span>
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-zinc-500">
            <span className="size-2 rounded-full bg-zinc-500" />
            En cola
          </span>

          <span className="font-medium text-zinc-300">
            {formatInteger(
              dashboard.queued_tryon_jobs,
            )}{" "}
            <span className="text-zinc-700">
              {queuedPercentage.toFixed(1)}%
            </span>
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-zinc-500">
            <span className="size-2 rounded-full bg-red-950 ring-1 ring-red-700" />
            Fallidos
          </span>

          <span className="font-medium text-zinc-300">
            {formatInteger(
              dashboard.failed_tryon_jobs,
            )}{" "}
            <span className="text-zinc-700">
              {failedPercentage.toFixed(1)}%
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [data, setData] =
    useState<DashboardData | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const loadDashboard =
    useCallback(async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [
          dashboard,
          analytics,
          monitoring,
        ] = await Promise.all([
          browserApiRequest<AdminDashboardResponse>(
            "/api/admin/dashboard",
          ),

          browserApiRequest<AnalyticsResponse>(
            "/api/admin/analytics?days=30",
          ),

          browserApiRequest<MonitoringResponse>(
            "/api/admin/monitoring",
          ),
        ]);

        setData({
          dashboard,
          analytics,
          monitoring,
        });
      } catch (error) {
        setData(null);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No fue posible cargar el centro de control.",
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const successRate = useMemo(() => {
    if (!data) {
      return 0;
    }

    return calculatePercentage(
      data.dashboard
        .completed_tryon_jobs,
      data.dashboard.total_tryon_jobs,
    );
  }, [data]);

  const activeUserRate = useMemo(() => {
    if (!data) {
      return 0;
    }

    return calculatePercentage(
      data.dashboard.active_users,
      data.dashboard.total_users,
    );
  }, [data]);

  return (
    <div className="mx-auto max-w-[1700px]">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.28em] text-red-500 uppercase">
            Centro de control
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Buen día,{" "}
            <span className="text-red-500">
              {user?.full_name ??
                user?.email ??
                "Administrador"}
            </span>
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Estado operativo, actividad y consumo de la plataforma en tiempo real.
          </p>
        </div>

        <button
          type="button"
          disabled={isLoading}
          onClick={() =>
            void loadDashboard()
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-4 text-sm text-zinc-400 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCcw
            size={16}
            className={
              isLoading
                ? "animate-spin"
                : ""
            }
          />

          Actualizar datos
        </button>
      </header>

      {isLoading && (
        <section className="luxia-panel mt-8 flex min-h-[520px] items-center justify-center rounded-3xl">
          <div className="text-center">
            <LoaderCircle className="mx-auto animate-spin text-red-500" />

            <p className="mt-4 text-sm text-zinc-500">
              Consultando servicios administrativos...
            </p>
          </div>
        </section>
      )}

      {!isLoading && errorMessage && (
        <section className="luxia-panel mt-8 rounded-3xl p-7">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/20 text-red-500">
            <AlertTriangle size={23} />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-white">
            No se pudo cargar el centro de control
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() =>
              void loadDashboard()
            }
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            <RefreshCcw size={16} />
            Intentar nuevamente
          </button>
        </section>
      )}

      {!isLoading && data && (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Usuarios activos"
              value={formatInteger(
                data.dashboard.active_users,
              )}
              description={`${activeUserRate.toFixed(1)}% de ${formatInteger(
                data.dashboard.total_users,
              )} usuarios registrados`}
              icon={Users}
            />

            <MetricCard
              label="Trabajos Try-On"
              value={formatInteger(
                data.dashboard.total_tryon_jobs,
              )}
              description={`${formatInteger(
                data.dashboard.queued_tryon_jobs,
              )} pendientes en cola`}
              icon={Sparkles}
            />

            <MetricCard
              label="Tasa de éxito"
              value={`${successRate.toFixed(1)}%`}
              description={`${formatInteger(
                data.dashboard.failed_tryon_jobs,
              )} trabajos fallidos`}
              icon={CheckCircle2}
            />

            <MetricCard
              label="Costo GPU real"
              value={formatCurrencyFromCents(
                data.dashboard
                  .actual_gpu_cost_cents,
              )}
              description={`Estimado: ${formatCurrencyFromCents(
                data.dashboard
                  .estimated_gpu_cost_cents,
              )}`}
              icon={Cpu}
            />
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(310px,0.75fr)]">
            <article className="luxia-panel rounded-3xl p-5 sm:p-6">
              <div className="flex flex-col gap-4 border-b border-white/6 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-red-500 uppercase">
                    Analítica de 30 días
                  </p>

                  <h2 className="mt-2 text-lg font-semibold text-white">
                    Actividad de la plataforma
                  </h2>

                  <p className="mt-1 text-xs text-zinc-600">
                    Trabajos Try-On y nuevos usuarios por día
                  </p>
                </div>

                <div className="flex items-center gap-5 text-[11px] text-zinc-500">
                  <span className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-red-600" />
                    Try-On
                  </span>

                  <span className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-zinc-400" />
                    Usuarios
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <DashboardAnalyticsChart
                  jobs={
                    data.analytics
                      .tryon_jobs_by_day
                  }
                  users={
                    data.analytics.users_by_day
                  }
                />
              </div>
            </article>

            <article className="luxia-panel rounded-3xl p-6">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.22em] text-red-500 uppercase">
                  Estado de trabajos
                </p>

                <h2 className="mt-2 text-lg font-semibold text-white">
                  Distribución Try-On
                </h2>
              </div>

              <div className="mt-7">
                <JobProgressRing
                  dashboard={data.dashboard}
                />
              </div>
            </article>
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-[0.9fr_1.1fr_0.8fr]">
            <article className="luxia-panel rounded-3xl p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-red-500 uppercase">
                    Infraestructura
                  </p>

                  <h2 className="mt-2 text-lg font-semibold text-white">
                    Estado del sistema
                  </h2>
                </div>

                <div className="flex size-10 items-center justify-center rounded-xl border border-red-500/15 bg-red-950/20 text-red-400">
                  <Activity size={18} />
                </div>
              </div>

              <div className="mt-4">
                <ServiceStatusRow
                  service={data.monitoring.api}
                  icon={Server}
                />

                <ServiceStatusRow
                  service={
                    data.monitoring.database
                  }
                  icon={Database}
                />

                <ServiceStatusRow
                  service={data.monitoring.redis}
                  icon={Gauge}
                />

                <ServiceStatusRow
                  service={data.monitoring.storage}
                  icon={HardDrive}
                />
              </div>
            </article>

            <article className="luxia-panel rounded-3xl p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-red-500 uppercase">
                    Economía interna
                  </p>

                  <h2 className="mt-2 text-lg font-semibold text-white">
                    Tokens y almacenamiento
                  </h2>
                </div>

                <div className="flex size-10 items-center justify-center rounded-xl border border-red-500/15 bg-red-950/20 text-red-400">
                  <Coins size={18} />
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/6 bg-black/25 p-4">
                  <Coins
                    size={18}
                    className="text-red-400"
                  />

                  <p className="mt-5 text-2xl font-semibold text-white">
                    {formatInteger(
                      data.dashboard
                        .total_tokens_issued,
                    )}
                  </p>

                  <p className="mt-2 text-xs text-zinc-600">
                    Tokens emitidos
                  </p>
                </div>

                <div className="rounded-2xl border border-white/6 bg-black/25 p-4">
                  <XCircle
                    size={18}
                    className="text-red-400"
                  />

                  <p className="mt-5 text-2xl font-semibold text-white">
                    {formatInteger(
                      data.dashboard
                        .total_tokens_consumed,
                    )}
                  </p>

                  <p className="mt-2 text-xs text-zinc-600">
                    Tokens consumidos
                  </p>
                </div>

                <div className="rounded-2xl border border-white/6 bg-black/25 p-4">
                  <Files
                    size={18}
                    className="text-red-400"
                  />

                  <p className="mt-5 text-2xl font-semibold text-white">
                    {formatInteger(
                      data.dashboard
                        .total_storage_files,
                    )}
                  </p>

                  <p className="mt-2 text-xs text-zinc-600">
                    Archivos almacenados
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/6 bg-black/25 p-4">
                <div className="flex items-center justify-between gap-5">
                  <div>
                    <p className="text-xs text-zinc-600">
                      Diferencia costo GPU
                    </p>

                    <p className="mt-2 text-xl font-semibold text-white">
                      {formatCurrencyFromCents(
                        data.dashboard
                          .actual_gpu_cost_cents -
                          data.dashboard
                            .estimated_gpu_cost_cents,
                      )}
                    </p>
                  </div>

                  <Cpu
                    size={25}
                    className="text-red-500"
                  />
                </div>
              </div>
            </article>

            <article className="luxia-panel rounded-3xl p-6">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.22em] text-red-500 uppercase">
                  Usuarios
                </p>

                <h2 className="mt-2 text-lg font-semibold text-white">
                  Estado de cuentas
                </h2>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-black/25 px-4 py-4">
                  <span className="flex items-center gap-3 text-sm text-zinc-500">
                    <CheckCircle2
                      size={17}
                      className="text-emerald-400"
                    />
                    Activos
                  </span>

                  <strong className="text-white">
                    {formatInteger(
                      data.dashboard.active_users,
                    )}
                  </strong>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-black/25 px-4 py-4">
                  <span className="flex items-center gap-3 text-sm text-zinc-500">
                    <AlertTriangle
                      size={17}
                      className="text-amber-400"
                    />
                    Suspendidos
                  </span>

                  <strong className="text-white">
                    {formatInteger(
                      data.dashboard
                        .suspended_users,
                    )}
                  </strong>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-black/25 px-4 py-4">
                  <span className="flex items-center gap-3 text-sm text-zinc-500">
                    <XCircle
                      size={17}
                      className="text-red-400"
                    />
                    Eliminados
                  </span>

                  <strong className="text-white">
                    {formatInteger(
                      data.dashboard.deleted_users,
                    )}
                  </strong>
                </div>
              </div>
            </article>
          </section>

          <footer className="mt-8 flex flex-col gap-2 border-t border-white/5 py-6 text-[10px] tracking-[0.18em] text-zinc-800 uppercase sm:flex-row sm:items-center sm:justify-between">
            <span>
              LUXIA AI Fashion Studio
            </span>

            <span>
              Centro administrativo local
            </span>
          </footer>
        </>
      )}
    </div>
  );
}