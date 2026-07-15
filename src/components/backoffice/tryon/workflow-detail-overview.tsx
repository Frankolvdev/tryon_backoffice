import {
  Boxes,
  CalendarDays,
  CircleDot,
  FileJson2,
  Hash,
  Layers3,
  UserRound,
} from "lucide-react";

import { WorkflowManagementPanel } from "@/components/backoffice/tryon/workflow-management-panel";
import { WorkflowStatusBadges } from "@/components/backoffice/tryon/workflow-status-badges";
import {
  formatTryOnDate,
} from "@/lib/tryon/format";

import type {
  WorkflowDefinitionResponse,
} from "@/types/admin-workflows";

interface WorkflowDetailOverviewProps {
  workflow: WorkflowDefinitionResponse;
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Hash;
}) {
  return (
    <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
      <Icon
        size={17}
        className="text-red-400"
      />

      <p className="mt-4 text-[10px] font-semibold tracking-[0.18em] text-zinc-700 uppercase">
        {label}
      </p>

      <p className="mt-2 break-words text-lg font-semibold text-white">
        {value}
      </p>
    </article>
  );
}

export function WorkflowDetailOverview({
  workflow,
}: WorkflowDetailOverviewProps) {
  const nodeCount =
    Object.keys(
      workflow.workflow,
    ).length;

  const parameterCount =
    Object.keys(
      workflow.parameter_schema,
    ).length;

  return (
    <>
      <section className="luxia-panel mt-5 rounded-3xl p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
              <Boxes size={24} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold text-white">
                  {workflow.name}
                </h2>

                <WorkflowStatusBadges
                  workflow={workflow}
                />
              </div>

              <p className="mt-2 font-mono text-xs text-zinc-700">
                {workflow.key}
              </p>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-500">
                {workflow.description ??
                  "Sin descripción."}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/7 bg-black/20 px-4 py-3 text-right">
            <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-700">
              Workflow ID
            </p>

            <p className="mt-1 font-mono text-sm text-zinc-300">
              #{workflow.id}
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Versión"
            value={`v${workflow.version}`}
            icon={Layers3}
          />

          <MetricCard
            label="Categoría"
            value={workflow.category}
            icon={CircleDot}
          />

          <MetricCard
            label="Nodos"
            value={nodeCount.toLocaleString(
              "es-MX",
            )}
            icon={FileJson2}
          />

          <MetricCard
            label="Parámetros"
            value={parameterCount.toLocaleString(
              "es-MX",
            )}
            icon={Hash}
          />
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <article className="luxia-panel rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <CalendarDays className="text-red-400" />

            <h2 className="font-semibold text-white">
              Fechas
            </h2>
          </div>

          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between gap-4 border-b border-white/5 pb-4">
              <dt className="text-zinc-600">
                Creado
              </dt>

              <dd className="text-right text-zinc-300">
                {formatTryOnDate(
                  workflow.created_at,
                )}
              </dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-zinc-600">
                Actualizado
              </dt>

              <dd className="text-right text-zinc-300">
                {formatTryOnDate(
                  workflow.updated_at,
                )}
              </dd>
            </div>
          </dl>
        </article>

        <article className="luxia-panel rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <UserRound className="text-red-400" />

            <h2 className="font-semibold text-white">
              Propiedad
            </h2>
          </div>

          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between gap-4 border-b border-white/5 pb-4">
              <dt className="text-zinc-600">
                Creado por
              </dt>

              <dd className="text-zinc-300">
                {workflow.created_by_user_id
                  ? `Usuario #${workflow.created_by_user_id}`
                  : "Sistema"}
              </dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-zinc-600">
                Modos de ejecución
              </dt>

              <dd className="text-right text-zinc-300">
                {workflow.execution_modes.join(
                  ", ",
                )}
              </dd>
            </div>
          </dl>
        </article>
      </section>

      <WorkflowManagementPanel
        workflow={workflow}
      />
    </>
  );
}
