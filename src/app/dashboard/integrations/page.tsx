"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  CheckCircle2,
  CircleOff,
  Gauge,
  LoaderCircle,
  RefreshCcw,
  Settings2,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import { IntegrationStatusBadge } from "@/components/backoffice/integrations/integration-status-badge";
import { browserApiRequest } from "@/lib/api/browser-api";
import {
  getIntegrationCatalogItem,
} from "@/lib/integrations/catalog";

import type {
  IntegrationConfigResponse,
  IntegrationHealthResponse,
  IntegrationSeedResponse,
} from "@/types/admin-integrations";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] =
    useState<IntegrationConfigResponse[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [action, setAction] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadIntegrations =
    useCallback(async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response =
          await browserApiRequest<
            IntegrationConfigResponse[]
          >("/api/admin/integrations");

        setIntegrations(response);
      } catch (error) {
        setIntegrations([]);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No fue posible cargar las integraciones.",
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadIntegrations();
  }, [loadIntegrations]);

  const metrics = useMemo(() => {
    const enabled =
      integrations.filter(
        (item) => item.is_enabled,
      ).length;

    const healthy =
      integrations.filter(
        (item) =>
          item.last_health_status ===
          "healthy",
      ).length;

    const problems =
      integrations.filter(
        (item) =>
          item.last_health_status ===
            "down" ||
          item.last_health_status ===
            "degraded" ||
          item.status === "error",
      ).length;

    return {
      total: integrations.length,
      enabled,
      healthy,
      problems,
    };
  }, [integrations]);

  const seedDefaults = async () => {
    setAction("seed");

    try {
      const response =
        await browserApiRequest<IntegrationSeedResponse>(
          "/api/admin/integrations/seed-defaults",
          {
            method: "POST",
          },
        );

      toast.success(
        `Configuraciones listas: ${response.created} creadas y ${response.skipped} existentes.`,
      );

      await loadIntegrations();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible crear las configuraciones predeterminadas.",
      );
    } finally {
      setAction(null);
    }
  };

  const checkHealth = async (
    integration: IntegrationConfigResponse,
  ) => {
    setAction(
      `health-${integration.provider}`,
    );

    try {
      const response =
        await browserApiRequest<IntegrationHealthResponse>(
          `/api/admin/integrations/${integration.provider}/health`,
          {
            method: "POST",
          },
        );

      if (response.status === "healthy") {
        toast.success(
          `${integration.name}: ${response.message}`,
        );
      } else {
        toast.warning(
          `${integration.name}: ${response.message}`,
        );
      }

      await loadIntegrations();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible comprobar la integración.",
      );
    } finally {
      setAction(null);
    }
  };

  return (
    <div>
      <section className="luxia-panel overflow-hidden rounded-3xl">
        <div className="border-b border-white/6 p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
                <Settings2 size={24} />
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
                  Sistema
                </p>

                <h1 className="mt-2 text-2xl font-semibold text-white">
                  Integraciones
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                  Configuración centralizada y estado de
                  los proveedores externos registrados
                  por el backend.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  void seedDefaults()
                }
                disabled={Boolean(action)}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-500/15 bg-red-950/15 px-4 text-sm text-red-300 disabled:opacity-50"
              >
                {action === "seed" ? (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Sparkles size={16} />
                )}
                Crear defaults
              </button>

              <button
                type="button"
                onClick={() =>
                  void loadIntegrations()
                }
                disabled={isLoading}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400 disabled:opacity-50"
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
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Registradas",
            value: metrics.total,
            icon: Activity,
          },
          {
            label: "Habilitadas",
            value: metrics.enabled,
            icon: ShieldCheck,
          },
          {
            label: "Saludables",
            value: metrics.healthy,
            icon: CheckCircle2,
          },
          {
            label: "Con atención",
            value: metrics.problems,
            icon: TriangleAlert,
          },
        ].map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              key={metric.label}
              className="luxia-panel rounded-2xl p-5"
            >
              <Icon
                size={18}
                className="text-red-400"
              />

              <p className="mt-4 text-xs text-zinc-600">
                {metric.label}
              </p>

              <p className="mt-2 text-2xl font-semibold text-white">
                {metric.value}
              </p>
            </article>
          );
        })}
      </section>

      {isLoading && (
        <section className="luxia-panel mt-5 flex min-h-80 items-center justify-center rounded-3xl">
          <LoaderCircle className="animate-spin text-red-500" />
        </section>
      )}

      {!isLoading &&
        errorMessage && (
          <section className="luxia-panel mt-5 rounded-3xl p-6">
            <div className="flex items-start gap-3 rounded-2xl border border-red-500/15 bg-red-950/15 p-5">
              <TriangleAlert
                size={19}
                className="mt-0.5 shrink-0 text-red-400"
              />

              <div>
                <p className="font-medium text-red-300">
                  No se pudieron cargar las integraciones
                </p>

                <p className="mt-2 text-sm leading-6 text-red-400/80">
                  {errorMessage}
                </p>
              </div>
            </div>
          </section>
        )}

      {!isLoading &&
        !errorMessage &&
        integrations.length === 0 && (
          <section className="luxia-panel mt-5 rounded-3xl p-8 text-center">
            <CircleOff
              size={36}
              className="mx-auto text-zinc-700"
            />

            <h2 className="mt-5 text-lg font-semibold text-white">
              No existen configuraciones
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zinc-600">
              Ejecuta “Crear defaults” para registrar las
              integraciones soportadas por el backend.
            </p>
          </section>
        )}

      {!isLoading &&
        !errorMessage &&
        integrations.length > 0 && (
          <section className="mt-5 grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {integrations.map(
              (integration) => {
                const catalog =
                  getIntegrationCatalogItem(
                    integration.provider,
                  );

                const Icon = catalog.icon;

                return (
                  <article
                    key={integration.id}
                    className="luxia-panel rounded-3xl p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-red-500/15 bg-red-950/20 text-red-400">
                          <Icon size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-white">
                            {integration.name}
                          </p>

                          <p className="mt-1 font-mono text-[10px] text-zinc-700">
                            {integration.provider}
                          </p>
                        </div>
                      </div>

                      <IntegrationStatusBadge
                        status={
                          integration.status
                        }
                        health={
                          integration.last_health_status
                        }
                      />
                    </div>

                    <p className="mt-5 text-sm leading-6 text-zinc-600">
                      {catalog.description}
                    </p>

                    <dl className="mt-5 space-y-3 text-xs">
                      <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
                        <dt className="text-zinc-700">
                          Habilitada
                        </dt>
                        <dd className="text-zinc-400">
                          {integration.is_enabled
                            ? "Sí"
                            : "No"}
                        </dd>
                      </div>

                      <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
                        <dt className="text-zinc-700">
                          URL base
                        </dt>
                        <dd className="max-w-[65%] truncate text-right text-zinc-400">
                          {integration.base_url ??
                            "No configurada"}
                        </dd>
                      </div>

                      <div className="flex justify-between gap-4">
                        <dt className="text-zinc-700">
                          Última comprobación
                        </dt>
                        <dd className="text-right text-zinc-400">
                          {integration.last_checked_at
                            ? new Date(
                                integration.last_checked_at,
                              ).toLocaleString(
                                "es-MX",
                              )
                            : "Sin comprobar"}
                        </dd>
                      </div>
                    </dl>

                    {integration.last_health_message && (
                      <p className="mt-4 rounded-xl border border-white/6 bg-black/20 p-3 text-xs leading-5 text-zinc-600">
                        {
                          integration.last_health_message
                        }
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        void checkHealth(
                          integration,
                        )
                      }
                      disabled={
                        Boolean(action) ||
                        !integration.is_enabled
                      }
                      className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] text-sm text-zinc-400 transition hover:text-white disabled:opacity-40"
                    >
                      {action ===
                      `health-${integration.provider}` ? (
                        <LoaderCircle
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <Gauge size={15} />
                      )}

                      Comprobar salud
                    </button>
                  </article>
                );
              },
            )}
          </section>
        )}
    </div>
  );
}
