"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { browserApiRequest } from "@/lib/api/browser-api";

type Module = { id:number; key:string; name:string; version:number; is_active:boolean; updated_at:string };
type Execution = { id:string; module_key:string; engine:string; status:string; progress:number; created_at:string; started_at?:string|null; finished_at?:string|null; duration_ms?:number|null; error?:string|null; user_id?:number|null; logs?:Array<{timestamp:string;level:string;message:string}> };
type SecuritySummary = {
  policy: {
    user_allowed_engines:string[];
    admin_allowed_engines:string[];
    max_active_executions_per_user:number;
    max_history_page_size:number;
    python_steps_admin_only:boolean;
    audit_enabled:boolean;
  };
  active_executions:number;
  active_user_executions:number;
  tracked_executions:number;
};

export default function GenerationOperationsPage(){
 const [modules,setModules]=useState<Module[]>([]);
 const [executions,setExecutions]=useState<Execution[]>([]);
 const [security,setSecurity]=useState<SecuritySummary|null>(null);
 const [selected,setSelected]=useState<number|null>(null);
 const [message,setMessage]=useState("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const load=useCallback(async()=>{
   try{
     const [m,e,s]=await Promise.all([
       browserApiRequest<{items:Module[]}>("/api/admin/generation-modules?limit=500"),
       browserApiRequest<{items:Execution[]}>("/api/admin/generation-modules/execution-history?limit=200"),
       browserApiRequest<SecuritySummary>("/api/admin/generation-modules/runtime/security"),
     ]);
     setModules(m.items);setExecutions(e.items);setSecurity(s);setError("");
   }catch(cause){setError(cause instanceof Error?cause.message:"No se pudo cargar la consola de operaciones.")}
 },[]);
 useEffect(()=>{void load();const timer=window.setInterval(()=>void load(),5000);return()=>window.clearInterval(timer)},[load]);
 const selectedModule=useMemo(()=>modules.find(item=>item.id===selected)??null,[modules,selected]);
 async function action(task:()=>Promise<void>){setBusy(true);setMessage("");setError("");try{await task();await load()}catch(cause){setError(cause instanceof Error?cause.message:"La operación no pudo completarse.")}finally{setBusy(false)}}
 const clone=()=>action(async()=>{if(!selected)throw new Error("Selecciona un módulo.");await browserApiRequest(`/api/admin/generation-modules/${selected}/clone`,{method:"POST",body:JSON.stringify({activate:false})});setMessage("Se creó una nueva versión en borrador.")});
 const publish=()=>action(async()=>{if(!selected)throw new Error("Selecciona un módulo.");await browserApiRequest(`/api/admin/generation-modules/${selected}/publish`,{method:"POST",body:JSON.stringify({deactivate_other_versions:true})});setMessage("Versión publicada y versiones anteriores desactivadas.")});

 const cancelExecution=(id:string)=>action(async()=>{await browserApiRequest(`/api/admin/generation-modules/executions/${id}/cancel`,{method:"POST"});setMessage("Cancelación solicitada.")});
 const retryExecution=(id:string)=>action(async()=>{await browserApiRequest(`/api/admin/generation-modules/executions/${id}/retry`,{method:"POST",body:JSON.stringify({})});setMessage("Ejecución enviada nuevamente a la cola.")});
 const download=async()=>{if(!selected){setError("Selecciona un módulo.");return}const data=await browserApiRequest(`/api/admin/generation-modules/${selected}/export`);const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`generation-module-${selected}.json`;a.click();URL.revokeObjectURL(url)};
 return <div className="space-y-7">
  <header><p className="text-xs font-semibold uppercase tracking-[.28em] text-red-400">Operaciones</p><h1 className="mt-2 text-3xl font-semibold text-white">Jobs, seguridad y versiones</h1><p className="mt-2 text-sm text-zinc-500">Monitoreo unificado del runtime, publicación y política de acceso.</p></header>
  {message&&<div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-300">{message}</div>}
  {error&&<div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">{error}</div>}
  {security&&<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <Metric label="Ejecuciones activas" value={security.active_executions}/><Metric label="Activas de usuarios" value={security.active_user_executions}/><Metric label="Ejecuciones rastreadas" value={security.tracked_executions}/><Metric label="Máximo por usuario" value={security.policy.max_active_executions_per_user}/>
  </section>}
  {security&&<section className="luxia-panel rounded-3xl p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="font-semibold text-white">Política de seguridad del runtime</h2><p className="mt-1 text-sm text-zinc-500">Usuarios finales: {security.policy.user_allowed_engines.join(", ")}. Administradores: {security.policy.admin_allowed_engines.join(", ")}.</p></div><div className="flex flex-wrap gap-2 text-xs"><Badge ok={security.policy.python_steps_admin_only}>Python solo admin</Badge><Badge ok={security.policy.audit_enabled}>Auditoría activa</Badge><Badge ok>Control de propiedad</Badge></div></div></section>}
  <section className="luxia-panel rounded-3xl p-5"><div className="flex flex-col gap-3 lg:flex-row"><select value={selected??""} onChange={e=>setSelected(e.target.value?Number(e.target.value):null)} className="h-11 flex-1 rounded-xl border border-white/10 bg-black/40 px-4 text-sm text-white"><option value="">Selecciona un módulo</option>{modules.map(m=><option key={m.id} value={m.id}>{m.name} · {m.key} · v{m.version} {m.is_active?"(publicado)":"(borrador)"}</option>)}</select><button disabled={busy||!selectedModule} onClick={()=>void clone()} className="rounded-xl border border-white/10 px-4 text-sm text-white disabled:opacity-40">Clonar versión</button><button disabled={busy||!selectedModule} onClick={()=>void publish()} className="rounded-xl bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-40">Publicar</button><button disabled={busy||!selectedModule} onClick={()=>void download()} className="rounded-xl border border-white/10 px-4 text-sm text-white disabled:opacity-40">Exportar JSON</button></div></section>
  <section className="luxia-panel overflow-hidden rounded-3xl"><div className="flex items-center justify-between border-b border-white/10 p-5"><h2 className="font-semibold text-white">Monitor de ejecuciones</h2><button onClick={()=>void load()} className="text-xs text-zinc-400 hover:text-white">Actualizar</button></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="text-xs uppercase text-zinc-600"><tr><th className="p-4">Módulo</th><th>Motor</th><th>Origen</th><th>Estado</th><th>Progreso</th><th>Creado</th><th>Último evento</th><th>Acciones</th></tr></thead><tbody>{executions.map(e=><tr key={e.id} className="border-t border-white/5"><td className="p-4"><p className="text-white">{e.module_key}</p><p className="font-mono text-[10px] text-zinc-700">{e.id}</p></td><td className="text-zinc-400">{e.engine}</td><td className="text-zinc-500">{e.user_id?`Usuario #${e.user_id}`:"Admin"}</td><td className="uppercase text-zinc-400">{e.status}</td><td className="pr-4"><div className="h-2 w-32 overflow-hidden rounded-full bg-white/5"><div className="h-full bg-red-600" style={{width:`${e.progress}%`}}/></div></td><td className="text-zinc-500"><p>{new Date(e.created_at).toLocaleString()}</p>{e.duration_ms!=null&&<p className="mt-1 text-[10px] text-zinc-700">{Math.round(e.duration_ms/1000)} s</p>}</td><td className="max-w-xs"><p className={e.error?"truncate text-red-300":"truncate text-zinc-500"}>{e.error??e.logs?.[e.logs.length-1]?.message??"—"}</p></td><td className="pr-4"><div className="flex gap-2">{["queued","running"].includes(e.status)&&<button disabled={busy} onClick={()=>void cancelExecution(e.id)} className="rounded-lg border border-white/10 px-3 py-1 text-xs text-zinc-300 disabled:opacity-40">Cancelar</button>}{["completed","failed","cancelled"].includes(e.status)&&<button disabled={busy} onClick={()=>void retryExecution(e.id)} className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-40">Reintentar</button>}</div></td></tr>)}</tbody></table></div></section>
 </div>
}
function Metric({label,value}:{label:string;value:number}){return <div className="luxia-panel rounded-3xl p-5"><p className="text-xs uppercase tracking-[.2em] text-zinc-600">{label}</p><p className="mt-3 text-3xl font-semibold text-white">{value}</p></div>}
function Badge({children,ok}:{children:React.ReactNode;ok:boolean}){return <span className={`rounded-full border px-3 py-1 ${ok?"border-emerald-500/20 bg-emerald-500/5 text-emerald-300":"border-red-500/20 bg-red-500/5 text-red-300"}`}>{children}</span>}
