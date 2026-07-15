"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  LoaderCircle,
  RefreshCcw,
} from "lucide-react";

import { TryOnEmptyState } from "@/components/backoffice/tryon/tryon-empty-state";
import { TryOnModuleHeader } from "@/components/backoffice/tryon/tryon-module-header";
import { WorkflowDetailOverview } from "@/components/backoffice/tryon/workflow-detail-overview";
import { WorkflowEditor } from "@/components/backoffice/tryon/workflow-editor";
import { WorkflowJsonPanel } from "@/components/backoffice/tryon/workflow-json-panel";
import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  WorkflowDefinitionResponse,
} from "@/types/admin-workflows";

export default function WorkflowDetailPage() {
  const params = useParams<{
    workflowId: string;
  }>();

  const workflowId = Number(
    params.workflowId,
  );

  const [workflow, setWorkflow] =
    useState<WorkflowDefinitionResponse | null>(
      null,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadWorkflow =
    useCallback(async () => {
      if (
        !Number.isInteger(workflowId) ||
        workflowId <= 0
      ) {
        setWorkflow(null);
        setErrorMessage(
          "El identificador del workflow no es válido.",
        );
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response =
          await browserApiRequest<WorkflowDefinitionResponse>(
            `/api/admin/workflow-definitions/${workflowId}`,
          );

        setWorkflow(response);
      } catch (error) {
        setWorkflow(null);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No fue posible cargar el workflow.",
        );
      } finally {
        setIsLoading(false);
      }
    }, [workflowId]);

  useEffect(() => {
    void loadWorkflow();
  }, [loadWorkflow]);

  if (isLoading) {
    return (
      <div>
        <TryOnModuleHeader
          title={`Workflow #${params.workflowId}`}
          description="Consultando la definición administrativa del workflow."
        />

        <section className="luxia-panel mt-7 flex min-h-96 items-center justify-center rounded-3xl">
          <LoaderCircle className="animate-spin text-red-500" />
        </section>
      </div>
    );
  }

  if (
    !workflow ||
    errorMessage
  ) {
    return (
      <div>
        <TryOnModuleHeader
          title={`Workflow #${params.workflowId}`}
          description="Detalle administrativo del workflow."
        />

        <div className="mt-7">
          <TryOnEmptyState
            error
            title="No se pudo cargar el workflow"
            description={
              errorMessage ??
              "El workflow solicitado no está disponible."
            }
          />
        </div>

        <Link
          href="/dashboard/tryon/workflows"
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver a workflows
        </Link>
      </div>
    );
  }

  return (
    <div>
      <TryOnModuleHeader
        title={workflow.name}
        description="Detalle, edición, esquemas y JSON de ejecución del workflow."
      />

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/tryon/workflows"
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver a workflows
        </Link>

        <button
          type="button"
          onClick={() =>
            void loadWorkflow()
          }
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400 hover:text-white"
        >
          <RefreshCcw size={16} />
          Actualizar
        </button>
      </div>

      <WorkflowDetailOverview
        workflow={workflow}
      />

      <div className="mt-5">
        <WorkflowEditor
          workflow={workflow}
          onSaved={setWorkflow}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <WorkflowJsonPanel
          title="Workflow ComfyUI"
          filename={`${workflow.key}-v${workflow.version}.json`}
          value={workflow.workflow}
        />

        <WorkflowJsonPanel
          title="Esquema de parámetros"
          filename={`${workflow.key}-parameter-schema.json`}
          value={
            workflow.parameter_schema
          }
        />
      </div>

      <div className="mt-5">
        <WorkflowJsonPanel
          title="Metadata"
          filename={`${workflow.key}-metadata.json`}
          value={workflow.metadata}
        />
      </div>
    </div>
  );
}
