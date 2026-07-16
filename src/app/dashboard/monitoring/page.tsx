"use client";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Database,
  Gauge,
  HardDrive,
  LoaderCircle,
  MemoryStick,
  RefreshCcw,
  Server,
  Wifi,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  ServiceHealth,
  SystemMonitoringResponse,
} from "@/types/admin-system-monitoring";

function statusClass(
  status: string,
): string {
  return [
    "ok",
    "healthy",
    "connected",
    "available",
  ].includes(status.toLowerCase())
    ? "border-emerald-500/15 bg-emerald-950/15 text-emerald-400"
    : "border-red-500/15 bg-red-950/15 text-red-400";
}

function ServiceCard({
  item,
  icon: Icon,
}: {
  item: ServiceHealth;
  icon: typeof Server;
}) {
  return (
    <article className="luxia-panel rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <Icon
          size={19}
          className="text-red-400"
        />

        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClass(
            item.status,
          )}`}
        >
          {item.status}
        </span>
      </div>

      <p className="mt-4 text-sm font-semibold text-white">
        {item.service}
      </p>

      {item.details && (
        <pre className="mt-3 max-h-32 overflow-auto rounded-xl bg-black/25 p-3 font-mono text-[10px] leading-5 text-zinc-600">
          {JSON.stringify(
            item.details,
            null,
            2,
          )}
        </pre>
      )}
    </article>
  );
}

function ResourceBar({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Cpu;
}) {
  const severity =
    value >= 90
      ? "bg-red-600"
      : value >= 75
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            size={16}
            className="text-red-400"
          />
          <p className="text-sm text-zinc-400">
            {label}
          </p>
        </div>

        <p className="text-sm font-semibold text-white">
          {value.toFixed(1)}%
        </p>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full ${severity}`}
          style={{
            width: `${Math.min(
              100,
              Math.max(0, value),
            )}%`,
          }}
        />
      </div>
    </article>
  );
}

export default function MonitoringPage() {
  const [monitoring, setMonitoring] =
    useState<SystemMonitoringResponse | null>(
      null,
    );
  const [isLoading, setIsLoading] =
    useState(true);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      setMonitoring(
        await browserApiRequest<SystemMonitoringResponse>(
          "/api/admin/monitoring",
        ),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar el monitoreo.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();

    const intervalId =
      window.setInterval(
        () => void load(),
        60_000,
      );

    return () =>
      window.clearInterval(intervalId);
  }, [load]);

  return (
    <div>
      <section className="luxia-panel rounded-3xl p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="luxia-red-glow flex size-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
              <Gauge size={24} />
            </div>

            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
                Sistema
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-white">
                Monitoreo
              </h1>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                Salud actual de API, base de datos,
                Redis, almacenamiento y recursos del
                servidor.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void load()}
            disabled={isLoading}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400 disabled:opacity-50"
          >
            <RefreshCcw
              size={16}
              className={
                isLoading
                  ? "animate-spin"
                  : undefined
              }
            />
            Actualizar
          </button>
        </div>
      </section>

      {isLoading && (
        <section className="luxia-panel mt-5 flex min-h-72 items-center justify-center rounded-3xl">
          <LoaderCircle className="animate-spin text-red-500" />
        </section>
      )}

      {!isLoading && errorMessage && (
        <section className="luxia-panel mt-5 rounded-3xl p-6">
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/15 bg-red-950/15 p-5">
            <AlertTriangle className="text-red-400" />
            <p className="text-sm text-red-300">
              {errorMessage}
            </p>
          </div>
        </section>
      )}

      {!isLoading && monitoring && (
        <>
          <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ServiceCard
              item={monitoring.api}
              icon={Server}
            />
            <ServiceCard
              item={monitoring.database}
              icon={Database}
            />
            <ServiceCard
              item={monitoring.redis}
              icon={Wifi}
            />
            <ServiceCard
              item={monitoring.storage}
              icon={HardDrive}
            />
          </section>

          <section className="luxia-panel mt-5 rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <Activity
                size={19}
                className="text-red-400"
              />
              <h2 className="font-semibold text-white">
                Recursos del sistema
              </h2>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <ResourceBar
                label="CPU"
                value={
                  monitoring.resources
                    .cpu_percent
                }
                icon={Cpu}
              />
              <ResourceBar
                label="Memoria"
                value={
                  monitoring.resources
                    .memory_percent
                }
                icon={MemoryStick}
              />
              <ResourceBar
                label="Disco"
                value={
                  monitoring.resources
                    .disk_percent
                }
                icon={HardDrive}
              />
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-emerald-500/10 bg-emerald-950/10 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-400" />
              <p className="text-sm text-emerald-300">
                Monitoreo actualizado. La pantalla se
                refresca automáticamente cada 60 segundos.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
