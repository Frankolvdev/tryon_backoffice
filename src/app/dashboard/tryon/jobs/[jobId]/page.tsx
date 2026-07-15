"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  Clock3,
  LoaderCircle,
  RefreshCcw,
  Server,
  Sparkles,
  UserRound,
} from "lucide-react";

import { TryOnCopyButton } from "@/components/backoffice/tryon/tryon-copy-button";
import { TryOnEmptyState } from "@/components/backoffice/tryon/tryon-empty-state";
import { TryOnJobCoreCard } from "@/components/backoffice/tryon/tryon-job-core-card";
import { TryOnJobFilesPanel } from "@/components/backoffice/tryon/tryon-job-files-panel";
import { TryOnJobJsonPanel } from "@/components/backoffice/tryon/tryon-job-json-panel";
import { TryOnJobMetricsPanel } from "@/components/backoffice/tryon/tryon-job-metrics-panel";
import { TryOnJobStatusBadge } from "@/components/backoffice/tryon/tryon-job-status-badge";
import { TryOnModuleHeader } from "@/components/backoffice/tryon/tryon-module-header";
import { browserApiRequest } from "@/lib/api/browser-api";
import {
  formatTryOnDate,
} from "@/lib/tryon/format";

import type {
  TryOnJobSummary,
} from "@/types/admin-tryon";

export default function TryOnJobDetailPage() {
  const params = useParams<{
    jobId: string;
  }>();

  const jobId = Number(params.jobId);

  const [job, setJob] =
    useState<TryOnJobSummary | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadJob = useCallback(async () => {
    if (
      !Number.isInteger(jobId) ||
      jobId <= 0
    ) {
      setJob(null);
      setErrorMessage(
        "El identificador del trabajo no es válido.",
      );
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response =
        await browserApiRequest<TryOnJobSummary>(
          `/api/admin/tryon-jobs/${jobId}`,
        );

      setJob(response);
    } catch (error) {
      setJob(null);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar el trabajo Try-On.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    void loadJob();
  }, [loadJob]);

  if (isLoading) {
    return (
      <div>
        <TryOnModuleHeader
          title={`Job #${params.jobId}`}
          description="Consultando la información administrativa del trabajo Try-On."
        />

        <section className="luxia-panel mt-7 flex min-h-96 items-center justify-center rounded-3xl">
          <div className="text-center">
            <LoaderCircle className="mx-auto animate-spin text-red-500" />

            <p className="mt-4 text-sm text-zinc-500">
              Cargando detalle del job...
            </p>
          </div>
        </section>
      </div>
    );
  }

  if (!job || errorMessage) {
    return (
      <div>
        <TryOnModuleHeader
          title={`Job #${params.jobId}`}
          description="Detalle administrativo del trabajo Try-On."
        />

        <div className="mt-7">
          <TryOnEmptyState
            error
            title="No se pudo cargar el job"
            description={
              errorMessage ??
              "El trabajo solicitado no está disponible."
            }
          />
        </div>

        <Link
          href="/dashboard/tryon/jobs"
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div>
      <TryOnModuleHeader
        title={`Job #${job.id}`}
        description="Información central, métricas, archivos y datos técnicos del trabajo Try-On."
      />

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/tryon/jobs"
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver al listado
        </Link>

        <button
          type="button"
          onClick={() => void loadJob()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400 transition hover:text-white"
        >
          <RefreshCcw size={16} />
          Actualizar
        </button>
      </div>

      <section className="luxia-panel mt-5 rounded-3xl p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
              <Sparkles size={24} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold text-white">
                  Trabajo Try-On #{job.id}
                </h2>

                <TryOnJobStatusBadge
                  status={job.status}
                />
              </div>

              <p className="mt-3 text-sm text-zinc-600">
                Creado{" "}
                {formatTryOnDate(
                  job.created_at,
                )}
              </p>
            </div>
          </div>

          <TryOnCopyButton
            value={String(job.id)}
            label="Copiar ID"
          />
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <TryOnJobCoreCard
            label="Usuario"
            value={
              <span className="inline-flex items-center gap-2">
                <UserRound
                  size={16}
                  className="text-red-400"
                />
                #{job.user_id}
              </span>
            }
          />

          <TryOnJobCoreCard
            label="Tipo de artículo"
            value={job.item_type}
          />

          <TryOnJobCoreCard
            label="Calidad"
            value={job.quality_mode}
          />

          <TryOnJobCoreCard
            label="Tokens"
            value={job.tokens_cost.toLocaleString(
              "es-MX",
            )}
          />
        </div>
      </section>

      <TryOnJobMetricsPanel job={job} />

      <TryOnJobFilesPanel job={job} />

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <article className="luxia-panel rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <Boxes className="text-red-400" />

            <div>
              <h2 className="font-semibold text-white">
                Workflow
              </h2>

              <p className="mt-1 text-xs text-zinc-600">
                Definición ComfyUI asociada al trabajo
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/7 bg-black/20 p-5">
            <p className="break-all text-sm text-zinc-300">
              {job.comfy_workflow_name ??
                "No asignado"}
            </p>

            {job.comfy_workflow_name && (
              <div className="mt-4">
                <TryOnCopyButton
                  value={job.comfy_workflow_name}
                />
              </div>
            )}
          </div>
        </article>

        <article className="luxia-panel rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <Server className="text-red-400" />

            <div>
              <h2 className="font-semibold text-white">
                RunPod
              </h2>

              <p className="mt-1 text-xs text-zinc-600">
                Identificador externo de ejecución
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/7 bg-black/20 p-5">
            <p className="break-all font-mono text-xs text-zinc-300">
              {job.runpod_job_id ??
                "No asignado"}
            </p>

            {job.runpod_job_id && (
              <div className="mt-4">
                <TryOnCopyButton
                  value={job.runpod_job_id}
                />
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="mt-5">
        <article className="luxia-panel rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <Clock3 className="text-red-400" />

            <h2 className="font-semibold text-white">
              Fechas principales
            </h2>
          </div>

          <dl className="mt-5 grid gap-4 text-sm md:grid-cols-3">
            <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
              <dt className="text-xs text-zinc-600">
                Creado
              </dt>

              <dd className="mt-2 text-zinc-300">
                {formatTryOnDate(
                  job.created_at,
                )}
              </dd>
            </div>

            <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
              <dt className="text-xs text-zinc-600">
                Actualizado
              </dt>

              <dd className="mt-2 text-zinc-300">
                {formatTryOnDate(
                  job.updated_at,
                )}
              </dd>
            </div>

            <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
              <dt className="text-xs text-zinc-600">
                Completado
              </dt>

              <dd className="mt-2 text-zinc-300">
                {formatTryOnDate(
                  job.completed_at,
                )}
              </dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <article className="luxia-panel rounded-3xl p-6">
          <h2 className="font-semibold text-white">
            Prompt
          </h2>

          <div className="mt-4 min-h-32 rounded-2xl border border-white/7 bg-black/25 p-5">
            <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-400">
              {job.prompt ??
                "El trabajo no contiene prompt."}
            </p>
          </div>

          {job.prompt && (
            <div className="mt-4">
              <TryOnCopyButton
                value={job.prompt}
                label="Copiar prompt"
              />
            </div>
          )}
        </article>

        <article className="luxia-panel rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400" />

            <h2 className="font-semibold text-white">
              Error
            </h2>
          </div>

          <div className="mt-4 min-h-32 rounded-2xl border border-red-500/10 bg-red-950/10 p-5">
            <p className="whitespace-pre-wrap text-sm leading-7 text-red-300">
              {job.error_message ??
                "No existe un error registrado."}
            </p>
          </div>

          {job.error_message && (
            <div className="mt-4">
              <TryOnCopyButton
                value={job.error_message}
                label="Copiar error"
              />
            </div>
          )}
        </article>
      </section>

      <TryOnJobJsonPanel job={job} />
    </div>
  );
}
