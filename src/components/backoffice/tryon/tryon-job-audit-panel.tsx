"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  RefreshCcw,
  Server,
  Sparkles,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { browserApiRequest } from "@/lib/api/browser-api";
import { formatTryOnDate } from "@/lib/tryon/format";
import { cn } from "@/lib/utils";

import type {
  ExternalAiJobResponse,
} from "@/types/admin-external-ai";
import type {
  TryOnJobSummary,
} from "@/types/admin-tryon";

interface TryOnJobAuditPanelProps {
  job: TryOnJobSummary;
}

interface TimelineEvent {
  key: string;
  title: string;
  description: string;
  date: string | null;
  kind:
    | "neutral"
    | "success"
    | "warning"
    | "error";
}

function eventTimestamp(
  event: TimelineEvent,
): number {
  if (!event.date) {
    return Number.MAX_SAFE_INTEGER;
  }

  const parsed = new Date(
    event.date,
  ).getTime();

  return Number.isNaN(parsed)
    ? Number.MAX_SAFE_INTEGER
    : parsed;
}

function isCompleted(
  status: string,
): boolean {
  return status.toLowerCase() ===
    "completed";
}

function isFailed(
  status: string,
): boolean {
  return [
    "failed",
    "error",
    "timed_out",
    "timeout",
  ].includes(status.toLowerCase());
}

export function TryOnJobAuditPanel({
  job,
}: TryOnJobAuditPanelProps) {
  const [externalJobs, setExternalJobs] =
    useState<
      ExternalAiJobResponse[]
    >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadAudit =
    useCallback(async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response =
          await browserApiRequest<
            ExternalAiJobResponse[]
          >(
            "/api/admin/external-ai-jobs?skip=0&limit=200",
          );

        setExternalJobs(response);
      } catch (error) {
        setExternalJobs([]);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No fue posible cargar el historial operativo.",
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadAudit();
  }, [loadAudit]);

  const relatedExternalJobs = useMemo(
    () =>
      externalJobs
        .filter(
          (candidate) =>
            candidate.internal_job_type
              .trim()
              .toLowerCase() ===
              "tryon" &&
            candidate.internal_job_id ===
              job.id,
        )
        .sort(
          (left, right) =>
            new Date(
              left.created_at,
            ).getTime() -
            new Date(
              right.created_at,
            ).getTime(),
        ),
    [externalJobs, job.id],
  );

  const timeline = useMemo(() => {
    const events: TimelineEvent[] = [
      {
        key: "tryon-created",
        title: "Trabajo Try-On creado",
        description:
          `Se registró el job #${job.id} para el usuario #${job.user_id}.`,
        date: job.created_at,
        kind: "neutral",
      },
    ];

    if (
      job.updated_at &&
      job.updated_at !== job.created_at
    ) {
      events.push({
        key: "tryon-updated",
        title: "Trabajo actualizado",
        description:
          `El job quedó con estado ${job.status}.`,
        date: job.updated_at,
        kind:
          isFailed(job.status)
            ? "error"
            : "warning",
      });
    }

    if (job.completed_at) {
      events.push({
        key: "tryon-completed",
        title: "Trabajo finalizado",
        description:
          `El resultado final quedó registrado con estado ${job.status}.`,
        date: job.completed_at,
        kind:
          isCompleted(job.status)
            ? "success"
            : isFailed(job.status)
              ? "error"
              : "warning",
      });
    }

    for (
      const externalJob of
      relatedExternalJobs
    ) {
      events.push({
        key:
          `external-${externalJob.id}-created`,
        title:
          `Ejecución externa #${externalJob.id} creada`,
        description:
          `Proveedor ${externalJob.provider}; estado inicial ${externalJob.status}.`,
        date: externalJob.created_at,
        kind: "neutral",
      });

      if (externalJob.started_at) {
        events.push({
          key:
            `external-${externalJob.id}-started`,
          title:
            "Procesamiento externo iniciado",
          description:
            externalJob.provider_job_id
              ? `Provider job ID: ${externalJob.provider_job_id}.`
              : "La ejecución externa comenzó sin provider job ID registrado.",
          date:
            externalJob.started_at,
          kind: "warning",
        });
      }

      if (externalJob.finished_at) {
        events.push({
          key:
            `external-${externalJob.id}-finished`,
          title:
            "Procesamiento externo finalizado",
          description:
            `Estado final: ${externalJob.status}.`,
          date:
            externalJob.finished_at,
          kind:
            isCompleted(
              externalJob.status,
            )
              ? "success"
              : isFailed(
                    externalJob.status,
                  )
                ? "error"
                : "warning",
        });
      }

      if (
        externalJob.error_message
      ) {
        events.push({
          key:
            `external-${externalJob.id}-error`,
          title:
            "Error de ejecución externa",
          description:
            externalJob.error_message,
          date:
            externalJob.finished_at ??
            externalJob.updated_at,
          kind: "error",
        });
      }
    }

    if (job.error_message) {
      events.push({
        key: "tryon-error",
        title:
          "Error registrado en Try-On",
        description:
          job.error_message,
        date:
          job.completed_at ??
          job.updated_at,
        kind: "error",
      });
    }

    return events.sort(
      (left, right) =>
        eventTimestamp(left) -
        eventTimestamp(right),
    );
  }, [job, relatedExternalJobs]);

  return (
    <section className="luxia-panel mt-5 rounded-3xl p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
            Historial operativo
          </p>

          <h2 className="mt-2 text-lg font-semibold text-white">
            Línea de tiempo del job
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
            Combina las fechas reales del
            trabajo Try-On con las ejecuciones
            External AI vinculadas.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadAudit()
          }
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400 transition hover:text-white"
        >
          <RefreshCcw size={15} />
          Actualizar historial
        </button>
      </div>

      {isLoading && (
        <div className="mt-6 flex min-h-40 items-center justify-center rounded-2xl border border-white/7 bg-black/20">
          <LoaderCircle className="animate-spin text-red-500" />
        </div>
      )}

      {!isLoading &&
        errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-500/15 bg-red-950/15 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={19}
                className="mt-0.5 shrink-0 text-red-400"
              />

              <p className="text-sm leading-6 text-red-300">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

      {!isLoading &&
        !errorMessage && (
          <div className="mt-6 space-y-0">
            {timeline.map(
              (event, index) => {
                const Icon =
                  event.kind === "success"
                    ? CheckCircle2
                    : event.kind ===
                        "error"
                      ? AlertTriangle
                      : event.title
                            .toLowerCase()
                            .includes(
                              "extern",
                            )
                        ? Server
                        : event.kind ===
                            "warning"
                          ? Clock3
                          : Sparkles;

                return (
                  <article
                    key={event.key}
                    className="relative flex gap-4 pb-6 last:pb-0"
                  >
                    {index <
                      timeline.length -
                        1 && (
                      <div className="absolute top-10 bottom-0 left-[19px] w-px bg-white/7" />
                    )}

                    <div
                      className={cn(
                        "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl border",
                        event.kind ===
                          "success" &&
                          "border-emerald-500/15 bg-emerald-950/20 text-emerald-400",
                        event.kind ===
                          "error" &&
                          "border-red-500/15 bg-red-950/20 text-red-400",
                        event.kind ===
                          "warning" &&
                          "border-amber-500/15 bg-amber-950/20 text-amber-400",
                        event.kind ===
                          "neutral" &&
                          "border-white/8 bg-black/30 text-zinc-500",
                      )}
                    >
                      <Icon size={17} />
                    </div>

                    <div className="min-w-0 flex-1 rounded-2xl border border-white/7 bg-black/20 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <p className="text-sm font-medium text-zinc-200">
                          {event.title}
                        </p>

                        <p className="shrink-0 text-xs text-zinc-700">
                          {formatTryOnDate(
                            event.date,
                          )}
                        </p>
                      </div>

                      <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-6 text-zinc-600">
                        {event.description}
                      </p>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}

      {!isLoading &&
        !errorMessage && (
          <div className="mt-6 rounded-2xl border border-white/6 bg-black/20 p-4 text-xs leading-6 text-zinc-600">
            Ejecuciones externas vinculadas:{" "}
            {relatedExternalJobs.length}.
            El backend no expone un endpoint de
            auditoría específico por Try-On Job;
            esta línea de tiempo se construye
            únicamente con fechas y estados
            realmente disponibles.
          </div>
        )}
    </section>
  );
}
