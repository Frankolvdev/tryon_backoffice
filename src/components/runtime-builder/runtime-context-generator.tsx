"use client";

import { Archive, CheckCircle2, Copy, HardDrive, LoaderCircle, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { RuntimeContextGenerateResponse } from "@/types/admin-runtime-builder";

const inputClass = "h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-white outline-none transition focus:border-red-500/50";

export function RuntimeContextGenerator() {
  const [comfyuiPath, setComfyuiPath] = useState("");
  const [outputDirectory, setOutputDirectory] = useState("");
  const [copyModels, setCopyModels] = useState(true);
  const [copyNodes, setCopyNodes] = useState(true);
  const [sha256, setSha256] = useState(true);
  const [overwrite, setOverwrite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RuntimeContextGenerateResponse | null>(null);

  const generate = async () => {
    if (!comfyuiPath.trim()) { toast.error("Indica la ruta local de ComfyUI."); return; }
    setLoading(true); setResult(null);
    try {
      const value = await browserApiRequest<RuntimeContextGenerateResponse>("/api/admin/runtime-builder/context/generate", {
        method: "POST",
        body: JSON.stringify({ comfyui_path: comfyuiPath.trim(), output_directory: outputDirectory.trim() || null, copy_models: copyModels, copy_custom_nodes: copyNodes, calculate_sha256: sha256, overwrite }),
      });
      setResult(value); toast.success("Contexto Docker autocontenido generado.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible generar el contexto Docker."); }
    finally { setLoading(false); }
  };

  return <div className="space-y-5">
    <section className="luxia-panel rounded-3xl p-5">
      <div className="mb-5 flex items-start gap-4"><div className="flex size-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400"><Archive /></div><div><h2 className="font-semibold text-white">Generar runtime autocontenido</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-500">Copia únicamente los modelos y Custom Nodes seleccionados por el workflow y crea un contexto Docker listo para construir.</p></div></div>
      <div className="grid gap-4 lg:grid-cols-2">
        <label><span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Ruta local de ComfyUI</span><input className={inputClass} placeholder="F:\\ComfyUI o carpeta Pinokio" value={comfyuiPath} onChange={e=>setComfyuiPath(e.target.value)} /></label>
        <label><span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Directorio de salida (opcional)</span><input className={inputClass} placeholder="F:\\runtime_exports" value={outputDirectory} onChange={e=>setOutputDirectory(e.target.value)} /></label>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Toggle label="Copiar modelos locales" checked={copyModels} onChange={setCopyModels} />
        <Toggle label="Copiar Custom Nodes" checked={copyNodes} onChange={setCopyNodes} />
        <Toggle label="Calcular SHA-256" checked={sha256} onChange={setSha256} />
        <Toggle label="Sobrescribir salida" checked={overwrite} onChange={setOverwrite} />
      </div>
      <button onClick={()=>void generate()} disabled={loading} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-60">{loading?<LoaderCircle size={16} className="animate-spin"/>:<HardDrive size={16}/>} {loading?"Copiando archivos…":"Generar contexto Docker"}</button>
    </section>
    {result && <section className="luxia-panel rounded-3xl p-5">
      <div className="flex items-center gap-3"><CheckCircle2 className="text-emerald-400"/><div><h3 className="font-semibold text-white">Runtime generado correctamente</h3><p className="text-sm text-zinc-500">{result.models_copied} modelos · {result.custom_nodes_copied} Custom Nodes · {formatBytes(result.bytes_copied)}</p></div></div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2"><PathBox label="Directorio" value={result.output_directory}/><PathBox label="Archivo ZIP" value={result.archive_path}/></div>
      {result.warnings.length>0 && <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-950/10 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-amber-300"><TriangleAlert size={16}/>Advertencias</div><div className="mt-2 space-y-1 text-sm text-zinc-400">{result.warnings.map((w,i)=><p key={i}>• {w}</p>)}</div></div>}
    </section>}
  </div>;
}
function Toggle({label,checked,onChange}:{label:string;checked:boolean;onChange:(v:boolean)=>void}){return <label className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-zinc-300"><span>{label}</span><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} className="size-4 accent-red-600"/></label>}
function PathBox({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-white/8 bg-black/20 p-4"><span className="text-xs uppercase tracking-wide text-zinc-500">{label}</span><div className="mt-2 flex items-center gap-2"><code className="min-w-0 flex-1 break-all text-xs text-zinc-300">{value}</code><button onClick={()=>{void navigator.clipboard.writeText(value);toast.success("Ruta copiada.")}} className="rounded-lg border border-white/10 p-2 text-zinc-400"><Copy size={14}/></button></div></div>}
function formatBytes(value:number){if(!value)return "0 B";const units=["B","KB","MB","GB","TB"];const i=Math.min(Math.floor(Math.log(value)/Math.log(1024)),units.length-1);return `${(value/1024**i).toFixed(i?2:0)} ${units[i]}`}
