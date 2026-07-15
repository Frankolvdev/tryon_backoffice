"use client";

import {
  Clock3,
  Gauge,
  LoaderCircle,
} from "lucide-react";

import { IntegrationStatusBadge } from "@/components/backoffice/integrations/integration-status-badge";
import {
  getIntegrationCatalogItem,
} from "@/lib/integrations/catalog";

import type {
  IntegrationConfigResponse,
} from "@/types/admin-integrations";

interface IntegrationHealthCardProps {
  integration: IntegrationConfigResponse;
  isChecking: boolean;
  onCheck: (
    integration: IntegrationConfigResponse,
  ) => Promise<void> | void;
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "Sin comprobar";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return value;
  }

  return date.toLocaleString(
    "es-MX",
  );
}

export function IntegrationHealthCard({
  integration,
  isChecking,
  onCheck,
}: IntegrationHealthCardProps) {
  const catalog =
    getIntegrationCatalogItem(
      integration.provider,
    );

  const Icon = catalog.icon;

  return (
    <article className="luxia-panel rounded-3xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-red-500/15 bg-red-950/20 text-red-400">
            <Icon size={19} />
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold text-white">
              {integration.name}
            </p>

            <p className="mt-1 font-mono text-[10px] text-zinc-700">
              {integration.provider}
            </p>
          </div>
        </div>

        <IntegrationStatusBadge
          status={integration.status}
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
            Estado administrativo
          </dt>

          <dd className="text-zinc-400">
            {integration.status}
          </dd>
        </div>

        <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
          <dt className="text-zinc-700">
            Última comprobación
          </dt>

          <dd className="max-w-[65%] text-right text-zinc-400">
            {formatDate(
              integration.last_checked_at,
            )}
          </dd>
        </div>

        <div className="flex justify-between gap-4">
          <dt className="text-zinc-700">
            URL base
          </dt>

          <dd className="max-w-[65%] truncate text-right text-zinc-400">
            {integration.base_url ??
              "No configurada"}
          </dd>
        </div>
      </dl>

      {integration.last_health_message && (
        <div className="mt-5 rounded-2xl border border-white/6 bg-black/20 p-4">
          <div className="flex items-start gap-3">
            <Clock3
              size={15}
              className="mt-0.5 shrink-0 text-zinc-600"
            />

            <p className="text-xs leading-6 text-zinc-500">
              {
                integration.last_health_message
              }
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={
          isChecking ||
          !integration.is_enabled
        }
        onClick={() =>
          void onCheck(integration)
        }
        className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-500/15 bg-red-950/15 text-sm text-red-300 transition hover:bg-red-950/25 disabled:opacity-40"
      >
        {isChecking ? (
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
}
