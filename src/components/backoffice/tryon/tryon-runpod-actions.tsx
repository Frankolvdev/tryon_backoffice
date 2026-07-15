"use client";

import {
  Ban,
  ExternalLink,
  LoaderCircle,
  RefreshCcw,
  RotateCcw,
  Server,
  TriangleAlert,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import { formatTryOnDate } from "@/lib/tryon/format";

import type {
  ExternalAiJobResponse,
  RunPodCancelRequest,
  RunPodCancelResponse,
  RunPodConfigResponse,
  RunPodStatusResponse,
} from "@/types/admin-external-ai";
import type {
  TryOnJobSummary,
} from "@/types/admin-tryon";

interface TryOnRunPodActionsProps {
  job: TryOnJobSummary;
  onTryOnJobRefresh: () => Promise<void> | void;
}

function isFinishedStatus(
  status: string,
): boolean {
  return [
    "completed",
    "failed",
    "cancelled",
    "canceled",
    "timed_out",
    "timeout",
  ].includes(status.toLowerCase());
}

export function TryOnRunPodActions({
  job,
  onTryOnJobRefresh,
}: TryOnRunPodActionsProps) {
  const [externalJobs, setExternalJobs] =
    useState<ExternalAiJobResponse[]>([]);

  const [configs, setConfigs] =
    useState<RunPodConfigResponse[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [action, setAction] =
    useState<"refresh" | "cancel" | null>(
      null,
    );

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadRelatedData =
    useCallback(async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [
          externalJobsResponse,
          configsResponse,
        ] = await Promise.all([
          browserApiRequest<
            ExternalAiJobResponse[]
          >(
            "/api/admin/external-ai-jobs?skip=0&limit=200",
          ),
          browserApiRequest<
            RunPodConfigResponse[]
          >("/api/admin/runpod-configs"),
        ]);

        setExternalJobs(
          externalJobsResponse,
        );
        setConfigs(configsResponse);
      } catch (error) {
        setExternalJobs([]);
        setConfigs([]);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No fue posible cargar la ejecución externa.",
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadRelatedData();
  }, [loadRelatedData]);

  const externalJob = useMemo(
    () =>
      externalJobs.find(
        (candidate) =>
          candidate.internal_job_type
            .trim()
            .toLowerCase() === "tryon" &&
          candidate.internal_job_id ===
            job.id,
      ) ?? null,
    [externalJobs, job.id],
  );

  const activeConfig = useMemo(
    () =>
      configs.find(
        (config) =>
          config.is_active &&
          Boolean(config.endpoint_id),
      ) ?? null,
    [configs],
  );

  const endpointId =
    activeConfig?.endpoint_id ?? null;

  const refreshStatus = async () => {
    if (!externalJob || !endpointId) {
      toast.error(
        "No existe una ejecución externa o una configuración RunPod activa.",
      );
      return;
    }

    setAction("refresh");

    try {
      const response =
        await browserApiRequest<RunPodStatusResponse>(
          `/api/admin/runpod/jobs/${externalJob.id}/status?endpoint_id=${encodeURIComponent(endpointId)}`,
          {
            method: "POST",
          },
        );

      toast.success(
        `Estado RunPod actualizado: ${response.status}.`,
      );

      await loadRelatedData();
      await onTryOnJobRefresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible actualizar el estado de RunPod.",
      );
    } finally {
      setAction(null);
    }
  };

  const cancelJob = async () => {
    if (!externalJob || !endpointId) {
      toast.error(
        "No existe una ejecución externa o una configuración RunPod activa.",
      );
      return;
    }

    const confirmed = window.confirm(
      "¿Cancelar la ejecución RunPod asociada a este trabajo? El backend también actualizará el job Try-On relacionado.",
    );

    if (!confirmed) {
      return;
    }

    const payload: RunPodCancelRequest = {
      endpoint_id: endpointId,
    };

    setAction("cancel");

    try {
      const response =
        await browserApiRequest<RunPodCancelResponse>(
          `/api/admin/runpod/jobs/${externalJob.id}/cancel`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );

      toast.success(
        `Ejecución cancelada con estado: ${response.status}.`,
      );

      await loadRelatedData();
      await onTryOnJobRefresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible cancelar la ejecución RunPod.",
      );
    } finally {
      setAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-6 flex min-h-32 items-center justify-center rounded-2xl border border-white/7 bg-black/20">
        <LoaderCircle className="animate-spin text-red-500" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mt-6 rounded-2xl border border-red-500/15 bg-red-950/15 p-5">
        <div className="flex items-start gap-3">
          <TriangleAlert
            size={19}
            className="mt-0.5 shrink-0 text-red-400"
          />

          <div>
            <p className="text-sm font-medium text-red-300">
              No se pudo cargar RunPod
            </p>

            <p className="mt-2 text-xs leading-6 text-red-400/80">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() =>
                void loadRelatedData()
              }
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl border border-red-500/15 px-3 text-xs text-red-300"
            >
              <RefreshCcw size={14} />
              Reintentar carga
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!externalJob) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-white/8 bg-black/15 p-5">
        <div className="flex items-start gap-3">
          <Server
            size={19}
            className="mt-0.5 shrink-0 text-zinc-600"
          />

          <div>
            <p className="text-sm font-medium text-zinc-300">
              Sin ejecución externa vinculada
            </p>

            <p className="mt-2 text-xs leading-6 text-zinc-600">
              No existe un External AI Job con
              internal_job_type=&quot;tryon&quot; e
              internal_job_id={job.id} dentro de los
              primeros 200 registros del endpoint.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const canCancel =
    !isFinishedStatus(externalJob.status);

  return (
    <div className="mt-6 rounded-2xl border border-white/7 bg-black/20 p-5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-white">
              Ejecución RunPod #{externalJob.id}
            </p>

            <span className="rounded-full border border-blue-500/15 bg-blue-950/20 px-2.5 py-1 text-[10px] font-semibold uppercase text-blue-400">
              {externalJob.status}
            </span>
          </div>

          <p className="mt-2 break-all font-mono text-xs text-zinc-600">
            {externalJob.provider_job_id ??
              "Sin provider job ID"}
          </p>

          <div className="mt-4 grid gap-2 text-xs text-zinc-700 sm:grid-cols-2">
            <p>
              Configuración:{" "}
              {activeConfig?.name ??
                "No disponible"}
            </p>

            <p>
              Endpoint:{" "}
              {endpointId ??
                "No disponible"}
            </p>

            <p>
              Inicio:{" "}
              {formatTryOnDate(
                externalJob.started_at,
              )}
            </p>

            <p>
              Finalización:{" "}
              {formatTryOnDate(
                externalJob.finished_at,
              )}
            </p>
          </div>

          {externalJob.error_message && (
            <p className="mt-4 rounded-xl border border-red-500/10 bg-red-950/10 p-3 text-xs leading-5 text-red-300">
              {externalJob.error_message}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            disabled={
              Boolean(action) ||
              !endpointId
            }
            onClick={() =>
              void refreshStatus()
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-blue-500/15 bg-blue-950/15 px-4 text-sm text-blue-300 disabled:opacity-40"
          >
            {action === "refresh" ? (
              <LoaderCircle
                size={15}
                className="animate-spin"
              />
            ) : (
              <RefreshCcw size={15} />
            )}

            Actualizar estado
          </button>

          <button
            type="button"
            disabled={
              Boolean(action) ||
              !endpointId ||
              !canCancel
            }
            onClick={() =>
              void cancelJob()
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-500/15 bg-red-950/20 px-4 text-sm text-red-300 disabled:opacity-40"
          >
            {action === "cancel" ? (
              <LoaderCircle
                size={15}
                className="animate-spin"
              />
            ) : (
              <Ban size={15} />
            )}

            Cancelar RunPod
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-500/10 bg-amber-950/10 p-4">
        <RotateCcw
          size={17}
          className="mt-0.5 shrink-0 text-amber-400"
        />

        <p className="text-xs leading-6 text-amber-300/80">
          El backend no expone un endpoint de reintento
          para jobs Try-On ni para External AI Jobs.
          Por esa razón este panel integra actualización
          de estado y cancelación reales, pero no inventa
          un botón de reintento.
        </p>
      </div>
    </div>
  );
}
