"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  useUpdateNodeInternals,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { Code2, Power, PowerOff, Trash2, Workflow } from "lucide-react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  GenerationModule,
  GenerationModuleOutput,
  GenerationModuleStep,
} from "@/types/admin-generation-modules";

type Port = {
  key: string;
  label: string;
  type: string;
  path: string;
};

type CanvasData = {
  title: string;
  subtitle: string;
  kind: "input" | "output" | "workflow" | "python";
  enabled: boolean;
  inputs: Port[];
  outputs: Port[];
  onEdit?: () => void;
  onDelete?: () => void;
};

type FlowNode = Node<CanvasData>;

function NodeCard({ id, data, selected }: NodeProps<FlowNode>) {
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => updateNodeInternals(id));
    return () => window.cancelAnimationFrame(frame);
  }, [data.inputs, data.outputs, id, updateNodeInternals]);

  const icon =
    data.kind === "workflow" ? (
      <Workflow size={17} />
    ) : data.kind === "python" ? (
      <Code2 size={17} />
    ) : null;

  return (
    <div
      className={`min-w-[270px] rounded-xl border bg-[#111216] shadow-2xl transition-colors ${
        selected ? "border-red-500" : "border-white/15"
      }`}
    >
      <div
        className={`flex items-center justify-between rounded-t-xl px-3 py-2 ${
          data.kind === "workflow"
            ? "bg-violet-500/15"
            : data.kind === "python"
              ? "bg-red-500/15"
              : "bg-sky-500/10"
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          {icon}
          {data.title}
        </div>
        <span className={data.enabled ? "text-emerald-400" : "text-zinc-600"}>
          {data.enabled ? <Power size={15} /> : <PowerOff size={15} />}
        </span>
      </div>

      <div className="px-3 py-2 text-[11px] text-zinc-500">{data.subtitle}</div>

      <div className="grid grid-cols-2 gap-5 px-3 pb-3">
        <div className="space-y-2">
          {data.inputs.map((port) => (
            <div
              key={port.key}
              className="relative min-h-5 py-0.5 pl-2 text-left text-[11px] text-zinc-300"
            >
              <Handle
                id={`in:${port.key}`}
                type="target"
                position={Position.Left}
                className="!h-3 !w-3 !border-2 !border-zinc-300 !bg-zinc-900"
                style={{ left: -13, top: "50%", transform: "translateY(-50%)" }}
              />
              <span>{port.label}</span>
              <small className="ml-1 text-zinc-600">{port.type}</small>
            </div>
          ))}
        </div>

        <div className="space-y-2 text-right">
          {data.outputs.map((port) => (
            <div
              key={port.key}
              className="relative min-h-5 py-0.5 pr-2 text-[11px] text-zinc-300"
            >
              <span>{port.label}</span>
              <small className="ml-1 text-zinc-600">{port.type}</small>
              <Handle
                id={`out:${port.key}`}
                type="source"
                position={Position.Right}
                className="!h-3 !w-3 !border-2 !border-zinc-300 !bg-zinc-900"
                style={{ right: -13, top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          ))}
        </div>
      </div>

      {(data.onEdit || data.onDelete) && (
        <div className="nodrag flex border-t border-white/10">
          {data.onEdit && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                data.onEdit?.();
              }}
              className="flex-1 py-2 text-xs text-zinc-400 hover:bg-white/5 hover:text-white"
            >
              Editar nodo
            </button>
          )}
          {data.onDelete && (
            <button
              type="button"
              title="Eliminar nodo"
              aria-label={`Eliminar ${data.title}`}
              onClick={(event) => {
                event.stopPropagation();
                data.onDelete?.();
              }}
              className="flex items-center justify-center gap-1.5 border-l border-white/10 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <Trash2 size={14} />
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const nodeTypes = { pipeline: NodeCard };

function stepInputs(step: GenerationModuleStep): Port[] {
  if (step.step_type === "workflow") {
    return ((step.configuration?.input_bindings ?? []) as Array<Record<string, unknown>>).map(
      (binding, index) => {
        const nodeId = String(binding.node_id ?? "node");
        const inputField = String(binding.input_field ?? `input_${index + 1}`);
        return {
          key: `${nodeId}.${inputField}`,
          label: inputField,
          type: "auto",
          path: String(binding.source_path ?? binding.module_input_key ?? ""),
        };
      },
    );
  }

  return Object.entries(step.input_mapping ?? {}).map(([key, value]) => ({
    key,
    label: key,
    type: "auto",
    path: String(value ?? ""),
  }));
}

function stepOutputs(step: GenerationModuleStep): Port[] {
  if (step.step_type === "workflow") {
    return ((step.configuration?.output_bindings ?? []) as Array<Record<string, unknown>>).map(
      (binding, index) => {
        const key = String(binding.module_output_key ?? `output_${index + 1}`);
        return {
          key,
          label: key,
          type: "image",
          path: `${step.key}.${key}`,
        };
      },
    );
  }

  return Object.keys(step.output_mapping ?? {}).map((key) => ({
    key,
    label: key,
    type: "auto",
    path: `${step.key}.${key}`,
  }));
}

export function GenerationNodeCanvas({
  module,
  onModule,
  onEdit,
}: {
  module: GenerationModule;
  onModule: (module: GenerationModule) => void;
  onEdit: (step: GenerationModuleStep) => void;
}) {
  const deleteStep = useCallback(
    async (step: GenerationModuleStep) => {
      const confirmed = window.confirm(
        `¿Eliminar el nodo “${step.name}”? También desaparecerán sus conexiones.`,
      );
      if (!confirmed) return;

      try {
        const updated = await browserApiRequest<GenerationModule>(
          `/api/admin/generation-modules/${module.id}/steps/${step.id}`,
          { method: "DELETE" },
        );
        onModule(updated);
        toast.success("Nodo eliminado correctamente.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "No se pudo eliminar el nodo.",
        );
      }
    },
    [module.id, onModule],
  );

  const buildNodes = useCallback(() => {
    const ordered = [...module.steps].sort((a, b) => a.position - b.position);
    const nodes: FlowNode[] = [
      {
        id: "module-inputs",
        type: "pipeline",
        position: { x: 40, y: 140 },
        deletable: false,
        data: {
          title: "Entradas del módulo",
          subtitle: "Formulario automático",
          kind: "input",
          enabled: true,
          inputs: [],
          outputs: module.inputs.map((input) => ({
            key: input.key,
            label: input.name || input.key,
            type: input.input_type,
            path: input.key,
          })),
        },
      },
    ];

    ordered.forEach((step, index) =>
      nodes.push({
        id: `step:${step.id}`,
        type: "pipeline",
        position: { x: 390 + index * 350, y: 100 + (index % 2) * 120 },
        data: {
          title: step.name,
          subtitle: `${step.key} · ${step.step_type}`,
          kind: step.step_type,
          enabled: step.is_enabled,
          inputs: stepInputs(step),
          outputs: stepOutputs(step),
          onEdit: () => onEdit(step),
          onDelete: () => void deleteStep(step),
        },
      }),
    );

    nodes.push({
      id: "module-outputs",
      type: "pipeline",
      position: { x: 390 + ordered.length * 350, y: 140 },
      deletable: false,
      data: {
        title: "Output",
        subtitle: "Salida final obligatoria",
        kind: "output",
        enabled: true,
        inputs: (module.outputs.length > 0
          ? module.outputs
          : [
              {
                key: "output",
                name: "Output final",
                output_type: "image" as const,
                position: 0,
                is_required: true,
                source_path: null,
              },
            ]
        ).map((output) => ({
          key: output.key,
          label: output.name || output.key,
          type: output.output_type,
          path: output.source_path ?? "",
        })),
        outputs: [],
      },
    });

    return nodes;
  }, [deleteStep, module, onEdit]);

  const buildEdges = useCallback(() => {
    const edges: Edge[] = [];
    for (const step of module.steps) {
      for (const port of stepInputs(step)) {
        if (!port.path) continue;
        const [prefix, key] = port.path.includes(".")
          ? port.path.split(".", 2)
          : ["module-inputs", port.path];
        const source =
          prefix === "module-inputs"
            ? "module-inputs"
            : `step:${module.steps.find((candidate) => candidate.key === prefix)?.id ?? "missing"}`;
        if (source.includes("missing")) continue;
        edges.push({
          id: `${source}-${step.id}-${port.key}`,
          source,
          target: `step:${step.id}`,
          sourceHandle: `out:${key}`,
          targetHandle: `in:${port.key}`,
          animated: true,
        });
      }
    }

    for (const output of module.outputs) {
      if (!output.source_path) continue;
      const [stepKey, outputKey] = output.source_path.includes(".")
        ? output.source_path.split(".", 2)
        : [output.source_step_key ?? "", output.source_path];
      const sourceStep = module.steps.find((candidate) => candidate.key === stepKey);
      if (!sourceStep) continue;
      edges.push({
        id: `output-${output.key}-${sourceStep.id}-${outputKey}`,
        source: `step:${sourceStep.id}`,
        target: "module-outputs",
        sourceHandle: `out:${outputKey}`,
        targetHandle: `in:${output.key}`,
        animated: true,
        deletable: true,
      });
    }
    return edges;
  }, [module]);

  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(buildNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildEdges());

  useEffect(() => {
    setNodes(buildNodes());
    setEdges(buildEdges());
  }, [buildEdges, buildNodes, setEdges, setNodes]);

  const outputPayload = useCallback(
    (overrides: Record<string, string | null>) => {
      const outputs: GenerationModuleOutput[] = module.outputs.length
        ? module.outputs
        : [{
            key: "output",
            name: "Output final",
            output_type: "image" as const,
            position: 0,
            is_required: true,
            source_step_key: null,
            source_path: null,
            metadata: {},
          }];
      return outputs.map((output) => {
        const sourcePath = Object.prototype.hasOwnProperty.call(overrides, output.key)
          ? overrides[output.key]
          : output.source_path ?? null;
        return {
          key: output.key,
          name: output.name,
          description: output.description ?? null,
          output_type: output.output_type,
          position: output.position,
          is_required: output.is_required,
          source_step_key: sourcePath?.includes(".") ? sourcePath.split(".", 1)[0] : null,
          source_path: sourcePath,
          metadata: output.metadata ?? {},
        };
      });
    },
    [module.outputs],
  );

  const disconnectEdge = useCallback(
    async (edge: Edge) => {
      if (!edge.targetHandle) return;
      try {
        let updated: GenerationModule;
        if (edge.target === "module-outputs") {
          const outputKey = edge.targetHandle.replace("in:", "");
          updated = await browserApiRequest<GenerationModule>(
            `/api/admin/generation-modules/${module.id}`,
            { method: "PATCH", body: JSON.stringify({ outputs: outputPayload({ [outputKey]: null }) }) },
          );
        } else if (edge.target.startsWith("step:")) {
          const target = module.steps.find((step) => String(step.id) === edge.target.split(":")[1]);
          if (!target) return;
          const targetKey = edge.targetHandle.replace("in:", "");
          if (target.step_type === "python") {
            const mapping = { ...(target.input_mapping ?? {}) };
            delete mapping[targetKey];
            updated = await browserApiRequest<GenerationModule>(
              `/api/admin/generation-modules/${module.id}/steps/${target.id}/python`,
              { method: "PATCH", body: JSON.stringify({ input_mapping: mapping }) },
            );
          } else {
            const inputBindings = ((target.configuration?.input_bindings ?? []) as Array<Record<string, unknown>>).filter(
              (binding) => `${String(binding.node_id ?? "")}.${String(binding.input_field ?? "")}` !== targetKey,
            );
            updated = await browserApiRequest<GenerationModule>(
              `/api/admin/generation-modules/${module.id}/steps/${target.id}/workflow-bindings`,
              { method: "PATCH", body: JSON.stringify({ input_bindings: inputBindings, output_bindings: target.configuration?.output_bindings ?? [] }) },
            );
          }
        } else return;
        setEdges((current) => current.filter((candidate) => candidate.id !== edge.id));
        onModule(updated);
        toast.success("Conexión eliminada.");
      } catch (error) {
        setEdges(buildEdges());
        toast.error(error instanceof Error ? error.message : "No se pudo eliminar la conexión.");
      }
    },
    [buildEdges, module, onModule, outputPayload, setEdges],
  );

  const onEdgesDeletePersisted = useCallback(
    async (deletedEdges: Edge[]) => {
      for (const edge of deletedEdges) await disconnectEdge(edge);
    },
    [disconnectEdge],
  );

  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.sourceHandle || !connection.targetHandle || !connection.target) return;

      const sourceNode = connection.source === "module-inputs"
        ? null
        : module.steps.find((step) => String(step.id) === connection.source?.split(":")[1]);
      const sourceKey = connection.sourceHandle.replace("out:", "");
      const sourcePath = sourceNode ? `${sourceNode.key}.${sourceKey}` : sourceKey;

      try {
        let updated: GenerationModule;
        if (connection.target === "module-outputs") {
          if (!sourceNode) {
            toast.error("El bloque Output debe conectarse desde la salida de un paso.");
            return;
          }
          const outputKey = connection.targetHandle.replace("in:", "");
          updated = await browserApiRequest<GenerationModule>(
            `/api/admin/generation-modules/${module.id}`,
            { method: "PATCH", body: JSON.stringify({ outputs: outputPayload({ [outputKey]: sourcePath }) }) },
          );
          setEdges((current) => addEdge({ ...connection, animated: true, deletable: true }, current.filter(
            (edge) => !(edge.target === "module-outputs" && edge.targetHandle === connection.targetHandle),
          )));
          onModule(updated);
          toast.success("Output final conectado.");
          return;
        }

        if (!connection.target.startsWith("step:")) return;
        const target = module.steps.find((step) => String(step.id) === connection.target?.split(":")[1]);
        if (!target) return;
        const targetKey = connection.targetHandle.replace("in:", "");

        if (target.step_type === "python") {
          updated = await browserApiRequest<GenerationModule>(
            `/api/admin/generation-modules/${module.id}/steps/${target.id}/python`,
            { method: "PATCH", body: JSON.stringify({ input_mapping: { ...(target.input_mapping ?? {}), [targetKey]: sourcePath } }) },
          );
        } else {
          const [nodeId, inputField] = targetKey.split(".", 2);
          const existing = ((target.configuration?.input_bindings ?? []) as Array<Record<string, unknown>>).filter(
            (binding) => `${String(binding.node_id ?? "")}.${String(binding.input_field ?? "")}` !== targetKey,
          );
          updated = await browserApiRequest<GenerationModule>(
            `/api/admin/generation-modules/${module.id}/steps/${target.id}/workflow-bindings`,
            { method: "PATCH", body: JSON.stringify({ input_bindings: [...existing, { source_path: sourcePath, node_id: nodeId, input_field: inputField }], output_bindings: target.configuration?.output_bindings ?? [] }) },
          );
        }
        setEdges((current) => addEdge({ ...connection, animated: true, deletable: true }, current));
        onModule(updated);
        toast.success("Conexión guardada.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo guardar la conexión.");
      }
    },
    [module, onModule, outputPayload, setEdges],
  );

  return (
    <div className="relative h-[650px] overflow-hidden rounded-2xl border border-white/10 bg-[#08090c]">
      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-lg border border-white/10 bg-black/70 px-3 py-2 text-[11px] text-zinc-400 backdrop-blur">
        Selecciona un cable y pulsa Supr/Backspace, o haz doble clic para desconectarlo.
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgesDelete={onEdgesDeletePersisted}
        onEdgeDoubleClick={(_event, edge) => void disconnectEdge(edge)}
        onConnect={onConnect}
        fitView
        deleteKeyCode={["Backspace", "Delete"]}
      >
        <Background gap={20} size={1} />
        <MiniMap pannable zoomable />
        <Controls />
      </ReactFlow>
    </div>
  );
}
