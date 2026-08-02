"use client";

import { Archive, CheckCircle2, Copy, HardDrive, LoaderCircle, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { RuntimeBuilderConfig, RuntimeContextGenerateResponse, RuntimeContextJob, RuntimeProject } from "@/types/admin-runtime-builder";
import type { ModalProviderConfig } from "@/types/admin-infrastructure-providers";

const inputClass = "h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-white outline-none transition focus:border-red-500/50";

export function RuntimeContextGenerator() {
  const [comfyuiPath, setComfyuiPath] = useState("");
  const [outputDirectory, setOutputDirectory] = useState("");
  const [containerWorkdir, setContainerWorkdir] = useState("/app");
  const [copyModels, setCopyModels] = useState(true);
  const [copyNodes, setCopyNodes] = useState(true);
  const [sha256, setSha256] = useState(true);
  const [overwrite, setOverwrite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RuntimeContextGenerateResponse | null>(null);
  const [job, setJob] = useState<RuntimeContextJob | null>(null);
  const [provider, setProvider] = useState<string>("modal");
  const [modalConfig, setModalConfig] = useState<ModalProviderConfig | null>(null);
  const [residentModelsText, setResidentModelsText] = useState("");

  useEffect(() => {
    void Promise.all([browserApiRequest<RuntimeProject>("/api/admin/runtime-builder/project"), browserApiRequest<RuntimeBuilderConfig>("/api/admin/runtime-builder/config"), browserApiRequest<ModalProviderConfig>("/api/admin/infrastructure-providers/modal")])
      .then(([config, runtimeConfig, modal]) => {
        setProvider(runtimeConfig.provider || "modal");
        setModalConfig(modal);
        setResidentModelsText((modal.snapshot_resident_models || []).join("\n"));
        setComfyuiPath(config.source_comfyui_path || "");
        setOutputDirectory(config.export_root_directory || "");
        setContainerWorkdir(config.container_workdir || "/app");
        if (config.export_directory) {
          setResult({
            success: true,
            output_directory: config.export_directory,
            archive_path: config.last_export_archive || "",
            models_copied: Number((config.last_export_manifest?.summary as Record<string, unknown> | undefined)?.models_copied || 0),
            custom_nodes_copied: Number((config.last_export_manifest?.summary as Record<string, unknown> | undefined)?.custom_nodes_copied || 0),
            bytes_copied: Number((config.last_export_manifest?.summary as Record<string, unknown> | undefined)?.bytes_copied || 0),
            files_generated: [],
            warnings: [],
            manifest: config.last_export_manifest || {},
          });
        }
      })
      .catch(() => undefined);
  }, []);

  const saveWorkspace = async () => browserApiRequest<RuntimeProject>("/api/admin/runtime-builder/project", {
    method: "PATCH",
    body: JSON.stringify({
      source_comfyui_path: comfyuiPath.trim() || null,
      export_root_directory: outputDirectory.trim() || null,
      container_workdir: containerWorkdir.trim() || "/app",
    }),
  });

  const waitForJob = async (created: RuntimeContextJob) => {
    let current = created;
    while (current.status === "queued" || current.status === "running") {
      await new Promise((resolve) => window.setTimeout(resolve, 2000));
      current = await browserApiRequest<RuntimeContextJob>(`/api/admin/runtime-builder/context/jobs/${created.job_id}`);
      setJob(current);
    }
    if (current.status === "failed") throw new Error(current.error || "La exportación no pudo completarse.");
    if (!current.result) throw new Error("El backend terminó sin devolver resultado.");
    return current.result;
  };

  const generate = async () => {
    if (!comfyuiPath.trim()) return toast.error("Indica la ruta local de ComfyUI.");
    setLoading(true);
    setResult(null);
    try {
      await saveWorkspace();
      if (provider === "modal" && modalConfig) {
        const snapshot_resident_models = residentModelsText.split(/\r?\n/).map(v => v.trim()).filter(Boolean);
        const savedModal = await browserApiRequest<ModalProviderConfig>("/api/admin/infrastructure-providers/modal", { method: "PUT", body: JSON.stringify({ ...modalConfig, snapshot_resident_models }) });
        setModalConfig(savedModal);
        setResidentModelsText((savedModal.snapshot_resident_models || []).join("\n"));
      }
      const created = await browserApiRequest<RuntimeContextJob>("/api/admin/runtime-builder/context/generate", {
        method: "POST",
        body: JSON.stringify({
          comfyui_path: comfyuiPath.trim(),
          output_directory: outputDirectory.trim() || null,
          copy_models: copyModels,
          copy_custom_nodes: copyNodes,
          calculate_sha256: sha256,
          overwrite,
        }),
      });
      setJob(created);
      const response = await waitForJob(created) as RuntimeContextGenerateResponse;
      setResult(response);
      toast.success("Contexto Docker generado y ruta guardada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible generar el contexto Docker.");
    } finally {
      setLoading(false);
    }
  };

  return <div className="space-y-5">
    <section className="luxia-panel rounded-3xl p-5">
      <div className="mb-5 flex items-start gap-4"><div className="flex size-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400"><Archive /></div><div><h2 className="font-semibold text-white">6. Generar runtime autocontenido</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-500">Copia los recursos seleccionados y crea el contexto Docker listo para construir. La exportación de modelos se administra únicamente desde “Modelos y Docker”.</p></div></div>
      <div className="grid gap-4 lg:grid-cols-3"><Field label="Ruta local de ComfyUI"><input className={inputClass} placeholder="F:\\ComfyUI" value={comfyuiPath} onChange={e=>setComfyuiPath(e.target.value)} onBlur={()=>void saveWorkspace()}/></Field><Field label="Directorio raíz de exportación"><input className={inputClass} placeholder="F:\\runtime_exports" value={outputDirectory} onChange={e=>setOutputDirectory(e.target.value)} onBlur={()=>void saveWorkspace()}/></Field><Field label="Ruta interna del contenedor"><input className={inputClass} value={containerWorkdir} onChange={e=>setContainerWorkdir(e.target.value)} onBlur={()=>void saveWorkspace()}/></Field></div>
      {provider === "modal" && <div className="mt-5"><Field label="Modelos residentes del snapshot de Modal (una ruta por línea)"><textarea className={`${inputClass} min-h-36 py-3`} value={residentModelsText} onChange={e=>setResidentModelsText(e.target.value)} /><span className="mt-2 block text-xs text-zinc-500">Se guarda antes de exportar y se respeta exactamente la lista indicada.</span></Field></div>}
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Toggle label="Copiar modelos locales" checked={copyModels} onChange={setCopyModels}/><Toggle label="Copiar Custom Nodes" checked={copyNodes} onChange={setCopyNodes}/><Toggle label="Calcular SHA-256" checked={sha256} onChange={setSha256}/><Toggle label="Sobrescribir salida" checked={overwrite} onChange={setOverwrite}/></div>
      <button onClick={()=>void generate()} disabled={loading} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-60">{loading?<LoaderCircle size={16} className="animate-spin"/>:<HardDrive size={16}/>} {loading?`${job?.progress??0}% · ${job?.message??"Iniciando…"}`:"6. Generar contexto Docker"}</button>
    </section>
    {loading&&job&&<Progress job={job}/>} 
    {result&&<ResultCard title="Runtime generado correctamente" subtitle={`${result.models_copied} modelos · ${result.custom_nodes_copied} Custom Nodes · ${formatBytes(result.bytes_copied)}`} paths={[["Directorio",result.output_directory]]} warnings={result.warnings}/>} 
  </div>;
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label><span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</span>{children}</label>}
function Toggle({label,checked,onChange}:{label:string;checked:boolean;onChange:(v:boolean)=>void}){return <label className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-zinc-300"><span>{label}</span><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} className="size-4 accent-red-600"/></label>}
function Progress({job}:{job:RuntimeContextJob}){return <section className="luxia-panel rounded-3xl p-5"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold text-white">Exportación en segundo plano</p><p className="mt-1 text-sm text-zinc-500">{job.message}</p></div><span className="text-sm font-semibold text-red-300">{job.progress}%</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-red-700 transition-all duration-500" style={{width:`${job.progress}%`}}/></div><p className="mt-3 text-xs uppercase tracking-wide text-zinc-600">Fase: {job.phase}</p></section>}
function ResultCard({title,subtitle,paths,warnings}:{title:string;subtitle:string;paths:Array<[string,string]>;warnings:string[]}){return <section className="luxia-panel rounded-3xl p-5"><div className="flex items-center gap-3"><CheckCircle2 className="text-emerald-400"/><div><h3 className="font-semibold text-white">{title}</h3><p className="text-sm text-zinc-500">{subtitle}</p></div></div><div className="mt-4 grid gap-3 lg:grid-cols-2">{paths.map(([label,value])=><PathBox key={label} label={label} value={value}/>)}</div>{warnings.length>0&&<div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-950/10 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-amber-300"><TriangleAlert size={16}/>Advertencias</div><div className="mt-2 space-y-1 text-sm text-zinc-400">{warnings.map((w,i)=><p key={i}>• {w}</p>)}</div></div>}</section>}
function PathBox({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-white/8 bg-black/20 p-4"><span className="text-xs uppercase tracking-wide text-zinc-500">{label}</span><div className="mt-2 flex items-center gap-2"><code className="min-w-0 flex-1 break-all text-xs text-zinc-300">{value}</code><button onClick={()=>{void navigator.clipboard.writeText(value);toast.success("Ruta copiada.")}} className="rounded-lg border border-white/10 p-2 text-zinc-400"><Copy size={14}/></button></div></div>}
function formatBytes(value:number){if(!value)return "0 B";const units=["B","KB","MB","GB","TB"];const i=Math.min(Math.floor(Math.log(value)/Math.log(1024)),units.length-1);return `${(value/1024**i).toFixed(i?2:0)} ${units[i]}`}
