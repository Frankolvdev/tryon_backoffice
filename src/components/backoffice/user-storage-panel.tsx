"use client";

import { FileInput, FileOutput, FolderOpen, HardDrive, ImageIcon, LoaderCircle, RefreshCcw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import { toast } from "sonner";

import { StorageImageViewer } from "@/components/backoffice/tryon/storage-image-viewer";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { AdminStorageFile } from "@/types/admin-storage";
import type { GenerationModuleExecution } from "@/types/admin-generation-modules";
import type { AdminUserGenerationDeleteResponse } from "@/types/admin-users";

interface Props { userId: number; }
interface ExecutionListResponse { items: GenerationModuleExecution[]; total: number; skip: number; limit: number; }
interface StorageFileListResponse { items: AdminStorageFile[]; total: number; total_size_bytes: number; skip: number; limit: number; }
type View = "generations" | "inputs" | "results" | "library" | "other";

const size = (bytes: number | null) => {
  const value = Number(bytes || 0);
  if (value < 1024) return `${value} B`;
  if (value < 1024**2) return `${(value/1024).toFixed(1)} KB`;
  if (value < 1024**3) return `${(value/1024**2).toFixed(1)} MB`;
  return `${(value/1024**3).toFixed(2)} GB`;
};
const date = (value: string) => new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

function collectFileIds(value: unknown, target = new Set<number>()): Set<number> {
  if (Array.isArray(value)) { value.forEach((item) => collectFileIds(item, target)); return target; }
  if (!value || typeof value !== "object") return target;
  const record = value as Record<string, unknown>;
  const raw = record.storage_file_id;
  const parsed = typeof raw === "number" ? raw : (typeof raw === "string" ? Number(raw) : NaN);
  if (Number.isInteger(parsed) && parsed > 0) target.add(parsed);
  Object.values(record).forEach((item) => collectFileIds(item, target));
  return target;
}

function kind(file: AdminStorageFile): View {
  if (file.object_key.startsWith("generation-inputs/")) return "inputs";
  if (file.object_key.startsWith("generation-results/")) return "results";
  if (file.object_key.startsWith("user-library/")) return "library";
  return "other";
}

export function UserStoragePanel({ userId }: Props) {
  const [executions, setExecutions] = useState<GenerationModuleExecution[]>([]);
  const [files, setFiles] = useState<AdminStorageFile[]>([]);
  const [storageTotal, setStorageTotal] = useState(0);
  const [storageBytes, setStorageBytes] = useState(0);
  const [view, setView] = useState<View>("generations");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [executionResponse, storedFiles] = await Promise.all([
        browserApiRequest<ExecutionListResponse>(`/api/admin/generation-module-executions?user_id=${userId}&limit=500`),
        browserApiRequest<StorageFileListResponse>(`/api/admin/users/${userId}/storage-files?limit=1000`),
      ]);
      setExecutions(executionResponse.items);
      setFiles(storedFiles.items);
      setStorageTotal(storedFiles.total);
      setStorageBytes(storedFiles.total_size_bytes);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible cargar el almacenamiento del usuario.");
    } finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  const filteredFiles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return files.filter((file) => kind(file) === view && (!q || [file.original_filename, file.object_key, file.content_type, file.provider].some((v) => String(v ?? "").toLowerCase().includes(q))));
  }, [files, search, view]);

  const filteredExecutions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return executions.filter((item) => !q || [item.id, item.module_key, item.status, item.engine].some((v) => String(v ?? "").toLowerCase().includes(q)));
  }, [executions, search]);


  async function deleteGeneration(execution: GenerationModuleExecution) {
    if (!window.confirm(`Se eliminará la generación ${execution.id.slice(0, 8)} y sus resultados almacenados. El historial financiero se conservará. ¿Continuar?`)) return;
    setDeleting(execution.id);
    try {
      const result = await browserApiRequest<AdminUserGenerationDeleteResponse>(
        `/api/admin/users/${userId}/generations/${execution.id}/storage`,
        { method: "DELETE" },
      );
      toast.success(`Generación eliminada. ${result.deleted_result_files} archivo(s) de resultado borrados; finanzas conservadas.`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible eliminar la generación.");
    } finally { setDeleting(null); }
  }

  return (
    <section className="luxia-panel rounded-3xl p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-950/20 text-cyan-300"><HardDrive size={19}/></div>
          <div><h2 className="font-semibold text-white">Almacenamiento del usuario</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-600">Aquí ves generaciones y archivos guardados sin importar si están en Local, S3 o Cloudflare R2. Las previsualizaciones usan el proveedor original de cada archivo.</p></div>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/8 px-3 text-xs text-zinc-400 disabled:opacity-50"><RefreshCcw size={14} className={loading ? "animate-spin" : undefined}/>Actualizar</button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Generaciones guardadas" value={String(executions.length)} />
        <Metric label="Archivos encontrados" value={String(storageTotal)} />
        <Metric label="Espacio de estos archivos" value={size(storageBytes)} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Tab active={view==="generations"} onClick={()=>setView("generations")} icon={ImageIcon} label={`Generaciones (${executions.length})`}/>
        <Tab active={view==="inputs"} onClick={()=>setView("inputs")} icon={FileInput} label={`Archivos subidos (${files.filter(f=>kind(f)==="inputs").length})`}/>
        <Tab active={view==="results"} onClick={()=>setView("results")} icon={FileOutput} label={`Resultados (${files.filter(f=>kind(f)==="results").length})`}/>
        <Tab active={view==="library"} onClick={()=>setView("library")} icon={FolderOpen} label={`Librería (${files.filter(f=>kind(f)==="library").length})`}/>
        <Tab active={view==="other"} onClick={()=>setView("other")} icon={HardDrive} label={`Otros (${files.filter(f=>kind(f)==="other").length})`}/>
      </div>

      <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Buscar por nombre, módulo, estado o archivo..." className="mt-4 h-10 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-cyan-500/30"/>
      {storageTotal > files.length && <p className="mt-2 text-xs text-amber-300">Este usuario tiene más de 1,000 archivos. Se muestran los 1,000 más recientes; usa el módulo global de Almacenamiento para búsquedas históricas más amplias.</p>}

      {loading ? <div className="flex min-h-64 items-center justify-center"><LoaderCircle className="animate-spin text-cyan-300"/></div> : view === "generations" ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {filteredExecutions.length === 0 ? <Empty text="Este usuario no tiene generaciones que coincidan con el filtro."/> : filteredExecutions.map((execution) => {
            const outputIds = collectFileIds(execution.outputs);
            const resultFiles = files.filter((file) => outputIds.has(file.id) || file.object_key.startsWith(`generation-results/${execution.id}/`));
            return <article key={execution.id} className="rounded-2xl border border-white/7 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div><p className="font-semibold text-white">{execution.module_key}</p><p className="mt-1 font-mono text-[10px] text-zinc-700">{execution.id}</p><p className="mt-2 text-xs text-zinc-500">{date(execution.created_at)} · {friendlyEngine(execution.engine)} · {friendlyStatus(execution.status)}</p></div>
                <button type="button" onClick={() => void deleteGeneration(execution)} disabled={deleting===execution.id || !["completed","failed","cancelled"].includes(execution.status)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/10 px-3 text-xs text-red-300 disabled:opacity-35">{deleting===execution.id?<LoaderCircle size={14} className="animate-spin"/>:<Trash2 size={14}/>}Eliminar</button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {resultFiles.length === 0 ? <p className="col-span-full text-xs text-zinc-600">No hay un archivo de resultado almacenado para previsualizar.</p> : resultFiles.slice(0,6).map((file)=><FilePreview key={file.id} file={file}/>) }
              </div>
              <p className="mt-3 text-[11px] leading-5 text-zinc-700">Eliminar desde aquí borra la ejecución y sus archivos de resultado, pero conserva el historial financiero para auditoría. Los archivos de entrada se administran por separado.</p>
            </article>;
          })}
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredFiles.length === 0 ? <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4"><Empty text="No hay archivos que coincidan con este filtro."/></div> : filteredFiles.map((file)=><FileCard key={file.id} file={file}/>) }
        </div>
      )}
    </section>
  );
}

function isImage(file: AdminStorageFile) {
  const type = (file.content_type || "").toLowerCase();
  const name = (file.original_filename || file.object_key || "").toLowerCase();
  return type.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp|avif)$/i.test(name);
}

function FilePreview({file}:{file:AdminStorageFile}) {
  const [viewerOpen,setViewerOpen]=useState(false);
  const image = isImage(file);
  const contentUrl = `/api/admin/storage/files/${file.id}/content`;

  return <>
    <button
      type="button"
      onClick={() => image && setViewerOpen(true)}
      disabled={!image}
      className="block w-full overflow-hidden rounded-xl border border-white/6 bg-black/30 text-left disabled:cursor-default"
      title={image ? "Abrir visor" : "Este archivo no es una imagen previsualizable"}
    >
      {image
        ? <div className="flex aspect-square items-center justify-center overflow-hidden bg-[#070708] p-2"><img src={contentUrl} alt={file.original_filename||"Resultado"} className="h-full w-full object-contain"/></div>
        : <div className="flex aspect-square items-center justify-center text-zinc-700"><ImageIcon size={20}/></div>}
      <div className="p-2"><p className="truncate text-[10px] text-zinc-500">{file.original_filename||`Archivo #${file.id}`}</p></div>
    </button>
    {viewerOpen && image && <StorageImageViewer file={file} onClose={()=>setViewerOpen(false)}/>}
  </>;
}

function FileCard({file}:{file:AdminStorageFile}) {
  return <article className="rounded-2xl border border-white/7 bg-black/20 p-4"><FilePreview file={file}/><p className="mt-3 truncate text-sm font-medium text-white">{file.original_filename||`Archivo #${file.id}`}</p><p className="mt-1 text-xs text-zinc-600">{size(file.size_bytes)} · {file.provider}</p><p className="mt-1 truncate text-[10px] text-zinc-700">{file.object_key}</p><p className="mt-2 text-[10px] text-zinc-700">{date(file.created_at)}</p></article>;
}
function Metric({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-white/6 bg-black/20 p-4"><p className="text-[10px] uppercase tracking-[.12em] text-zinc-600">{label}</p><p className="mt-2 text-lg font-semibold text-white">{value}</p></div>}
function Empty({text}:{text:string}){return <div className="rounded-2xl border border-dashed border-white/8 p-8 text-center text-sm text-zinc-600">{text}</div>}
function friendlyStatus(status:string){return status==="completed"?"Completada":status==="failed"?"Fallida":status==="cancelled"?"Cancelada":status==="running"?"Generando":"En cola"}
function friendlyEngine(engine:string){return engine==="runpod_serverless"?"RunPod":engine==="local_docker"?"Local":engine==="modal"?"Modal":engine==="beam"?"Beam":engine==="simulated"?"Simulado":engine}
function Tab({active,onClick,icon:Icon,label}:{active:boolean;onClick:()=>void;icon:ComponentType<{size?:number}>;label:string}){return <button type="button" onClick={onClick} className={active?"inline-flex h-9 items-center gap-2 rounded-xl bg-cyan-950/30 px-3 text-xs text-cyan-200":"inline-flex h-9 items-center gap-2 rounded-xl border border-white/7 px-3 text-xs text-zinc-500 hover:text-zinc-300"}><Icon size={14}/>{label}</button>}
