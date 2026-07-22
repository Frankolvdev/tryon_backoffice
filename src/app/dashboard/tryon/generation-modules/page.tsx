"use client";

import { DragEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown, ArrowRight, Boxes, Braces, Code2, Copy, GripVertical,
  Image as ImageIcon, LoaderCircle, Pencil, Plus, Save, Search, Sparkles,
  Trash2, Workflow, X,
} from "lucide-react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  GenerationExecutionEngine, GenerationModule, GenerationModuleInput,
  GenerationModuleListResponse, GenerationModuleOutput, GenerationModuleStep,
  WorkflowInputBinding, WorkflowOutputBinding,
} from "@/types/admin-generation-modules";

const engines: { value: GenerationExecutionEngine; label: string }[] = [
  { value: "simulated", label: "Simulado" },
  { value: "local_docker", label: "Docker local" },
  { value: "runpod_serverless", label: "RunPod Serverless" },
];
const inputTypes = ["image", "file", "text", "integer", "float", "boolean", "json"] as const;
const outputTypes = ["image", "images", "file", "json", "metadata"] as const;
const emptyInput = (position: number): GenerationModuleInput => ({ key: `input_${position + 1}`, name: "Nueva entrada", input_type: "image", position, is_required: true, validation: {} });
const emptyOutput = (position: number): GenerationModuleOutput => ({ key: `output_${position + 1}`, name: "Nueva salida", output_type: "image", position, is_required: true, metadata: {} });

type EditorTarget = { mode: "create" | "edit"; type: "workflow" | "python"; step?: GenerationModuleStep } | null;
type Port = { key: string; label: string; type: string; path: string; origin: string };

export default function GenerationModulesPage() {
  const [items, setItems] = useState<GenerationModule[]>([]);
  const [selected, setSelected] = useState<GenerationModule | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editor, setEditor] = useState<EditorTarget>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ limit: "200" });
      if (search.trim()) q.set("search", search.trim());
      const response = await browserApiRequest<GenerationModuleListResponse>(`/api/admin/generation-modules?${q}`);
      setItems(response.items);
      setSelected(current => current ? response.items.find(item => item.id === current.id) ?? null : current);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible cargar los módulos.");
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { const timer = setTimeout(() => void load(), 200); return () => clearTimeout(timer); }, [load]);

  const saveModule = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await browserApiRequest<GenerationModule>(`/api/admin/generation-modules/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: selected.name, description: selected.description, category: selected.category,
          default_execution_engine: selected.default_execution_engine, is_active: selected.is_active,
          inputs: selected.inputs.map(({ id, ...item }) => item),
          outputs: selected.outputs.map(({ id, ...item }) => item),
        }),
      });
      setSelected(updated);
      toast.success("Módulo guardado.");
      await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible guardar."); }
    finally { setSaving(false); }
  };

  return <div className="space-y-7">
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-[.28em] text-red-400">Pipeline visual</p><h1 className="mt-2 text-3xl font-semibold text-white">Módulos de generación</h1><p className="mt-2 max-w-3xl text-sm text-zinc-500">Arrastra pasos, edítalos y deja que el editor sugiera conexiones por nombre y tipo.</p></div>
      <button onClick={() => setCreateOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-500"><Plus size={17}/>Nuevo módulo</button>
    </header>
    <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <section className="luxia-panel overflow-hidden rounded-3xl">
        <div className="border-b border-white/6 p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700" size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar módulos..." className="h-10 w-full rounded-xl border border-white/7 bg-black/30 pl-10 pr-3 text-sm text-white outline-none focus:border-red-500/40"/></div></div>
        <div className="max-h-[760px] overflow-y-auto p-3">{loading ? <div className="flex justify-center p-10"><LoaderCircle className="animate-spin text-red-500"/></div> : items.map(module => <button key={module.id} onClick={() => setSelected(module)} className={`mb-2 w-full rounded-2xl border p-4 text-left transition ${selected?.id === module.id ? "border-red-500/35 bg-red-500/8" : "border-white/6 bg-white/[.02] hover:border-white/12"}`}><p className="font-medium text-white">{module.name}</p><p className="mt-1 font-mono text-xs text-zinc-600">{module.key} · v{module.version}</p><div className="mt-3 flex gap-3 text-xs text-zinc-600"><span>{module.inputs.length} entradas</span><span>{module.steps.length} pasos</span><span>{module.outputs.length} salidas</span></div></button>)}</div>
      </section>
      {!selected ? <EmptyState/> : <ModuleEditor module={selected} setModule={setSelected} saving={saving} onSave={saveModule} onOpenEditor={setEditor}/>} 
    </div>
    {editor && selected && <StepEditor module={selected} target={editor} onClose={() => setEditor(null)} onSaved={module => { setSelected(module); setEditor(null); void load(); }}/>} 
    {createOpen && <CreateModuleModal onClose={() => setCreateOpen(false)} onCreated={module => { setItems(current => [module, ...current]); setSelected(module); setCreateOpen(false); }}/>} 
  </div>;
}

function EmptyState() { return <section className="luxia-panel flex min-h-[560px] flex-col items-center justify-center rounded-3xl p-10 text-center"><Boxes size={44} className="text-zinc-800"/><h2 className="mt-5 text-xl font-semibold text-white">Selecciona un módulo</h2><p className="mt-2 max-w-md text-sm text-zinc-600">Aquí aparecerá el editor visual del pipeline.</p></section>; }

function ModuleEditor({ module, setModule, saving, onSave, onOpenEditor }: { module: GenerationModule; setModule: (module: GenerationModule) => void; saving: boolean; onSave: () => void; onOpenEditor: (target: EditorTarget) => void }) {
  const patch = (value: Partial<GenerationModule>) => setModule({ ...module, ...value });
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const ordered = useMemo(() => [...module.steps].sort((a, b) => a.position - b.position), [module.steps]);

  const persistOrder = async (steps: GenerationModuleStep[]) => {
    const optimistic = { ...module, steps: steps.map((step, position) => ({ ...step, position })) };
    setModule(optimistic);
    try {
      const updated = await browserApiRequest<GenerationModule>(`/api/admin/generation-modules/${module.id}/steps/reorder`, { method: "PUT", body: JSON.stringify({ items: optimistic.steps.map(step => ({ step_id: step.id, position: step.position })) }) });
      setModule(updated); toast.success("Orden actualizado y conexiones recalculadas visualmente.");
    } catch (error) { setModule(module); toast.error(error instanceof Error ? error.message : "No fue posible reordenar."); }
  };
  const dropOn = (targetId: number) => {
    if (!draggedId || draggedId === targetId) return;
    const next = [...ordered]; const from = next.findIndex(item => item.id === draggedId); const to = next.findIndex(item => item.id === targetId);
    const [moved] = next.splice(from, 1); next.splice(to, 0, moved); setDraggedId(null); void persistOrder(next);
  };
  const removeStep = async (step: GenerationModuleStep) => {
    if (!confirm(`¿Eliminar el paso ${step.name}?`)) return;
    try { setModule(await browserApiRequest<GenerationModule>(`/api/admin/generation-modules/${module.id}/steps/${step.id}`, { method: "DELETE" })); toast.success("Paso eliminado."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible eliminar."); }
  };
  const duplicateStep = async (step: GenerationModuleStep) => {
    try {
      if (step.step_type === "python") {
        const config = step.configuration ?? {};
        setModule(await browserApiRequest<GenerationModule>(`/api/admin/generation-modules/${module.id}/steps/python`, { method: "POST", body: JSON.stringify({ key: `${step.key}_copy_${Date.now().toString().slice(-4)}`, name: `${step.name} copia`, description: step.description, position: module.steps.length, source_code: config.source_code ?? "def run(inputs):\n    return inputs\n", entrypoint: config.entrypoint ?? "run", timeout_seconds: config.timeout_seconds ?? 300, input_mapping: step.input_mapping ?? {}, output_mapping: step.output_mapping ?? {}, is_enabled: step.is_enabled }) }));
      } else {
        const config = step.configuration ?? {};
        setModule(await browserApiRequest<GenerationModule>(`/api/admin/generation-modules/${module.id}/steps/workflow`, { method: "POST", body: JSON.stringify({ key: `${step.key}_copy_${Date.now().toString().slice(-4)}`, name: `${step.name} copia`, description: step.description, position: module.steps.length, workflow_name: config.workflow_name ?? null, workflow_json: config.workflow ?? {}, input_bindings: config.input_bindings ?? [], output_bindings: config.output_bindings ?? [], is_enabled: step.is_enabled }) }));
      }
      toast.success("Paso duplicado.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible duplicar."); }
  };

  return <section className="luxia-panel overflow-hidden rounded-3xl">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/6 p-5"><div><h2 className="text-xl font-semibold text-white">{module.name}</h2><p className="mt-1 font-mono text-xs text-zinc-600">{module.key} · ID {module.id}</p></div><button onClick={onSave} disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? <LoaderCircle size={16} className="animate-spin"/> : <Save size={16}/>}Guardar módulo</button></div>
    <div className="space-y-7 p-5">
      <div className="grid gap-4 md:grid-cols-2"><Field label="Nombre"><input value={module.name} onChange={e => patch({ name: e.target.value })} className="gm-input"/></Field><Field label="Categoría"><input value={module.category} onChange={e => patch({ category: e.target.value })} className="gm-input"/></Field><Field label="Motor"><select value={module.default_execution_engine} onChange={e => patch({ default_execution_engine: e.target.value as GenerationExecutionEngine })} className="gm-input">{engines.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field><Field label="Estado"><select value={String(module.is_active)} onChange={e => patch({ is_active: e.target.value === "true" })} className="gm-input"><option value="true">Activo</option><option value="false">Inactivo</option></select></Field></div>
      <ContractEditor module={module} setModule={setModule}/>
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-semibold uppercase tracking-[.18em] text-zinc-400">Pipeline visual</h3><p className="mt-1 text-xs text-zinc-600">Arrastra un bloque. El contexto completo fluye al siguiente paso y el editor sugiere las claves más probables.</p></div><div className="flex gap-2"><button onClick={() => onOpenEditor({ mode: "create", type: "workflow" })} className="gm-secondary"><Workflow size={15}/>Workflow</button><button onClick={() => onOpenEditor({ mode: "create", type: "python" })} className="gm-secondary"><Code2 size={15}/>Python</button></div></div>
        <ModuleInputNode module={module}/>
        {ordered.map((step, index) => <div key={step.id}><FlowConnector previous={index === 0 ? null : ordered[index - 1]} current={step} module={module}/><StepNode step={step} module={module} draggable onDragStart={() => setDraggedId(step.id)} onDragOver={event => event.preventDefault()} onDrop={() => dropOn(step.id)} onEdit={() => onOpenEditor({ mode: "edit", type: step.step_type, step })} onDuplicate={() => void duplicateStep(step)} onDelete={() => void removeStep(step)}/></div>)}
        {ordered.length === 0 && <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-600">Agrega un Workflow o Python para comenzar.</div>}
        <FlowConnector previous={ordered.at(-1) ?? null} current={null} module={module}/><ModuleOutputNode module={module}/>
      </div>
    </div>
  </section>;
}

function ModuleInputNode({ module }: { module: GenerationModule }) { return <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[.05] p-4"><div className="flex items-center gap-2 text-sm font-semibold text-blue-300"><Braces size={16}/>Entradas del módulo</div><div className="mt-3 flex flex-wrap gap-2">{module.inputs.map(input => <PortChip key={input.key} label={input.key} type={input.input_type}/>)}</div></div>; }
function ModuleOutputNode({ module }: { module: GenerationModule }) { return <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[.05] p-4"><div className="flex items-center gap-2 text-sm font-semibold text-emerald-300"><ImageIcon size={16}/>Salidas publicadas</div><div className="mt-3 flex flex-wrap gap-2">{module.outputs.map(output => <PortChip key={output.key} label={output.key} type={output.output_type}/>)}</div></div>; }
function PortChip({ label, type }: { label: string; type: string }) { return <span className="rounded-full border border-white/8 bg-black/25 px-3 py-1.5 font-mono text-[11px] text-zinc-300">{label}<span className="ml-2 text-zinc-600">{type}</span></span>; }

function FlowConnector({ previous, current, module }: { previous: GenerationModuleStep | null; current: GenerationModuleStep | null; module: GenerationModule }) {
  const suggestions = useMemo(() => current ? suggestConnections(module, previous, current) : [], [module, previous, current]);
  return <div className="flex min-h-16 flex-col items-center justify-center gap-1"><ArrowDown size={18} className="text-zinc-700"/>{current && <div className="flex flex-wrap items-center justify-center gap-2">{suggestions.slice(0, 3).map(item => <span key={`${item.target}-${item.source}`} className={`rounded-full px-2.5 py-1 text-[10px] ${item.confidence === "exact" ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"}`}>{item.source} <ArrowRight className="inline" size={10}/> {item.target}</span>)}{suggestions.length === 0 && <span className="text-[10px] text-zinc-700">contexto completo disponible</span>}</div>}</div>;
}

function StepNode({ step, module, ...props }: { step: GenerationModuleStep; module: GenerationModule; draggable: boolean; onDragStart: () => void; onDragOver: (event: DragEvent<HTMLDivElement>) => void; onDrop: () => void; onEdit: () => void; onDuplicate: () => void; onDelete: () => void }) {
  const inputs = describeStepInputs(step, module); const outputs = describeStepOutputs(step, module);
  return <div draggable={props.draggable} onDragStart={props.onDragStart} onDragOver={props.onDragOver} onDrop={props.onDrop} className="group rounded-2xl border border-white/8 bg-black/25 p-4 transition hover:border-red-500/25">
    <div className="flex items-start gap-3"><GripVertical className="mt-1 cursor-grab text-zinc-700 group-active:cursor-grabbing" size={19}/><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${step.step_type === "workflow" ? "bg-purple-500/10 text-purple-300" : "bg-red-500/10 text-red-300"}`}>{step.step_type === "workflow" ? <Workflow size={19}/> : <Code2 size={19}/>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-white">{step.name}</p><span className="rounded-full bg-white/5 px-2 py-1 font-mono text-[10px] text-zinc-500">{step.key}</span><span className={`rounded-full px-2 py-1 text-[10px] ${step.is_enabled ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>{step.is_enabled ? "Activo" : "Inactivo"}</span></div><div className="mt-3 grid gap-3 md:grid-cols-2"><PortGroup title="Recibe" ports={inputs}/><PortGroup title="Produce" ports={outputs}/></div></div><div className="flex gap-1"><button onClick={props.onEdit} className="gm-icon" title="Editar"><Pencil size={15}/></button><button onClick={props.onDuplicate} className="gm-icon" title="Duplicar"><Copy size={15}/></button><button onClick={props.onDelete} className="gm-icon text-red-400" title="Eliminar"><Trash2 size={15}/></button></div></div>
  </div>;
}
function PortGroup({ title, ports }: { title: string; ports: Port[] }) { return <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">{title}</p><div className="flex flex-wrap gap-1.5">{ports.length ? ports.slice(0, 6).map(port => <PortChip key={`${port.origin}-${port.key}`} label={port.label} type={port.type}/>) : <span className="text-xs text-zinc-700">Contexto completo</span>}</div></div>; }

function describeStepInputs(step: GenerationModuleStep, module: GenerationModule): Port[] {
  if (step.step_type === "workflow") return ((step.configuration?.input_bindings ?? []) as WorkflowInputBinding[]).map(binding => { const input = module.inputs.find(item => item.key === binding.module_input_key); return { key: binding.module_input_key, label: `${binding.module_input_key} → ${binding.node_id}.${binding.input_field}`, type: input?.input_type ?? "unknown", path: binding.module_input_key, origin: "module" }; });
  const mapping = step.input_mapping ?? {};
  return Object.entries(mapping).map(([key, value]) => ({ key, label: `${key} ← ${String(value)}`, type: inferType(key), path: String(value), origin: "mapping" }));
}
function describeStepOutputs(step: GenerationModuleStep, module: GenerationModule): Port[] {
  if (step.step_type === "workflow") return ((step.configuration?.output_bindings ?? []) as WorkflowOutputBinding[]).map(binding => { const output = module.outputs.find(item => item.key === binding.module_output_key); return { key: binding.module_output_key, label: `${binding.node_id} → ${binding.module_output_key}`, type: output?.output_type ?? "image", path: `${step.key}.${binding.module_output_key}`, origin: step.key }; });
  const mapping = step.output_mapping ?? {};
  return Object.keys(mapping).map(key => ({ key, label: key, type: inferType(key), path: `${step.key}.${key}`, origin: step.key }));
}
function inferType(key: string) { const value = key.toLowerCase(); if (value.includes("image") || value.includes("photo") || value.includes("mask")) return "image"; if (value.includes("file") || value.includes("path")) return "file"; if (value.includes("count") || value.includes("width") || value.includes("height")) return "integer"; return "json"; }
function suggestConnections(module: GenerationModule, previous: GenerationModuleStep | null, current: GenerationModuleStep) {
  const sources: Port[] = previous ? describeStepOutputs(previous, module) : module.inputs.map(input => ({ key: input.key, label: input.key, type: input.input_type, path: input.key, origin: "module" }));
  const targets = describeStepInputs(current, module);
  return targets.map(target => {
    const exact = sources.find(source => source.key === target.key);
    const sameType = sources.find(source => source.type === target.type || (source.type === "images" && target.type === "image"));
    const source = exact ?? sameType ?? sources[0];
    return source ? { target: target.key, source: source.path, confidence: exact ? "exact" : sameType ? "type" : "fallback" } : null;
  }).filter(Boolean) as { target: string; source: string; confidence: "exact" | "type" | "fallback" }[];
}

function ContractEditor({ module, setModule }: { module: GenerationModule; setModule: (module: GenerationModule) => void }) {
  const updateInput = (index: number, value: Partial<GenerationModuleInput>) => setModule({ ...module, inputs: module.inputs.map((item, current) => current === index ? { ...item, ...value } : item) });
  const updateOutput = (index: number, value: Partial<GenerationModuleOutput>) => setModule({ ...module, outputs: module.outputs.map((item, current) => current === index ? { ...item, ...value } : item) });
  return <div className="grid gap-5 xl:grid-cols-2"><Contract title="Entradas" onAdd={() => setModule({ ...module, inputs: [...module.inputs, emptyInput(module.inputs.length)] })}>{module.inputs.map((input, index) => <div key={input.id ?? index} className="grid gap-2 rounded-xl border border-white/5 p-3 md:grid-cols-[1fr_1fr_auto]"><input className="gm-input" value={input.key} onChange={e => updateInput(index, { key: e.target.value })}/><select className="gm-input" value={input.input_type} onChange={e => updateInput(index, { input_type: e.target.value as GenerationModuleInput["input_type"] })}>{inputTypes.map(type => <option key={type}>{type}</option>)}</select><button className="gm-delete" onClick={() => setModule({ ...module, inputs: module.inputs.filter((_, current) => current !== index).map((item, position) => ({ ...item, position })) })}><X size={15}/></button></div>)}</Contract><Contract title="Salidas" onAdd={() => setModule({ ...module, outputs: [...module.outputs, emptyOutput(module.outputs.length)] })}>{module.outputs.map((output, index) => <div key={output.id ?? index} className="grid gap-2 rounded-xl border border-white/5 p-3 md:grid-cols-[1fr_1fr_auto]"><input className="gm-input" value={output.key} onChange={e => updateOutput(index, { key: e.target.value })}/><select className="gm-input" value={output.output_type} onChange={e => updateOutput(index, { output_type: e.target.value as GenerationModuleOutput["output_type"] })}>{outputTypes.map(type => <option key={type}>{type}</option>)}</select><button className="gm-delete" onClick={() => setModule({ ...module, outputs: module.outputs.filter((_, current) => current !== index).map((item, position) => ({ ...item, position })) })}><X size={15}/></button></div>)}</Contract></div>;
}

function StepEditor({ module, target, onClose, onSaved }: { module: GenerationModule; target: NonNullable<EditorTarget>; onClose: () => void; onSaved: (module: GenerationModule) => void }) {
  return target.type === "workflow" ? <WorkflowStepEditor module={module} target={target} onClose={onClose} onSaved={onSaved}/> : <PythonStepEditor module={module} target={target} onClose={onClose} onSaved={onSaved}/>;
}
function WorkflowStepEditor({ module, target, onClose, onSaved }: { module: GenerationModule; target: NonNullable<EditorTarget>; onClose: () => void; onSaved: (module: GenerationModule) => void }) {
  const step = target.step; const config = step?.configuration ?? {};
  const [key, setKey] = useState(step?.key ?? `workflow_${module.steps.length + 1}`); const [name, setName] = useState(step?.name ?? "Workflow ComfyUI"); const [description, setDescription] = useState(step?.description ?? "");
  const [json, setJson] = useState(JSON.stringify(config.workflow ?? {}, null, 2)); const [inputs, setInputs] = useState<WorkflowInputBinding[]>((config.input_bindings ?? []) as WorkflowInputBinding[]); const [outputs, setOutputs] = useState<WorkflowOutputBinding[]>((config.output_bindings ?? []) as WorkflowOutputBinding[]); const [enabled, setEnabled] = useState(step?.is_enabled ?? true); const [busy, setBusy] = useState(false);
  const parsed = useMemo(() => { try { return JSON.parse(json); } catch { return null; } }, [json]);
  const autoDetect = () => {
    if (!parsed) return toast.error("El JSON no es válido.");
    const nodes = Object.entries(parsed) as [string, { class_type?: string; inputs?: Record<string, unknown> }][];
    const imageInputs = nodes.flatMap(([nodeId, node]) => Object.keys(node.inputs ?? {}).filter(field => /image|mask|photo/i.test(field)).map(field => ({ nodeId, field })));
    const nextInputs = module.inputs.map((input, index) => ({ module_input_key: input.key, node_id: imageInputs[index]?.nodeId ?? nodes[index]?.[0] ?? "", input_field: imageInputs[index]?.field ?? "image" })).filter(item => item.node_id);
    const outputNodes = nodes.filter(([, node]) => /saveimage|previewimage|vae decode/i.test(node.class_type ?? ""));
    const nextOutputs = module.outputs.map((output, index) => ({ module_output_key: output.key, node_id: outputNodes[index]?.[0] ?? outputNodes[0]?.[0] ?? "" })).filter(item => item.node_id);
    setInputs(nextInputs); setOutputs(nextOutputs); toast.success("Bindings sugeridos automáticamente. Revísalos antes de guardar.");
  };
  const save = async () => {
    if (!parsed) return toast.error("El JSON no es válido."); setBusy(true);
    try {
      const url = target.mode === "edit" ? `/api/admin/generation-modules/${module.id}/steps/${step!.id}/workflow` : `/api/admin/generation-modules/${module.id}/steps/workflow`;
      const body = target.mode === "edit" ? { name, description, workflow_name: name, workflow_json: parsed, input_bindings: inputs, output_bindings: outputs, is_enabled: enabled } : { key, name, description, position: module.steps.length, workflow_name: name, workflow_json: parsed, input_bindings: inputs, output_bindings: outputs, is_enabled: enabled };
      onSaved(await browserApiRequest<GenerationModule>(url, { method: target.mode === "edit" ? "PATCH" : "POST", body: JSON.stringify(body) })); toast.success(target.mode === "edit" ? "Workflow actualizado." : "Workflow agregado.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible guardar."); } finally { setBusy(false); }
  };
  return <ModalShell title={target.mode === "edit" ? "Editar Workflow" : "Agregar Workflow"} onClose={onClose}><div className="grid gap-3 md:grid-cols-2">{target.mode === "create" && <Field label="Clave"><input className="gm-input" value={key} onChange={e => setKey(e.target.value)}/></Field>}<Field label="Nombre"><input className="gm-input" value={name} onChange={e => setName(e.target.value)}/></Field></div><Field label="Descripción"><input className="gm-input" value={description} onChange={e => setDescription(e.target.value)}/></Field><div className="mt-4 flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">JSON API de ComfyUI</p><button onClick={autoDetect} className="gm-secondary"><Sparkles size={14}/>Detectar conexiones</button></div><textarea className="gm-input mt-2 min-h-64 py-3 font-mono text-xs" value={json} onChange={e => setJson(e.target.value)}/><Bindings module={module} inputs={inputs} setInputs={setInputs} outputs={outputs} setOutputs={setOutputs}/><label className="mt-4 flex items-center gap-2 text-sm text-zinc-400"><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)}/>Paso activo</label><button onClick={() => void save()} disabled={busy || !parsed} className="mt-5 h-11 w-full rounded-xl bg-red-600 font-semibold text-white disabled:opacity-40">{busy ? "Guardando..." : "Guardar Workflow"}</button></ModalShell>;
}
function Bindings({ module, inputs, setInputs, outputs, setOutputs }: { module: GenerationModule; inputs: WorkflowInputBinding[]; setInputs: (value: WorkflowInputBinding[]) => void; outputs: WorkflowOutputBinding[]; setOutputs: (value: WorkflowOutputBinding[]) => void }) { return <div className="mt-5 grid gap-4 xl:grid-cols-2"><Contract title="Entradas detectadas" onAdd={() => setInputs([...inputs, { module_input_key: module.inputs[0]?.key ?? "", node_id: "", input_field: "image" }])}>{inputs.map((item, index) => <div key={index} className="grid gap-2 rounded-xl border border-white/5 p-3"><select className="gm-input" value={item.module_input_key} onChange={e => setInputs(inputs.map((value, current) => current === index ? { ...value, module_input_key: e.target.value } : value))}>{module.inputs.map(input => <option key={input.key}>{input.key}</option>)}</select><div className="grid grid-cols-2 gap-2"><input className="gm-input" value={item.node_id} onChange={e => setInputs(inputs.map((value, current) => current === index ? { ...value, node_id: e.target.value } : value))} placeholder="node_id"/><input className="gm-input" value={item.input_field} onChange={e => setInputs(inputs.map((value, current) => current === index ? { ...value, input_field: e.target.value } : value))} placeholder="campo"/></div></div>)}</Contract><Contract title="Salidas detectadas" onAdd={() => setOutputs([...outputs, { module_output_key: module.outputs[0]?.key ?? "", node_id: "" }])}>{outputs.map((item, index) => <div key={index} className="grid gap-2 rounded-xl border border-white/5 p-3"><select className="gm-input" value={item.module_output_key} onChange={e => setOutputs(outputs.map((value, current) => current === index ? { ...value, module_output_key: e.target.value } : value))}>{module.outputs.map(output => <option key={output.key}>{output.key}</option>)}</select><input className="gm-input" value={item.node_id} onChange={e => setOutputs(outputs.map((value, current) => current === index ? { ...value, node_id: e.target.value } : value))} placeholder="node_id"/></div>)}</Contract></div>; }

function PythonStepEditor({ module, target, onClose, onSaved }: { module: GenerationModule; target: NonNullable<EditorTarget>; onClose: () => void; onSaved: (module: GenerationModule) => void }) {
  const step = target.step; const config = step?.configuration ?? {};
  const [key, setKey] = useState(step?.key ?? `python_${module.steps.length + 1}`); const [name, setName] = useState(step?.name ?? "Paso Python"); const [description, setDescription] = useState(step?.description ?? ""); const [entrypoint, setEntrypoint] = useState(String(config.entrypoint ?? "run")); const [source, setSource] = useState(String(config.source_code ?? "def run(inputs):\n    return inputs\n")); const [inputMapping, setInputMapping] = useState<Record<string, unknown>>(step?.input_mapping ?? {}); const [outputMapping, setOutputMapping] = useState<Record<string, unknown>>(step?.output_mapping ?? {}); const [enabled, setEnabled] = useState(step?.is_enabled ?? true); const [busy, setBusy] = useState(false);
  const available = useMemo(() => collectAvailablePorts(module, step), [module, step]);
  const applyTemplate = (kind: string) => { if (kind === "passthrough") { setSource("def run(inputs):\n    return inputs\n"); setOutputMapping({}); } else if (kind === "first_image") { setSource("def run(inputs):\n    files = inputs.get('files') or []\n    image = files[0] if files else inputs.get('image')\n    return {'image': image}\n"); setOutputMapping({ image: "image" }); } else { setSource("def run(inputs):\n    result = dict(inputs)\n    result['processed'] = True\n    return result\n"); setOutputMapping({ processed: "boolean" }); } };
  const autoMap = () => { const mapping: Record<string, unknown> = {}; available.slice(-4).forEach(port => { mapping[port.key] = port.path; }); setInputMapping(mapping); toast.success("Entradas sugeridas desde los pasos anteriores."); };
  const save = async () => { setBusy(true); try { const url = target.mode === "edit" ? `/api/admin/generation-modules/${module.id}/steps/${step!.id}/python` : `/api/admin/generation-modules/${module.id}/steps/python`; const body = target.mode === "edit" ? { name, description, source_code: source, entrypoint, timeout_seconds: Number(config.timeout_seconds ?? 300), input_mapping: inputMapping, output_mapping: outputMapping, is_enabled: enabled } : { key, name, description, position: module.steps.length, source_code: source, entrypoint, timeout_seconds: 300, input_mapping: inputMapping, output_mapping: outputMapping, is_enabled: enabled }; onSaved(await browserApiRequest<GenerationModule>(url, { method: target.mode === "edit" ? "PATCH" : "POST", body: JSON.stringify(body) })); toast.success(target.mode === "edit" ? "Python actualizado." : "Python agregado."); } catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible guardar."); } finally { setBusy(false); } };
  return <ModalShell title={target.mode === "edit" ? "Editar Python" : "Agregar Python"} onClose={onClose}><div className="grid gap-3 md:grid-cols-3">{target.mode === "create" && <Field label="Clave"><input className="gm-input" value={key} onChange={e => setKey(e.target.value)}/></Field>}<Field label="Nombre"><input className="gm-input" value={name} onChange={e => setName(e.target.value)}/></Field><Field label="Función"><input className="gm-input" value={entrypoint} onChange={e => setEntrypoint(e.target.value)}/></Field></div><Field label="Descripción"><input className="gm-input" value={description} onChange={e => setDescription(e.target.value)}/></Field><div className="mt-4 grid gap-4 xl:grid-cols-[1fr_240px]"><div><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Código</p><select className="gm-input max-w-52" defaultValue="" onChange={e => { if (e.target.value) applyTemplate(e.target.value); }}><option value="" disabled>Plantilla...</option><option value="passthrough">Devolver sin cambios</option><option value="first_image">Seleccionar primera imagen</option><option value="flag">Agregar indicador</option></select></div><textarea className="gm-input min-h-96 py-3 font-mono text-xs" value={source} onChange={e => setSource(e.target.value)}/></div><div><div className="mb-2 flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Datos disponibles</p><button onClick={autoMap} className="gm-icon" title="Mapear automáticamente"><Sparkles size={15}/></button></div><div className="max-h-96 space-y-2 overflow-y-auto rounded-xl border border-white/6 bg-black/20 p-3">{available.map(port => <button key={port.path} onClick={() => setInputMapping(current => ({ ...current, [port.key]: port.path }))} className="w-full rounded-lg border border-white/5 p-2 text-left hover:border-red-500/20"><p className="font-mono text-[11px] text-zinc-300">{port.path}</p><p className="mt-1 text-[10px] text-zinc-600">{port.type}</p></button>)}</div></div></div><JsonMapping title="Mapeo de entradas" value={inputMapping} onChange={setInputMapping}/><JsonMapping title="Salidas declaradas" value={outputMapping} onChange={setOutputMapping}/><label className="mt-4 flex items-center gap-2 text-sm text-zinc-400"><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)}/>Paso activo</label><button onClick={() => void save()} disabled={busy} className="mt-5 h-11 w-full rounded-xl bg-red-600 font-semibold text-white disabled:opacity-40">{busy ? "Guardando..." : "Guardar Python"}</button></ModalShell>;
}
function collectAvailablePorts(module: GenerationModule, current?: GenerationModuleStep) { const ordered = [...module.steps].sort((a, b) => a.position - b.position); const limit = current ? ordered.findIndex(item => item.id === current.id) : ordered.length; return [...module.inputs.map(input => ({ key: input.key, label: input.name, type: input.input_type, path: input.key, origin: "module" })), ...ordered.slice(0, limit).flatMap(step => describeStepOutputs(step, module))]; }
function JsonMapping({ title, value, onChange }: { title: string; value: Record<string, unknown>; onChange: (value: Record<string, unknown>) => void }) { const [text, setText] = useState(JSON.stringify(value, null, 2)); useEffect(() => setText(JSON.stringify(value, null, 2)), [value]); return <div className="mt-4"><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</p><textarea className="gm-input min-h-28 py-3 font-mono text-xs" value={text} onChange={e => { setText(e.target.value); try { onChange(JSON.parse(e.target.value)); } catch {} }}/></div>; }

function CreateModuleModal({ onClose, onCreated }: { onClose: () => void; onCreated: (module: GenerationModule) => void }) { const [form, setForm] = useState({ key: "", name: "", description: "", category: "tryon", default_execution_engine: "simulated" as GenerationExecutionEngine }); const [busy, setBusy] = useState(false); return <ModalShell title="Nuevo módulo" onClose={onClose}><div className="grid gap-4 md:grid-cols-2"><Field label="Clave"><input className="gm-input" value={form.key} onChange={e => setForm({ ...form, key: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, "-") })}/></Field><Field label="Nombre"><input className="gm-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></Field><Field label="Categoría"><input className="gm-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}/></Field><Field label="Motor"><select className="gm-input" value={form.default_execution_engine} onChange={e => setForm({ ...form, default_execution_engine: e.target.value as GenerationExecutionEngine })}>{engines.map(engine => <option key={engine.value} value={engine.value}>{engine.label}</option>)}</select></Field></div><button disabled={busy || form.key.length < 2 || form.name.length < 2} onClick={async () => { setBusy(true); try { onCreated(await browserApiRequest<GenerationModule>("/api/admin/generation-modules", { method: "POST", body: JSON.stringify({ ...form, version: 1, is_active: true, metadata: {}, inputs: [], outputs: [], steps: [] }) })); } finally { setBusy(false); } }} className="mt-5 h-11 w-full rounded-xl bg-red-600 font-semibold text-white disabled:opacity-40">Crear módulo</button></ModalShell>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-600">{label}</span>{children}</label>; }
function Contract({ title, onAdd, children }: { title: string; onAdd: () => void; children: React.ReactNode }) { return <div><div className="mb-3 flex items-center justify-between"><h3 className="text-xs font-semibold uppercase tracking-[.18em] text-zinc-500">{title}</h3><button onClick={onAdd} className="gm-secondary"><Plus size={14}/>Agregar</button></div><div className="space-y-2 rounded-2xl border border-white/6 bg-white/[.015] p-3">{children}</div></div>; }
function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"><div className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0b0b0d] shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/7 bg-[#0b0b0d]/95 p-5"><h2 className="text-xl font-semibold text-white">{title}</h2><button onClick={onClose} className="gm-icon"><X size={18}/></button></div><div className="p-5">{children}</div></div></div>; }
