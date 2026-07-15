import { NextResponse } from "next/server";
import type {
  MonitoringMetric,
  MonitoringProbe,
  ProbeState,
  TryonMonitoringSnapshot,
} from "@/types/tryon-monitoring";

export const dynamic = "force-dynamic";

const backendBaseUrl = (
  process.env.BACKEND_API_URL ?? "http://127.0.0.1:8001"
).replace(/\/$/, "");

const probes = [
  { key: "application", label: "Aplicación", path: "/health" },
  { key: "api", label: "API v1", path: "/api/v1/health" },
  { key: "liveness", label: "Proceso", path: "/api/v1/health/live" },
  { key: "readiness", label: "Dependencias", path: "/api/v1/health/ready" },
  { key: "database", label: "PostgreSQL", path: "/api/v1/db-health" },
] as const;

function detailFromPayload(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const record = payload as Record<string, unknown>;
  for (const key of ["detail", "message", "status", "service"]) {
    if (typeof record[key] === "string" && record[key]) return record[key];
  }
  if (typeof record.ready === "boolean") {
    return record.ready ? "Dependencias listas" : "Dependencias no disponibles";
  }
  if (typeof record.live === "boolean") {
    return record.live ? "Proceso activo" : "Proceso inactivo";
  }
  return fallback;
}

async function runProbe(definition: (typeof probes)[number]): Promise<MonitoringProbe> {
  const startedAt = performance.now();
  try {
    const response = await fetch(`${backendBaseUrl}${definition.path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
      headers: { Accept: "application/json" },
    });
    const latencyMs = Math.round(performance.now() - startedAt);
    const text = await response.text();
    let payload: unknown = text;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      // Keep plain text payload.
    }
    const state: ProbeState = response.ok
      ? "healthy"
      : response.status >= 500
        ? "unavailable"
        : "degraded";
    return {
      key: definition.key,
      label: definition.label,
      path: definition.path,
      state,
      statusCode: response.status,
      latencyMs,
      detail: detailFromPayload(payload, response.statusText || "Respuesta recibida"),
      payload,
    };
  } catch (error) {
    return {
      key: definition.key,
      label: definition.label,
      path: definition.path,
      state: "unavailable",
      statusCode: null,
      latencyMs: Math.round(performance.now() - startedAt),
      detail: error instanceof Error ? error.message : "No fue posible conectar con el backend",
      payload: null,
    };
  }
}

function parseLabels(raw: string | undefined): Record<string, string> {
  if (!raw) return {};
  const labels: Record<string, string> = {};
  const pattern = /([a-zA-Z_][a-zA-Z0-9_]*)="((?:\\.|[^"])*)"/g;
  for (const match of raw.matchAll(pattern)) {
    labels[match[1]] = match[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  return labels;
}

function parsePrometheus(text: string): MonitoringMetric[] {
  const wanted = new Set([
    "tryon_application_ready",
    "tryon_application_live",
    "tryon_postgres_available",
    "tryon_redis_available",
    "tryon_redis_used_memory_bytes",
    "tryon_redis_connected_clients",
    "tryon_background_jobs",
    "tryon_background_job_expired_leases",
    "tryon_worker_active_jobs",
    "tryon_runpod_configured",
    "tryon_runpod_available",
    "tryon_runpod_jobs",
    "tryon_comfyui_local_configured",
    "tryon_comfyui_local_available",
    "tryon_local_storage_available",
    "tryon_local_storage_free_bytes",
    "tryon_local_storage_total_bytes",
    "tryon_dependency_health",
  ]);
  const result: MonitoringMetric[] = [];
  for (const line of text.split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*)(?:\{([^}]*)\})?\s+([^\s]+)$/);
    if (!match || !wanted.has(match[1])) continue;
    const value = Number(match[3]);
    if (!Number.isFinite(value)) continue;
    result.push({ name: match[1], labels: parseLabels(match[2]), value });
  }
  return result;
}

async function loadMetrics(): Promise<MonitoringMetric[]> {
  try {
    const response = await fetch(`${backendBaseUrl}/api/v1/metrics`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
      headers: { Accept: "text/plain" },
    });
    if (!response.ok) return [];
    return parsePrometheus(await response.text());
  } catch {
    return [];
  }
}

function overallState(items: MonitoringProbe[]): ProbeState {
  if (items.some((item) => item.state === "unavailable")) return "unavailable";
  if (items.some((item) => item.state === "degraded")) return "degraded";
  return "healthy";
}

export async function GET(): Promise<NextResponse<TryonMonitoringSnapshot>> {
  const [probeResults, metrics] = await Promise.all([
    Promise.all(probes.map(runProbe)),
    loadMetrics(),
  ]);
  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    backendBaseUrl,
    overallState: overallState(probeResults),
    probes: probeResults,
    metrics,
    metricsAvailable: metrics.length > 0,
  });
}
