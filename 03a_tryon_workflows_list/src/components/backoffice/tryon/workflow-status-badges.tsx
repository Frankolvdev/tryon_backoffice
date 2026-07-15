import {
  CheckCircle2,
  CircleDot,
  Cpu,
  Server,
  XCircle,
} from "lucide-react";

import type {
  WorkflowDefinitionResponse,
  WorkflowExecutionMode,
} from "@/types/admin-workflows";

interface WorkflowStatusBadgesProps {
  workflow: WorkflowDefinitionResponse;
}

function executionModeLabel(
  mode: WorkflowExecutionMode,
): string {
  if (mode === "comfyui_local") {
    return "ComfyUI local";
  }

  return "RunPod Serverless";
}

export function WorkflowStatusBadges({
  workflow,
}: WorkflowStatusBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <span
        className={
          workflow.is_active
            ? "inline-flex items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-950/20 px-2.5 py-1 text-[10px] font-semibold uppercase text-emerald-400"
            : "inline-flex items-center gap-1.5 rounded-full border border-zinc-500/15 bg-zinc-900/40 px-2.5 py-1 text-[10px] font-semibold uppercase text-zinc-500"
        }
      >
        {workflow.is_active ? (
          <CheckCircle2 size={12} />
        ) : (
          <XCircle size={12} />
        )}
        {workflow.is_active
          ? "Activo"
          : "Inactivo"}
      </span>

      {workflow.is_default && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/15 bg-red-950/20 px-2.5 py-1 text-[10px] font-semibold uppercase text-red-400">
          <CircleDot size={12} />
          Predeterminado
        </span>
      )}

      {workflow.execution_modes.map(
        (mode) => (
          <span
            key={mode}
            className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/15 bg-blue-950/20 px-2.5 py-1 text-[10px] text-blue-300"
          >
            {mode ===
            "comfyui_local" ? (
              <Cpu size={12} />
            ) : (
              <Server size={12} />
            )}

            {executionModeLabel(mode)}
          </span>
        ),
      )}
    </div>
  );
}
