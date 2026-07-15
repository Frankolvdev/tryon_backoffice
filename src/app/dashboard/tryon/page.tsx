"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  Clock3,
  Coins,
  Cpu,
  LoaderCircle,
  RefreshCcw,
  Sparkles,
  TriangleAlert,
  XCircle,
} from "lucide-react";

import { TryOnEmptyState } from "@/components/backoffice/tryon/tryon-empty-state";
import { TryOnModuleHeader } from "@/components/backoffice/tryon/tryon-module-header";
import { browserApiRequest } from "@/lib/api/browser-api";
import {
  calculateTryOnOverview,
  extractTryOnJobs,
} from "@/lib/tryon/normalize";

import type {
  TryOnJobSummary,
} from "@/types/admin-tryon";

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default function TryOnOverviewPage() {
  const [jobs, setJobs] =
    useState<TryOnJobSummary[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response =
        await browserApiRequest<unknown>(
          "/api/admin/tryon-jobs?skip=0&limit=100",
        );

      setJobs(extractTryOnJobs(response));
    } catch (error) {
      setJobs([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible consultar los trabajos Try-On.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const metrics = useMemo(
    () => calculateTryOnOverview(jobs),
    [jobs],
  );

  const cards = [
    {
      label: "Trabajos consultados",
      value: metrics.total.toLocaleString("es-MX"),
      icon: Sparkles,
    },
    {
      label: "En cola",
      value: metrics.queued.toLocaleString("es-MX"),
      icon: Clock3,
    },
    {
      label: "Procesando",
      value: metrics.processing.toLocaleString("es-MX"),
      icon: Cpu,
    },
    {
      label: "Completados",
      value: metrics.completed.toLocaleString("es-MX"),
      icon: CheckCircle2,
    },
    {
      label: "Fallidos",
      value: metrics.failed.toLocaleString("es-MX"),
      icon: TriangleAlert,
    },
    {
      label: "Cancelados",
      value: metrics.canceled.toLocaleString("es-MX"),
      icon: XCircle,
    },
    {
      label: "Tokens consumidos",
      value: metrics.tokensConsumed.toLocaleString("es-MX"),
      icon: Coins,
    },
    {
      label: "Costo GPU real",
      value: formatMoney(metrics.actualGpuCostCents),
      icon: Cpu,
    },
  ];

  return (
    <div>
      <TryOnModuleHeader
        title="Try-On"
        description="Base operativa del módulo de generación: métricas reales, navegación interna y acceso a trabajos, workflows e integraciones."
      />

      <div className="mt-7 flex justify-end">
        <button
          type="button"
          onClick={() => void loadOverview()}
          disabled={isLoading}
          className="flex h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-4 text-sm text-zinc-400 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
        >
          {isLoading ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          ) : (
            <RefreshCcw size={16} />
          )}

          Actualizar
        </button>
      </div>

      {isLoading && (
        <section className="luxia-panel mt-6 flex min-h-80 items-center justify-center rounded-3xl">
          <div className="text-center">
            <LoaderCircle className="mx-auto animate-spin text-red-500" />
            <p className="mt-4 text-sm text-zinc-500">
              Consultando el motor Try-On...
            </p>
          </div>
        </section>
      )}

      {!isLoading && errorMessage && (
        <div className="mt-6">
          <TryOnEmptyState
            error
            title="No se pudo cargar Try-On"
            description={errorMessage}
          />
        </div>
      )}

      {!isLoading && !errorMessage && (
        <>
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.label}
                  className="luxia-panel rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-600 uppercase">
                        {card.label}
                      </p>

                      <p className="mt-4 text-2xl font-semibold text-white">
                        {card.value}
                      </p>
                    </div>

                    <div className="flex size-10 items-center justify-center rounded-xl border border-red-500/15 bg-red-950/15 text-red-400">
                      <Icon size={18} />
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          {jobs.length === 0 && (
            <div className="mt-6">
              <TryOnEmptyState
                title="Todavía no hay trabajos"
                description="El endpoint administrativo respondió correctamente, pero no existen jobs Try-On para mostrar en este momento."
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
