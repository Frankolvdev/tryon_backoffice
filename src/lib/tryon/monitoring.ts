import type {
  TryOnMonitoringMetrics,
  TryOnMonitoringSnapshot,
} from "@/types/admin-tryon-monitoring";

function numeric(
  value: number | null | undefined,
): number {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : 0;
}

function normalizedStatus(
  value: string,
): string {
  return value.trim().toLowerCase();
}

function isRunningStatus(
  value: string,
): boolean {
  return [
    "pending",
    "queued",
    "processing",
    "running",
    "retrying",
    "in_queue",
    "in_progress",
  ].includes(normalizedStatus(value));
}

function isFailedStatus(
  value: string,
): boolean {
  return [
    "failed",
    "error",
    "timed_out",
    "timeout",
  ].includes(normalizedStatus(value));
}

export function calculateTryOnMonitoringMetrics(
  snapshot: TryOnMonitoringSnapshot,
): TryOnMonitoringMetrics {
  const metrics: TryOnMonitoringMetrics = {
    jobsTotal: snapshot.tryOnJobs.length,
    jobsQueued: 0,
    jobsProcessing: 0,
    jobsCompleted: 0,
    jobsFailed: 0,
    jobsCanceled: 0,
    successRate: 0,
    tokensConsumed: 0,
    estimatedGpuSeconds: 0,
    actualGpuSeconds: 0,
    estimatedGpuCostCents: 0,
    actualGpuCostCents: 0,
    averageActualGpuSeconds: 0,
    externalJobsTotal:
      snapshot.externalAiJobs.length,
    externalJobsRunning: 0,
    externalJobsFailed: 0,
    storageFilesTotal:
      snapshot.storageFiles.length,
    storageBytes: 0,
    activeWorkflows:
      snapshot.workflowDefinitions.items.filter(
        (workflow) => workflow.is_active,
      ).length,
    defaultWorkflows:
      snapshot.workflowDefinitions.items.filter(
        (workflow) => workflow.is_default,
      ).length,
  };

  let jobsWithActualGpu = 0;

  for (const job of snapshot.tryOnJobs) {
    const status = normalizedStatus(
      job.status,
    );

    if (
      status === "queued" ||
      status === "pending"
    ) {
      metrics.jobsQueued += 1;
    } else if (
      status === "processing" ||
      status === "running" ||
      status === "retrying"
    ) {
      metrics.jobsProcessing += 1;
    } else if (status === "completed") {
      metrics.jobsCompleted += 1;
    } else if (status === "failed") {
      metrics.jobsFailed += 1;
    } else if (
      status === "canceled" ||
      status === "cancelled"
    ) {
      metrics.jobsCanceled += 1;
    }

    metrics.tokensConsumed +=
      numeric(job.tokens_cost);

    metrics.estimatedGpuSeconds +=
      numeric(job.estimated_gpu_seconds);

    metrics.actualGpuSeconds +=
      numeric(job.actual_gpu_seconds);

    metrics.estimatedGpuCostCents +=
      numeric(
        job.estimated_gpu_cost_cents,
      );

    metrics.actualGpuCostCents +=
      numeric(job.actual_gpu_cost_cents);

    if (
      typeof job.actual_gpu_seconds ===
        "number" &&
      Number.isFinite(
        job.actual_gpu_seconds,
      )
    ) {
      jobsWithActualGpu += 1;
    }
  }

  metrics.successRate =
    metrics.jobsTotal > 0
      ? (
          metrics.jobsCompleted /
          metrics.jobsTotal
        ) * 100
      : 0;

  metrics.averageActualGpuSeconds =
    jobsWithActualGpu > 0
      ? metrics.actualGpuSeconds /
        jobsWithActualGpu
      : 0;

  for (
    const externalJob of
    snapshot.externalAiJobs
  ) {
    if (
      isRunningStatus(
        externalJob.status,
      )
    ) {
      metrics.externalJobsRunning += 1;
    }

    if (
      isFailedStatus(
        externalJob.status,
      )
    ) {
      metrics.externalJobsFailed += 1;
    }
  }

  for (
    const file of snapshot.storageFiles
  ) {
    metrics.storageBytes +=
      numeric(file.size_bytes);
  }

  return metrics;
}
