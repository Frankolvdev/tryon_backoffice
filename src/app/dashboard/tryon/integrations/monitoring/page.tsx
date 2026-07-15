"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  Boxes,
  CheckCircle2,
  Clock3,
  Coins,
  Cpu,
  Database,
  Gauge,
  HardDrive,
  LoaderCircle,
  RefreshCcw,
  Server,
  TriangleAlert,
  XCircle,
} from "lucide-react";

import { AiEngineTabs } from "@/components/backoffice/tryon/ai-engine-tabs";
import { MonitoringMetricCard } from "@/components/backoffice/tryon/monitoring-metric-card";
import { TryOnEmptyState } from "@/components/backoffice/tryon/tryon-empty-state";
import { TryOnModuleHeader } from "@/components/backoffice/tryon/tryon-module-header";
import { browserApiRequest } from "@/lib/api/browser-api";
import {
  calculateTryOnMonitoringMetrics,
} from "@/lib/tryon/monitoring";

import type {
  ExternalAiJobResponse,
} from "@/types/admin-runpod";
import type {
  AdminStorageFile,
} from "@/types/admin-storage";
import type {
  TryOnJobSummary,
} from "@/types/admin-tryon";
import type {
  TryOnMonitoringSnapshot,
} from "@/types/admin-tryon-monitoring";
import type {
  WorkflowDefinitionListResponse,
} from "@/types/admin-workflows";

function formatMoney(
  cents: number,
): string {
  return new Intl.NumberFormat(
    "es-MX",
    {
      style: "currency",
      currency: "USD",
    },
  ).format(cents / 100);
}

function formatDuration(
  seconds: number,
): string {
  if (seconds < 60) {
    return `${seconds.toLocaleString(
      "es-MX",
      {
        maximumFractionDigits: 1,
      },
    )} s`;
  }

  const minutes = Math.floor(
    seconds / 60,
  );

  const remainder =
    Math.round(seconds % 60);

  return `${minutes} min ${remainder} s`;
}

function formatBytes(
  bytes: number,
): string {
  const units = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  let value = bytes;
  let unitIndex = 0;

  while (
    value >= 1024 &&
    unitIndex < units.length - 1
  ) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toLocaleString(
    "es-MX",
    {
      maximumFractionDigits: 2,
    },
  )} ${units[unitIndex]}`;
}

function percentage(
  value: number,
): string {
  return `${value.toLocaleString(
    "es-MX",
    {
      maximumFractionDigits: 1,
    },
  )}%`;
}

export default function TryOnMonitoringPage() {
  const [snapshot, setSnapshot] =
    useState<TryOnMonitoringSnapshot | null>(
      null,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadMonitoring =
    useCallback(async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [
          tryOnJobs,
          externalAiJobs,
          storageFiles,
          workflowDefinitions,
        ] = await Promise.all([
          browserApiRequest<
            TryOnJobSummary[]
          >(
            "/api/admin/tryon-jobs?skip=0&limit=200",
          ),
          browserApiRequest<
            ExternalAiJobResponse[]
          >(
            "/api/admin/external-ai-jobs?skip=0&limit=200",
          ),
          browserApiRequest<
            AdminStorageFile[]
          >(
            "/api/admin/storage/files?skip=0&limit=200",
          ),
          browserApiRequest<WorkflowDefinitionListResponse>(
            "/api/admin/workflow-definitions?skip=0&limit=200",
          ),
        ]);

        setSnapshot({
          tryOnJobs,
          externalAiJobs,
          storageFiles,
          workflowDefinitions,
        });
      } catch (error) {
        setSnapshot(null);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No fue posible cargar el monitoreo Try-On.",
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadMonitoring();
  }, [loadMonitoring]);

  const metrics = useMemo(
    () =>
      snapshot
        ? calculateTryOnMonitoringMetrics(
            snapshot,
          )
        : null,
    [snapshot],
  );

  return (
    <div>
      <TryOnModuleHeader
        title="Monitoreo Try-On"
        description="Resumen operativo construido con datos reales de jobs, ejecuciones externas, workflows y almacenamiento."
      />

      <AiEngineTabs />

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() =>
            void loadMonitoring()
          }
          disabled={isLoading}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400 hover:text-white disabled:opacity-50"
        >
          <RefreshCcw
            size={16}
            className={
              isLoading
                ? "animate-spin"
                : undefined
            }
          />

          Actualizar métricas
        </button>
      </div>

      {isLoading && (
        <section className="luxia-panel mt-5 flex min-h-80 items-center justify-center rounded-3xl">
          <div className="text-center">
            <LoaderCircle className="mx-auto animate-spin text-red-500" />

            <p className="mt-4 text-sm text-zinc-500">
              Calculando métricas...
            </p>
          </div>
        </section>
      )}

      {!isLoading &&
        errorMessage && (
          <div className="mt-5">
            <TryOnEmptyState
              error
              title="No se pudo cargar el monitoreo"
              description={errorMessage}
            />
          </div>
        )}

      {!isLoading &&
        metrics &&
        snapshot && (
          <>
            <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MonitoringMetricCard
                label="Jobs Try-On"
                value={metrics.jobsTotal.toLocaleString(
                  "es-MX",
                )}
                description="Primeros 200 trabajos administrativos."
                icon={Activity}
              />

              <MonitoringMetricCard
                label="Tasa de éxito"
                value={percentage(
                  metrics.successRate,
                )}
                description="Jobs completados sobre el total cargado."
                icon={CheckCircle2}
              />

              <MonitoringMetricCard
                label="Tokens consumidos"
                value={metrics.tokensConsumed.toLocaleString(
                  "es-MX",
                )}
                description="Suma de tokens_cost."
                icon={Coins}
              />

              <MonitoringMetricCard
                label="Costo GPU real"
                value={formatMoney(
                  metrics.actualGpuCostCents,
                )}
                description="Suma del costo real registrado."
                icon={Cpu}
              />

              <MonitoringMetricCard
                label="GPU real"
                value={formatDuration(
                  metrics.actualGpuSeconds,
                )}
                description="Tiempo GPU acumulado."
                icon={Gauge}
              />

              <MonitoringMetricCard
                label="Promedio GPU/job"
                value={formatDuration(
                  metrics.averageActualGpuSeconds,
                )}
                description="Solo jobs con tiempo real disponible."
                icon={Clock3}
              />

              <MonitoringMetricCard
                label="Ejecuciones externas"
                value={metrics.externalJobsTotal.toLocaleString(
                  "es-MX",
                )}
                description="Primeros 200 External AI Jobs."
                icon={Server}
              />

              <MonitoringMetricCard
                label="Storage cargado"
                value={formatBytes(
                  metrics.storageBytes,
                )}
                description="Tamaño de los primeros 200 archivos."
                icon={HardDrive}
              />
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-2">
              <article className="luxia-panel rounded-3xl p-6">
                <div className="flex items-center gap-3">
                  <Activity className="text-red-400" />

                  <div>
                    <h2 className="font-semibold text-white">
                      Estados Try-On
                    </h2>

                    <p className="mt-1 text-xs text-zinc-600">
                      Distribución de la página cargada.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      label: "En cola",
                      value:
                        metrics.jobsQueued,
                      icon: Clock3,
                    },
                    {
                      label: "Procesando",
                      value:
                        metrics.jobsProcessing,
                      icon: Cpu,
                    },
                    {
                      label: "Completados",
                      value:
                        metrics.jobsCompleted,
                      icon: CheckCircle2,
                    },
                    {
                      label: "Fallidos",
                      value:
                        metrics.jobsFailed,
                      icon: TriangleAlert,
                    },
                    {
                      label: "Cancelados",
                      value:
                        metrics.jobsCanceled,
                      icon: XCircle,
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-white/7 bg-black/20 p-4"
                      >
                        <Icon
                          size={16}
                          className="text-red-400"
                        />

                        <p className="mt-3 text-xs text-zinc-600">
                          {item.label}
                        </p>

                        <p className="mt-1 text-xl font-semibold text-white">
                          {item.value.toLocaleString(
                            "es-MX",
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className="luxia-panel rounded-3xl p-6">
                <div className="flex items-center gap-3">
                  <Database className="text-red-400" />

                  <div>
                    <h2 className="font-semibold text-white">
                      Infraestructura
                    </h2>

                    <p className="mt-1 text-xs text-zinc-600">
                      Estado agregado de recursos cargados.
                    </p>
                  </div>
                </div>

                <dl className="mt-6 space-y-4 text-sm">
                  <div className="flex justify-between gap-4 border-b border-white/5 pb-4">
                    <dt className="text-zinc-600">
                      External jobs activos
                    </dt>
                    <dd className="text-zinc-300">
                      {metrics.externalJobsRunning}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4 border-b border-white/5 pb-4">
                    <dt className="text-zinc-600">
                      External jobs fallidos
                    </dt>
                    <dd className="text-zinc-300">
                      {metrics.externalJobsFailed}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4 border-b border-white/5 pb-4">
                    <dt className="text-zinc-600">
                      Archivos cargados
                    </dt>
                    <dd className="text-zinc-300">
                      {metrics.storageFilesTotal}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4 border-b border-white/5 pb-4">
                    <dt className="text-zinc-600">
                      Workflows activos
                    </dt>
                    <dd className="text-zinc-300">
                      {metrics.activeWorkflows}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-zinc-600">
                      Workflows predeterminados
                    </dt>
                    <dd className="text-zinc-300">
                      {metrics.defaultWorkflows}
                    </dd>
                  </div>
                </dl>
              </article>
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-2">
              <article className="luxia-panel rounded-3xl p-6">
                <div className="flex items-center gap-3">
                  <Cpu className="text-red-400" />
                  <h2 className="font-semibold text-white">
                    Comparación GPU
                  </h2>
                </div>

                <dl className="mt-6 space-y-4 text-sm">
                  <div className="flex justify-between gap-4 border-b border-white/5 pb-4">
                    <dt className="text-zinc-600">
                      Tiempo estimado
                    </dt>
                    <dd className="text-zinc-300">
                      {formatDuration(
                        metrics.estimatedGpuSeconds,
                      )}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4 border-b border-white/5 pb-4">
                    <dt className="text-zinc-600">
                      Tiempo real
                    </dt>
                    <dd className="text-zinc-300">
                      {formatDuration(
                        metrics.actualGpuSeconds,
                      )}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4 border-b border-white/5 pb-4">
                    <dt className="text-zinc-600">
                      Costo estimado
                    </dt>
                    <dd className="text-zinc-300">
                      {formatMoney(
                        metrics.estimatedGpuCostCents,
                      )}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-zinc-600">
                      Costo real
                    </dt>
                    <dd className="text-zinc-300">
                      {formatMoney(
                        metrics.actualGpuCostCents,
                      )}
                    </dd>
                  </div>
                </dl>
              </article>

              <article className="luxia-panel rounded-3xl p-6">
                <div className="flex items-center gap-3">
                  <Boxes className="text-red-400" />
                  <h2 className="font-semibold text-white">
                    Alcance de los datos
                  </h2>
                </div>

                <div className="mt-6 space-y-3 text-sm text-zinc-600">
                  <p>
                    Try-On Jobs:{" "}
                    {snapshot.tryOnJobs.length}
                  </p>
                  <p>
                    External AI Jobs:{" "}
                    {
                      snapshot.externalAiJobs
                        .length
                    }
                  </p>
                  <p>
                    Storage Files:{" "}
                    {
                      snapshot.storageFiles
                        .length
                    }
                  </p>
                  <p>
                    Workflow Definitions:{" "}
                    {
                      snapshot
                        .workflowDefinitions.items
                        .length
                    }
                  </p>
                </div>

                <p className="mt-5 rounded-2xl border border-amber-500/10 bg-amber-950/10 p-4 text-xs leading-6 text-amber-300/80">
                  El backend no expone un endpoint JSON
                  dedicado de monitoreo. Este panel agrega
                  únicamente datos reales de los endpoints
                  administrativos existentes. Las cifras
                  representan hasta 200 registros por
                  recurso, no estadísticas globales.
                </p>
              </article>
            </section>
          </>
        )}
    </div>
  );
}
