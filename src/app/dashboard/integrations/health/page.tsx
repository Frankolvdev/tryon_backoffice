"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  CircleHelp,
  Gauge,
  LoaderCircle,
  RefreshCcw,
  ShieldAlert,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { IntegrationHealthCard } from "@/components/backoffice/integrations/integration-health-card";
import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  IntegrationConfigResponse,
  IntegrationHealthResponse,
  IntegrationHealthStatus,
} from "@/types/admin-integrations";

type HealthFilter =
  | "all"
  | "healthy"
  | "attention"
  | "unknown"
  | "disabled";

function needsAttention(
  integration: IntegrationConfigResponse,
): boolean {
  return (
    integration.status === "error" ||
    integration.last_health_status ===
      "down" ||
    integration.last_health_status ===
      "degraded"
  );
}

export default function IntegrationsHealthPage() {
  const [integrations, setIntegrations] =
    useState<IntegrationConfigResponse[]>([]);

  const [filter, setFilter] =
    useState<HealthFilter>("all");

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    checkingProvider,
    setCheckingProvider,
  ] = useState<string | null>(null);

  const [isCheckingAll, setIsCheckingAll] =
    useState(false);

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
          >(
            "/api/admin/integrations",
          );

        setIntegrations(response);
      } catch (error) {
        setIntegrations([]);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No fue posible cargar el estado de las integraciones.",
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadIntegrations();
  }, [loadIntegrations]);

  const metrics = useMemo(() => {
    const healthy =
      integrations.filter(
        (integration) =>
          integration.last_health_status ===
          "healthy",
      ).length;

    const attention =
      integrations.filter(
        needsAttention,
      ).length;

    const unknown =
      integrations.filter(
        (integration) =>
          integration.is_enabled &&
          (
            integration.last_health_status ===
              null ||
            integration.last_health_status ===
              "unknown"
          ),
      ).length;

    const disabled =
      integrations.filter(
        (integration) =>
          !integration.is_enabled,
      ).length;

    return {
      total: integrations.length,
      healthy,
      attention,
      unknown,
      disabled,
    };
  }, [integrations]);

  const visibleIntegrations =
    useMemo(() => {
      if (filter === "healthy") {
        return integrations.filter(
          (integration) =>
            integration.last_health_status ===
            "healthy",
        );
      }

      if (filter === "attention") {
        return integrations.filter(
          needsAttention,
        );
      }

      if (filter === "unknown") {
        return integrations.filter(
          (integration) =>
            integration.is_enabled &&
            (
              integration.last_health_status ===
                null ||
              integration.last_health_status ===
                "unknown"
            ),
        );
      }

      if (filter === "disabled") {
        return integrations.filter(
          (integration) =>
            !integration.is_enabled,
        );
      }

      return integrations;
    }, [filter, integrations]);

  const checkHealth = async (
    integration: IntegrationConfigResponse,
  ) => {
    setCheckingProvider(
      integration.provider,
    );

    try {
      const response =
        await browserApiRequest<IntegrationHealthResponse>(
          `/api/admin/integrations/${integration.provider}/health`,
          {
            method: "POST",
          },
        );

      if (
        response.status === "healthy"
      ) {
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
          : `No fue posible comprobar ${integration.name}.`,
      );
    } finally {
      setCheckingProvider(null);
    }
  };

  const checkAll = async () => {
    const enabled =
      integrations.filter(
        (integration) =>
          integration.is_enabled,
      );

    if (enabled.length === 0) {
      toast.info(
        "No existen integraciones habilitadas.",
      );
      return;
    }

    setIsCheckingAll(true);

    let healthy = 0;
    let withProblems = 0;

    for (const integration of enabled) {
      setCheckingProvider(
        integration.provider,
      );

      try {
        const response =
          await browserApiRequest<IntegrationHealthResponse>(
            `/api/admin/integrations/${integration.provider}/health`,
            {
              method: "POST",
            },
          );

        if (
          response.status ===
          "healthy"
        ) {
          healthy += 1;
        } else {
          withProblems += 1;
        }
      } catch {
        withProblems += 1;
      }
    }

    setCheckingProvider(null);

    await loadIntegrations();

    toast.success(
      `Comprobación finalizada: ${healthy} saludables y ${withProblems} con atención.`,
    );

    setIsCheckingAll(false);
  };

  const filters: Array<{
    key: HealthFilter;
    label: string;
    value: number;
    icon: typeof Gauge;
  }> = [
    {
      key: "all",
      label: "Todas",
      value: metrics.total,
      icon: Activity,
    },
    {
      key: "healthy",
      label: "Saludables",
      value: metrics.healthy,
      icon: CheckCircle2,
    },
    {
      key: "attention",
      label: "Con atención",
      value: metrics.attention,
      icon: ShieldAlert,
    },
    {
      key: "unknown",
      label: "Sin comprobar",
      value: metrics.unknown,
      icon: CircleHelp,
    },
    {
      key: "disabled",
      label: "Deshabilitadas",
      value: metrics.disabled,
      icon: XCircle,
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/integrations"
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver a integraciones
        </Link>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={
              isLoading ||
              isCheckingAll
            }
            onClick={() =>
              void loadIntegrations()
            }
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

          <button
            type="button"
            disabled={
              isLoading ||
              isCheckingAll
            }
            onClick={() =>
              void checkAll()
            }
            className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
          >
            {isCheckingAll ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <Gauge size={16} />
            )}
            Comprobar todas
          </button>
        </div>
      </div>

      <section className="luxia-panel mt-5 rounded-3xl p-6">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
          Sistema · Integraciones
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-white">
          Estado de integraciones
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
          Vista consolidada de las comprobaciones de
          salud registradas por el backend. La acción
          masiva ejecuta secuencialmente el endpoint real
          de cada proveedor habilitado.
        </p>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {filters.map((item) => {
          const Icon = item.icon;
          const active =
            filter === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() =>
                setFilter(item.key)
              }
              className={
                active
                  ? "luxia-panel rounded-2xl border-red-500/20 p-5 text-left"
                  : "luxia-panel rounded-2xl p-5 text-left opacity-75 transition hover:opacity-100"
              }
            >
              <Icon
                size={18}
                className={
                  active
                    ? "text-red-400"
                    : "text-zinc-600"
                }
              />

              <p className="mt-4 text-xs text-zinc-600">
                {item.label}
              </p>

              <p className="mt-2 text-2xl font-semibold text-white">
                {item.value}
              </p>
            </button>
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

              <p className="text-sm leading-6 text-red-300">
                {errorMessage}
              </p>
            </div>
          </section>
        )}

      {!isLoading &&
        !errorMessage &&
        visibleIntegrations.length === 0 && (
          <section className="luxia-panel mt-5 rounded-3xl p-8 text-center">
            <CircleHelp
              size={36}
              className="mx-auto text-zinc-700"
            />

            <h2 className="mt-5 text-lg font-semibold text-white">
              Sin resultados
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zinc-600">
              No hay integraciones que coincidan con el
              filtro seleccionado.
            </p>
          </section>
        )}

      {!isLoading &&
        !errorMessage &&
        visibleIntegrations.length > 0 && (
          <section className="mt-5 grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {visibleIntegrations.map(
              (integration) => (
                <IntegrationHealthCard
                  key={integration.id}
                  integration={integration}
                  isChecking={
                    checkingProvider ===
                    integration.provider
                  }
                  onCheck={checkHealth}
                />
              ),
            )}
          </section>
        )}

      <section className="mt-5 rounded-2xl border border-amber-500/10 bg-amber-950/10 p-4 text-xs leading-6 text-amber-300/80">
        No todos los proveedores realizan el mismo tipo
        de comprobación. ComfyUI, RunPod, S3 y SMTP
        cuentan con validaciones específicas; otros
        proveedores pueden validar únicamente que la
        integración y sus credenciales estén configuradas.
      </section>
    </div>
  );
}
