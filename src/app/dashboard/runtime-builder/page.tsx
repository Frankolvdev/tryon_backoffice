"use client";

import { Boxes, CheckCircle2, Code2, FileJson2, LoaderCircle, Plus, RefreshCcw, Save, ServerCog, Trash2, TriangleAlert, ArrowLeft, LogIn, Copy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { RuntimeBuilderConfig, RuntimeGeneratedFiles, RuntimeValidationResponse, RuntimeBuilderProfileSummary, RuntimeBuilderProfileList, RuntimeValidatedProfile, RuntimeValidatedProfileList } from "@/types/admin-runtime-builder";
import { RuntimeBuildPanel } from "@/components/runtime-builder/runtime-build-panel";
import { RuntimeImportWizard } from "@/components/runtime-builder/runtime-import-wizard";
import { RuntimeContextGenerator } from "@/components/runtime-builder/runtime-context-generator";
import { RuntimeMega3Panel } from "@/components/runtime-builder/runtime-mega3-panel";

const inputClass = "h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-white outline-none transition focus:border-red-500/50";
const cardClass = "luxia-panel rounded-3xl p-5";
const safeRuntimeName = (value?: string | null) => {
  const source = typeof value === "string" ? value : "";
  const normalized = source.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 120).replace(/-$/g, "");
  if (!normalized) return "generation-runtime";
  return /^[a-z]/.test(normalized) ? normalized : `runtime-${normalized}`;
};
const MODAL_GPUS = ["T4", "L4", "A10G", "L40S", "A100-40GB", "A100-80GB", "RTX-PRO-6000", "H100", "H200", "B200", "B300"] as const;
const REQUIRED_NODE_NAMES = ["ComfyUI-Manager", "rgthree-comfy", "ComfyUI-Easy-Use", "ComfyUI-Lora-Manager", "ComfyUI-KJNodes", "comfyui-essentials", "was-node-suite-comfyui", "ComfyUI-Logic", "ComfyUI-Execute-Python", "ComfyLiterals", "Anomalous_Model_Browser"];


type Tab = "import" | "base" | "nodes" | "models" | "dependencies" | "environment" | "preview" | "generator" | "model-export" | "builds";

export default function RuntimeBuilderPage() {
  const [config, setConfig] = useState<RuntimeBuilderConfig | null>(null);
  const [validation, setValidation] = useState<RuntimeValidationResponse | null>(null);
  const [generated, setGenerated] = useState<RuntimeGeneratedFiles | null>(null);
  const [tab, setTab] = useState<Tab>("base");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [profiles, setProfiles] = useState<RuntimeBuilderProfileSummary[]>([]);
  const [validatedProfiles, setValidatedProfiles] = useState<RuntimeValidatedProfile[]>([]);
  const [validatedProfileId, setValidatedProfileId] = useState("");
  const [profileApplying, setProfileApplying] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileProvider, setNewProfileProvider] = useState<RuntimeBuilderConfig["provider"]>("modal");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [loaded, profileList, validatedList] = await Promise.all([
        browserApiRequest<RuntimeBuilderConfig>("/api/admin/runtime-builder/config"),
        browserApiRequest<RuntimeBuilderProfileList>("/api/admin/runtime-builder/profiles"),
        browserApiRequest<RuntimeValidatedProfileList>("/api/admin/runtime-builder/validated-profiles"),
      ]);
      setProfiles(profileList.items);
      setValidatedProfiles(validatedList.items);
      setValidatedProfileId(validatedList.selected_id);
      setConfig({ ...loaded, include_comfyui_manager:true, runtime_name: safeRuntimeName(loaded.runtime_name) });
    }
    catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible cargar Runtime Builder."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const selectProfile = async (id:number) => {
    await browserApiRequest(`/api/admin/runtime-builder/profiles/${id}/select`,{method:"POST"});
    await load();
    setEditingProfile(true);
    toast.success("Runtime abierto.");
  };
  const createProfile = async () => {
    const name = newProfileName.trim();
    if (!name) { toast.error("Escribe el nombre del runtime."); return; }
    const created = await browserApiRequest<RuntimeBuilderConfig>("/api/admin/runtime-builder/profiles",{method:"POST",body:JSON.stringify({name,provider:newProfileProvider})});
    setCreatingProfile(false); setNewProfileName("");
    await load(); setEditingProfile(true);
    toast.success(`Runtime ${created.name} creado para ${created.provider}.`);
  };
  const cloneProfile = async (profile: RuntimeBuilderProfileSummary) => {
    const suggested = `${profile.name} copia`;
    const name = window.prompt("Nombre del runtime clonado (debe ser diferente):", suggested)?.trim();
    if (!name) return;
    try {
      await browserApiRequest<RuntimeBuilderConfig>(`/api/admin/runtime-builder/profiles/${profile.id}/clone`, { method:"POST", body:JSON.stringify({name, provider:profile.provider}) });
      await load(); setEditingProfile(true); toast.success("Runtime clonado completo.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible clonar el runtime."); }
  };
  const deleteProfileById = async (profile: RuntimeBuilderProfileSummary) => {
    if(!window.confirm(`¿Eliminar el runtime ${profile.name}?`)) return;
    await browserApiRequest(`/api/admin/runtime-builder/profiles/${profile.id}/delete`,{method:"POST"});
    if (config?.id === profile.id) setEditingProfile(false);
    await load();
  };

  const applyValidatedProfile = async (profileId:string) => {
    if (!profileId || profileId === validatedProfileId) return;
    setProfileApplying(true);
    try {
      const updated = await browserApiRequest<RuntimeBuilderConfig>(
        `/api/admin/runtime-builder/validated-profiles/${encodeURIComponent(profileId)}/apply`,
        { method:"POST" },
      );
      setConfig({ ...updated, runtime_name:safeRuntimeName(updated.runtime_name) });
      setValidatedProfileId(profileId);
      toast.success("Perfil de runtime aplicado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible aplicar el perfil.");
    } finally {
      setProfileApplying(false);
    }
  };
  const selectedValidatedProfile = validatedProfiles.find(item=>item.id===validatedProfileId) ?? validatedProfiles[0];

  const patch = (values: Partial<RuntimeBuilderConfig>) => setConfig((current) => current ? { ...current, ...values } : current);
  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const { id, created_at, updated_at, ...payload } = config;
      const persisted = await browserApiRequest<RuntimeBuilderConfig>("/api/admin/runtime-builder/config", { method: "PUT", body: JSON.stringify(payload) });
      setConfig({ ...persisted, runtime_name:safeRuntimeName(persisted.runtime_name) });
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

  if (!editingProfile) return <div className="space-y-5">
    <section className="luxia-panel rounded-3xl p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-red-500">Infraestructura IA</p><h1 className="mt-2 text-2xl font-semibold text-white">Runtimes</h1><p className="mt-2 text-sm text-zinc-500">Cada runtime pertenece permanentemente al proveedor elegido al crearlo.</p></div>
        <button onClick={()=>setCreatingProfile(true)} className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white"><Plus size={16}/>Crear runtime</button>
      </div>
    </section>
    <section className="luxia-panel overflow-hidden rounded-3xl">
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-white/8 bg-black/20 text-xs uppercase text-zinc-500"><tr><th className="p-4">Nombre</th><th className="p-4">Proveedor</th><th className="p-4">Versión</th><th className="p-4">Actualizado</th><th className="p-4 text-right">Acciones</th></tr></thead><tbody>{profiles.map(profile=><tr key={profile.id} className="border-b border-white/6 last:border-0"><td className="p-4"><div className="font-medium text-white">{profile.name}</div><div className="mt-1 text-xs text-zinc-600">{profile.runtime_name}</div></td><td className="p-4"><span className="rounded-full border border-white/10 bg-white/[.03] px-3 py-1 text-xs capitalize text-zinc-300">{profile.provider}</span></td><td className="p-4 text-zinc-400">{profile.runtime_version}</td><td className="p-4 text-zinc-500">{new Date(profile.updated_at).toLocaleString("es-MX")}</td><td className="p-4"><div className="flex justify-end gap-2"><button onClick={()=>void selectProfile(profile.id)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs text-zinc-200"><LogIn size={14}/>Entrar</button><button onClick={()=>void cloneProfile(profile)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs text-zinc-200"><Copy size={14}/>Clonar</button><button disabled={profiles.length<=1} onClick={()=>void deleteProfileById(profile)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-500/20 px-3 text-xs text-red-300 disabled:opacity-40"><Trash2 size={14}/>Eliminar</button></div></td></tr>)}</tbody></table></div>
    </section>
    {creatingProfile&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"><div className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-2xl"><h2 className="text-xl font-semibold text-white">Crear runtime</h2><p className="mt-2 text-sm text-zinc-500">El proveedor quedará asociado al runtime y no se podrá cambiar después.</p><label className="mt-5 block"><span className="mb-2 block text-sm text-zinc-300">Nombre</span><input autoFocus className={inputClass} value={newProfileName} onChange={e=>setNewProfileName(e.target.value)} placeholder="Ej. TryOn producción"/></label><label className="mt-4 block"><span className="mb-2 block text-sm text-zinc-300">Proveedor</span><select className={inputClass} value={newProfileProvider} onChange={e=>setNewProfileProvider(e.target.value as RuntimeBuilderConfig["provider"])}><option value="modal">Modal</option><option value="runpod">RunPod Serverless</option><option value="beam">Beam</option><option value="local">Local / Docker</option></select></label><div className="mt-6 flex justify-end gap-3"><button onClick={()=>setCreatingProfile(false)} className="h-11 rounded-xl border border-white/10 px-4 text-sm text-zinc-300">Cancelar</button><button onClick={()=>void createProfile()} className="h-11 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white">Crear y entrar</button></div></div></div>}
  </div>;

  const tabs: {id: Tab; label: string}[] = [
    {id:"import",label:"1–3. Preparar Runtime"},{id:"base",label:"4. Configuración base"},{id:"nodes",label:`4. Custom Nodes (${config.custom_nodes.length})`},{id:"models",label:`4. Modelos (${config.models.length})`},
    {id:"dependencies",label:"4. Dependencias"},{id:"environment",label:"4. Variables y volúmenes"},{id:"preview",label:"5. Validar y generar archivos"},{id:"generator",label:"6. Generar Runtime"},{id:"model-export",label:"Modelos y Docker"},{id:"builds",label:"7–9. Build & Deploy"},
  ];

  return <div className="space-y-5">
    <section className="luxia-panel rounded-3xl p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><button onClick={()=>setEditingProfile(false)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm text-zinc-300"><ArrowLeft size={15}/>Runtimes</button><div><p className="text-xs uppercase tracking-wider text-zinc-600">Runtime abierto</p><p className="font-semibold text-white">{config.name}</p></div></div><div className="rounded-xl border border-white/10 bg-black/20 px-4 py-2"><span className="text-xs text-zinc-500">Proveedor fijo</span><p className="text-sm font-semibold capitalize text-zinc-200">{config.provider}</p></div></div></section>
    <section className="luxia-panel rounded-3xl p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex gap-4"><div className="luxia-red-glow flex size-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400"><ServerCog /></div><div>
          <p className="text-[10px] font-semibold tracking-[.2em] text-red-500 uppercase">Infraestructura IA</p><h1 className="mt-2 text-2xl font-semibold text-white">Runtime Builder</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-500">Configura ComfyUI, nodos, modelos y dependencias; valida y genera el contexto Docker sin editar archivos manualmente.</p>
          <p className="mt-2 max-w-3xl text-xs leading-6 text-zinc-600">“Aplicar al Runtime Builder” guarda automáticamente lo resuelto. “Guardar configuración” persiste los cambios manuales posteriores. Cambiar Legacy/Modern solo modifica los campos protegidos del perfil y conserva nodos, modelos y dependencias.</p>
        </div></div>
        <div className="flex flex-wrap gap-2"><button onClick={() => void load()} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-zinc-300"><RefreshCcw size={16}/>Recargar</button>
          <button onClick={() => void validate()} className="inline-flex h-11 items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-950/20 px-4 text-sm text-amber-300"><CheckCircle2 size={16}/>5. Validar</button>
          <button onClick={() => void generate()} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-zinc-200"><Code2 size={16}/>5. Generar archivos</button>
          <button onClick={() => void save()} disabled={saving} className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white"><Save size={16}/>{saving ? "Guardando…" : "4. Guardar configuración"}</button>
        </div>
      </div>
    </section>

    {validation && <section className={`${cardClass} border ${validation.valid ? "border-emerald-500/20" : "border-red-500/20"}`}><div className="flex items-center gap-3">{validation.valid ? <CheckCircle2 className="text-emerald-400"/> : <TriangleAlert className="text-red-400"/>}<div><h2 className="font-semibold text-white">{validation.valid ? "Runtime listo para generar" : "Hay errores por corregir"}</h2><p className="text-sm text-zinc-500">{validation.issues.length} observaciones · reproducible: {String(validation.summary.reproducible)}</p></div></div>{validation.issues.length > 0 && <div className="mt-4 space-y-2">{validation.issues.map((issue,index)=><div key={`${issue.field}-${index}`} className="rounded-xl border border-white/7 bg-black/20 px-4 py-3 text-sm"><span className={issue.level === "error" ? "text-red-400" : "text-amber-300"}>{issue.level.toUpperCase()}</span><span className="ml-3 text-zinc-400">{issue.message}</span></div>)}</div>}</section>}

    <div className="flex flex-wrap gap-2">{tabs.map(item=><button key={item.id} onClick={()=>setTab(item.id)} className={`rounded-xl px-4 py-2.5 text-sm transition ${tab===item.id?"bg-red-700 text-white":"border border-white/8 text-zinc-500 hover:text-white"}`}>{item.label}</button>)}</div>

    {tab === "import" && <RuntimeImportWizard onApplied={(value)=>{setConfig(value);setTab("base")}} />}

    {tab === "base" && <div className="space-y-4"><section className="rounded-3xl border border-emerald-500/20 bg-emerald-950/10 p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-400">Perfil validado</p><div className="mt-3 grid gap-3 xl:grid-cols-[minmax(280px,420px)_1fr]"><div><label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Perfil de compatibilidad</label><select className={inputClass} disabled={profileApplying} value={validatedProfileId} onChange={e=>void applyValidatedProfile(e.target.value)}>{validatedProfiles.map(profile=><option key={profile.id} value={profile.id}>{profile.label} · {new Date(`${profile.date}T00:00:00`).toLocaleDateString("es-MX",{day:"2-digit",month:"short",year:"numeric"})}</option>)}</select></div>{selectedValidatedProfile&&<div className="rounded-2xl border border-white/7 bg-black/20 px-4 py-3"><h2 className="text-base font-semibold text-white">{selectedValidatedProfile.label} <span className="text-zinc-500">· {new Date(`${selectedValidatedProfile.date}T00:00:00`).toLocaleDateString("es-MX",{day:"2-digit",month:"long",year:"numeric"})}</span></h2><p className="mt-2 text-sm text-zinc-400">ComfyUI {selectedValidatedProfile.comfyui_version} · Frontend {selectedValidatedProfile.comfyui_frontend_version} · Python {selectedValidatedProfile.python_version} · CUDA {selectedValidatedProfile.cuda_version.replace(/\.0$/,"")} · {selectedValidatedProfile.gpu_profile==="universal-cu130"?"PyTorch 2.13.0 cu130":"PyTorch cu128"}</p><p className="mt-2 text-xs text-zinc-500">Al seleccionar y al guardar se reaplican únicamente los valores protegidos del perfil. Todo lo demás del runtime permanece intacto.</p></div>}</div></div><label className="flex items-center gap-3 text-sm text-zinc-300"><input type="checkbox" checked={advancedMode} onChange={e=>setAdvancedMode(e.target.checked)} className="size-4 accent-red-600"/>Modo avanzado</label></div></section><section className={`${cardClass} grid gap-4 md:grid-cols-2 xl:grid-cols-3`}>
      <Field label="Versión"><input className={inputClass} value={config.runtime_version} onChange={e=>patch({runtime_version:e.target.value})}/></Field>{config.provider === "modal" && <Field label="GPU de este runtime"><select className={inputClass} value={config.gpu} onChange={e=>patch({gpu:e.target.value})}>{MODAL_GPUS.map(gpu=><option key={gpu} value={gpu}>{gpu}</option>)}</select><span className="mt-2 block text-xs text-zinc-500">El precio de esta GPU sigue administrándose en Proveedores de infraestructura.</span></Field>}<Field label="Plataforma"><select disabled={!advancedMode} className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`} value={config.target_platform} onChange={e=>patch({target_platform:e.target.value})}><option>linux/amd64</option><option>linux/arm64</option></select></Field>
      <Field label="CUDA"><input disabled={!advancedMode} className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`} value={config.cuda_version} onChange={e=>patch({cuda_version:e.target.value})}/></Field><Field label="Python"><input disabled={!advancedMode} className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`} value={config.python_version} onChange={e=>patch({python_version:e.target.value})}/></Field><Field label="PyTorch index URL"><input disabled={!advancedMode} className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`} value={config.pytorch_index_url} onChange={e=>patch({pytorch_index_url:e.target.value})}/></Field>
      <Field label="Repositorio ComfyUI" wide><input className={inputClass} value={config.comfyui_repository} onChange={e=>patch({comfyui_repository:e.target.value})}/></Field><Field label="Commit ComfyUI"><input disabled={!advancedMode} className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`} value={config.comfyui_commit ?? ""} onChange={e=>patch({comfyui_commit:e.target.value || null})}/><span className="mt-2 block text-xs text-zinc-500">Referencia validada para ComfyUI {selectedValidatedProfile?.comfyui_version ?? "—"}.</span></Field>
      <Field label="Imagen del registro" wide><input className={inputClass} value={config.registry_image} onChange={e=>patch({registry_image:e.target.value})}/></Field><Field label="Notas" wide><textarea className="min-h-24 w-full rounded-xl border border-white/10 bg-black/25 p-3 text-sm text-white" value={config.notes ?? ""} onChange={e=>patch({notes:e.target.value || null})}/></Field>
    </section></div>}

    {tab === "nodes" && <ListEditor title="Custom Nodes" onAdd={()=>patch({custom_nodes:[...config.custom_nodes,{name:"",repository:"",commit:null,enabled:true,install_requirements:true}]})}><div className="mb-4 rounded-2xl border border-emerald-500/15 bg-emerald-950/10 p-4"><p className="text-sm font-semibold text-emerald-300">Paquetes base obligatorios</p><div className="mt-3 flex flex-wrap gap-2">{REQUIRED_NODE_NAMES.map(name=><span key={name} className="rounded-lg border border-emerald-500/15 px-2.5 py-1 text-xs text-emerald-200">✓ {name}</span>)}</div><p className="mt-3 text-xs text-zinc-500">Se incorporan siempre a la imagen, incluso cuando el workflow los usa dentro de subgrafos.</p></div>{config.custom_nodes.map((node,index)=><div key={index} className="grid gap-3 rounded-2xl border border-white/8 bg-black/20 p-4 lg:grid-cols-[1fr_2fr_1fr_auto]">
      <input placeholder="Nombre" className={inputClass} value={node.name} onChange={e=>patch({custom_nodes:config.custom_nodes.map((n,i)=>i===index?{...n,name:e.target.value}:n)})}/><input placeholder="Repositorio Git" className={inputClass} value={node.repository} onChange={e=>patch({custom_nodes:config.custom_nodes.map((n,i)=>i===index?{...n,repository:e.target.value}:n)})}/><input placeholder="Commit fijo" className={inputClass} value={node.commit ?? ""} onChange={e=>patch({custom_nodes:config.custom_nodes.map((n,i)=>i===index?{...n,commit:e.target.value||null}:n)})}/><Delete onClick={()=>patch({custom_nodes:config.custom_nodes.filter((_,i)=>i!==index)})}/></div>)}</ListEditor>}

    {tab === "models" && <ListEditor title="Catálogo de modelos" onAdd={()=>patch({models:[...config.models,{name:"",model_type:"other",source_url:null,target_path:"",sha256:null,strategy:"volume",enabled:true}]})}>{config.models.map((model,index)=><div key={index} className="grid gap-3 rounded-2xl border border-white/8 bg-black/20 p-4 lg:grid-cols-3">
      <input placeholder="Nombre" className={inputClass} value={model.name} onChange={e=>patch({models:config.models.map((m,i)=>i===index?{...m,name:e.target.value}:m)})}/><select className={inputClass} value={model.model_type} onChange={e=>patch({models:config.models.map((m,i)=>i===index?{...m,model_type:e.target.value as typeof m.model_type}:m)})}>{["checkpoint","vae","lora","controlnet","clip","upscaler","diffusion_model","embedding","detector","sam","ipadapter","video_model","other"].map(x=><option key={x}>{x}</option>)}</select><select className={inputClass} value={model.strategy} onChange={e=>patch({models:config.models.map((m,i)=>i===index?{...m,strategy:e.target.value as typeof m.strategy}:m)})}><option value="volume">Volumen</option><option value="image">Dentro de imagen</option><option value="startup-download">Descargar al iniciar</option></select>
      <input placeholder="Ruta en ComfyUI/models" className={inputClass} value={model.target_path} onChange={e=>patch({models:config.models.map((m,i)=>i===index?{...m,target_path:e.target.value}:m)})}/><input placeholder="URL de origen" className={`${inputClass} lg:col-span-2`} value={model.source_url ?? ""} onChange={e=>patch({models:config.models.map((m,i)=>i===index?{...m,source_url:e.target.value||null}:m)})}/><div className="lg:col-span-3 flex justify-end"><Delete onClick={()=>patch({models:config.models.filter((_,i)=>i!==index)})}/></div></div>)}</ListEditor>}

    {tab === "dependencies" && <ListEditor title="Dependencias Python adicionales" onAdd={()=>patch({python_dependencies:[...config.python_dependencies,{package:"",version:null,enabled:true}]})}>{config.python_dependencies.map((dep,index)=><div key={index} className="grid gap-3 rounded-2xl border border-white/8 bg-black/20 p-4 md:grid-cols-[2fr_1fr_auto]"><input placeholder="Paquete" className={inputClass} value={dep.package} onChange={e=>patch({python_dependencies:config.python_dependencies.map((d,i)=>i===index?{...d,package:e.target.value}:d)})}/><input placeholder="Versión" className={inputClass} value={dep.version ?? ""} onChange={e=>patch({python_dependencies:config.python_dependencies.map((d,i)=>i===index?{...d,version:e.target.value||null}:d)})}/><Delete onClick={()=>patch({python_dependencies:config.python_dependencies.filter((_,i)=>i!==index)})}/></div>)}</ListEditor>}

    {tab === "environment" && <div className="grid gap-5 xl:grid-cols-2"><ListEditor title="Variables de entorno" onAdd={()=>patch({environment_variables:[...config.environment_variables,{key:"",value:null,secret:false,required:false}]})}>{config.environment_variables.map((env,index)=><div key={index} className="grid gap-3 rounded-2xl border border-white/8 bg-black/20 p-4 md:grid-cols-[1fr_1fr_auto]"><input placeholder="CLAVE" className={inputClass} value={env.key} onChange={e=>patch({environment_variables:config.environment_variables.map((v,i)=>i===index?{...v,key:e.target.value.toUpperCase()}:v)})}/><input placeholder={env.secret?"Secreto no almacenado":"Valor"} className={inputClass} value={env.value ?? ""} onChange={e=>patch({environment_variables:config.environment_variables.map((v,i)=>i===index?{...v,value:e.target.value||null}:v)})}/><Delete onClick={()=>patch({environment_variables:config.environment_variables.filter((_,i)=>i!==index)})}/></div>)}</ListEditor><ListEditor title="Volúmenes" onAdd={()=>patch({volumes:[...config.volumes,{name:"models",mount_path:"/opt/ComfyUI/models",read_only:false}]})}>{config.volumes.map((volume,index)=><div key={index} className="grid gap-3 rounded-2xl border border-white/8 bg-black/20 p-4 md:grid-cols-[1fr_2fr_auto]"><input placeholder="Nombre" className={inputClass} value={volume.name} onChange={e=>patch({volumes:config.volumes.map((v,i)=>i===index?{...v,name:e.target.value}:v)})}/><input placeholder="Ruta de montaje" className={inputClass} value={volume.mount_path} onChange={e=>patch({volumes:config.volumes.map((v,i)=>i===index?{...v,mount_path:e.target.value}:v)})}/><Delete onClick={()=>patch({volumes:config.volumes.filter((_,i)=>i!==index)})}/></div>)}</ListEditor></div>}

    {tab === "preview" && <section className={cardClass}>{!generated ? <div className="py-16 text-center text-zinc-500"><FileJson2 className="mx-auto mb-3"/>Pulsa “Generar archivos” para crear el Dockerfile y los manifiestos.</div> : <div className="space-y-5"><CodeBlock title="Dockerfile" value={generated.dockerfile}/><CodeBlock title="entrypoint.sh" value={generated.entrypoint}/><CodeBlock title="runtime-manifest.json" value={JSON.stringify(generated.runtime_manifest,null,2)}/><CodeBlock title="custom-nodes.lock.json" value={JSON.stringify(generated.custom_nodes_lock,null,2)}/><CodeBlock title="models-manifest.json" value={JSON.stringify(generated.models_manifest,null,2)}/></div>}</section>}
    {tab === "generator" && <RuntimeContextGenerator />}
    {tab === "model-export" && <RuntimeMega3Panel />}
    {tab === "builds" && <RuntimeBuildPanel />}
  </div>;
}

function Field({label,wide,children}:{label:string;wide?:boolean;children:React.ReactNode}) { return <label className={wide?"md:col-span-2 xl:col-span-2":""}><span className="mb-2 block text-xs font-semibold tracking-wide text-zinc-500 uppercase">{label}</span>{children}</label>; }
function ListEditor({title,onAdd,children}:{title:string;onAdd:()=>void;children:React.ReactNode}) { return <section className={cardClass}><div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 font-semibold text-white"><Boxes size={18} className="text-red-400"/>{title}</h2><button onClick={onAdd} className="inline-flex items-center gap-2 rounded-xl bg-red-950/40 px-3 py-2 text-sm text-red-300"><Plus size={15}/>Agregar</button></div><div className="space-y-3">{children}</div></section>; }
function Delete({onClick}:{onClick:()=>void}) { return <button onClick={onClick} className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/15 text-red-400 hover:bg-red-950/30"><Trash2 size={16}/></button>; }
function CodeBlock({title,value}:{title:string;value:string}) { return <div><h3 className="mb-2 text-sm font-semibold text-white">{title}</h3><pre className="max-h-96 overflow-auto rounded-2xl border border-white/8 bg-black/40 p-4 text-xs leading-6 text-zinc-300">{value}</pre></div>; }
