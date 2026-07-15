"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  Gauge,
  HardDrive,
  RefreshCw,
  Server,
  WifiOff,
} from "lucide-react";
import type {
  MonitoringMetric,
  ProbeState,
  TryonMonitoringSnapshot,
} from "@/types/tryon-monitoring";

const stateStyles: Record<ProbeState, string> = {
  healthy: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  degraded: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  unavailable: "border-red-500/30 bg-red-500/10 text-red-300",
};

const stateLabels: Record<ProbeState, string> = {
  healthy: "Operativo",
  degraded: "Degradado",
  unavailable: "No disponible",
};

function metricValue(metrics: MonitoringMetric[], name: string): number | null {
  const metric = metrics.find((item) => item.name === name);
  return metric?.value ?? null;
}

function sumMetric(metrics: MonitoringMetric[], name: string): number {
  return metrics
    .filter((item) => item.name === name)
    .reduce((total, item) => total + item.value, 0);
}

function formatBytes(value: number | null): string {
  if (value === null) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let amount = value;
  let index = 0;
  while (amount >= 1024 && index < units.length - 1) {
    amount /= 1024;
    index += 1;
  }
  return `${amount.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function MonitoringDashboard() {
  const [snapshot, setSnapshot] = useState<TryonMonitoringSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tryon/monitoring", { cache: "no-store" });
      if (!response.ok) throw new Error(`La consulta devolvió HTTP ${response.status}`);
      setSnapshot((await response.json()) as TryonMonitoringSnapshot);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No fue posible cargar el monitoreo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => void refresh(), 30_000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const summary = useMemo(() => {
    const metrics = snapshot?.metrics ?? [];
    return {
      redisMemory: formatBytes(metricValue(metrics, "tryon_redis_used_memory_bytes")),
      redisClients: metricValue(metrics, "tryon_redis_connected_clients"),
      activeJobs: sumMetric(metrics, "tryon_worker_active_jobs"),
      queuedJobs: sumMetric(metrics, "tryon_background_jobs"),
      storageFree: formatBytes(metricValue(metrics, "tryon_local_storage_free_bytes")),
      storageTotal: formatBytes(metricValue(metrics, "tryon_local_storage_total_bytes")),
    };
  }, [snapshot]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#111214] p-5 shadow-2xl shadow-black/20 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-red-400">
            <Gauge className="h-4 w-4" /> Observabilidad del backend
          </div>
          <h1 className="text-2xl font-semibold text-white">Monitoreo y métricas</h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400">
            Estado de aplicación, PostgreSQL, Redis, workers, RunPod, ComfyUI y almacenamiento mediante los endpoints reales de health y Prometheus.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-2.5 text-sm font-medium text-red-200 transition hover:bg-red-900/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Actualizar
        </button>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div><strong>Error de monitoreo.</strong> {error}</div>
        </div>
      )}

      {snapshot && (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard icon={Activity} label="Estado general" value={stateLabels[snapshot.overallState]} detail="Health + readiness" state={snapshot.overallState} />
            <SummaryCard icon={Server} label="Trabajos activos" value={String(summary.activeJobs)} detail={`${summary.queuedJobs} métricas de cola`} />
            <SummaryCard icon={Database} label="Redis" value={summary.redisMemory} detail={`${summary.redisClients ?? "—"} clientes conectados`} />
            <SummaryCard icon={HardDrive} label="Almacenamiento libre" value={summary.storageFree} detail={`Total ${summary.storageTotal}`} />
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#111214] p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-white">Comprobaciones de servicio</h2>
                <p className="text-sm text-zinc-500">Backend: {snapshot.backendBaseUrl}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Clock3 className="h-4 w-4" /> {new Date(snapshot.checkedAt).toLocaleString("es-MX")}
              </div>
            </div>
            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {snapshot.probes.map((probe) => (
                <article key={probe.key} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-zinc-100">{probe.label}</h3>
                      <code className="mt-1 block text-xs text-zinc-600">{probe.path}</code>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${stateStyles[probe.state]}`}>
                      {stateLabels[probe.state]}
                    </span>
                  </div>
                  <p className="mt-4 line-clamp-2 min-h-10 text-sm text-zinc-400">{probe.detail}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                    <span>HTTP {probe.statusCode ?? "—"}</span>
                    <span>{probe.latencyMs ?? "—"} ms</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <MetricsTable metrics={snapshot.metrics} available={snapshot.metricsAvailable} />
        </>
      )}

      {!snapshot && loading && (
        <div className="flex min-h-72 items-center justify-center rounded-2xl border border-white/10 bg-[#111214] text-zinc-400">
          <RefreshCw className="mr-3 h-5 w-5 animate-spin" /> Consultando servicios…
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, detail, state }: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail: string;
  state?: ProbeState;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#111214] p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-500">{label}</span>
        <Icon className="h-5 w-5 text-red-400" />
      </div>
      <div className="mt-4 flex items-center gap-2">
        {state === "healthy" && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
        {state === "unavailable" && <WifiOff className="h-5 w-5 text-red-400" />}
        <strong className="text-2xl font-semibold text-white">{value}</strong>
      </div>
      <p className="mt-2 text-xs text-zinc-600">{detail}</p>
    </article>
  );
}

function MetricsTable({ metrics, available }: { metrics: MonitoringMetric[]; available: boolean }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#111214] p-5">
      <div className="mb-4">
        <h2 className="font-semibold text-white">Métricas operativas</h2>
        <p className="text-sm text-zinc-500">Selección del endpoint real <code>/api/v1/metrics</code>.</p>
      </div>
      {!available ? (
        <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
          El endpoint de métricas no respondió o todavía no produjo series operativas.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-zinc-600">
              <tr><th className="px-3 py-3">Métrica</th><th className="px-3 py-3">Etiquetas</th><th className="px-3 py-3 text-right">Valor</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {metrics.map((metric, index) => (
                <tr key={`${metric.name}-${index}`} className="text-zinc-300">
                  <td className="px-3 py-3 font-mono text-xs text-red-300">{metric.name}</td>
                  <td className="px-3 py-3 font-mono text-xs text-zinc-500">
                    {Object.entries(metric.labels).map(([key, value]) => `${key}=${value}`).join(", ") || "—"}
                  </td>
                  <td className="px-3 py-3 text-right font-mono">{metric.value.toLocaleString("es-MX")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
