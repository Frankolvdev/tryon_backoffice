"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
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
import { Box, Code2, PackageOpen, Power, PowerOff, Trash2, Workflow } from "lucide-react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  GenerationModule,
  GenerationModuleOutput,
  GenerationModuleStep,
  GenerationNodePort,
} from "@/types/admin-generation-modules";

type Port = {
  id: string;
  label: string;
  type: string;
  path: string;
  nodeId?: string | null;
  field?: string | null;
};

type CanvasData = {
  title: string;
  subtitle: string;
  kind: "assets" | "output" | "workflow" | "python";
  enabled: boolean;
  inputs: Port[];
  outputs: Port[];
  onEdit?: () => void;
  onDelete?: () => void;
};

type FlowNode = Node<CanvasData>;

const compatibleTypes = (source: string, target: string) => {
  if (source === "auto" || target === "auto") return true;
  if (source === target) return true;
  if (source === "images" && target === "image") return true;
  if (source === "image" && target === "images") return true;
  if (source === "file" && ["image", "mask"].includes(target)) return true;
  return false;
};

const safePortToken = (value: string) =>
  value.trim().replace(/[^a-zA-Z0-9_-]/g, (character) =>
    `_${character.codePointAt(0)?.toString(16) ?? "0"}_`,
  );

// Los Handle IDs solo necesitan ser únicos dentro de su propio nodo.
// No incluimos el nodeId para evitar codificación doble y desajustes entre
// el Handle renderizado y el targetHandle/sourceHandle del edge.
const handleId = (side: "input" | "output", portId: string) =>
  `port__${side}__${safePortToken(portId)}`;

// Cada input admite una sola conexión, por lo que el destino es la identidad
// estable y única del wire. Esto también evita keys duplicadas en React.
const edgeId = (target: string, targetHandle: string) =>
  `edge__${safePortToken(target)}__${safePortToken(targetHandle)}`;

const edgeTargetKey = (target: string, targetHandle: string | null | undefined) =>
  `${target}::${targetHandle ?? ""}`;

const uniquePorts = (ports: Port[]) => {
  const seen = new Set<string>();
  return ports.filter((port) => {
    if (!port.id || seen.has(port.id)) return false;
    seen.add(port.id);
    return true;
  });
};

function NodeCard({ id, data, selected }: NodeProps<FlowNode>) {
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    const frame = requestAnimationFrame(() => updateNodeInternals(id));
    return () => cancelAnimationFrame(frame);
  }, [data.inputs, data.outputs, id, updateNodeInternals]);

  const icon =
    data.kind === "workflow" ? <Workflow size={17} /> :
    data.kind === "python" ? <Code2 size={17} /> :
    data.kind === "assets" ? <PackageOpen size={17} /> :
    <Box size={17} />;

  return (
    <div className={`min-w-[290px] rounded-xl border bg-[#111216] shadow-2xl ${selected ? "border-red-500" : "border-white/15"}`}>
      <div className={`flex items-center justify-between rounded-t-xl px-3 py-2 ${
        data.kind === "workflow" ? "bg-violet-500/15" :
        data.kind === "python" ? "bg-red-500/15" :
        data.kind === "assets" ? "bg-cyan-500/15" : "bg-emerald-500/15"
      }`}>
        <div className="flex items-center gap-2 text-sm font-semibold text-white">{icon}{data.title}</div>
        <span className={data.enabled ? "text-emerald-400" : "text-zinc-600"}>
          {data.enabled ? <Power size={15}/> : <PowerOff size={15}/>}
        </span>
      </div>
      <div className="px-3 py-2 text-[11px] text-zinc-500">{data.subtitle}</div>

      <div className="grid grid-cols-2 gap-6 px-3 pb-3">
        <div className="space-y-2">
          {data.inputs.map((port) => (
            <div key={port.id} className="relative min-h-6 rounded-md bg-white/[.025] py-1 pl-3 pr-1 text-left text-[11px] text-zinc-300">
              <Handle
                id={handleId("input", port.id)}
                type="target"
                position={Position.Left}
                className="!h-3 !w-3 !border-2 !border-zinc-200 !bg-zinc-900"
                style={{ left: -7, top: "50%", transform: "translateY(-50%)" }}
              />
              <span className="block truncate">{port.label}</span>
              <small className="text-[9px] uppercase text-zinc-600">{port.type}</small>
            </div>
          ))}
        </div>

        <div className="space-y-2 text-right">
          {data.outputs.map((port) => (
            <div key={port.id} className="relative min-h-6 rounded-md bg-white/[.025] py-1 pl-1 pr-3 text-[11px] text-zinc-300">
              <span className="block truncate">{port.label}</span>
              <small className="text-[9px] uppercase text-zinc-600">{port.type}</small>
              <Handle
                id={handleId("output", port.id)}
                type="source"
                position={Position.Right}
                className="!h-3 !w-3 !border-2 !border-zinc-200 !bg-zinc-900"
                style={{ right: -7, top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          ))}
        </div>
      </div>

      {(data.onEdit || data.onDelete) && (
        <div className="nodrag flex border-t border-white/10">
          {data.onEdit && <button type="button" onClick={(event) => { event.stopPropagation(); data.onEdit?.(); }} className="flex-1 py-2 text-xs text-zinc-400 hover:bg-white/5 hover:text-white">Editar nodo</button>}
          {data.onDelete && <button type="button" onClick={(event) => { event.stopPropagation(); data.onDelete?.(); }} className="flex items-center gap-1.5 border-l border-white/10 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"><Trash2 size={14}/>Eliminar</button>}
        </div>
      )}
    </div>
  );
}

const nodeTypes = { pipeline: NodeCard };

function configuredPorts(step: GenerationModuleStep, side: "input" | "output"): Port[] {
  const config = step.configuration ?? {};
  const raw = (config[side === "input" ? "input_ports" : "output_ports"] ?? []) as GenerationNodePort[];
  if (raw.length) {
    return uniquePorts(raw.map((port) => ({
      id: port.id,
      label: port.label || port.id,
      type: port.data_type || "auto",
      path: side === "output" ? `${step.key}.${port.id}` : "",
      nodeId: port.node_id,
      field: port.field,
    })));
  }

  if (step.step_type === "workflow") {
    const bindings = (config[side === "input" ? "input_bindings" : "output_bindings"] ?? []) as Array<Record<string, unknown>>;
    return uniquePorts(bindings.map((binding, index) => {
      const id = String(binding.port_id ?? binding.input_field ?? binding.module_output_key ?? `${side}_${index + 1}`);
      return {
        id,
        label: id,
        type: "auto",
        path: side === "output" ? `${step.key}.${id}` : "",
        nodeId: String(binding.node_id ?? ""),
        field: String(binding.input_field ?? ""),
      };
    }));
  }

  const mapping = side === "input" ? step.input_mapping : step.output_mapping;
  return uniquePorts(Object.keys(mapping ?? {}).map((id) => ({
    id,
    label: id,
    type: "auto",
    path: side === "output" ? `${step.key}.${id}` : "",
  })));
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
  const orderedSteps = useMemo(() => [...module.steps].sort((a, b) => a.position - b.position), [module.steps]);

  const deleteStep = useCallback(async (step: GenerationModuleStep) => {
    if (!confirm(`¿Eliminar el nodo “${step.name}”?`)) return;
    try {
      const updated = await browserApiRequest<GenerationModule>(`/api/admin/generation-modules/${module.id}/steps/${step.id}`, { method: "DELETE" });
      onModule(updated);
      toast.success("Nodo eliminado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar.");
    }
  }, [module.id, onModule]);

  const buildNodes = useCallback((): FlowNode[] => {
    const nodes: FlowNode[] = [{
      id: "assets",
      type: "pipeline",
      position: { x: 40, y: 160 },
      deletable: false,
      data: {
        title: "Assets",
        subtitle: "Entradas reutilizables y formulario del AppWeb",
        kind: "assets",
        enabled: true,
        inputs: [],
        outputs: uniquePorts(module.inputs.map((input) => ({
          id: input.key,
          label: input.name || input.key,
          type: input.input_type,
          path: input.key,
        }))),
      },
    }];

    orderedSteps.forEach((step, index) => {
      nodes.push({
        id: `step:${step.id}`,
        type: "pipeline",
        position: { x: 390 + index * 350, y: 100 + (index % 2) * 150 },
        data: {
          title: step.name,
          subtitle: `${step.key} · ${step.step_type}`,
          kind: step.step_type,
          enabled: step.is_enabled,
          inputs: configuredPorts(step, "input"),
          outputs: configuredPorts(step, "output"),
          onEdit: () => onEdit(step),
          onDelete: () => void deleteStep(step),
        },
      });
    });

    nodes.push({
      id: "output",
      type: "pipeline",
      position: { x: 440 + orderedSteps.length * 350, y: 160 },
      deletable: false,
      data: {
        title: "Output",
        subtitle: "Resultado final obligatorio",
        kind: "output",
        enabled: true,
        inputs: uniquePorts((module.outputs.length ? module.outputs : [{
          key: "output",
          name: "Resultado final",
          output_type: "image",
          position: 0,
          is_required: true,
        } as GenerationModuleOutput]).map((output) => ({
          id: output.key,
          label: output.name || output.key,
          type: output.output_type,
          path: output.source_path ?? "",
        }))),
        outputs: [],
      },
    });
    return nodes;
  }, [deleteStep, module.inputs, module.outputs, onEdit, orderedSteps]);

  const sourceForPath = useCallback((path: string) => {
    if (!path.includes(".")) return { node: "assets", handle: path };
    const [stepKey, portId] = path.split(".", 2);
    const step = module.steps.find((item) => item.key === stepKey);
    return step ? { node: `step:${step.id}`, handle: portId } : null;
  }, [module.steps]);

  const buildEdges = useCallback((): Edge[] => {
    // Cada input admite una sola conexión. Usar un Map elimina bindings
    // históricos duplicados antes de entregar los edges a React Flow.
    const graphNodes = buildNodes();
    const graphNodeMap = new Map(graphNodes.map((node) => [node.id, node]));
    const hasHandle = (nodeId: string, side: "input" | "output", candidate: string | null | undefined) => {
      if (!candidate) return false;
      const node = graphNodeMap.get(nodeId);
      const ports = side === "input" ? node?.data.inputs : node?.data.outputs;
      return Boolean(ports?.some((port) => handleId(side, port.id) === candidate));
    };

    const edgesByTarget = new Map<string, Edge>();
    const registerEdge = (edge: Edge) => {
      if (!hasHandle(edge.source, "output", edge.sourceHandle)) return;
      if (!hasHandle(edge.target, "input", edge.targetHandle)) return;
      const key = `${edge.target}::${edge.targetHandle ?? ""}`;
      edgesByTarget.set(key, edge);
    };
    for (const step of module.steps) {
      const ports = configuredPorts(step, "input");
      if (step.step_type === "python") {
        for (const port of ports) {
          const path = String(step.input_mapping?.[port.id] ?? "");
          const source = sourceForPath(path);
          if (!source) continue;
          {
            const sourceHandle = handleId("output", source.handle);
            const targetHandle = handleId("input", port.id);
            registerEdge({ id: edgeId(`step:${step.id}`, targetHandle), source: source.node, target: `step:${step.id}`, sourceHandle, targetHandle, animated: true, deletable: true });
          }
        }
      } else {
        const bindings = (step.configuration?.input_bindings ?? []) as Array<Record<string, unknown>>;
        for (const binding of bindings) {
          const portId = String(binding.port_id ?? binding.input_field ?? "");
          const path = String(binding.source_path ?? binding.module_input_key ?? "");
          const source = sourceForPath(path);
          if (!portId || !source) continue;
          {
            const sourceHandle = handleId("output", source.handle);
            const targetHandle = handleId("input", portId);
            registerEdge({ id: edgeId(`step:${step.id}`, targetHandle), source: source.node, target: `step:${step.id}`, sourceHandle, targetHandle, animated: true, deletable: true });
          }
        }
      }
    }

    for (const output of module.outputs) {
      const source = sourceForPath(String(output.source_path ?? ""));
      if (!source || source.node === "assets") continue;
      {
        const sourceHandle = handleId("output", source.handle);
        const targetHandle = handleId("input", output.key);
        registerEdge({ id: edgeId("output", targetHandle), source: source.node, target: "output", sourceHandle, targetHandle, animated: true, deletable: true });
      }
    }
    return [...edgesByTarget.values()];
  }, [buildNodes, module.outputs, module.steps, sourceForPath]);

  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(buildNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const pendingEdgesRef = useRef<Map<string, Edge>>(new Map());

  useEffect(() => {
    // Primero se renderizan los nodos y sus Handles. Los edges se incorporan
    // en el siguiente frame, cuando React Flow ya registró los puertos.
    setNodes(buildNodes());
    const frame = requestAnimationFrame(() => {
      const persistedEdges = buildEdges();
      const persistedTargets = new Set(
        persistedEdges.map((edge) => edgeTargetKey(edge.target, edge.targetHandle)),
      );

      // Una conexión recién guardada puede tardar un render en aparecer en el
      // modelo recibido por el padre. La conservamos visualmente hasta que la
      // respuesta persistida ya la contenga, evitando que el efecto la borre.
      for (const key of persistedTargets) pendingEdgesRef.current.delete(key);
      const pendingEdges = [...pendingEdgesRef.current.entries()]
        .filter(([key]) => !persistedTargets.has(key))
        .map(([, edge]) => edge);

      setEdges([...persistedEdges, ...pendingEdges]);
    });
    return () => cancelAnimationFrame(frame);
  }, [buildEdges, buildNodes, setEdges, setNodes]);

  const findPort = useCallback((nodeId: string | null, candidateHandleId: string | null, side: "input" | "output") => {
    if (!nodeId || !candidateHandleId) return undefined;
    const node = nodes.find((item) => item.id === nodeId);
    const ports = side === "input" ? node?.data.inputs : node?.data.outputs;
    return ports?.find((port) => handleId(side, port.id) === candidateHandleId);
  }, [nodes]);

  const findPortId = useCallback((nodeId: string, candidateHandleId: string | null, side: "input" | "output") =>
    findPort(nodeId, candidateHandleId, side)?.id ?? "", [findPort]);

  const outputsPayload = useCallback((override: Record<string, string | null>) => {
    const definitions = module.outputs.length ? module.outputs : [{
      key: "output", name: "Resultado final", output_type: "image" as const,
      position: 0, is_required: true, source_step_key: null, source_path: null, metadata: {},
    }];
    return definitions.map((output) => {
      const sourcePath = Object.prototype.hasOwnProperty.call(override, output.key) ? override[output.key] : output.source_path ?? null;
      return { ...output, source_step_key: null, source_path: sourcePath };
    });
  }, [module.outputs]);

  const persistDisconnect = useCallback(async (edge: Edge) => {
    try {
      let updated: GenerationModule;
      if (edge.target === "output") {
        const key = findPortId("output", edge.targetHandle ?? null, "input");
        updated = await browserApiRequest<GenerationModule>(`/api/admin/generation-modules/${module.id}`, {
          method: "PATCH",
          body: JSON.stringify({ outputs: outputsPayload({ [key]: null }) }),
        });
      } else {
        const target = module.steps.find((step) => `step:${step.id}` === edge.target);
        const portId = findPortId(edge.target, edge.targetHandle ?? null, "input");
        if (!target) return;
        if (target.step_type === "python") {
          const mapping = { ...(target.input_mapping ?? {}) };
          delete mapping[portId];
          updated = await browserApiRequest<GenerationModule>(`/api/admin/generation-modules/${module.id}/steps/${target.id}/python`, {
            method: "PATCH", body: JSON.stringify({ input_mapping: mapping }),
          });
        } else {
          const bindings = ((target.configuration?.input_bindings ?? []) as Array<Record<string, unknown>>)
            .filter((binding) => String(binding.port_id ?? binding.input_field ?? "") !== portId);
          updated = await browserApiRequest<GenerationModule>(`/api/admin/generation-modules/${module.id}/steps/${target.id}/workflow-bindings`, {
            method: "PATCH",
            body: JSON.stringify({ input_bindings: bindings, output_bindings: target.configuration?.output_bindings ?? [] }),
          });
        }
      }
      pendingEdgesRef.current.delete(edgeTargetKey(edge.target, edge.targetHandle));
      onModule(updated);
      toast.success("Conexión eliminada.");
    } catch (error) {
      setEdges(buildEdges());
      toast.error(error instanceof Error ? error.message : "No se pudo desconectar.");
    }
  }, [buildEdges, findPortId, module.id, module.steps, onModule, outputsPayload, setEdges]);

  const onConnect = useCallback(async (connection: Connection) => {
    const sourcePort = findPort(connection.source, connection.sourceHandle, "output");
    const targetPort = findPort(connection.target, connection.targetHandle, "input");
    if (!sourcePort || !targetPort) return;
    if (!compatibleTypes(sourcePort.type, targetPort.type)) {
      toast.error(`Tipos incompatibles: ${sourcePort.type} no puede conectarse con ${targetPort.type}.`);
      return;
    }

    const sourceStep = module.steps.find((step) => `step:${step.id}` === connection.source);
    const sourcePath = sourceStep ? `${sourceStep.key}.${sourcePort.id}` : sourcePort.id;

    try {
      let updated: GenerationModule;
      if (connection.target === "output") {
        if (!sourceStep) return toast.error("Output debe conectarse desde un Workflow o Python.");
        updated = await browserApiRequest<GenerationModule>(`/api/admin/generation-modules/${module.id}`, {
          method: "PATCH",
          body: JSON.stringify({ outputs: outputsPayload({ [targetPort.id]: sourcePath }) }),
        });
      } else {
        const target = module.steps.find((step) => `step:${step.id}` === connection.target);
        if (!target) return;
        if (target.step_type === "python") {
          updated = await browserApiRequest<GenerationModule>(`/api/admin/generation-modules/${module.id}/steps/${target.id}/python`, {
            method: "PATCH",
            body: JSON.stringify({ input_mapping: { ...(target.input_mapping ?? {}), [targetPort.id]: sourcePath } }),
          });
        } else {
          const targetNodeId = targetPort.nodeId ?? "";
          const targetField = targetPort.field ?? targetPort.id;
          const current = ((target.configuration?.input_bindings ?? []) as Array<Record<string, unknown>>)
            .filter((binding) => {
              const samePort = String(binding.port_id ?? "") === targetPort.id;
              const sameLegacyTarget =
                String(binding.node_id ?? "") === targetNodeId &&
                String(binding.input_field ?? "") === targetField;
              return !samePort && !sameLegacyTarget;
            });
          updated = await browserApiRequest<GenerationModule>(`/api/admin/generation-modules/${module.id}/steps/${target.id}/workflow-bindings`, {
            method: "PATCH",
            body: JSON.stringify({
              input_bindings: [...current, {
                port_id: targetPort.id,
                module_input_key: sourceStep ? null : sourcePort.id,
                source_path: sourcePath,
                node_id: targetNodeId,
                input_field: targetField,
              }],
              output_bindings: target.configuration?.output_bindings ?? [],
            }),
          });
        }
      }
      if (connection.source && connection.target && connection.sourceHandle && connection.targetHandle) {
        const optimisticEdge: Edge = {
          id: edgeId(connection.target, connection.targetHandle),
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
          animated: true,
          deletable: true,
        };
        const targetKey = edgeTargetKey(connection.target, connection.targetHandle);
        pendingEdgesRef.current.set(targetKey, optimisticEdge);
        setEdges((current) => {
          const next = current.filter(
            (edge) => edgeTargetKey(edge.target, edge.targetHandle) !== targetKey,
          );
          return addEdge(optimisticEdge, next);
        });
      }
      onModule(updated);
      toast.success("Conexión guardada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la conexión.");
    }
  }, [findPort, module.id, module.steps, onModule, outputsPayload, setEdges]);

  return (
    <div className="relative h-[680px] overflow-hidden rounded-2xl border border-white/10 bg-[#08090c]">
      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-lg border border-white/10 bg-black/70 px-3 py-2 text-[11px] text-zinc-400 backdrop-blur">
        Assets define el formulario. Conecta puertos del mismo tipo. Doble clic en un cable para desconectar.
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgesDelete={(deleted) => void Promise.all(deleted.map(persistDisconnect))}
        onEdgeDoubleClick={(_event, edge) => void persistDisconnect(edge)}
        deleteKeyCode={["Backspace", "Delete"]}
        fitView
      >
        <Background gap={20} size={1}/>
        <MiniMap pannable zoomable/>
        <Controls/>
      </ReactFlow>
    </div>
  );
}
