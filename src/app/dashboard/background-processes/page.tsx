"use client";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  Layers3,
  LoaderCircle,
  RefreshCcw,
  RotateCcw,
  Search,
  Skull,
  XCircle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  BackgroundJob,
  BackgroundJobDetailResponse,
  BackgroundJobListResponse,
  BackgroundJobMetrics,
} from "@/types/admin-background-jobs";

const LIMIT = 200;

function formatDate(
  value: string | null,
): string {
  if (!value) return "No disponible";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("es-MX");
}

function statusClass(
  status: string,
): string {
  if (
    status === "succeeded" ||
    status === "completed"
  ) {
    return "border-emerald-500/15 bg-emerald-950/15 text-emerald-400";
  }

  if (
    status === "running" ||
    status === "processing"
  ) {
    return "border-blue-500/15 bg-blue-950/15 text-blue-400";
  }

  if (
    status === "queued" ||
    status === "pending" ||
    status === "retrying"
  ) {
    return "border-amber-500/15 bg-amber-950/15 text-amber-400";
  }

  return "border-red-500/15 bg-red-950/15 text-red-400";
}

export default function BackgroundProcessesPage() {
  const [jobs, setJobs] =
    useState<BackgroundJob[]>([]);
  const [metrics, setMetrics] =
    useState<BackgroundJobMetrics | null>(
      null,
    );
  const [selected, setSelected] =
    useState<BackgroundJobDetailResponse | null>(
      null,
    );
  const [search, setSearch] =
    useState("");
  const [status, setStatus] =
    useState("");
  const [queueName, setQueueName] =
    useState("");
  const [executionMode, setExecutionMode] =
    useState("");
  const [isLoading, setIsLoading] =
    useState(true);
  const [detailLoading, setDetailLoading] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [
        listResponse,
        metricsResponse,
      ] = await Promise.all([
        browserApiRequest<BackgroundJobListResponse>(
          `/api/admin/background-jobs?skip=0&limit=${LIMIT}`,
        ),
        browserApiRequest<BackgroundJobMetrics>(
          "/api/admin/background-job-operations/metrics",
        ),
      ]);

      setJobs(listResponse.items);
      setMetrics(metricsResponse);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar los procesos.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openDetail = async (
    job: BackgroundJob,
  ) => {
    setDetailLoading(true);

    try {
      setSelected(
        await browserApiRequest<BackgroundJobDetailResponse>(
          `/api/admin/background-jobs/${job.id}`,
        ),
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const queues = useMemo(
    () =>
      Array.from(
        new Set(
          jobs.map(
            (job) => job.queue_name,
          ),
        ),
      ).sort(),
    [jobs],
  );

  const visibleJobs = useMemo(() => {
    const normalized =
      search.trim().toLowerCase();

    return jobs.filter((job) => {
      if (
        status &&
        job.status !== status
      ) {
        return false;
      }

      if (
        queueName &&
        job.queue_name !== queueName
      ) {
        return false;
      }

      if (
        executionMode &&
        job.execution_mode !==
          executionMode
      ) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return [
        job.id,
        job.public_id,
        job.job_type,
        job.queue_name,
        job.status,
        job.worker_name ?? "",
        job.provider_job_id ?? "",
        job.error_message ?? "",
      ].some((value) =>
        String(value)
          .toLowerCase()
          .includes(normalized),
      );
    });
  }, [
    executionMode,
    jobs,
    queueName,
    search,
    status,
  ]);

  const cards = metrics
    ? [
        [
          "Total",
          metrics.total_jobs,
          Layers3,
        ],
        [
          "En cola",
          metrics.queued_jobs,
          Clock3,
        ],
        [
          "Ejecutándose",
          metrics.running_jobs,
          Activity,
        ],
        [
          "Completados",
          metrics.succeeded_jobs,
          CheckCircle2,
        ],
        [
          "Fallidos",
          metrics.failed_jobs,
          XCircle,
        ],
        [
          "Reintentando",
          metrics.retrying_jobs,
          RotateCcw,
        ],
        [
          "Dead letter",
          metrics.dead_letter_jobs,
          Skull,
        ],
      ]
    : [];

  return (
    <div>
      <section className="luxia-panel rounded-3xl p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Operación
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-white">
              Procesos en segundo plano
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
              Supervisa trabajos asíncronos de
              toda la plataforma, no únicamente
              los jobs de Try-On.
            </p>
          </div>

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
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {cards.map(
          ([label, value, Icon]) => {
            const MetricIcon =
              Icon as typeof Layers3;

            return (
              <article
                key={String(label)}
                className="luxia-panel rounded-2xl p-5"
              >
                <MetricIcon
                  size={18}
                  className="text-red-400"
                />
                <p className="mt-4 text-xs text-zinc-600">
                  {String(label)}
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {Number(value)}
                </p>
              </article>
            );
          },
        )}
      </section>

      <section className="luxia-panel mt-5 rounded-3xl p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-zinc-700"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Buscar proceso..."
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 pr-4 pl-11 text-sm text-white"
            />
          </label>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value,
              )
            }
            className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
          >
            <option value="">
              Cualquier estado
            </option>
            {[
              "queued",
              "running",
              "succeeded",
              "failed",
              "retrying",
              "dead_letter",
              "canceled",
            ].map((value) => (
              <option
                key={value}
                value={value}
              >
                {value}
              </option>
            ))}
          </select>

          <select
            value={queueName}
            onChange={(event) =>
              setQueueName(
                event.target.value,
              )
            }
            className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
          >
            <option value="">
              Cualquier cola
            </option>

            {queues.map((value) => (
              <option
                key={value}
                value={value}
              >
                {value}
              </option>
            ))}
          </select>

          <select
            value={executionMode}
            onChange={(event) =>
              setExecutionMode(
                event.target.value,
              )
            }
            className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
          >
            <option value="">
              Cualquier ejecución
            </option>
            <option value="internal">
              internal
            </option>
            <option value="external">
              external
            </option>
          </select>
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
              <AlertTriangle className="mt-0.5 text-red-400" />
              <p className="text-sm text-red-300">
                {errorMessage}
              </p>
            </div>
          </section>
        )}

      {!isLoading &&
        !errorMessage && (
          <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_450px]">
            <div className="luxia-panel overflow-hidden rounded-3xl">
              {visibleJobs.length === 0 ? (
                <div className="p-12 text-center text-sm text-zinc-600">
                  No existen procesos que
                  coincidan.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1050px] text-left">
                    <thead className="border-b border-white/6 bg-black/20 text-[10px] tracking-[0.14em] text-zinc-700 uppercase">
                      <tr>
                        <th className="px-5 py-4">
                          Proceso
                        </th>
                        <th className="px-5 py-4">
                          Cola
                        </th>
                        <th className="px-5 py-4">
                          Estado
                        </th>
                        <th className="px-5 py-4">
                          Progreso
                        </th>
                        <th className="px-5 py-4">
                          Intentos
                        </th>
                        <th className="px-5 py-4">
                          Worker
                        </th>
                        <th className="px-5 py-4 text-right">
                          Acción
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                      {visibleJobs.map(
                        (job) => (
                          <tr
                            key={job.id}
                            className="hover:bg-white/[0.02]"
                          >
                            <td className="px-5 py-4">
                              <p className="max-w-xs truncate text-sm font-semibold text-white">
                                {job.job_type}
                              </p>
                              <p className="mt-1 font-mono text-[10px] text-zinc-700">
                                {job.public_id}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-sm text-zinc-400">
                              {job.queue_name}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClass(
                                  job.status,
                                )}`}
                              >
                                {job.status}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="w-32">
                                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                                  <div
                                    className="h-full bg-red-600"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        Math.max(
                                          0,
                                          job.progress,
                                        ),
                                      )}%`,
                                    }}
                                  />
                                </div>
                                <p className="mt-1 text-[10px] text-zinc-700">
                                  {job.progress.toFixed(
                                    0,
                                  )}
                                  %
                                </p>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm text-zinc-400">
                              {job.attempt_count} /{" "}
                              {job.max_attempts}
                            </td>

                            <td className="px-5 py-4 text-xs text-zinc-600">
                              {job.worker_name ??
                                "Sin asignar"}
                            </td>

                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  void openDetail(
                                    job,
                                  )
                                }
                                className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/8 px-3 text-xs text-zinc-400"
                              >
                                <Eye size={14} />
                                Ver
                              </button>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <aside className="luxia-panel rounded-3xl p-6">
              {detailLoading ? (
                <div className="flex min-h-72 items-center justify-center">
                  <LoaderCircle className="animate-spin text-red-500" />
                </div>
              ) : !selected ? (
                <div className="flex min-h-72 flex-col items-center justify-center text-center">
                  <Layers3 className="text-zinc-800" />
                  <p className="mt-4 text-sm text-zinc-600">
                    Selecciona un proceso para
                    revisar su detalle.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-[10px] font-semibold tracking-[0.16em] text-red-500 uppercase">
                    Proceso #{selected.job.id}
                  </p>

                  <h2 className="mt-2 text-lg font-semibold text-white">
                    {selected.job.job_type}
                  </h2>

                  <p className="mt-2 font-mono text-[10px] text-zinc-700">
                    {selected.job.public_id}
                  </p>

                  <dl className="mt-5 space-y-3 text-xs">
                    {[
                      [
                        "Estado",
                        selected.job.status,
                      ],
                      [
                        "Cola",
                        selected.job.queue_name,
                      ],
                      [
                        "Ejecución",
                        selected.job.execution_mode,
                      ],
                      [
                        "Prioridad",
                        selected.job.priority,
                      ],
                      [
                        "Intentos",
                        `${selected.job.attempt_count} / ${selected.job.max_attempts}`,
                      ],
                      [
                        "Usuario",
                        selected.job.user_id ??
                          "—",
                      ],
                      [
                        "Worker",
                        selected.job.worker_name ??
                          "—",
                      ],
                      [
                        "Creado",
                        formatDate(
                          selected.job.created_at,
                        ),
                      ],
                      [
                        "Iniciado",
                        formatDate(
                          selected.job.started_at,
                        ),
                      ],
                      [
                        "Completado",
                        formatDate(
                          selected.job.completed_at,
                        ),
                      ],
                    ].map(([label, value]) => (
                      <div
                        key={String(label)}
                        className="flex justify-between gap-4 border-b border-white/5 pb-3"
                      >
                        <dt className="text-zinc-700">
                          {String(label)}
                        </dt>
                        <dd className="max-w-64 break-all text-right text-zinc-300">
                          {String(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {selected.job.error_message && (
                    <div className="mt-5 rounded-2xl border border-red-500/15 bg-red-950/15 p-4">
                      <p className="text-xs font-semibold text-red-300">
                        {selected.job.error_code ??
                          "Error"}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-zinc-500">
                        {
                          selected.job
                            .error_message
                        }
                      </p>
                    </div>
                  )}

                  <section className="mt-5">
                    <p className="text-xs font-semibold text-white">
                      Intentos
                    </p>
                    <p className="mt-2 text-xs text-zinc-600">
                      {selected.attempts.length}{" "}
                      registrados
                    </p>
                  </section>

                  <section className="mt-4">
                    <p className="text-xs font-semibold text-white">
                      Dependencias
                    </p>
                    <p className="mt-2 text-xs text-zinc-600">
                      {
                        selected.dependencies
                          .length
                      }{" "}
                      dependencias ·{" "}
                      {
                        selected.dependents
                          .length
                      }{" "}
                      dependientes
                    </p>
                  </section>
                </>
              )}
            </aside>
          </section>
        )}
    </div>
  );
}
