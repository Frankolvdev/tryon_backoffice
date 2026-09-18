"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Film, Image as ImageIcon, Loader2, Pause, Play, Plus, Sparkles, Trash2, Upload } from "lucide-react";
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
  {key:"facial_structures",label:"Estructuras faciales",description:"Banco privado de referencias faciales para Create Model. Nunca se publica al AppWeb."},
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


const FACE_GROUPS = [
  {key:"east_asian",label:"Asia Oriental",countryCodes:["CN","HK","JP","KP","KR","MO","MN","TW"]},
  {key:"southeast_asian",label:"Sudeste Asiático",countryCodes:["BN","KH","ID","LA","MY","MM","PH","SG","TH","TL","VN"]},
  {key:"south_central_asian",label:"Asia del Sur y Central",countryCodes:["AF","BD","BT","IN","KZ","KG","MV","NP","PK","LK","TJ","TM","UZ"]},
  {key:"middle_eastern_north_african",label:"Medio Oriente y Norte de África",countryCodes:["AE","AM","AZ","BH","DZ","EG","EH","GE","IL","IQ","IR","JO","KW","LB","LY","MA","MR","OM","PS","QA","SA","SY","TN","TR","YE"]},
  {key:"african_afrodescendant",label:"África y Afrodescendientes",countryCodes:["AO","BF","BI","BJ","BW","CD","CF","CG","CI","CM","CV","DJ","ER","ET","GA","GH","GM","GN","GQ","GW","HT","KE","KM","LR","LS","MG","ML","MU","MW","MZ","NA","NE","NG","RE","RW","SC","SD","SH","SL","SN","SO","SS","ST","SZ","TD","TG","TZ","UG","YT","ZA","ZM","ZW"]},
  {key:"european",label:"Europa",countryCodes:["AD","AL","AT","AX","BA","BE","BG","BY","CH","CY","CZ","DE","DK","EE","ES","FI","FO","FR","GB","GG","GI","GR","HR","HU","IE","IM","IS","IT","JE","LI","LT","LU","LV","MC","MD","ME","MK","MT","NL","NO","PL","PT","RO","RS","RU","SE","SI","SJ","SK","SM","UA","VA"]},
  {key:"latin_caribbean",label:"Latinoamérica y Caribe",countryCodes:["AG","AI","AR","AW","BB","BL","BO","BQ","BR","BS","BZ","CL","CO","CR","CU","CW","DM","DO","EC","FK","GF","GD","GP","GT","GY","HN","JM","KN","KY","LC","MF","MQ","MS","MX","NI","PA","PE","PM","PR","PY","SR","SV","SX","TC","TT","UY","VC","VE","VG","VI"]},
  {key:"mixed_pacific",label:"América y Pacífico",countryCodes:["AS","AQ","AU","BM","BV","IO","CA","CX","CC","CK","FJ","PF","TF","GL","GU","HM","KI","MH","FM","NR","NC","NZ","NU","NF","MP","PW","PG","PN","WS","SB","GS","TK","TO","TV","US","UM","VU","WF"]},
] as const;
type FaceGroupKey = typeof FACE_GROUPS[number]["key"];
const FACE_PAGE_SIZES = [12,24,48,96] as const;

const FACE_GROUP_COUNTRY_NAMES = (() => {
  const displayNames = new Intl.DisplayNames(["es"], { type: "region" });
  return new Map<FaceGroupKey, string>(
    FACE_GROUPS.map((group) => [
      group.key,
      group.countryCodes.map((code) => displayNames.of(code) || code).join(", "),
    ]),
  );
})();

function FaceGroupTabs({value,onChange}:{value:FaceGroupKey;onChange:(group:FaceGroupKey)=>void}){
  const [hovered,setHovered]=useState<FaceGroupKey|null>(null);
  const hoveredGroup=FACE_GROUPS.find(group=>group.key===hovered);
  return <div className={styles.faceGroupTabsArea} onMouseLeave={()=>setHovered(null)}>
    <div className={styles.faceGroupTabs} role="tablist" aria-label="Grupos de estructuras faciales">
      {FACE_GROUPS.map(group=><button type="button" role="tab" aria-selected={value===group.key} aria-describedby={hovered===group.key?"face-group-countries":undefined} className={`${styles.faceGroupTab} ${value===group.key?styles.faceGroupTabActive:""}`} key={group.key} onMouseEnter={()=>setHovered(group.key)} onFocus={()=>setHovered(group.key)} onBlur={()=>setHovered(null)} onClick={()=>onChange(group.key)}>{group.label}</button>)}
    </div>
    {hoveredGroup&&<div id="face-group-countries" role="tooltip" className={styles.faceGroupTooltip}><strong>{hoveredGroup.label}</strong><span>Incluye {hoveredGroup.countryCodes.length} países y territorios:</span><p>{FACE_GROUP_COUNTRY_NAMES.get(hoveredGroup.key)}.</p></div>}
  </div>
}

function FaceStructureManager(){
  const [items,setItems]=useState<ModelGenerationAsset[]>([]);
  const [total,setTotal]=useState(0); const [page,setPage]=useState(0);
  const [faceGroup,setFaceGroup]=useState<FaceGroupKey>("east_asian");
  const [pageSize,setPageSize]=useState<number>(24);
  const [storage,setStorage]=useState<ModelGenerationStorageOptions>({active_provider:"local",modes:["auto","local","amazon_s3","cloudflare_r2"]});
  const [mode,setMode]=useState<ModelGenerationStorageMode>("auto"); const [loading,setLoading]=useState(true); const [busy,setBusy]=useState(false); const [cleaning,setCleaning]=useState(false); const [dragging,setDragging]=useState(false);
  const picker=useRef<HTMLInputElement>(null);
  const load=useCallback(async()=>{setLoading(true);try{const query=new URLSearchParams({tool_key:"facial_structures",face_group:faceGroup,skip:String(page*pageSize),limit:String(pageSize)});const [list,opts]=await Promise.all([browserApiRequest<ModelGenerationAssetList>(`${API}?${query.toString()}`),browserApiRequest<ModelGenerationStorageOptions>(`${API}/storage-options`)]);setItems(list.items);setTotal(list.total);setStorage(opts)}catch(e){toast.error(e instanceof Error?e.message:"No se pudo cargar el banco facial")}finally{setLoading(false)}},[faceGroup,page,pageSize]);
  useEffect(()=>{void load()},[load]);
  async function uploadFiles(files:File[]){const images=files.filter(file=>file.type.startsWith("image/"));if(!images.length){toast.error("Selecciona imágenes válidas.");return}setBusy(true);try{const fd=new FormData();for(const file of images)fd.append("media",file);fd.set("storage_mode",mode);fd.set("face_group",faceGroup);await browserApiRequest(`${API}/facial-structures/batch`,{method:"POST",body:fd});toast.success(`${images.length} referencia${images.length===1?"":"s"} subida${images.length===1?"":"s"} y normalizada${images.length===1?"":"s"} a 512×720`);if(page!==0)setPage(0);else await load()}catch(e){toast.error(e instanceof Error?e.message:"No se pudieron subir las referencias")}finally{setBusy(false)}}
  async function cleanupDuplicates(){
    if(!confirm("¿Limpiar imágenes duplicadas de Estructuras faciales? Se conservará la referencia más antigua de cada copia exacta. Ninguna otra categoría será modificada."))return;
    setCleaning(true);
    try{
      const result=await browserApiRequest<{checked:number;removed:number;duplicate_groups:number;skipped:number;storage_cleanup_failed?:number}>(`${API}/facial-structures/cleanup-duplicates`,{method:"POST"});
      if(result.removed>0)toast.success(`Se eliminaron ${result.removed} referencia${result.removed===1?" duplicada":"s duplicadas"}.`);
      else toast.success("No se encontraron imágenes duplicadas exactas.");
      if(result.skipped>0)toast.warning(`${result.skipped} referencia${result.skipped===1?" no pudo":"s no pudieron"} revisarse.`);
      if(result.storage_cleanup_failed)toast.warning("Los registros duplicados se eliminaron, pero algunos archivos físicos requieren revisión.");
      if(page===0)await load();else setPage(0);
    }catch(e){toast.error(e instanceof Error?e.message:"No se pudo limpiar el banco facial")}finally{setCleaning(false)}
  }
  async function remove(item:ModelGenerationAsset){if(!confirm("¿Eliminar esta estructura facial?"))return;try{await browserApiRequest(`${API}/${item.id}`,{method:"DELETE"});await load()}catch(e){toast.error(e instanceof Error?e.message:"No se pudo eliminar")}}
  async function moveToGroup(item:ModelGenerationAsset,nextGroup:FaceGroupKey){try{await browserApiRequest(`${API}/${item.id}`,{method:"PATCH",body:JSON.stringify({metadata:{...item.metadata,face_group:nextGroup}})});toast.success("Referencia movida");await load()}catch(e){toast.error(e instanceof Error?e.message:"No se pudo mover la referencia")}}
  const activeLabel=storage.active_provider.replaceAll("_"," "); const pages=Math.max(1,Math.ceil(total/pageSize));
  useEffect(()=>{if(page>=pages)setPage(Math.max(0,pages-1))},[page,pages]);
  return <section className={styles.panel}>
    <div className={styles.toolbar}><div><h2>Estructuras faciales</h2><p>Banco privado. Cada archivo se recorta y optimiza automáticamente a 512×720.</p></div><span className={styles.status}>{total.toLocaleString("es-MX")} referencias</span></div>
    <FaceGroupTabs value={faceGroup} onChange={group=>{setFaceGroup(group);setPage(0)}}/>
    <div className={styles.faceControls}><button type="button" className={styles.cleanupButton} disabled={busy||cleaning} onClick={()=>void cleanupDuplicates()}>{cleaning?<Loader2 className={styles.spinner} size={14}/>:<Sparkles size={14}/>} {cleaning?"Revisando…":"Limpiar duplicados"}</button><label className={styles.storageField}><span>Destino de storage</span><select className={styles.select} value={mode} onChange={e=>setMode(e.target.value as ModelGenerationStorageMode)}>{storage.modes.map(m=><option key={m} value={m}>{m==="auto"?`Automatic (${activeLabel})`:m}</option>)}</select></label><label className={styles.storageField}><span>Mostrar por página</span><select className={styles.select} value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(0)}}>{FACE_PAGE_SIZES.map(size=><option key={size} value={size}>{size}</option>)}</select></label></div>
    <div className={`${styles.dropzone} ${dragging?styles.dropzoneActive:""}`} onDragEnter={e=>{e.preventDefault();setDragging(true)}} onDragOver={e=>e.preventDefault()} onDragLeave={e=>{e.preventDefault();if(e.currentTarget===e.target)setDragging(false)}} onDrop={e=>{e.preventDefault();setDragging(false);void uploadFiles(Array.from(e.dataTransfer.files))}}>
      <Upload size={28}/><strong>Arrastra aquí una o muchas imágenes</strong><span>También puedes seleccionarlas desde móvil o escritorio.</span><button type="button" className={styles.btn} disabled={busy} onClick={()=>picker.current?.click()}>{busy?<Loader2 size={14}/>:<Plus size={14}/>} Seleccionar imágenes</button><input ref={picker} className={styles.hidden} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e=>{const files=Array.from(e.target.files||[]);e.target.value="";void uploadFiles(files)}}/>
    </div>
    {loading?<div className={styles.empty}><Loader2 size={18}/> Cargando…</div>:items.length?<div className={styles.faceGrid}>{items.map((item,index)=><article className={styles.faceCard} key={item.id}>{item.poster_url?<img src={item.poster_url} alt={`Estructura facial ${page*pageSize+index+1}`}/>:<div className={styles.empty}>Sin imagen</div>}<select aria-label="Grupo facial" className={styles.faceCardGroup} value={String(item.metadata.face_group||faceGroup)} onChange={e=>void moveToGroup(item,e.target.value as FaceGroupKey)}>{FACE_GROUPS.map(group=><option key={group.key} value={group.key}>{group.label}</option>)}</select><div className={styles.faceCardBar}><span>#{page*pageSize+index+1}</span><label className={styles.toggle}><input type="checkbox" checked={item.is_active} onChange={async e=>{await browserApiRequest(`${API}/${item.id}`,{method:"PATCH",body:JSON.stringify({is_active:e.target.checked})});await load()}}/> activa</label><button className={styles.danger} onClick={()=>void remove(item)}><Trash2 size={12}/></button></div></article>)}</div>:<div className={styles.empty}>No hay referencias en este grupo.</div>}
    <div className={styles.pagination}><span>Página {page+1} de {pages} · {total.toLocaleString("es-MX")} elementos</span><div><button className={styles.ghost} disabled={page===0||loading} onClick={()=>setPage(p=>Math.max(0,p-1))}>Anterior</button><button className={styles.ghost} disabled={page+1>=pages||loading} onClick={()=>setPage(p=>p+1)}>Siguiente</button></div></div>
  </section>
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
    {active==="ancestry"?<div className={styles.ancestryWrap}><div className={styles.notice}>Ancestry se reutiliza directamente desde su vista existente. No se modifica su lógica, catálogo, API ni comportamiento.</div><AncestryAssetsPage/></div>:active==="facial_structures"?<FaceStructureManager/>:<ToolManager tool={active}/>} 
  </div>
}
