"use client";

import {
  Ban,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  BackgroundJob,
  BackgroundJobCancelResponse,
  BackgroundJobDetailResponse,
  BackgroundJobRetryResponse,
} from "@/types/admin-background-jobs";

interface Props {
  detail: BackgroundJobDetailResponse;
  onUpdated: (
    detail: BackgroundJobDetailResponse,
  ) => void;
  onRefresh: () => Promise<void>;
}

const retryableStatuses = new Set([
  "failed",
  "timed_out",
  "dead_letter",
  "canceled",
]);

const cancelableStatuses = new Set([
  "pending",
  "scheduled",
  "queued",
  "claimed",
  "running",
  "retrying",
  "cancel_requested",
]);

export function BackgroundJobActions({
  detail,
  onUpdated,
  onRefresh,
}: Props) {
  const [action, setAction] =
    useState<"cancel" | "retry" | null>(
      null,
    );

  const replaceJob = (
    job: BackgroundJob,
  ) => {
    onUpdated({
      ...detail,
      job,
    });
  };

  const cancel = async () => {
    const reason = window.prompt(
      "Motivo de cancelación (opcional):",
      "",
    );

    if (reason === null) return;

    setAction("cancel");

    try {
      const response =
        await browserApiRequest<BackgroundJobCancelResponse>(
          `/api/admin/background-jobs/${detail.job.id}/cancel`,
          {
            method: "POST",
            body: JSON.stringify({
              reason:
                reason.trim() || null,
            }),
          },
        );

      replaceJob(response.job);
      toast.success(response.message);
      await onRefresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible cancelar el proceso.",
      );
    } finally {
      setAction(null);
    }
  };

  const retry = async () => {
    const confirmed = window.confirm(
      `Se volverá a poner en cola el proceso #${detail.job.id}. ¿Continuar?`,
    );

    if (!confirmed) return;

    const resetAttemptCount =
      window.confirm(
        "¿Deseas reiniciar el contador de intentos?",
      );

    setAction("retry");

    try {
      const response =
        await browserApiRequest<BackgroundJobRetryResponse>(
          `/api/admin/background-jobs/${detail.job.id}/retry`,
          {
            method: "POST",
            body: JSON.stringify({
              reset_attempt_count:
                resetAttemptCount,
              priority: null,
              scheduled_at: null,
              reason:
                "Manual retry from BackOffice",
            }),
          },
        );

      replaceJob(response.job);
      toast.success(response.message);
      await onRefresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible reintentar el proceso.",
      );
    } finally {
      setAction(null);
    }
  };

  const canCancel =
    detail.job.is_cancelable &&
    cancelableStatuses.has(
      detail.job.status,
    );

  const canRetry =
    retryableStatuses.has(
      detail.job.status,
    );

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => void cancel()}
        disabled={
          !canCancel ||
          action !== null
        }
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-500/15 bg-red-950/10 px-4 text-sm text-red-300 disabled:opacity-35"
      >
        {action === "cancel" ? (
          <LoaderCircle
            size={15}
            className="animate-spin"
          />
        ) : (
          <Ban size={15} />
        )}
        Cancelar
      </button>

      <button
        type="button"
        onClick={() => void retry()}
        disabled={
          !canRetry ||
          action !== null
        }
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-amber-500/15 bg-amber-950/10 px-4 text-sm text-amber-300 disabled:opacity-35"
      >
        {action === "retry" ? (
          <LoaderCircle
            size={15}
            className="animate-spin"
          />
        ) : (
          <RotateCcw size={15} />
        )}
        Reintentar
      </button>
    </div>
  );
}
