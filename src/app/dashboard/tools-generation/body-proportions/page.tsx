"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { BetweenHorizontalStart, ChevronDown, ChevronUp, CirclePlus, Cpu, FileJson, Image as ImageIcon, LoaderCircle, Play, Plus, Save, Trash2, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { BodyProportionConfig, BodyProportionGeneration, BodyProportionPreset, BodyProportionPresetList, BodySex, WorkflowMapping } from "@/types/body-proportion-tools";

const API = "/api/admin/tools-generation/body-proportions";
const mapKeys = ["hips_size", "fat_thin", "breasts_size", "skin_tone", "hair_length", "category_name", "sex"] as const;

const defaults: BodyProportionConfig = {
  id: null, sex: "woman", workflow: null, input_mapping: {},
  limits: { hips_min: 0, hips_max: 9, breasts_min: null, breasts_max: 1.5, fat_thin_min: -1.5, fat_thin_max: 1.8, skin_tone_min: -5, skin_tone_max: 5 },
  formula: { fat_step: 0, hips_step: 0, breasts_step: 0, fat_to_hips: 0, fat_to_breasts: 0, hips_to_breasts: 0 },
  fixed_values: { skin_tone: 0, hair_length: 0 }, is_enabled: false, notes: null, created_at: null, updated_at: null,
};

function n(value: string): number { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; }

export default function BodyProportionGeneratorPage() {
  const [sex, setSex] = useState<BodySex>("woman");
  const [config, setConfig] = useState<BodyProportionConfig>({ ...defaults });
  const [presets, setPresets] = useState<BodyProportionPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [generating, setGenerating] = useState<Set<number>>(new Set());
  const [workflowOpen, setWorkflowOpen] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cfg, list] = await Promise.all([
        browserApiRequest<BodyProportionConfig>(`${API}/config/${sex}`),
        browserApiRequest<BodyProportionPresetList>(`${API}/presets?sex=${sex}`),
      ]);
      setConfig(cfg); setPresets(list.items);
    } catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible cargar el generador."); }
    finally { setLoading(false); }
  }, [sex]);

  useEffect(() => { void load(); }, [load]);

  const workflowNodes = useMemo(() => Object.entries(config.workflow ?? {}).map(([id, raw]) => {
    const node = raw as { class_type?: string; _meta?: { title?: string }; inputs?: Record<string, unknown> };
    return { id, label: `${id} · ${node._meta?.title ?? node.class_type ?? "Node"}`, inputs: Object.keys(node.inputs ?? {}) };
  }), [config.workflow]);

  const uploadWorkflow = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      const workflow = JSON.parse(await file.text()) as Record<string, unknown>;
      setConfig(current => ({ ...current, workflow }));
      toast.success(`Workflow API cargado: ${file.name}`);
    } catch { toast.error("El archivo no contiene JSON válido."); }
    finally { event.target.value = ""; }
  };

  const saveConfig = async () => {
    setSavingConfig(true);
    try {
      const saved = await browserApiRequest<BodyProportionConfig>(`${API}/config/${sex}`, {
        method: "PUT", body: JSON.stringify({ workflow: config.workflow, input_mapping: config.input_mapping, limits: config.limits, formula: config.formula, fixed_values: config.fixed_values, is_enabled: config.is_enabled, notes: config.notes }),
      });
      setConfig(saved); toast.success("Configuración del generador guardada.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible guardar."); }
    finally { setSavingConfig(false); }
  };

  const addPreset = async () => {
    try {
      const created = await browserApiRequest<BodyProportionPreset>(`${API}/presets`, {
        method: "POST", body: JSON.stringify({ sex, display_name: null, hips_size: 0, fat_thin: config.fixed_values.fat_thin ?? 0, breasts_size: 0, skin_tone: config.fixed_values.skin_tone ?? 0, hair_length: config.fixed_values.hair_length ?? 0 }),
      });
      setPresets(current => [...current, created]);
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo crear el perfil."); }
  };

  const savePreset = async (preset: BodyProportionPreset) => {
    try {
      const saved = await browserApiRequest<BodyProportionPreset>(`${API}/presets/${preset.id}`, { method: "PATCH", body: JSON.stringify({ display_name: preset.display_name, sort_order: preset.sort_order, hips_size: preset.hips_size, fat_thin: preset.fat_thin, breasts_size: preset.breasts_size, skin_tone: preset.skin_tone, hair_length: preset.hair_length }) });
      setPresets(current => current.map(item => item.id === saved.id ? saved : item));
      toast.success(`${saved.profile_key} guardado.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo guardar el perfil."); }
  };

  const generate = async (preset: BodyProportionPreset) => {
    setGenerating(current => new Set(current).add(preset.id));
    try {
      await savePreset(preset);
      const result = await browserApiRequest<BodyProportionGeneration>(`${API}/presets/${preset.id}/generate`, { method: "POST" });
      setPresets(current => current.map(item => item.id === preset.id ? result.preset : item));
      toast.success(`${preset.profile_key} generado${result.overwritten ? " y sobrescrito" : ""}.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "La generación falló."); await load(); }
    finally { setGenerating(current => { const next = new Set(current); next.delete(preset.id); return next; }); }
  };

  const generateAll = async () => { for (const preset of presets) await generate(preset); };

  const createNext = async (preset: BodyProportionPreset) => {
    try {
      const row = await browserApiRequest<BodyProportionPreset>(`${API}/presets/${preset.id}/next`, { method: "POST", body: JSON.stringify({ display_name: null }) });
      await load(); toast.success(`${row.profile_key} creado con la fórmula de compensación.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo crear el siguiente nivel."); }
  };

  const interpolate = async (index: number) => {
    const before = presets[index], after = presets[index + 1]; if (!before || !after) return;
    try {
      await browserApiRequest(`${API}/presets/interpolate`, { method: "POST", body: JSON.stringify({ before_id: before.id, after_id: after.id, ratio: 0.5 }) });
      await load(); toast.success("Nivel intermedio insertado.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo insertar el intermedio."); }
  };

  const remove = async (preset: BodyProportionPreset) => {
    if (!window.confirm(`¿Eliminar ${preset.profile_key}?`)) return;
    try { await browserApiRequest(`${API}/presets/${preset.id}`, { method: "DELETE" }); await load(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo eliminar."); }
  };

  const patchRow = (id: number, patch: Partial<BodyProportionPreset>) => setPresets(current => current.map(row => row.id === id ? { ...row, ...patch } : row));
  const patchMap = (key: string, patch: Partial<{node_id:string; input_name:string}>) => setConfig(current => ({ ...current, input_mapping: { ...current.input_mapping, [key]: { node_id: current.input_mapping[key]?.node_id ?? "", input_name: current.input_mapping[key]?.input_name ?? "", ...patch } } }));

  if (loading) return <div className="flex min-h-[520px] items-center justify-center"><LoaderCircle className="animate-spin text-red-500" size={30}/></div>;

  return <div className="space-y-6 pb-16">
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-[.28em] text-red-400">Tools Generation</p><h1 className="mt-2 text-3xl font-semibold text-white">Generador de proporciones corporales</h1><p className="mt-2 max-w-4xl text-sm text-zinc-500">Herramienta administrativa aislada. Ejecuta únicamente ComfyUI local, guarda la plantilla en BD, usa el proveedor de almacenamiento activo y conserva un espejo por carpetas.</p></div>
      <div className="flex flex-wrap gap-2"><button onClick={addPreset} className="bp-secondary"><Plus size={16}/>Nueva fila</button><button onClick={generateAll} disabled={!presets.length || generating.size>0} className="bp-primary"><Play size={16}/>Generar todas</button></div>
    </header>

    <div className="flex gap-2 rounded-2xl border border-white/7 bg-black/20 p-1.5 w-fit">
      {(["woman","man"] as BodySex[]).map(value => <button key={value} onClick={() => setSex(value)} className={`rounded-xl px-5 py-2 text-sm font-semibold ${sex===value ? "bg-red-600 text-white" : "text-zinc-500 hover:text-white"}`}>{value === "woman" ? "Mujer" : "Hombre"}</button>)}
    </div>

    <section className="luxia-panel rounded-3xl overflow-hidden">
      <button onClick={()=>setWorkflowOpen(v=>!v)} className="flex w-full items-center justify-between border-b border-white/6 p-5 text-left"><div className="flex items-center gap-3"><Cpu className="text-red-400"/><div><h2 className="font-semibold text-white">Workflow API · {sex === "woman" ? "Mujer" : "Hombre"}</h2><p className="text-xs text-zinc-600">Solo proveedor local. El workflow de hombre puede quedar preparado y desactivado.</p></div></div>{workflowOpen?<ChevronUp/>:<ChevronDown/>}</button>
      {workflowOpen && <div className="space-y-6 p-5">
        <div className="flex flex-wrap items-center gap-3"><label className="bp-secondary cursor-pointer"><FileJson size={16}/>{config.workflow ? "Reemplazar workflow API" : "Cargar workflow API"}<input type="file" accept=".json,application/json" className="hidden" onChange={uploadWorkflow}/></label><span className={`rounded-full px-3 py-1 text-xs ${config.workflow ? "bg-emerald-500/10 text-emerald-300" : "bg-zinc-800 text-zinc-500"}`}>{config.workflow ? `${workflowNodes.length} nodos cargados` : "Sin workflow"}</span><label className="ml-auto flex items-center gap-2 text-sm text-zinc-400"><input type="checkbox" checked={config.is_enabled} onChange={e=>setConfig(c=>({...c,is_enabled:e.target.checked}))}/>Habilitado</label></div>
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">{mapKeys.map(key => { const mapped=config.input_mapping[key]??{node_id:"",input_name:""}; const node=workflowNodes.find(item=>item.id===mapped.node_id); return <div key={key} className="rounded-2xl border border-white/7 bg-black/20 p-3"><p className="mb-2 font-mono text-xs text-red-300">{key}</p><select value={mapped.node_id} onChange={e=>patchMap(key,{node_id:e.target.value,input_name:""})} className="bp-input"><option value="">No mapear</option>{workflowNodes.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select><select value={mapped.input_name} onChange={e=>patchMap(key,{input_name:e.target.value})} className="bp-input mt-2"><option value="">Input...</option>{node?.inputs.map(input=><option key={input} value={input}>{input}</option>)}</select></div>})}</div>

        <div className="grid gap-5 xl:grid-cols-3">
          <ConfigCard title="Límites duros"><NumberSetting label="Hips min" value={config.limits.hips_min} onChange={v=>setConfig(c=>({...c,limits:{...c.limits,hips_min:v}}))}/><NumberSetting label="Hips max" value={config.limits.hips_max} onChange={v=>setConfig(c=>({...c,limits:{...c.limits,hips_max:v}}))}/><NumberSetting label="Breasts min (opcional)" value={config.limits.breasts_min} nullable onChange={v=>setConfig(c=>({...c,limits:{...c.limits,breasts_min:v}}))}/><NumberSetting label="Breasts max" value={config.limits.breasts_max} onChange={v=>setConfig(c=>({...c,limits:{...c.limits,breasts_max:v}}))}/><NumberSetting label="Fat min" value={config.limits.fat_thin_min} onChange={v=>setConfig(c=>({...c,limits:{...c.limits,fat_thin_min:v}}))}/><NumberSetting label="Fat max" value={config.limits.fat_thin_max} onChange={v=>setConfig(c=>({...c,limits:{...c.limits,fat_thin_max:v}}))}/></ConfigCard>
          <ConfigCard title="Siguiente escalón"><NumberSetting label="Δ fat_thin" value={config.formula.fat_step} onChange={v=>setConfig(c=>({...c,formula:{...c.formula,fat_step:v??0}}))}/><NumberSetting label="Δ hips base" value={config.formula.hips_step} onChange={v=>setConfig(c=>({...c,formula:{...c.formula,hips_step:v??0}}))}/><NumberSetting label="Δ breasts base" value={config.formula.breasts_step} onChange={v=>setConfig(c=>({...c,formula:{...c.formula,breasts_step:v??0}}))}/><NumberSetting label="Fat → Hips" value={config.formula.fat_to_hips} onChange={v=>setConfig(c=>({...c,formula:{...c.formula,fat_to_hips:v??0}}))}/><NumberSetting label="Fat → Breasts" value={config.formula.fat_to_breasts} onChange={v=>setConfig(c=>({...c,formula:{...c.formula,fat_to_breasts:v??0}}))}/><NumberSetting label="Hips → Breasts" value={config.formula.hips_to_breasts} onChange={v=>setConfig(c=>({...c,formula:{...c.formula,hips_to_breasts:v??0}}))}/></ConfigCard>
          <ConfigCard title="Valores fijos"><NumberSetting label="Skin tone" value={config.fixed_values.skin_tone} onChange={v=>setConfig(c=>({...c,fixed_values:{...c.fixed_values,skin_tone:v??0}}))}/><NumberSetting label="Hair length" value={config.fixed_values.hair_length} onChange={v=>setConfig(c=>({...c,fixed_values:{...c.fixed_values,hair_length:v??0}}))}/><p className="mt-3 text-xs leading-5 text-zinc-600">Por ahora quedan fijos. Cada fila conserva sus valores, pero puedes editarlos si necesitas una excepción.</p></ConfigCard>
        </div>
        <div className="flex justify-end"><button onClick={saveConfig} disabled={savingConfig} className="bp-primary">{savingConfig?<LoaderCircle className="animate-spin" size={16}/>:<Save size={16}/>}Guardar configuración</button></div>
      </div>}
    </section>

    <section className="space-y-3">
      <div className="flex items-end justify-between"><div><p className="text-xs uppercase tracking-[.2em] text-zinc-600">Escalera dinámica</p><h2 className="mt-1 text-xl font-semibold text-white">Perfiles {sex === "woman" ? "de mujer" : "de hombre"}</h2></div><span className="text-xs text-zinc-600">{presets.length} filas · nombres internos estables</span></div>
      {presets.length===0 && <div className="luxia-panel rounded-3xl p-12 text-center"><WandSparkles className="mx-auto text-zinc-800" size={40}/><p className="mt-4 text-white">Aún no hay perfiles.</p><button onClick={addPreset} className="bp-primary mt-5"><CirclePlus size={16}/>Crear el primero</button></div>}
      {presets.map((preset,index)=><div key={preset.id}>
        <PresetRow preset={preset} busy={generating.has(preset.id)} patch={patch=>patchRow(preset.id,patch)} save={()=>savePreset(preset)} generate={()=>generate(preset)} next={()=>createNext(preset)} remove={()=>remove(preset)}/>
        {index<presets.length-1 && <div className="flex h-11 items-center justify-center"><button onClick={()=>interpolate(index)} className="inline-flex items-center gap-2 rounded-full border border-dashed border-white/10 bg-black/20 px-3 py-1.5 text-[11px] text-zinc-600 hover:border-red-500/30 hover:text-red-300"><BetweenHorizontalStart size={13}/>Insertar nivel intermedio 50%</button></div>}
      </div>)}
    </section>
    <style jsx global>{`.bp-primary{display:inline-flex;height:42px;align-items:center;gap:8px;border-radius:12px;background:#dc2626;padding:0 16px;font-size:14px;font-weight:600;color:white}.bp-primary:hover{background:#ef4444}.bp-primary:disabled{opacity:.45}.bp-secondary{display:inline-flex;height:42px;align-items:center;gap:8px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.25);padding:0 14px;font-size:13px;font-weight:600;color:#d4d4d8}.bp-secondary:hover{border-color:rgba(239,68,68,.3);color:white}.bp-input{height:38px;width:100%;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:#09090b;padding:0 10px;font-size:12px;color:#e4e4e7;outline:none}.bp-input:focus{border-color:rgba(239,68,68,.45)}`}</style>
  </div>;
}

function ConfigCard({title,children}:{title:string;children:ReactNode}) { return <div className="rounded-2xl border border-white/7 bg-black/20 p-4"><h3 className="mb-3 text-sm font-semibold text-white">{title}</h3><div className="grid grid-cols-2 gap-3">{children}</div></div>; }
function NumberSetting({label,value,onChange,nullable=false}:{label:string;value:number|null|undefined;onChange:(v:number|null)=>void;nullable?:boolean}) { return <label className="block"><span className="mb-1 block text-[10px] uppercase tracking-[.12em] text-zinc-600">{label}</span><input type="number" step="0.01" value={value??""} onChange={e=>onChange(e.target.value===""&&nullable?null:n(e.target.value))} className="bp-input"/></label>; }

function PresetRow({preset,busy,patch,save,generate,next,remove}:{preset:BodyProportionPreset;busy:boolean;patch:(p:Partial<BodyProportionPreset>)=>void;save:()=>void;generate:()=>void;next:()=>void;remove:()=>void}) {
  const img = preset.image_storage_file_id ? `/api/admin/storage/files/${preset.image_storage_file_id}/content` : null;
  return <div className={`luxia-panel grid gap-4 rounded-3xl p-4 xl:grid-cols-[160px_170px_minmax(0,1fr)_auto] ${preset.status==="error"?"border border-red-500/25":""}`}>
    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/7 bg-black/35">{img?<img src={img} alt={preset.display_name} className="h-full w-full object-cover"/>:<div className="flex h-full flex-col items-center justify-center text-zinc-800"><ImageIcon/><span className="mt-2 text-[10px]">Sin preview</span></div>}{busy&&<div className="absolute inset-0 flex items-center justify-center bg-black/70"><LoaderCircle className="animate-spin text-red-400"/></div>}</div>
    <div><div className="flex items-center gap-2"><span className="rounded-full bg-red-500/10 px-2.5 py-1 font-mono text-xs text-red-300">{preset.profile_key}</span><span className={`h-2 w-2 rounded-full ${preset.status==="ready"?"bg-emerald-400":preset.status==="error"?"bg-red-400":"bg-zinc-600"}`}/></div><input value={preset.display_name} onChange={e=>patch({display_name:e.target.value})} className="bp-input mt-3"/><p className="mt-3 break-all text-[10px] text-zinc-700">{preset.category_slug}</p>{preset.local_mirror_path&&<p className="mt-2 break-all text-[10px] text-zinc-700">{preset.local_mirror_path}</p>}</div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5"><Mini label="Hips" value={preset.hips_size} onChange={v=>patch({hips_size:v})}/><Mini label="Fat / Thin" value={preset.fat_thin} onChange={v=>patch({fat_thin:v})}/><Mini label="Breasts" value={preset.breasts_size} onChange={v=>patch({breasts_size:v})}/><Mini label="Skin" value={preset.skin_tone} onChange={v=>patch({skin_tone:v})}/><Mini label="Hair" value={preset.hair_length} onChange={v=>patch({hair_length:v})}/>{preset.last_error&&<p className="col-span-full text-xs text-red-400">{preset.last_error}</p>}</div>
    <div className="flex flex-row flex-wrap content-start gap-2 xl:w-44 xl:flex-col"><button onClick={generate} disabled={busy} className="bp-primary justify-center">{busy?<LoaderCircle className="animate-spin" size={15}/>:<Play size={15}/>}Generar fila</button><button onClick={save} className="bp-secondary justify-center"><Save size={15}/>Guardar</button><button onClick={next} className="bp-secondary justify-center"><Plus size={15}/>Siguiente compensado</button><button onClick={remove} className="bp-secondary justify-center text-red-300"><Trash2 size={15}/>Eliminar</button></div>
  </div>;
}
function Mini({label,value,onChange}:{label:string;value:number;onChange:(v:number)=>void}) { return <label><span className="mb-1 block text-[10px] uppercase tracking-[.12em] text-zinc-600">{label}</span><input type="number" step="0.01" value={value} onChange={e=>onChange(n(e.target.value))} className="bp-input"/></label>; }
