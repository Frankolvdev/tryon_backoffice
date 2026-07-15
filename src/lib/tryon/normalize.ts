import type {
  TryOnJobListResponse,
  TryOnJobSummary,
  TryOnOverviewMetrics,
} from "@/types/admin-tryon";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return null;
  }

  return value as Record<string, unknown>;
}

export function extractTryOnJobs(
  payload: unknown,
): TryOnJobSummary[] {
  if (Array.isArray(payload)) {
    return payload.filter(
      (item): item is TryOnJobSummary =>
        typeof item === "object" && item !== null,
    );
  }

  const record = asRecord(payload);

  if (!record) {
    return [];
  }

  const candidates = [
    record.items,
    record.jobs,
    record.results,
    record.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter(
        (item): item is TryOnJobSummary =>
          typeof item === "object" && item !== null,
      );
    }

    const nested = asRecord(candidate);

    if (nested) {
      const nestedItems =
        nested.items ?? nested.jobs ?? nested.results;

      if (Array.isArray(nestedItems)) {
        return nestedItems.filter(
          (item): item is TryOnJobSummary =>
            typeof item === "object" && item !== null,
        );
      }
    }
  }

  return [];
}

function normalizeStatus(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function readNumber(
  value: unknown,
): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

export function calculateTryOnOverview(
  jobs: TryOnJobSummary[],
): TryOnOverviewMetrics {
  const metrics: TryOnOverviewMetrics = {
    total: jobs.length,
    queued: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    canceled: 0,
    tokensConsumed: 0,
    estimatedGpuCostCents: 0,
    actualGpuCostCents: 0,
  };

  for (const job of jobs) {
    const status = normalizeStatus(job.status);

    if (
      status === "queued" ||
      status === "pending"
    ) {
      metrics.queued += 1;
    } else if (
      status === "processing" ||
      status === "running" ||
      status === "retrying"
    ) {
      metrics.processing += 1;
    } else if (status === "completed") {
      metrics.completed += 1;
    } else if (status === "failed") {
      metrics.failed += 1;
    } else if (
      status === "canceled" ||
      status === "cancelled"
    ) {
      metrics.canceled += 1;
    }

    metrics.tokensConsumed += readNumber(
      job.tokens_consumed,
    );

    metrics.estimatedGpuCostCents += readNumber(
      job.estimated_gpu_cost_cents,
    );

    metrics.actualGpuCostCents += readNumber(
      job.actual_gpu_cost_cents,
    );
  }

  return metrics;
}

export function normalizeTryOnListResponse(
  payload: unknown,
): TryOnJobListResponse {
  const record = asRecord(payload);

  if (!record) {
    return {
      items: extractTryOnJobs(payload),
    };
  }

  return {
    ...record,
    items: extractTryOnJobs(payload),
  };
}
