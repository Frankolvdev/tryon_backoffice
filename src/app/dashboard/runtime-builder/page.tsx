"use client";

import { Boxes, CheckCircle2, Code2, FileJson2, LoaderCircle, Plus, RefreshCcw, Save, ServerCog, Trash2, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { RuntimeBuilderConfig, RuntimeGeneratedFiles, RuntimeValidationResponse } from "@/types/admin-runtime-builder";
import { RuntimeBuildPanel } from "@/components/runtime-builder/runtime-build-panel";

const inputClass = "h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-white outline-none transition focus:border-red-500/50";
const cardClass = "luxia-panel rounded-3xl p-5";

type Tab = "base" | "nodes" | "models" | "dependencies" | "environment" | "preview" | "builds";

export default function RuntimeBuilderPage() {
  const [config, setConfig] = useState<RuntimeBuilderConfig | null>(null);
  const [validation, setValidation] = useState<RuntimeValidationResponse | null>(null);
  const [generated, setGenerated] = useState<RuntimeGeneratedFiles | null>(null);
  const [tab, setTab] = useState<Tab>("base");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setConfig(await browserApiRequest<RuntimeBuilderConfig>("/api/admin/runtime-builder/config")); }
    catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible cargar Runtime Builder."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const patch = (values: Partial<RuntimeBuilderConfig>) => setConfig((current) => current ? { ...current, ...values } : current);
  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const { id, created_at, updated_at, ...payload } = config;
      setConfig(await browserApiRequest<RuntimeBuilderConfig>("/api/admin/runtime-builder/config", { method: "PUT", body: JSON.stringify(payload) }));
      toast.success("Configuración del runtime guardada.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible guardar."); }
    finally { setSaving(false); }
  };
  const validate = async () => {
    await save();
    const result = await browserApiRequest<RuntimeValidationResponse>("/api/admin/runtime-builder/validate", { method: "POST" });
    setValidation(result); toast[result.valid ? "success" : "error"](result.valid ? "Configuración válida." : "La configuración contiene errores.");
  };
  const generate = async () => {
    await save();
    setGenerated(await browserApiRequest<RuntimeGeneratedFiles>("/api/admin/runtime-builder/generate", { method: "POST" }));
    setTab("preview"); toast.success("Archivos reproducibles generados.");
  };

  if (loading || !config) return <div className="flex min-h-80 items-center justify-center"><LoaderCircle className="animate-spin text-red-500" /></div>;

  const tabs: {id: Tab; label: string}[] = [
    {id:"base",label:"Base"},{id:"nodes",label:`Custom Nodes (${config.custom_nodes.length})`},{id:"models",label:`Modelos (${config.models.length})`},
    {id:"dependencies",label:"Dependencias"},{id:"environment",label:"Variables y volúmenes"},{id:"preview",label:"Archivos generados"},{id:"builds",label:"Build & Deploy"},
  ];

  return <div className="space-y-5">
    <section className="luxia-panel rounded-3xl p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex gap-4"><div className="luxia-red-glow flex size-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400"><ServerCog /></div><div>
          <p className="text-[10px] font-semibold tracking-[.2em] text-red-500 uppercase">Infraestructura IA</p><h1 className="mt-2 text-2xl font-semibold text-white">Runtime Builder</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-500">Configura ComfyUI, nodos, modelos y dependencias; valida y genera el contexto Docker sin editar archivos manualmente.</p>
        </div></div>
        <div className="flex flex-wrap gap-2"><button onClick={() => void load()} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-zinc-300"><RefreshCcw size={16}/>Recargar</button>
          <button onClick={() => void validate()} className="inline-flex h-11 items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-950/20 px-4 text-sm text-amber-300"><CheckCircle2 size={16}/>Validar</button>
          <button onClick={() => void generate()} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-zinc-200"><Code2 size={16}/>Generar archivos</button>
          <button onClick={() => void save()} disabled={saving} className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white"><Save size={16}/>{saving ? "Guardando…" : "Guardar"}</button>
        </div>
      </div>
    </section>

    {validation && <section className={`${cardClass} border ${validation.valid ? "border-emerald-500/20" : "border-red-500/20"}`}><div className="flex items-center gap-3">{validation.valid ? <CheckCircle2 className="text-emerald-400"/> : <TriangleAlert className="text-red-400"/>}<div><h2 className="font-semibold text-white">{validation.valid ? "Runtime listo para generar" : "Hay errores por corregir"}</h2><p className="text-sm text-zinc-500">{validation.issues.length} observaciones · reproducible: {String(validation.summary.reproducible)}</p></div></div>{validation.issues.length > 0 && <div className="mt-4 space-y-2">{validation.issues.map((issue,index)=><div key={`${issue.field}-${index}`} className="rounded-xl border border-white/7 bg-black/20 px-4 py-3 text-sm"><span className={issue.level === "error" ? "text-red-400" : "text-amber-300"}>{issue.level.toUpperCase()}</span><span className="ml-3 text-zinc-400">{issue.message}</span></div>)}</div>}</section>}

    <div className="flex flex-wrap gap-2">{tabs.map(item=><button key={item.id} onClick={()=>setTab(item.id)} className={`rounded-xl px-4 py-2.5 text-sm transition ${tab===item.id?"bg-red-700 text-white":"border border-white/8 text-zinc-500 hover:text-white"}`}>{item.label}</button>)}</div>

    {tab === "base" && <section className={`${cardClass} grid gap-4 md:grid-cols-2 xl:grid-cols-3`}>
      <Field label="Nombre"><input className={inputClass} value={config.name} onChange={e=>patch({name:e.target.value})}/></Field><Field label="Versión"><input className={inputClass} value={config.runtime_version} onChange={e=>patch({runtime_version:e.target.value})}/></Field><Field label="Plataforma"><select className={inputClass} value={config.target_platform} onChange={e=>patch({target_platform:e.target.value})}><option>linux/amd64</option><option>linux/arm64</option></select></Field>
      <Field label="CUDA"><input className={inputClass} value={config.cuda_version} onChange={e=>patch({cuda_version:e.target.value})}/></Field><Field label="Python"><input className={inputClass} value={config.python_version} onChange={e=>patch({python_version:e.target.value})}/></Field><Field label="PyTorch index URL"><input className={inputClass} value={config.pytorch_index_url} onChange={e=>patch({pytorch_index_url:e.target.value})}/></Field>
      <Field label="Repositorio ComfyUI" wide><input className={inputClass} value={config.comfyui_repository} onChange={e=>patch({comfyui_repository:e.target.value})}/></Field><Field label="Commit ComfyUI"><input className={inputClass} value={config.comfyui_commit ?? ""} onChange={e=>patch({comfyui_commit:e.target.value || null})}/></Field>
      <Field label="Imagen del registro" wide><input className={inputClass} value={config.registry_image} onChange={e=>patch({registry_image:e.target.value})}/></Field><Field label="Notas" wide><textarea className="min-h-24 w-full rounded-xl border border-white/10 bg-black/25 p-3 text-sm text-white" value={config.notes ?? ""} onChange={e=>patch({notes:e.target.value || null})}/></Field>
    </section>}

    {tab === "nodes" && <ListEditor title="Custom Nodes" onAdd={()=>patch({custom_nodes:[...config.custom_nodes,{name:"",repository:"",commit:null,enabled:true,install_requirements:true}]})}>{config.custom_nodes.map((node,index)=><div key={index} className="grid gap-3 rounded-2xl border border-white/8 bg-black/20 p-4 lg:grid-cols-[1fr_2fr_1fr_auto]">
      <input placeholder="Nombre" className={inputClass} value={node.name} onChange={e=>patch({custom_nodes:config.custom_nodes.map((n,i)=>i===index?{...n,name:e.target.value}:n)})}/><input placeholder="Repositorio Git" className={inputClass} value={node.repository} onChange={e=>patch({custom_nodes:config.custom_nodes.map((n,i)=>i===index?{...n,repository:e.target.value}:n)})}/><input placeholder="Commit fijo" className={inputClass} value={node.commit ?? ""} onChange={e=>patch({custom_nodes:config.custom_nodes.map((n,i)=>i===index?{...n,commit:e.target.value||null}:n)})}/><Delete onClick={()=>patch({custom_nodes:config.custom_nodes.filter((_,i)=>i!==index)})}/></div>)}</ListEditor>}

    {tab === "models" && <ListEditor title="Catálogo de modelos" onAdd={()=>patch({models:[...config.models,{name:"",model_type:"other",source_url:null,target_path:"",sha256:null,strategy:"volume",enabled:true}]})}>{config.models.map((model,index)=><div key={index} className="grid gap-3 rounded-2xl border border-white/8 bg-black/20 p-4 lg:grid-cols-3">
      <input placeholder="Nombre" className={inputClass} value={model.name} onChange={e=>patch({models:config.models.map((m,i)=>i===index?{...m,name:e.target.value}:m)})}/><select className={inputClass} value={model.model_type} onChange={e=>patch({models:config.models.map((m,i)=>i===index?{...m,model_type:e.target.value as typeof m.model_type}:m)})}>{["checkpoint","vae","lora","controlnet","clip","upscaler","other"].map(x=><option key={x}>{x}</option>)}</select><select className={inputClass} value={model.strategy} onChange={e=>patch({models:config.models.map((m,i)=>i===index?{...m,strategy:e.target.value as typeof m.strategy}:m)})}><option value="volume">Volumen</option><option value="image">Dentro de imagen</option><option value="startup-download">Descargar al iniciar</option></select>
      <input placeholder="Ruta en ComfyUI/models" className={inputClass} value={model.target_path} onChange={e=>patch({models:config.models.map((m,i)=>i===index?{...m,target_path:e.target.value}:m)})}/><input placeholder="URL de origen" className={`${inputClass} lg:col-span-2`} value={model.source_url ?? ""} onChange={e=>patch({models:config.models.map((m,i)=>i===index?{...m,source_url:e.target.value||null}:m)})}/><div className="lg:col-span-3 flex justify-end"><Delete onClick={()=>patch({models:config.models.filter((_,i)=>i!==index)})}/></div></div>)}</ListEditor>}

    {tab === "dependencies" && <ListEditor title="Dependencias Python adicionales" onAdd={()=>patch({python_dependencies:[...config.python_dependencies,{package:"",version:null,enabled:true}]})}>{config.python_dependencies.map((dep,index)=><div key={index} className="grid gap-3 rounded-2xl border border-white/8 bg-black/20 p-4 md:grid-cols-[2fr_1fr_auto]"><input placeholder="Paquete" className={inputClass} value={dep.package} onChange={e=>patch({python_dependencies:config.python_dependencies.map((d,i)=>i===index?{...d,package:e.target.value}:d)})}/><input placeholder="Versión" className={inputClass} value={dep.version ?? ""} onChange={e=>patch({python_dependencies:config.python_dependencies.map((d,i)=>i===index?{...d,version:e.target.value||null}:d)})}/><Delete onClick={()=>patch({python_dependencies:config.python_dependencies.filter((_,i)=>i!==index)})}/></div>)}</ListEditor>}

    {tab === "environment" && <div className="grid gap-5 xl:grid-cols-2"><ListEditor title="Variables de entorno" onAdd={()=>patch({environment_variables:[...config.environment_variables,{key:"",value:null,secret:false,required:false}]})}>{config.environment_variables.map((env,index)=><div key={index} className="grid gap-3 rounded-2xl border border-white/8 bg-black/20 p-4 md:grid-cols-[1fr_1fr_auto]"><input placeholder="CLAVE" className={inputClass} value={env.key} onChange={e=>patch({environment_variables:config.environment_variables.map((v,i)=>i===index?{...v,key:e.target.value.toUpperCase()}:v)})}/><input placeholder={env.secret?"Secreto no almacenado":"Valor"} className={inputClass} value={env.value ?? ""} onChange={e=>patch({environment_variables:config.environment_variables.map((v,i)=>i===index?{...v,value:e.target.value||null}:v)})}/><Delete onClick={()=>patch({environment_variables:config.environment_variables.filter((_,i)=>i!==index)})}/></div>)}</ListEditor><ListEditor title="Volúmenes" onAdd={()=>patch({volumes:[...config.volumes,{name:"models",mount_path:"/opt/ComfyUI/models",read_only:false}]})}>{config.volumes.map((volume,index)=><div key={index} className="grid gap-3 rounded-2xl border border-white/8 bg-black/20 p-4 md:grid-cols-[1fr_2fr_auto]"><input placeholder="Nombre" className={inputClass} value={volume.name} onChange={e=>patch({volumes:config.volumes.map((v,i)=>i===index?{...v,name:e.target.value}:v)})}/><input placeholder="Ruta de montaje" className={inputClass} value={volume.mount_path} onChange={e=>patch({volumes:config.volumes.map((v,i)=>i===index?{...v,mount_path:e.target.value}:v)})}/><Delete onClick={()=>patch({volumes:config.volumes.filter((_,i)=>i!==index)})}/></div>)}</ListEditor></div>}

    {tab === "preview" && <section className={cardClass}>{!generated ? <div className="py-16 text-center text-zinc-500"><FileJson2 className="mx-auto mb-3"/>Pulsa “Generar archivos” para crear el Dockerfile y los manifiestos.</div> : <div className="space-y-5"><CodeBlock title="Dockerfile" value={generated.dockerfile}/><CodeBlock title="entrypoint.sh" value={generated.entrypoint}/><CodeBlock title="runtime-manifest.json" value={JSON.stringify(generated.runtime_manifest,null,2)}/><CodeBlock title="custom-nodes.lock.json" value={JSON.stringify(generated.custom_nodes_lock,null,2)}/><CodeBlock title="models-manifest.json" value={JSON.stringify(generated.models_manifest,null,2)}/></div>}</section>}
    {tab === "builds" && <RuntimeBuildPanel />}
  </div>;
}

function Field({label,wide,children}:{label:string;wide?:boolean;children:React.ReactNode}) { return <label className={wide?"md:col-span-2 xl:col-span-2":""}><span className="mb-2 block text-xs font-semibold tracking-wide text-zinc-500 uppercase">{label}</span>{children}</label>; }
function ListEditor({title,onAdd,children}:{title:string;onAdd:()=>void;children:React.ReactNode}) { return <section className={cardClass}><div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 font-semibold text-white"><Boxes size={18} className="text-red-400"/>{title}</h2><button onClick={onAdd} className="inline-flex items-center gap-2 rounded-xl bg-red-950/40 px-3 py-2 text-sm text-red-300"><Plus size={15}/>Agregar</button></div><div className="space-y-3">{children}</div></section>; }
function Delete({onClick}:{onClick:()=>void}) { return <button onClick={onClick} className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/15 text-red-400 hover:bg-red-950/30"><Trash2 size={16}/></button>; }
function CodeBlock({title,value}:{title:string;value:string}) { return <div><h3 className="mb-2 text-sm font-semibold text-white">{title}</h3><pre className="max-h-96 overflow-auto rounded-2xl border border-white/8 bg-black/40 p-4 text-xs leading-6 text-zinc-300">{value}</pre></div>; }
