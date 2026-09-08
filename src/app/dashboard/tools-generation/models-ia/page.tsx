"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Film, Image as ImageIcon, Loader2, Pause, Play, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { ModelGenerationAsset, ModelGenerationAssetList, ModelGenerationStorageMode, ModelGenerationStorageOptions, ModelGenerationToolKey } from "@/types/model-generation-assets";
import AncestryAssetsPage from "../ancestry-assets/page";
import styles from "./page.module.css";

const API = "/api/admin/tools-generation/model-assets";
const BODY_TOOLS = new Set<ModelGenerationToolKey>(["hips","butt_size","breasts","height","bubble_butt","waist","complexion"]);
const TABS: {key:"ancestry"|ModelGenerationToolKey; label:string; description:string}[] = [
  {key:"ancestry",label:"Ancestry",description:"Biblioteca de ascendencias existente. Se renderiza sin modificar su implementación."},
  {key:"eyebrows",label:"Eyebrows",description:"Previews de formas de cejas. Solo título, valor y media."},
  {key:"lips",label:"Lips",description:"Previews de formas de labios. Solo título, valor y media."},
  {key:"hairstyle",label:"Hairstyle",description:"Previews de estilos de cabello. Solo título, valor y media."},
  {key:"hips",label:"Hips",description:"Previews del slider de caderas. Position define su punto visual dentro del rango."},
  {key:"butt_size",label:"Butt Size",description:"Previews SFW del slider de tamaño. Position define su punto visual dentro del rango."},
  {key:"breasts",label:"Breasts",description:"Previews del slider de busto. Position define su punto visual dentro del rango."},
  {key:"height",label:"Height",description:"Previews opcionales de altura. Si queda vacío, AppWeb mostrará únicamente el slider."},
  {key:"bubble_butt",label:"Bubble Butt",description:"Previews de forma/proyección. Position define su punto visual dentro del rango."},
  {key:"waist",label:"Waist",description:"Previews del slider de cintura. Position define su punto visual dentro del rango."},
  {key:"complexion",label:"Complexion",description:"Modos corporales globales, por ejemplo Slim y Thick. Conserva título y Position."},
];

async function posterFromVideo(file: File): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;

    await new Promise<void>((ok, fail) => {
      const ready = () => ok();
      video.onloadeddata = ready;
      video.onloadedmetadata = () => {
        if (video.readyState >= 2) ready();
      };
      video.onerror = () => fail(new Error("No se pudo leer el video."));
    });

    // Igual que Ancestry: usar el primer frame decodificable, apenas por encima de 0.
    const target = Math.min(0.001, Math.max(video.duration - 0.001, 0));
    if (Math.abs(video.currentTime - target) > 0.0005) {
      await new Promise<void>((ok, fail) => {
        video.onseeked = () => ok();
        video.onerror = () => fail(new Error("No se pudo buscar el primer frame."));
        video.currentTime = target;
      });
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo preparar el poster.");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((ok, fail) =>
      canvas.toBlob(
        value => value ? ok(value) : fail(new Error("No se pudo crear poster.")),
        "image/webp",
        0.92,
      ),
    );

    return new File(
      [blob],
      `${file.name.replace(/\.[^.]+$/, "")}-first-frame.webp`,
      { type: "image/webp" },
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}


function ToolManager({tool}:{tool:ModelGenerationToolKey}){
  const [items,setItems]=useState<ModelGenerationAsset[]>([]);
  const [storage,setStorage]=useState<ModelGenerationStorageOptions>({active_provider:"local",modes:["auto","local","amazon_s3","cloudflare_r2"]});
  const [loading,setLoading]=useState(true); const [busy,setBusy]=useState<number|"new"|null>(null);
  const [playingId,setPlayingId]=useState<number|null>(null);
  const [title,setTitle]=useState(""); const [value,setValue]=useState(""); const [position,setPosition]=useState(1); const [newMedia,setNewMedia]=useState<File|null>(null); const [mode,setMode]=useState<ModelGenerationStorageMode>("auto");
  const isBodyTool=BODY_TOOLS.has(tool); const isComplexion=tool==="complexion";
  const newMediaRef=useRef<HTMLInputElement>(null);
  const fileRefs=useRef(new Map<string,HTMLInputElement>());
  const load=useCallback(async()=>{setLoading(true);try{const [list,opts]=await Promise.all([browserApiRequest<ModelGenerationAssetList>(`${API}?tool_key=${tool}`),browserApiRequest<ModelGenerationStorageOptions>(`${API}/storage-options`)]);setItems(list.items);setStorage(opts)}catch(e){toast.error(e instanceof Error?e.message:"No se pudo cargar Models IA") }finally{setLoading(false)}},[tool]);
  useEffect(()=>{void load()},[load]);
  const ordered=useMemo(()=>[...items].sort((a,b)=>isBodyTool?((a.position??999999)-(b.position??999999)||a.id-b.id):(a.sort_order-b.sort_order||a.id-b.id)),[items,isBodyTool]);
  const activeLabel=useMemo(()=>storage.active_provider.replaceAll("_"," "),[storage.active_provider]);

  async function create(){
    if(!isBodyTool&&(!title.trim()||!value.trim())){toast.error("Título y valor son obligatorios.");return}
    if(isComplexion&&!title.trim()){toast.error("Título es obligatorio para Complexion.");return}
    if(isBodyTool&&(!Number.isInteger(position)||position<0)){toast.error("Position debe ser un entero igual o mayor que 0.");return}
    if(!newMedia){toast.error("Selecciona una imagen o video para crear la preview.");return}
    setBusy("new");
    try{
      const isVideo=newMedia.type.startsWith("video/");
      const poster=isVideo?await posterFromVideo(newMedia):newMedia;
      const key=(isComplexion?title.trim():`${tool}-${position}`).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
      const created=await browserApiRequest<ModelGenerationAsset>(API,{method:"POST",body:JSON.stringify({tool_key:tool,asset_key:key,title:isComplexion?title.trim():(isBodyTool?"":title.trim()),value:isBodyTool?"":value.trim(),sort_order:(items.length+1)*10,position:isBodyTool?position:null,storage_mode:mode,is_active:true})});
      if(isVideo){
        const vfd=new FormData();vfd.set("kind","video");vfd.set("media",newMedia);
        await browserApiRequest(`${API}/${created.id}/media`,{method:"POST",body:vfd});
      }
      const pfd=new FormData();pfd.set("kind","poster");pfd.set("media",poster);
      await browserApiRequest(`${API}/${created.id}/media`,{method:"POST",body:pfd});
      setTitle("");setValue("");setPosition((items.reduce((max,item)=>Math.max(max,item.position??0),0))+1);setNewMedia(null);if(newMediaRef.current)newMediaRef.current.value="";
      await load();toast.success(isVideo?"Opción, video y poster automático creados":"Opción e imagen creadas");
    }catch(e){toast.error(e instanceof Error?e.message:"No se pudo crear") }finally{setBusy(null)}
  }
  async function patch(item:ModelGenerationAsset,patch:Record<string,unknown>){setBusy(item.id);try{await browserApiRequest(`${API}/${item.id}`,{method:"PATCH",body:JSON.stringify(patch)});await load()}catch(e){toast.error(e instanceof Error?e.message:"No se pudo guardar") }finally{setBusy(null)}}
  async function remove(item:ModelGenerationAsset){if(!confirm(`Eliminar ${item.title}?`))return;setBusy(item.id);try{await browserApiRequest(`${API}/${item.id}`,{method:"DELETE"});await load();toast.success("Opción eliminada") }catch(e){toast.error(e instanceof Error?e.message:"No se pudo eliminar") }finally{setBusy(null)}}
  async function upload(item:ModelGenerationAsset,kind:"poster"|"video",file:File){
    setBusy(item.id);
    try{
      let poster:File|null=null;
      if(kind==="video"){
        poster=await posterFromVideo(file);
      }
      const fd=new FormData();fd.set("kind",kind);fd.set("media",file);
      await browserApiRequest(`${API}/${item.id}/media`,{method:"POST",body:fd});
      if(kind==="video"&&poster){
        const pfd=new FormData();pfd.set("kind","poster");pfd.set("media",poster);
        await browserApiRequest(`${API}/${item.id}/media`,{method:"POST",body:pfd});
        setPlayingId(null);
      }
      await load();
      toast.success(kind==="video"?"Video y poster automático guardados":"Poster guardado");
    }catch(e){toast.error(e instanceof Error?e.message:"No se pudo subir") }finally{setBusy(null)}
  }
  function chooseFile(item:ModelGenerationAsset,kind:"poster"|"video"){fileRefs.current.get(`${item.id}:${kind}`)?.click()}
  function onFile(item:ModelGenerationAsset,kind:"poster"|"video",event:ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];event.target.value="";if(file)void upload(item,kind,file)}

  return <section className={styles.panel}>
    <div className={styles.toolbar}><div><h2>{TABS.find(t=>t.key===tool)?.label}</h2><p>{TABS.find(t=>t.key===tool)?.description}</p></div><span className={styles.status}>Storage: {storage.active_provider.replaceAll("_"," ")}</span></div>
    <div className={styles.form}>
      {(!isBodyTool||isComplexion)&&<input className={styles.input} placeholder="Título visible" value={title} onChange={e=>setTitle(e.target.value)} maxLength={180}/>}
      {!isBodyTool&&<input className={styles.input} placeholder="Valor para prompt" value={value} onChange={e=>setValue(e.target.value)} maxLength={500}/>}
      {isBodyTool&&<label className={styles.storageField}><span>Position</span><input className={styles.input} type="number" min={0} step={1} value={position} onChange={e=>setPosition(Number.parseInt(e.target.value||"0",10))}/></label>}
      <label className={styles.storageField}>
        <span>Destino de storage</span>
        <select className={styles.select} value={mode} onChange={e=>setMode(e.target.value as ModelGenerationStorageMode)}>
          {storage.modes.map(storageMode=><option key={storageMode} value={storageMode}>{storageMode==="auto"?`Automatic (${activeLabel})`:storageMode}</option>)}
        </select>
      </label>
      <button type="button" className={styles.videoPicker} onClick={()=>newMediaRef.current?.click()}>{newMedia?.type.startsWith("image/")?<ImageIcon size={14}/>:<Film size={14}/>}<span>{newMedia?newMedia.name:"Seleccionar imagen o video"}</span></button>
      <input ref={newMediaRef} className={styles.hidden} type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" onChange={e=>setNewMedia(e.target.files?.[0]||null)}/>
      <button className={styles.btn} onClick={()=>void create()} disabled={busy==="new"}>{busy==="new"?<Loader2 size={14}/>:<Plus size={14}/>} Agregar</button>
    </div>
    {loading?<div className={styles.empty}><Loader2 size={18}/> Cargando…</div>:<div className={styles.grid}>{ordered.map(item=><article className={styles.card} key={item.id}>
      <button type="button" className={`${styles.media} ${BODY_TOOLS.has(tool)?styles.bodyMedia:""} ${item.video_url?styles.mediaPlayable:""}`} onClick={()=>{if(item.video_url)setPlayingId(current=>current===item.id?null:item.id)}} aria-label={item.video_url?`${playingId===item.id?"Pausar":"Reproducir"} ${item.title||`Position ${item.position??"-"}`}`:(item.title||`Position ${item.position??"-"}`)}>
        {playingId===item.id&&item.video_url?
          <video key={`${item.id}-${item.video_url}`} src={item.video_url} poster={item.poster_url||undefined} muted loop playsInline autoPlay/>:
          item.poster_url?<img src={item.poster_url} alt={item.title||`Position ${item.position??"-"}`}/>:<div className={styles.empty}>Sin preview</div>}
        {item.video_url&&<span className={styles.playBadge}>{playingId===item.id?<Pause size={14}/>:<Play size={14}/>}</span>}
      </button>
      <div className={styles.cardBody}>
      {(!isBodyTool||isComplexion)&&<input className={styles.cardEdit} defaultValue={item.title} maxLength={180} aria-label="Título" onBlur={e=>{const v=e.target.value.trim();if(v&&v!==item.title)void patch(item,{title:v})}}/>}
      {!isBodyTool&&<textarea className={styles.cardValueEdit} defaultValue={item.value} maxLength={500} aria-label="Valor para prompt" onBlur={e=>{const v=e.target.value.trim();if(v&&v!==item.value)void patch(item,{value:v})}}/>}
      {isBodyTool&&<label className={styles.storageField}><span>Position</span><input className={styles.input} type="number" min={0} step={1} defaultValue={item.position??0} onBlur={e=>{const v=Number.parseInt(e.target.value||"0",10);if(Number.isInteger(v)&&v>=0&&v!==(item.position??0))void patch(item,{position:v})}}/></label>}
      <div className={styles.cardStorage}>
        <label>
          <span>Destino</span>
          <select className={styles.select} value={item.storage_mode} disabled={busy===item.id} onChange={e=>void patch(item,{storage_mode:e.target.value as ModelGenerationStorageMode})}>
            {storage.modes.map(storageMode=><option key={storageMode} value={storageMode}>{storageMode==="auto"?`Automatic (${activeLabel})`:storageMode}</option>)}
          </select>
        </label>
        <label className={styles.toggle}><input type="checkbox" checked={item.is_active} onChange={e=>void patch(item,{is_active:e.target.checked})}/> activo</label>
      </div>
      <div className={styles.actions}><button onClick={()=>chooseFile(item,"poster")}><ImageIcon size={12}/> Poster</button><button onClick={()=>chooseFile(item,"video")}><Film size={12}/> Video</button>{!isBodyTool&&<button onClick={()=>void patch(item,{sort_order:Math.max(0,item.sort_order-10)})}>↑ Orden</button>}<button className={styles.danger} onClick={()=>void remove(item)}><Trash2 size={12}/> Eliminar</button></div>
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
