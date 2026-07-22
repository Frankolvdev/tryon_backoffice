"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Ban,
  CircleDollarSign,
  CloudCog,
  Cpu,
  LoaderCircle,
  Pencil,
  Play,
  Plus,
  RefreshCcw,
  Server,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import { ComfyUIJsonResult } from "@/components/backoffice/tryon/comfyui-json-result";
import { RunPodConfigEditor } from "@/components/backoffice/tryon/runpod-config-editor";
import { TryOnEmptyState } from "@/components/backoffice/tryon/tryon-empty-state";
import { TryOnModuleHeader } from "@/components/backoffice/tryon/tryon-module-header";
import { browserApiRequest } from "@/lib/api/browser-api";
import {
  formatTryOnDate,
  formatTryOnMoneyFromCents,
} from "@/lib/tryon/format";

import type {
  ExternalAiJobResponse,
  RunPodCancelRequest,
  RunPodCancelResponse,
  RunPodConfigResponse,
  RunPodStatusResponse,
  RunPodSubmitRequest,
  RunPodSubmitResponse,
} from "@/types/admin-runpod";

function parseJsonObject(
  value: string,
): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(value);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      toast.error("Input debe ser un objeto JSON.");
      return null;
    }

    return parsed as Record<string, unknown>;
  } catch {
    toast.error("El input JSON no es válido.");
    return null;
  }
}

function finished(status: string): boolean {
  return [
    "completed",
    "failed",
    "cancelled",
    "canceled",
    "timed_out",
    "timeout",
  ].includes(status.toLowerCase());
}

export default function RunPodDashboardPage() {
  const [configs, setConfigs] =
    useState<RunPodConfigResponse[]>([]);
  const [jobs, setJobs] =
    useState<ExternalAiJobResponse[]>([]);
  const [editing, setEditing] =
    useState<RunPodConfigResponse | null | undefined>(
      undefined,
    );
  const [selectedConfigId, setSelectedConfigId] =
    useState("");
  const [inputJson, setInputJson] =
    useState("{}");
  const [internalJobType, setInternalJobType] =
    useState("manual");
  const [internalJobId, setInternalJobId] =
    useState("");
  const [result, setResult] =
    useState<unknown>(null);
  const [isLoading, setIsLoading] =
    useState(true);
  const [action, setAction] =
    useState<string | null>(null);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [configResponse, jobResponse] =
        await Promise.all([
          browserApiRequest<RunPodConfigResponse[]>(
            "/api/admin/runpod-configs",
          ),
          browserApiRequest<ExternalAiJobResponse[]>(
            "/api/admin/external-ai-jobs?skip=0&limit=200",
          ),
        ]);

      setConfigs(configResponse);
      setJobs(
        jobResponse.filter(
          (job) =>
            job.provider.toLowerCase() === "runpod",
        ),
      );

      setSelectedConfigId((current) => {
        if (
          current &&
          configResponse.some(
            (config) =>
              String(config.id) === current,
          )
        ) {
          return current;
        }

        const active =
          configResponse.find(
            (config) => config.is_active,
          );

        return active
          ? String(active.id)
          : configResponse[0]
            ? String(configResponse[0].id)
            : "";
      });
    } catch (error) {
      setConfigs([]);
      setJobs([]);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar RunPod.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const selectedConfig = useMemo(
    () =>
      configs.find(
        (config) =>
          String(config.id) === selectedConfigId,
      ) ?? null,
    [configs, selectedConfigId],
  );

  const activeCount = configs.filter(
    (config) => config.is_active,
  ).length;

  const runningCount = jobs.filter(
    (job) => !finished(job.status),
  ).length;

  const saveConfig = async () => {
    setEditing(undefined);
    await loadData();
  };

  const submitJob = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!selectedConfig?.endpoint_id) {
      toast.error(
        "Selecciona una configuración con endpoint_id.",
      );
      return;
    }

    const input = parseJsonObject(inputJson);
    if (!input) return;

    const parsedInternalJobId =
      internalJobId.trim()
        ? Number.parseInt(internalJobId, 10)
        : null;

    if (
      internalJobId.trim() &&
      (
        parsedInternalJobId === null ||
        !Number.isInteger(parsedInternalJobId) ||
        parsedInternalJobId <= 0
      )
    ) {
      toast.error("Internal job ID no es válido.");
      return;
    }

    const payload: RunPodSubmitRequest = {
      endpoint_id: selectedConfig.endpoint_id,
      input,
      internal_job_type:
        internalJobType.trim() || "manual",
      internal_job_id: parsedInternalJobId,
    };

    setAction("submit");

    try {
      const response =
        await browserApiRequest<RunPodSubmitResponse>(
          "/api/admin/runpod/jobs",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );

      setResult(response);
      toast.success(
        `Job RunPod enviado con estado ${response.status}.`,
      );
      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible enviar el job.",
      );
    } finally {
      setAction(null);
    }
  };

  const refreshStatus = async (
    job: ExternalAiJobResponse,
  ) => {
    if (!selectedConfig?.endpoint_id) {
      toast.error(
        "Selecciona una configuración con endpoint_id.",
      );
      return;
    }

    setAction(`status-${job.id}`);

    try {
      const response =
        await browserApiRequest<RunPodStatusResponse>(
          `/api/admin/runpod/jobs/${job.id}/status?endpoint_id=${encodeURIComponent(selectedConfig.endpoint_id)}`,
          { method: "POST" },
        );

      setResult(response);
      toast.success(
        `Estado actualizado: ${response.status}.`,
      );
      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible actualizar el estado.",
      );
    } finally {
      setAction(null);
    }
  };

  const cancelJob = async (
    job: ExternalAiJobResponse,
  ) => {
    if (!selectedConfig?.endpoint_id) {
      toast.error(
        "Selecciona una configuración con endpoint_id.",
      );
      return;
    }

    if (
      !window.confirm(
        `¿Cancelar la ejecución RunPod #${job.id}?`,
      )
    ) {
      return;
    }

    const payload: RunPodCancelRequest = {
      endpoint_id: selectedConfig.endpoint_id,
    };

    setAction(`cancel-${job.id}`);

    try {
      const response =
        await browserApiRequest<RunPodCancelResponse>(
          `/api/admin/runpod/jobs/${job.id}/cancel`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );

      setResult(response);
      toast.success(
        `Ejecución cancelada: ${response.status}.`,
      );
      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible cancelar el job.",
      );
    } finally {
      setAction(null);
    }
  };

  return (
    <div>
      <TryOnModuleHeader
        title="RunPod"
        description="Configuración Serverless, ejecuciones externas, envío manual, actualización de estado y cancelación."
      />


      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white"
        >
          <Plus size={16} />
          Nueva configuración
        </button>

        <button
          type="button"
          onClick={() => void loadData()}
          disabled={isLoading}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400 disabled:opacity-50"
        >
          <RefreshCcw
            size={16}
            className={
              isLoading ? "animate-spin" : undefined
            }
          />
          Actualizar
        </button>
      </div>

      {isLoading && (
        <section className="luxia-panel mt-5 flex min-h-72 items-center justify-center rounded-3xl">
          <LoaderCircle className="animate-spin text-red-500" />
        </section>
      )}

      {!isLoading && errorMessage && (
        <div className="mt-5">
          <TryOnEmptyState
            error
            title="No se pudo cargar RunPod"
            description={errorMessage}
          />
        </div>
      )}

      {!isLoading && !errorMessage && (
        <>
          <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="luxia-panel rounded-2xl p-5">
              <CloudCog size={18} className="text-red-400" />
              <p className="mt-4 text-xs text-zinc-600">
                Configuraciones
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {configs.length}
              </p>
            </article>

            <article className="luxia-panel rounded-2xl p-5">
              <Server size={18} className="text-red-400" />
              <p className="mt-4 text-xs text-zinc-600">
                Configuraciones activas
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {activeCount}
              </p>
            </article>

            <article className="luxia-panel rounded-2xl p-5">
              <Play size={18} className="text-red-400" />
              <p className="mt-4 text-xs text-zinc-600">
                Jobs RunPod cargados
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {jobs.length}
              </p>
            </article>

            <article className="luxia-panel rounded-2xl p-5">
              <Cpu size={18} className="text-red-400" />
              <p className="mt-4 text-xs text-zinc-600">
                Jobs no finalizados
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {runningCount}
              </p>
            </article>
          </section>

          {editing !== undefined && (
            <div className="mt-5">
              <RunPodConfigEditor
                config={editing}
                onSaved={saveConfig}
                onCancel={() =>
                  setEditing(undefined)
                }
              />
            </div>
          )}

          <section className="mt-5 grid gap-5 xl:grid-cols-2">
            <article className="luxia-panel rounded-3xl p-6">
              <h2 className="text-lg font-semibold text-white">
                Configuraciones
              </h2>

              <div className="mt-5 space-y-3">
                {configs.map((config) => (
                  <div
                    key={config.id}
                    className="rounded-2xl border border-white/7 bg-black/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-zinc-200">
                            {config.name}
                          </p>
                          <span
                            className={
                              config.is_active
                                ? "rounded-full border border-emerald-500/15 bg-emerald-950/20 px-2 py-1 text-[10px] text-emerald-400"
                                : "rounded-full border border-zinc-500/15 bg-zinc-900/40 px-2 py-1 text-[10px] text-zinc-500"
                            }
                          >
                            {config.is_active
                              ? "ACTIVA"
                              : "INACTIVA"}
                          </span>
                        </div>
                        <p className="mt-2 break-all font-mono text-xs text-zinc-700">
                          {config.endpoint_id ??
                            "Sin endpoint ID"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setEditing(config)}
                        className="flex size-9 items-center justify-center rounded-xl border border-white/8 text-zinc-500 hover:text-white"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>

                    <div className="mt-4 grid gap-2 text-xs text-zinc-600 sm:grid-cols-2">
                      <p>GPU: {config.gpu_type ?? "—"}</p>
                      <p>
                        Workers: {config.min_workers}–
                        {config.max_workers}
                      </p>
                      <p>
                        Workflow:{" "}
                        {config.comfy_workflow_name ?? "—"}
                      </p>
                      <p>
                        Costo:{" "}
                        {formatTryOnMoneyFromCents(
                          config.estimated_cost_per_second_cents,
                        )}
                        /s
                      </p>
                    </div>
                  </div>
                ))}

                {configs.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-white/8 p-5 text-center text-sm text-zinc-600">
                    No existen configuraciones RunPod.
                  </p>
                )}
              </div>
            </article>

            <form
              onSubmit={submitJob}
              className="luxia-panel rounded-3xl p-6"
            >
              <h2 className="text-lg font-semibold text-white">
                Enviar job manual
              </h2>

              <label className="mt-5 block">
                <span className="mb-2 block text-sm text-zinc-500">
                  Configuración
                </span>
                <select
                  value={selectedConfigId}
                  onChange={(event) =>
                    setSelectedConfigId(
                      event.target.value,
                    )
                  }
                  className="h-12 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-white"
                >
                  {configs.map((config) => (
                    <option
                      key={config.id}
                      value={config.id}
                    >
                      {config.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm text-zinc-500">
                    Internal job type
                  </span>
                  <input
                    value={internalJobType}
                    onChange={(event) =>
                      setInternalJobType(
                        event.target.value,
                      )
                    }
                    className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm text-zinc-500">
                    Internal job ID
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={internalJobId}
                    onChange={(event) =>
                      setInternalJobId(
                        event.target.value,
                      )
                    }
                    className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
                  />
                </label>
              </div>

              <label className="mt-5 block">
                <span className="mb-2 block text-sm text-zinc-500">
                  Input JSON
                </span>
                <textarea
                  value={inputJson}
                  onChange={(event) =>
                    setInputJson(event.target.value)
                  }
                  spellCheck={false}
                  className="min-h-64 w-full rounded-xl border border-white/8 bg-[#060607] p-4 font-mono text-xs leading-6 text-zinc-300"
                />
              </label>

              <button
                type="submit"
                disabled={
                  Boolean(action) ||
                  !selectedConfig?.endpoint_id
                }
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {action === "submit" ? (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Play size={16} />
                )}
                Enviar a RunPod
              </button>
            </form>
          </section>

          <section className="luxia-panel mt-5 overflow-hidden rounded-3xl">
            <div className="border-b border-white/6 p-6">
              <h2 className="text-lg font-semibold text-white">
                Ejecuciones RunPod
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                Primeros 200 External AI Jobs filtrados
                por proveedor RunPod.
              </p>
            </div>

            <div className="divide-y divide-white/6">
              {jobs.map((job) => (
                <article
                  key={job.id}
                  className="p-5"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-medium text-white">
                          External AI Job #{job.id}
                        </p>
                        <span className="rounded-full border border-blue-500/15 bg-blue-950/20 px-2.5 py-1 text-[10px] text-blue-400">
                          {job.status}
                        </span>
                      </div>

                      <p className="mt-2 break-all font-mono text-xs text-zinc-700">
                        {job.provider_job_id ??
                          "Sin provider job ID"}
                      </p>

                      <div className="mt-4 grid gap-2 text-xs text-zinc-600 sm:grid-cols-2 lg:grid-cols-4">
                        <p>
                          Tipo: {job.internal_job_type}
                        </p>
                        <p>
                          ID interno:{" "}
                          {job.internal_job_id ?? "—"}
                        </p>
                        <p>
                          Creado:{" "}
                          {formatTryOnDate(job.created_at)}
                        </p>
                        <p>
                          Finalizado:{" "}
                          {formatTryOnDate(job.finished_at)}
                        </p>
                      </div>

                      {job.error_message && (
                        <p className="mt-4 rounded-xl border border-red-500/10 bg-red-950/10 p-3 text-xs text-red-300">
                          {job.error_message}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={
                          Boolean(action) ||
                          !selectedConfig?.endpoint_id
                        }
                        onClick={() =>
                          void refreshStatus(job)
                        }
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-blue-500/15 bg-blue-950/15 px-4 text-sm text-blue-300 disabled:opacity-40"
                      >
                        {action === `status-${job.id}` ? (
                          <LoaderCircle
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          <RefreshCcw size={15} />
                        )}
                        Estado
                      </button>

                      <button
                        type="button"
                        disabled={
                          Boolean(action) ||
                          finished(job.status) ||
                          !selectedConfig?.endpoint_id
                        }
                        onClick={() =>
                          void cancelJob(job)
                        }
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-500/15 bg-red-950/20 px-4 text-sm text-red-300 disabled:opacity-40"
                      >
                        {action === `cancel-${job.id}` ? (
                          <LoaderCircle
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          <Ban size={15} />
                        )}
                        Cancelar
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {jobs.length === 0 && (
                <div className="p-6">
                  <TryOnEmptyState
                    title="No existen ejecuciones RunPod"
                    description="No se encontraron External AI Jobs del proveedor RunPod."
                  />
                </div>
              )}
            </div>
          </section>

          {result !== null && (
            <div className="mt-5">
              <ComfyUIJsonResult
                title="Última respuesta RunPod"
                value={result}
              />
            </div>
          )}

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-500/10 bg-amber-950/10 p-4">
            <TriangleAlert
              size={18}
              className="mt-0.5 shrink-0 text-amber-400"
            />
            <p className="text-xs leading-6 text-amber-300/80">
              El backend permite crear y editar
              configuraciones, pero no eliminarlas. El
              estado de workers mostrado corresponde a
              min_workers y max_workers configurados; la
              API actual no expone métricas en vivo del
              número de workers activos.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
