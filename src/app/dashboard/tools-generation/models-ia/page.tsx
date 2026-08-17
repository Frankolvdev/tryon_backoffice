"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Film, Image as ImageIcon, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { ModelGenerationAsset, ModelGenerationAssetList, ModelGenerationStorageMode, ModelGenerationStorageOptions, ModelGenerationToolKey } from "@/types/model-generation-assets";
import AncestryAssetsPage from "../ancestry-assets/page";
import styles from "./page.module.css";

const API = "/api/admin/tools-generation/model-assets";
const TABS: {key:"ancestry"|ModelGenerationToolKey; label:string; description:string}[] = [
  {key:"ancestry",label:"Ancestry",description:"Biblioteca de ascendencias existente. Se renderiza sin modificar su implementación."},
  {key:"eyebrows",label:"Eyebrows",description:"Previews de formas de cejas. Solo título, valor y media."},
  {key:"lips",label:"Lips",description:"Previews de formas de labios. Solo título, valor y media."},
  {key:"hairstyle",label:"Hairstyle",description:"Previews de estilos de cabello. Solo título, valor y media."},
];

async function posterFromVideo(file:File):Promise<File>{
  const url=URL.createObjectURL(file);
  try{
    const video=document.createElement("video"); video.muted=true; video.playsInline=true; video.preload="auto"; video.src=url;
    await new Promise<void>((ok,fail)=>{video.onloadeddata=()=>ok();video.onerror=()=>fail(new Error("No se pudo leer el video."));});
    if(video.duration>0.01){await new Promise<void>((ok)=>{video.onseeked=()=>ok();video.currentTime=Math.min(.001,video.duration/2);});}
    const canvas=document.createElement("canvas"); canvas.width=video.videoWidth; canvas.height=video.videoHeight;
    const ctx=canvas.getContext("2d"); if(!ctx) throw new Error("No se pudo crear el poster."); ctx.drawImage(video,0,0);
    const blob=await new Promise<Blob>((ok,fail)=>canvas.toBlob(v=>v?ok(v):fail(new Error("No se pudo crear el poster.")),"image/webp",.92));
    return new File([blob],`${file.name.replace(/\.[^.]+$/,"")}-poster.webp`,{type:"image/webp"});
  }finally{URL.revokeObjectURL(url)}
}

function ToolManager({tool}:{tool:ModelGenerationToolKey}){
  const [items,setItems]=useState<ModelGenerationAsset[]>([]);
  const [storage,setStorage]=useState<ModelGenerationStorageOptions>({active_provider:"local",modes:["auto","local","amazon_s3","cloudflare_r2"]});
  const [loading,setLoading]=useState(true); const [busy,setBusy]=useState<number|"new"|null>(null);
  const [title,setTitle]=useState(""); const [value,setValue]=useState(""); const [assetKey,setAssetKey]=useState("");
  const [mode,setMode]=useState<ModelGenerationStorageMode>("auto");
  const fileRefs=useRef(new Map<string,HTMLInputElement>());
  const load=useCallback(async()=>{setLoading(true);try{const [list,opts]=await Promise.all([browserApiRequest<ModelGenerationAssetList>(`${API}?tool_key=${tool}`),browserApiRequest<ModelGenerationStorageOptions>(`${API}/storage-options`)]);setItems(list.items);setStorage(opts)}catch(e){toast.error(e instanceof Error?e.message:"No se pudo cargar Models IA") }finally{setLoading(false)}},[tool]);
  useEffect(()=>{void load()},[load]);
  const ordered=useMemo(()=>[...items].sort((a,b)=>a.sort_order-b.sort_order||a.id-b.id),[items]);

  async function create(){if(!title.trim()||!value.trim()){toast.error("Título y valor son obligatorios.");return}setBusy("new");try{const key=(assetKey.trim()||title.trim()).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");await browserApiRequest(API,{method:"POST",body:JSON.stringify({tool_key:tool,asset_key:key,title:title.trim(),value:value.trim(),sort_order:(items.length+1)*10,storage_mode:mode,is_active:true})});setTitle("");setValue("");setAssetKey("");await load();toast.success("Opción creada") }catch(e){toast.error(e instanceof Error?e.message:"No se pudo crear") }finally{setBusy(null)}}
  async function patch(item:ModelGenerationAsset,patch:Record<string,unknown>){setBusy(item.id);try{await browserApiRequest(`${API}/${item.id}`,{method:"PATCH",body:JSON.stringify(patch)});await load()}catch(e){toast.error(e instanceof Error?e.message:"No se pudo guardar") }finally{setBusy(null)}}
  async function remove(item:ModelGenerationAsset){if(!confirm(`Eliminar ${item.title}?`))return;setBusy(item.id);try{await browserApiRequest(`${API}/${item.id}`,{method:"DELETE"});await load();toast.success("Opción eliminada") }catch(e){toast.error(e instanceof Error?e.message:"No se pudo eliminar") }finally{setBusy(null)}}
  async function upload(item:ModelGenerationAsset,kind:"poster"|"video",file:File){setBusy(item.id);try{const fd=new FormData();fd.set("kind",kind);fd.set("media",file);await browserApiRequest(`${API}/${item.id}/media`,{method:"POST",body:fd});if(kind==="video"&&!item.poster_url){const poster=await posterFromVideo(file);const pfd=new FormData();pfd.set("kind","poster");pfd.set("media",poster);await browserApiRequest(`${API}/${item.id}/media`,{method:"POST",body:pfd});}await load();toast.success(kind==="video"?"Video guardado":"Poster guardado") }catch(e){toast.error(e instanceof Error?e.message:"No se pudo subir") }finally{setBusy(null)}}
  function chooseFile(item:ModelGenerationAsset,kind:"poster"|"video"){fileRefs.current.get(`${item.id}:${kind}`)?.click()}
  function onFile(item:ModelGenerationAsset,kind:"poster"|"video",event:ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];event.target.value="";if(file)void upload(item,kind,file)}

  return <section className={styles.panel}>
    <div className={styles.toolbar}><div><h2>{TABS.find(t=>t.key===tool)?.label}</h2><p>{TABS.find(t=>t.key===tool)?.description}</p></div><span className={styles.status}>Storage: {storage.active_provider.replaceAll("_"," ")}</span></div>
    <div className={styles.form}>
      <input className={styles.input} placeholder="Título visible" value={title} onChange={e=>setTitle(e.target.value)} maxLength={180}/>
      <input className={styles.input} placeholder="Clave (opcional)" value={assetKey} onChange={e=>setAssetKey(e.target.value)} maxLength={120}/>
      <input className={styles.input} placeholder="Valor para prompt" value={value} onChange={e=>setValue(e.target.value)} maxLength={500}/>
      <select className={styles.select} value={mode} onChange={e=>setMode(e.target.value as ModelGenerationStorageMode)}>{storage.modes.map(m=><option key={m} value={m}>{m}</option>)}</select>
      <button className={styles.btn} onClick={()=>void create()} disabled={busy==="new"}>{busy==="new"?<Loader2 size={14}/>:<Plus size={14}/>} Agregar</button>
    </div>
    {loading?<div className={styles.empty}><Loader2 size={18}/> Cargando…</div>:<div className={styles.grid}>{ordered.map(item=><article className={styles.card} key={item.id}>
      <div className={styles.media}>{item.video_url?<video src={item.video_url} muted loop playsInline controls={false} onMouseEnter={e=>void e.currentTarget.play()} onMouseLeave={e=>{e.currentTarget.pause();e.currentTarget.currentTime=0}}/>:item.poster_url?<img src={item.poster_url} alt={item.title}/>:<div className={styles.empty}>Sin preview</div>}</div>
      <div className={styles.cardBody}><input className={styles.cardEdit} defaultValue={item.title} maxLength={180} aria-label="Título" onBlur={e=>{const v=e.target.value.trim();if(v&&v!==item.title)void patch(item,{title:v})}}/><textarea className={styles.cardValueEdit} defaultValue={item.value} maxLength={500} aria-label="Valor para prompt" onBlur={e=>{const v=e.target.value.trim();if(v&&v!==item.value)void patch(item,{value:v})}}/><div className={styles.meta}><span>{item.asset_key}</span><label className={styles.toggle}><input type="checkbox" checked={item.is_active} onChange={e=>void patch(item,{is_active:e.target.checked})}/> activo</label></div>
      <div className={styles.actions}><button onClick={()=>chooseFile(item,"poster")}><ImageIcon size={12}/> Poster</button><button onClick={()=>chooseFile(item,"video")}><Film size={12}/> Video</button><button onClick={()=>void patch(item,{sort_order:Math.max(0,item.sort_order-10)})}>↑ Orden</button><button className={styles.danger} onClick={()=>void remove(item)}><Trash2 size={12}/> Eliminar</button></div>
      <input ref={el=>{if(el)fileRefs.current.set(`${item.id}:poster`,el)}} className={styles.hidden} type="file" accept="image/*" onChange={e=>onFile(item,"poster",e)}/>
      <input ref={el=>{if(el)fileRefs.current.set(`${item.id}:video`,el)}} className={styles.hidden} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={e=>onFile(item,"video",e)}/>
      {busy===item.id&&<div className={styles.status}><Loader2 size={12}/> Guardando…</div>}</div></article>)}</div>}
  </section>
}

export default function ModelsIaPage(){
  const [active,setActive]=useState<(typeof TABS)[number]["key"]>("ancestry");
  const [importing,setImporting]=useState(false); const importRef=useRef<HTMLInputElement>(null);
  async function importBundle(event:ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];event.target.value="";if(!file)return;setImporting(true);try{const fd=new FormData();fd.set("archive",file);fd.set("target","auto");await browserApiRequest(`${API}/bundle/import/zip`,{method:"POST",body:fd});toast.success("Bundle global importado");window.location.reload()}catch(e){toast.error(e instanceof Error?e.message:"No se pudo importar") }finally{setImporting(false)}}
  return <div className={styles.shell}>
    <header className={styles.head}><div><div className={styles.eyebrow}>Tools Generation</div><h1>Models IA</h1><p>Biblioteca central de previews para la creación de identidad. Ancestry permanece blindado; las nuevas herramientas comparten el mismo patrón de media y publicación.</p></div><div className={styles.global}><a className={styles.ghost} href="/api/admin/tools-generation/model-assets-bundle-export"><Download size={14}/> Exportar todo</a><button className={styles.btn} onClick={()=>importRef.current?.click()} disabled={importing}>{importing?<Loader2 size={14}/>:<Upload size={14}/>} Importar todo</button><input ref={importRef} className={styles.hidden} type="file" accept=".zip,application/zip" onChange={importBundle}/></div></header>
    <nav className={styles.tabs}>{TABS.map(tab=><button key={tab.key} className={`${styles.tab} ${active===tab.key?styles.tabActive:""}`} onClick={()=>setActive(tab.key)}>{tab.label}</button>)}</nav>
    {active==="ancestry"?<div className={styles.ancestryWrap}><div className={styles.notice}>Ancestry se reutiliza directamente desde su vista existente. No se modifica su lógica, catálogo, API ni comportamiento.</div><AncestryAssetsPage/></div>:<ToolManager tool={active}/>} 
  </div>
}
