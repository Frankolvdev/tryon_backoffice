"use client";

import {
  LoaderCircle,
  Save,
  Settings2,
} from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { TryOnJobAuditPanel } from "@/components/backoffice/tryon/tryon-job-audit-panel";
import { TryOnRunPodActions } from "@/components/backoffice/tryon/tryon-runpod-actions";
import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  TryOnJobAdminUpdate,
  TryOnJobSummary,
  TryOnJobStatus,
} from "@/types/admin-tryon";

interface TryOnJobActionsPanelProps {
  job: TryOnJobSummary;
  onUpdated: (job: TryOnJobSummary) => void;
  onRefresh?: () => Promise<void> | void;
}

const KNOWN_STATUSES: TryOnJobStatus[] = [
  "pending",
  "queued",
  "processing",
  "running",
  "retrying",
  "completed",
  "failed",
  "canceled",
];

function parseNullableInteger(
  value: string,
): number | null {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const parsed = Number.parseInt(
    normalized,
    10,
  );

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

export function TryOnJobActionsPanel({
  job,
  onUpdated,
  onRefresh,
}: TryOnJobActionsPanelProps) {
  const [status, setStatus] =
    useState<TryOnJobStatus>(
      job.status,
    );

  const [errorMessage, setErrorMessage] =
    useState(
      job.error_message ?? "",
    );

  const [runpodJobId, setRunpodJobId] =
    useState(
      job.runpod_job_id ?? "",
    );

  const [
    comfyWorkflowName,
    setComfyWorkflowName,
  ] = useState(
    job.comfy_workflow_name ?? "",
  );

  const [
    actualGpuSeconds,
    setActualGpuSeconds,
  ] = useState(
    job.actual_gpu_seconds === null
      ? ""
      : String(
          job.actual_gpu_seconds,
        ),
  );

  const [
    actualGpuCostCents,
    setActualGpuCostCents,
  ] = useState(
    job.actual_gpu_cost_cents === null
      ? ""
      : String(
          job.actual_gpu_cost_cents,
        ),
  );

  const [isSaving, setIsSaving] =
    useState(false);

  useEffect(() => {
    setStatus(job.status);
    setErrorMessage(
      job.error_message ?? "",
    );
    setRunpodJobId(
      job.runpod_job_id ?? "",
    );
    setComfyWorkflowName(
      job.comfy_workflow_name ?? "",
    );
    setActualGpuSeconds(
      job.actual_gpu_seconds === null
        ? ""
        : String(
            job.actual_gpu_seconds,
          ),
    );
    setActualGpuCostCents(
      job.actual_gpu_cost_cents === null
        ? ""
        : String(
            job.actual_gpu_cost_cents,
          ),
    );
  }, [job]);

  const submit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const gpuSeconds =
      parseNullableInteger(
        actualGpuSeconds,
      );

    const gpuCost =
      parseNullableInteger(
        actualGpuCostCents,
      );

    if (
      actualGpuSeconds.trim() &&
      (
        gpuSeconds === null ||
        gpuSeconds < 0
      )
    ) {
      toast.error(
        "Los segundos GPU deben ser un entero mayor o igual a cero.",
      );
      return;
    }

    if (
      actualGpuCostCents.trim() &&
      (
        gpuCost === null ||
        gpuCost < 0
      )
    ) {
      toast.error(
        "El costo GPU debe ser un entero mayor o igual a cero.",
      );
      return;
    }

    const payload: TryOnJobAdminUpdate = {
      status,
      error_message:
        errorMessage.trim() || null,
      runpod_job_id:
        runpodJobId.trim() || null,
      comfy_workflow_name:
        comfyWorkflowName.trim() ||
        null,
      actual_gpu_seconds:
        gpuSeconds,
      actual_gpu_cost_cents:
        gpuCost,
    };

    setIsSaving(true);

    try {
      const updated =
        await browserApiRequest<TryOnJobSummary>(
          `/api/admin/tryon-jobs/${job.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(
              payload,
            ),
          },
        );

      onUpdated(updated);

      toast.success(
        "Trabajo actualizado correctamente.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible actualizar el trabajo.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <section className="luxia-panel mt-5 rounded-3xl p-6">
        <div className="flex items-center gap-3">
          <Settings2 className="text-red-400" />

          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Acciones administrativas
            </p>

            <h2 className="mt-2 text-lg font-semibold text-white">
              Actualizar trabajo
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
              Edición administrativa del job y
              acciones reales sobre su ejecución
              RunPod vinculada.
            </p>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="mt-6 space-y-5"
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Estado
              </span>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target
                      .value as TryOnJobStatus,
                  )
                }
                className="h-12 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-white outline-none focus:border-red-500/50"
              >
                {KNOWN_STATUSES.map(
                  (value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {value}
                    </option>
                  ),
                )}

                {!KNOWN_STATUSES.includes(
                  job.status,
                ) && (
                  <option
                    value={job.status}
                  >
                    {job.status}
                  </option>
                )}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                RunPod Job ID
              </span>

              <input
                value={runpodJobId}
                onChange={(event) =>
                  setRunpodJobId(
                    event.target.value,
                  )
                }
                placeholder="ID externo de RunPod"
                className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm text-white outline-none focus:border-red-500/50"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Workflow ComfyUI
              </span>

              <input
                value={
                  comfyWorkflowName
                }
                onChange={(event) =>
                  setComfyWorkflowName(
                    event.target.value,
                  )
                }
                placeholder="Nombre del workflow"
                className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                GPU real en segundos
              </span>

              <input
                type="number"
                min={0}
                step={1}
                value={
                  actualGpuSeconds
                }
                onChange={(event) =>
                  setActualGpuSeconds(
                    event.target.value,
                  )
                }
                placeholder="Ejemplo: 42"
                className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Costo GPU real en centavos
              </span>

              <input
                type="number"
                min={0}
                step={1}
                value={
                  actualGpuCostCents
                }
                onChange={(event) =>
                  setActualGpuCostCents(
                    event.target.value,
                  )
                }
                placeholder="Ejemplo: 15"
                className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
              />
            </label>
          </div>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Mensaje de error
            </span>

            <textarea
              value={errorMessage}
              onChange={(event) =>
                setErrorMessage(
                  event.target.value,
                )
              }
              placeholder="Vacío cuando el trabajo no tiene error"
              className="min-h-32 w-full resize-y rounded-xl border border-white/8 bg-black/30 p-4 text-sm leading-6 text-white outline-none focus:border-red-500/50"
            />
          </label>

          <div className="flex justify-end border-t border-white/6 pt-5">
            <button
              type="submit"
              disabled={isSaving}
              className="luxia-red-glow inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              {isSaving ? (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Save size={16} />
              )}

              Guardar cambios
            </button>
          </div>
        </form>

        <TryOnRunPodActions
          job={job}
          onTryOnJobRefresh={
            onRefresh ??
            (() => undefined)
          }
        />
      </section>

      <TryOnJobAuditPanel
        job={job}
      />
    </>
  );
}
