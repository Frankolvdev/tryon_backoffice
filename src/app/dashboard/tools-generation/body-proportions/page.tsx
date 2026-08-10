"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { BetweenHorizontalStart, ChevronDown, ChevronUp, FileJson, Image as ImageIcon, LoaderCircle, Play, RefreshCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { BodyProportionConfig, BodyProportionGeneration, BodyProportionPreset, BodyProportionPresetList, BodyProportionStorageOptions, BodySex } from "@/types/body-proportion-tools";

const API = "/api/admin/tools-generation/body-proportions";
const mapKeys = ["hips_size", "fat_thin", "breasts_size", "skin_tone", "hair_length", "category_name", "sex"] as const;
const FAT_ORDER = ["low", "medium", "high"] as const;
const ASS_ORDER = ["small", "medium", "big", "huge"] as const;
const BREAST_ORDER = ["small", "medium", "big", "huge"] as const;

const defaults: BodyProportionConfig = {
  id: null,
  sex: "woman",
  workflow: null,
  input_mapping: {},
  limits: { hips_min: 0, hips_max: 9, breasts_min: null, breasts_max: 1.5, fat_thin_min: -1.5, fat_thin_max: 1.8, skin_tone_min: -5, skin_tone_max: 5 },
  formula: {
    fat_levels: {
      low: { label: "Low Fat", fat_thin: 1, hips_compensation: 0, breasts_compensation: 0 },
      medium: { label: "Medium Fat", fat_thin: 0, hips_compensation: 0, breasts_compensation: 0 },
      high: { label: "High Fat", fat_thin: -1, hips_compensation: 0, breasts_compensation: 0 },
    },
    ass_levels: {
      small: { label: "Small Ass", hips_size: 0 }, medium: { label: "Medium Ass", hips_size: 3 },
      big: { label: "Big Ass", hips_size: 6 }, huge: { label: "Huge Ass", hips_size: 7 },
    },
    breast_levels: {
      small: { label: "Small Breast", base: 0 }, medium: { label: "Medium Breast", base: 0.5 },
      big: { label: "Big Breast", base: 1 }, huge: { label: "Huge Breast", base: 1.5 },
    },
    ass_breast_compensation: {
      small: { small: 0, medium: 0, big: 0, huge: 0 },
      medium: { small: 0, medium: -0.2, big: -0.2, huge: -0.2 },
      big: { small: -0.2, medium: -0.4, big: -0.4, huge: -0.4 },
      huge: { small: -0.2, medium: -0.4, big: -0.4, huge: -0.4 },
    },
  },
  fixed_values: { skin_tone: 3, hair_length: 3.5 },
  storage_mode: "auto",
  is_enabled: false,
  notes: null,
  created_at: null,
  updated_at: null,
};

function num(value: string) { const n = Number(value); return Number.isFinite(n) ? n : 0; }

export default function BodyProportionGeneratorPage() {
  const [sex, setSex] = useState<BodySex>("woman");
  const [config, setConfig] = useState<BodyProportionConfig>(defaults);
  const [presets, setPresets] = useState<BodyProportionPreset[]>([]);
  const [storage, setStorage] = useState<BodyProportionStorageOptions>({ active_provider: "local", modes: ["auto", "local", "amazon_s3", "cloudflare_r2"] });
  const [loading, setLoading] = useState(true);
  const [workflowOpen, setWorkflowOpen] = useState(true);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [generating, setGenerating] = useState<Set<number>>(new Set());
  const [fromId, setFromId] = useState<number | "">("");
  const [toId, setToId] = useState<number | "">("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cfg, list, storageOptions] = await Promise.all([
        browserApiRequest<BodyProportionConfig>(`${API}/config/${sex}`),
        browserApiRequest<BodyProportionPresetList>(`${API}/presets?sex=${sex}`),
        browserApiRequest<BodyProportionStorageOptions>(`${API}/storage-options`),
      ]);
      setConfig(cfg); setPresets(list.items); setStorage(storageOptions);
    } catch (e) { toast.error(e instanceof Error ? e.message : "No se pudo cargar la herramienta."); }
    finally { setLoading(false); }
  }, [sex]);

  useEffect(() => { void load(); }, [load]);

  const workflowNodes = useMemo(() => Object.entries(config.workflow ?? {}).map(([id, raw]) => {
    const node = raw as { class_type?: string; _meta?: { title?: string }; inputs?: Record<string, unknown> };
    return { id, label: `${id} · ${node._meta?.title ?? node.class_type ?? "Node"}`, inputs: Object.keys(node.inputs ?? {}) };
  }), [config.workflow]);

  const uploadWorkflow = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const workflow = JSON.parse(text);

      setConfig((c) => ({
        ...c,
        workflow,
      }));

      toast.success(`Workflow cargado: ${file.name}`);
    } catch {
      toast.error("El JSON del workflow no es válido.");
    } finally {
      event.target.value = "";
    }
  };

  const saveConfig = async () => {
    try {
      const saved = await browserApiRequest<BodyProportionConfig>(`${API}/config/${sex}`, {
        method: "PUT",
        body: JSON.stringify({ workflow: config.workflow, input_mapping: config.input_mapping, limits: config.limits, formula: config.formula, fixed_values: config.fixed_values, storage_mode: config.storage_mode, is_enabled: config.is_enabled, notes: config.notes }),
      });
      setConfig(saved); toast.success("Configuración guardada.");
    } catch (e) { toast.error(e instanceof Error ? e.message : "No se pudo guardar."); }
  };

  const seed48 = async () => {
    try {
      const r = await browserApiRequest<{created:number;existing:number;total_base:number}>(`${API}/presets/seed-defaults?sex=${sex}`, { method: "POST" });
      await load(); toast.success(`${r.total_base} categorías base listas · ${r.created} nuevas.`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "No se pudo crear la malla base."); }
  };

  const recalc = async () => {
    try {
      const r = await browserApiRequest<{updated:number;skipped_ready:number}>(`${API}/presets/recalculate-defaults?sex=${sex}`, { method: "POST", body: JSON.stringify({ include_ready: false }) });
      await load(); toast.success(`${r.updated} presets pendientes recalculados. ${r.skipped_ready} generados se conservaron.`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "No se pudo recalcular."); }
  };

  const savePreset = async (p: BodyProportionPreset) => {
    const saved = await browserApiRequest<BodyProportionPreset>(`${API}/presets/${p.id}`, { method: "PATCH", body: JSON.stringify({ display_name: p.display_name, hips_size: p.hips_size, fat_thin: p.fat_thin, breasts_size: p.breasts_size, skin_tone: p.skin_tone, hair_length: p.hair_length }) });
    setPresets(list => list.map(x => x.id === saved.id ? saved : x));
    return saved;
  };

  const generate = async (p: BodyProportionPreset) => {
    setGenerating(s => new Set(s).add(p.id));
    try {
      await savePreset(p);
      const r = await browserApiRequest<BodyProportionGeneration>(`${API}/presets/${p.id}/generate`, { method: "POST" });
      setPresets(list => list.map(x => x.id === p.id ? r.preset : x));
      toast.success(`${p.display_name}${r.overwritten ? " regenerado" : " generado"}.`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Falló la generación."); }
    finally { setGenerating(s => { const n = new Set(s); n.delete(p.id); return n; }); }
  };

  const generateList = async (rows: BodyProportionPreset[]) => { for (const row of rows) await generate(row); };
  const patch = (id:number, change:Partial<BodyProportionPreset>) => setPresets(list => list.map(x => x.id===id ? {...x,...change}:x));

  const interpolate = async () => {
    if (!fromId || !toId || fromId === toId) return toast.error("Selecciona dos presets distintos.");
    try {
      await browserApiRequest(`${API}/presets/interpolate`, { method: "POST", body: JSON.stringify({ before_id: fromId, after_id: toId, ratio: 0.5 }) });
      await load(); toast.success("Preset intermedio 50% creado.");
    } catch (e) { toast.error(e instanceof Error ? e.message : "No se pudo crear el intermedio."); }
  };

  const patchMapping = (key:string, field:"node_id"|"input_name", value:string) => setConfig(c => ({ ...c, input_mapping: { ...c.input_mapping, [key]: { node_id: c.input_mapping[key]?.node_id ?? "", input_name: c.input_mapping[key]?.input_name ?? "", [field]: value } } }));

  const base = presets.filter(p => p.is_base_category);
  const custom = presets.filter(p => !p.is_base_category);

  if (loading) return <div className="flex min-h-[520px] items-center justify-center"><LoaderCircle className="animate-spin text-red-500"/></div>;

  return <div className="space-y-6 pb-16">
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-[.28em] text-red-400">Tools Generation</p><h1 className="mt-2 text-3xl font-semibold text-white">Generador de proporciones corporales</h1><p className="mt-2 max-w-4xl text-sm text-zinc-500">48 categorías base + presets intermedios. La generación usa únicamente ComfyUI local. El almacenamiento puede seguir la regla global o forzarse solo para esta herramienta.</p></div>
      <div className="flex flex-wrap gap-2"><button onClick={seed48} className="bp-secondary">Inicializar 48 categorías</button><button onClick={recalc} className="bp-secondary"><RefreshCcw size={15}/>Recalcular pendientes</button><button onClick={()=>generateList(base.filter(x=>x.status!=="ready"))} disabled={generating.size>0} className="bp-primary"><Play size={15}/>Generar pendientes</button></div>
    </header>

    <div className="flex w-fit gap-2 rounded-2xl border border-white/7 bg-black/20 p-1.5">{(["woman","man"] as BodySex[]).map(v=><button key={v} onClick={()=>setSex(v)} className={`rounded-xl px-5 py-2 text-sm font-semibold ${sex===v?"bg-red-600 text-white":"text-zinc-500 hover:text-white"}`}>{v==="woman"?"Mujer":"Hombre"}</button>)}</div>

    <section className="luxia-panel overflow-hidden rounded-3xl">
      <button onClick={()=>setWorkflowOpen(v=>!v)} className="flex w-full items-center justify-between border-b border-white/6 p-5"><div className="text-left"><h2 className="font-semibold text-white">Workflow y almacenamiento</h2><p className="text-xs text-zinc-600">Workflow API independiente por sexo · proveedor de ejecución siempre local.</p></div>{workflowOpen?<ChevronUp/>:<ChevronDown/>}</button>
      {workflowOpen&&<div className="space-y-5 p-5">
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/7 bg-black/20 p-4"><h3 className="text-sm font-semibold text-white">Workflow API</h3><label className="bp-secondary mt-3 cursor-pointer"><FileJson size={15}/>{config.workflow?"Reemplazar workflow":"Cargar workflow"}<input type="file" accept=".json" className="hidden" onChange={uploadWorkflow}/></label><label className="mt-4 flex items-center gap-2 text-xs text-zinc-400"><input type="checkbox" checked={config.is_enabled} onChange={e=>setConfig(c=>({...c,is_enabled:e.target.checked}))}/>Workflow habilitado</label></div>
          <div className="rounded-2xl border border-white/7 bg-black/20 p-4"><h3 className="text-sm font-semibold text-white">Destino de almacenamiento</h3><select value={config.storage_mode} onChange={e=>setConfig(c=>({...c,storage_mode:e.target.value as BodyProportionConfig["storage_mode"]}))} className="bp-input mt-3"><option value="auto">Auto · configuración global ({storage.active_provider})</option><option value="local">Local</option><option value="amazon_s3">Amazon S3</option><option value="cloudflare_r2">Cloudflare R2</option></select><p className="mt-3 text-xs leading-5 text-zinc-600">Auto no cambia nada de la plataforma: consulta el proveedor global activo. Las otras opciones son override exclusivo de esta herramienta.</p></div>
          <div className="rounded-2xl border border-white/7 bg-black/20 p-4"><h3 className="text-sm font-semibold text-white">Valores fijos</h3><div className="mt-3 grid grid-cols-2 gap-3"><Field label="Skin Tone" value={config.fixed_values.skin_tone??0} onChange={v=>setConfig(c=>({...c,fixed_values:{...c.fixed_values,skin_tone:v}}))}/><Field label="Hair Length" value={config.fixed_values.hair_length??0} onChange={v=>setConfig(c=>({...c,fixed_values:{...c.fixed_values,hair_length:v}}))}/></div></div>
        </div>

        {config.workflow&&<div className="rounded-2xl border border-white/7 bg-black/20 p-4"><h3 className="text-sm font-semibold text-white">Mapeo de inputs ComfyUI</h3><div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{mapKeys.map(key=>{const m=config.input_mapping[key]; const node=workflowNodes.find(x=>x.id===m?.node_id); return <div key={key} className="rounded-xl border border-white/6 p-3"><p className="mb-2 text-xs font-medium text-zinc-300">{key}</p><select value={m?.node_id??""} onChange={e=>patchMapping(key,"node_id",e.target.value)} className="bp-input"><option value="">Sin mapear</option>{workflowNodes.map(n=><option key={n.id} value={n.id}>{n.label}</option>)}</select><select value={m?.input_name??""} onChange={e=>patchMapping(key,"input_name",e.target.value)} className="bp-input mt-2"><option value="">Input</option>{(node?.inputs??[]).map(i=><option key={i} value={i}>{i}</option>)}</select></div>})}</div></div>}

        <div className="flex justify-end"><button onClick={saveConfig} className="bp-primary"><Save size={15}/>Guardar configuración</button></div>
      </div>}
    </section>

    <section className="luxia-panel overflow-hidden rounded-3xl">
      <button onClick={()=>setRulesOpen(v=>!v)} className="flex w-full items-center justify-between p-5"><div className="text-left"><h2 className="font-semibold text-white">Reglas de cálculo</h2><p className="text-xs text-zinc-600">Low Fat está calibrado con tus 13 presets. Medium/High Fat son compensaciones iniciales editables.</p></div>{rulesOpen?<ChevronUp/>:<ChevronDown/>}</button>
      {rulesOpen&&<div className="space-y-5 border-t border-white/6 p-5">
        <div className="grid gap-4 xl:grid-cols-3">{FAT_ORDER.map(k=>{const f=config.formula.fat_levels[k]; return <div key={k} className="rounded-2xl border border-white/7 bg-black/20 p-4"><h3 className="font-semibold text-white">{f.label}</h3><div className="mt-3 grid grid-cols-3 gap-2"><Field label="Fat/Thin" value={f.fat_thin} onChange={v=>setConfig(c=>({...c,formula:{...c.formula,fat_levels:{...c.formula.fat_levels,[k]:{...f,fat_thin:v}}}}))}/><Field label="Comp. Hips" value={f.hips_compensation} onChange={v=>setConfig(c=>({...c,formula:{...c.formula,fat_levels:{...c.formula.fat_levels,[k]:{...f,hips_compensation:v}}}}))}/><Field label="Comp. Breast" value={f.breasts_compensation} onChange={v=>setConfig(c=>({...c,formula:{...c.formula,fat_levels:{...c.formula.fat_levels,[k]:{...f,breasts_compensation:v}}}}))}/></div></div>})}</div>
        <div className="grid gap-4 xl:grid-cols-2"><div className="rounded-2xl border border-white/7 bg-black/20 p-4"><h3 className="text-sm font-semibold text-white">Anclas de glúteos</h3><div className="mt-3 grid grid-cols-4 gap-2">{ASS_ORDER.map(k=><Field key={k} label={config.formula.ass_levels[k].label} value={config.formula.ass_levels[k].hips_size} onChange={v=>setConfig(c=>({...c,formula:{...c.formula,ass_levels:{...c.formula.ass_levels,[k]:{...c.formula.ass_levels[k],hips_size:v}}}}))}/>)}</div></div><div className="rounded-2xl border border-white/7 bg-black/20 p-4"><h3 className="text-sm font-semibold text-white">Anclas de pecho</h3><div className="mt-3 grid grid-cols-4 gap-2">{BREAST_ORDER.map(k=><Field key={k} label={config.formula.breast_levels[k].label} value={config.formula.breast_levels[k].base} onChange={v=>setConfig(c=>({...c,formula:{...c.formula,breast_levels:{...c.formula.breast_levels,[k]:{...c.formula.breast_levels[k],base:v}}}}))}/>)}</div></div></div>
        <div className="rounded-2xl border border-white/7 bg-black/20 p-4"><h3 className="text-sm font-semibold text-white">Compensación glúteos → pecho</h3><div className="mt-3 overflow-x-auto"><table className="w-full text-xs"><thead><tr><th className="p-2 text-left text-zinc-600">Ass \ Breast</th>{BREAST_ORDER.map(b=><th key={b} className="p-2 text-zinc-600">{config.formula.breast_levels[b].label}</th>)}</tr></thead><tbody>{ASS_ORDER.map(a=><tr key={a}><td className="p-2 text-zinc-400">{config.formula.ass_levels[a].label}</td>{BREAST_ORDER.map(b=><td key={b} className="p-1"><input type="number" step="0.05" value={config.formula.ass_breast_compensation[a][b]} onChange={e=>setConfig(c=>({...c,formula:{...c.formula,ass_breast_compensation:{...c.formula.ass_breast_compensation,[a]:{...c.formula.ass_breast_compensation[a],[b]:num(e.target.value)}}}}))} className="bp-input"/></td>)}</tr>)}</tbody></table></div></div>
        <div className="flex justify-end gap-2"><button onClick={saveConfig} className="bp-primary"><Save size={15}/>Guardar reglas</button><button onClick={recalc} className="bp-secondary"><RefreshCcw size={15}/>Aplicar a pendientes</button></div>
      </div>}
    </section>

    {base.length===0?<div className="luxia-panel rounded-3xl p-12 text-center"><p className="text-white">Aún no existe la malla base.</p><button onClick={seed48} className="bp-primary mt-4">Crear 48 categorías</button></div>:
      FAT_ORDER.map(fat=>{const rows=base.filter(p=>p.fat_band===fat); return <section key={fat} className="space-y-4"><div className="flex items-end justify-between"><div><p className="text-xs uppercase tracking-[.22em] text-red-400">{config.formula.fat_levels[fat].label}</p><h2 className="mt-1 text-xl font-semibold text-white">16 categorías base</h2></div><button onClick={()=>generateList(rows)} disabled={generating.size>0} className="bp-secondary"><RefreshCcw size={14}/>Regenerar grupo</button></div>{ASS_ORDER.map(ass=><div key={ass} className="space-y-2"><p className="text-xs font-semibold uppercase tracking-[.18em] text-zinc-600">{config.formula.ass_levels[ass].label}</p><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{BREAST_ORDER.map(b=>{const p=rows.find(x=>x.ass_band===ass&&x.breast_band===b); return p?<PresetCard key={p.id} preset={p} busy={generating.has(p.id)} patch={v=>patch(p.id,v)} save={()=>savePreset(p).then(()=>toast.success("Preset guardado."))} generate={()=>generate(p)}/>:<div key={b} className="luxia-panel rounded-2xl p-5 text-xs text-zinc-700">Falta {b}</div>})}</div></div>)}</section>})}

    <section className="luxia-panel rounded-3xl p-5"><div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-xs uppercase tracking-[.2em] text-zinc-600">Intermedios y excepciones</p><h2 className="mt-1 text-xl font-semibold text-white">Crear preset entre dos existentes</h2><p className="mt-1 text-xs text-zinc-600">El nuevo preset toma el punto medio 50% y después puedes editarlo libremente.</p></div><div className="flex flex-wrap gap-2"><select className="bp-input w-52" value={fromId} onChange={e=>setFromId(e.target.value?Number(e.target.value):"")}><option value="">Desde…</option>{presets.map(p=><option key={p.id} value={p.id}>{p.profile_key} · {p.display_name}</option>)}</select><select className="bp-input w-52" value={toId} onChange={e=>setToId(e.target.value?Number(e.target.value):"")}><option value="">Hasta…</option>{presets.map(p=><option key={p.id} value={p.id}>{p.profile_key} · {p.display_name}</option>)}</select><button onClick={interpolate} className="bp-secondary"><BetweenHorizontalStart size={15}/>Crear intermedio</button></div></div>{custom.length>0&&<div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{custom.map(p=><PresetCard key={p.id} preset={p} busy={generating.has(p.id)} patch={v=>patch(p.id,v)} save={()=>savePreset(p).then(()=>toast.success("Preset guardado."))} generate={()=>generate(p)}/>)}</div>}</section>

    <style jsx global>{`.bp-primary{display:inline-flex;height:42px;align-items:center;justify-content:center;gap:8px;border-radius:12px;background:#dc2626;padding:0 16px;font-size:13px;font-weight:600;color:white}.bp-primary:hover{background:#ef4444}.bp-primary:disabled{opacity:.45}.bp-secondary{display:inline-flex;height:42px;align-items:center;justify-content:center;gap:8px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.25);padding:0 14px;font-size:12px;font-weight:600;color:#d4d4d8}.bp-secondary:hover{border-color:rgba(239,68,68,.3);color:white}.bp-input{height:38px;width:100%;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:#09090b;padding:0 10px;font-size:12px;color:#e4e4e7;outline:none}.bp-input:focus{border-color:rgba(239,68,68,.45)}`}</style>
  </div>;
}

function Field({label,value,onChange}:{label:string;value:number;onChange:(v:number)=>void}) { return <label><span className="mb-1 block text-[9px] uppercase tracking-[.12em] text-zinc-600">{label}</span><input type="number" step="0.05" value={value} onChange={e=>onChange(num(e.target.value))} className="bp-input"/></label>; }

function PresetCard({preset,busy,patch,save,generate}:{preset:BodyProportionPreset;busy:boolean;patch:(v:Partial<BodyProportionPreset>)=>void;save:()=>void;generate:()=>void}) {
  const img = preset.image_storage_file_id ? `/api/admin/storage/files/${preset.image_storage_file_id}/content` : null;
  return <div className="luxia-panel overflow-hidden rounded-2xl"><div className="relative aspect-[4/5] bg-black/40">{img?<img src={img} alt={preset.display_name} className="h-full w-full object-cover"/>:<div className="flex h-full flex-col items-center justify-center text-zinc-800"><ImageIcon/><span className="mt-2 text-[10px]">Sin preview</span></div>}{busy&&<div className="absolute inset-0 flex items-center justify-center bg-black/70"><LoaderCircle className="animate-spin text-red-400"/></div>}<span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 font-mono text-[9px] text-red-300">{preset.profile_key}</span></div><div className="space-y-3 p-3"><p className="min-h-9 text-xs font-semibold leading-4 text-white">{preset.display_name}</p><div className="grid grid-cols-3 gap-2"><Field label="Hips" value={preset.hips_size} onChange={v=>patch({hips_size:v})}/><Field label="Fat/Thin" value={preset.fat_thin} onChange={v=>patch({fat_thin:v})}/><Field label="Breasts" value={preset.breasts_size} onChange={v=>patch({breasts_size:v})}/></div><div className="grid grid-cols-2 gap-2"><button onClick={save} className="bp-secondary">Guardar</button><button onClick={generate} disabled={busy} className="bp-primary">{preset.status==="ready"?"Regenerar":"Generar"}</button></div>{preset.last_error&&<p className="text-[10px] text-red-400">{preset.last_error}</p>}</div></div>;
}
