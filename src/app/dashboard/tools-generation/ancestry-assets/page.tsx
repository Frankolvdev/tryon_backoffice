"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Download, Film, Image as ImageIcon, Plus, RefreshCcw, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { AncestryMediaAsset, AncestryMediaAssetList, AncestryStorageMode, AncestryStorageOptions } from "@/types/ancestry-media-assets";
import styles from "./page.module.css";

const API="/api/admin/tools-generation/ancestry-assets";
const defaults=["American","Russian","Brazilian","Colombian","Mexican","Italian","French","Spanish","Argentinian","Arab","Japanese","Korean","Indian","African"];

async function posterFromVideo(file:File):Promise<File>{
  const url=URL.createObjectURL(file);
  try{
    const video=document.createElement("video");
    video.muted=true; video.playsInline=true; video.preload="auto"; video.src=url;
    await new Promise<void>((ok,fail)=>{
      video.onloadedmetadata=()=>ok();
      video.onerror=()=>fail(new Error("No se pudo leer el video."));
    });
    video.currentTime=Math.min(Math.max(video.duration*.15,.05),Math.max(video.duration-.05,.05));
    await new Promise<void>((ok)=>{video.onseeked=()=>ok();});
    const canvas=document.createElement("canvas");
    canvas.width=video.videoWidth; canvas.height=video.videoHeight;
    canvas.getContext("2d")?.drawImage(video,0,0,canvas.width,canvas.height);
    const blob=await new Promise<Blob>((ok,fail)=>
      canvas.toBlob(v=>v?ok(v):fail(new Error("No se pudo crear poster.")),"image/webp",.9)
    );
    return new File([blob],`${file.name.replace(/\.[^.]+$/,"")}-poster.webp`,{type:"image/webp"});
  } finally { URL.revokeObjectURL(url); }
}

export default function AncestryAssetsPage(){
  const [items,setItems]=useState<AncestryMediaAsset[]>([]);
  const [storage,setStorage]=useState<AncestryStorageOptions>({active_provider:"local",modes:["auto","local","amazon_s3","cloudflare_r2"]});
  const [loading,setLoading]=useState(true);
  const [name,setName]=useState("American");
  const [country,setCountry]=useState("US");
  const [flag,setFlag]=useState("🇺🇸");
  const [lat,setLat]=useState("38");
  const [lng,setLng]=useState("-97");
  const [mode,setMode]=useState<AncestryStorageMode>("auto");
  const [busy,setBusy]=useState<number|null>(null);

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const [list,opts]=await Promise.all([
        browserApiRequest<AncestryMediaAssetList>(API),
        browserApiRequest<AncestryStorageOptions>(`${API}/storage-options`)
      ]);
      setItems(list.items); setStorage(opts);
    }catch(e){toast.error(e instanceof Error?e.message:"No se pudo cargar Ancestry Assets.");}
    finally{setLoading(false);}
  },[]);

  useEffect(()=>{void load()},[load]);

  async function create(){
    try{
      await browserApiRequest(API,{method:"POST",body:JSON.stringify({
        ancestry_key:name,display_name:name,country_code:country||null,flag_emoji:flag||null,
        latitude:lat?Number(lat):null,longitude:lng?Number(lng):null,sort_order:(items.length+1)*10,
        storage_mode:mode,is_active:true
      })});
      toast.success("Ascendencia creada.");
      await load();
    }catch(e){toast.error(e instanceof Error?e.message:"No se pudo crear.");}
  }

  async function patch(id:number,body:Record<string,unknown>){
    setBusy(id);
    try{
      await browserApiRequest(`${API}/${id}`,{method:"PATCH",body:JSON.stringify(body)});
      await load();
    }catch(e){toast.error(e instanceof Error?e.message:"No se pudo guardar.");}
    finally{setBusy(null);}
  }

  async function upload(id:number,kind:"poster"|"video",file:File){
    const fd=new FormData();
    fd.append("kind",kind);
    fd.append("file",file);
    return browserApiRequest<AncestryMediaAsset>(`${API}/${id}/media`,{method:"POST",body:fd});
  }

  async function videoSelected(asset:AncestryMediaAsset,file:File){
    setBusy(asset.id);
    try{
      const poster=await posterFromVideo(file).catch(()=>null);
      await upload(asset.id,"video",file);
      if(poster) await upload(asset.id,"poster",poster);
      toast.success(poster?"Video y poster automático guardados.":"Video guardado; sube poster manualmente.");
      await load();
    }catch(e){toast.error(e instanceof Error?e.message:"No se pudo subir el video.");}
    finally{setBusy(null);}
  }

  async function posterSelected(asset:AncestryMediaAsset,file:File){
    setBusy(asset.id);
    try{
      await upload(asset.id,"poster",file);
      toast.success("Poster actualizado.");
      await load();
    }catch(e){toast.error(e instanceof Error?e.message:"No se pudo subir el poster.");}
    finally{setBusy(null);}
  }

  async function remove(id:number){
    if(!confirm("¿Eliminar este asset y sus archivos?"))return;
    try{
      await browserApiRequest(`${API}/${id}`,{method:"DELETE"});
      toast.success("Eliminado.");
      await load();
    }catch(e){toast.error(e instanceof Error?e.message:"No se pudo eliminar.");}
  }

  async function importZip(e:ChangeEvent<HTMLInputElement>){
    const file=e.target.files?.[0];
    e.target.value="";
    if(!file)return;
    const fd=new FormData();
    fd.append("archive",file);
    fd.append("target",mode);
    try{
      await browserApiRequest(`${API}/import/zip`,{method:"POST",body:fd});
      toast.success("ZIP importado.");
      await load();
    }catch(err){toast.error(err instanceof Error?err.message:"No se pudo importar.");}
  }

  const activeLabel=useMemo(()=>storage.active_provider.replaceAll("_"," "),[storage.active_provider]);

  return <div className={styles.page}>
    <section className={styles.hero}>
      <div>
        <span className={styles.eyebrow}>TOOLS GENERATION · FACE STUDIO</span>
        <h1>Ancestry Media Library</h1>
        <p>Biblioteca aislada para los posters y videos que verá AppWeb. No ejecuta workflows ni modifica Body Proportions.</p>
      </div>
      <div className={styles.actions}>
        <button className={styles.ghost} onClick={()=>void load()}><RefreshCcw size={15}/> Actualizar</button>
        <a className={styles.ghost} href="/api/admin/tools-generation/ancestry-assets-export"><Download size={15}/> Exportar ZIP</a>
        <label className={`${styles.ghost} ${styles.upload}`}><Upload size={15}/> Importar ZIP<input type="file" accept=".zip" onChange={importZip}/></label>
      </div>
    </section>

    <section className={styles.builder}>
      <label className={styles.span2}>Ancestry / buscar o escribir
        <input list="ancestry-defaults" value={name} onChange={e=>setName(e.target.value)}/>
        <datalist id="ancestry-defaults">{defaults.map(v=><option key={v} value={v}/>)}</datalist>
      </label>
      <label>ISO país<input value={country} onChange={e=>setCountry(e.target.value)} maxLength={8}/></label>
      <label>Bandera<input value={flag} onChange={e=>setFlag(e.target.value)} maxLength={16}/></label>
      <label>Latitud<input value={lat} onChange={e=>setLat(e.target.value)}/></label>
      <label>Longitud<input value={lng} onChange={e=>setLng(e.target.value)}/></label>
      <label className={styles.span2}>Destino de storage
        <select value={mode} onChange={e=>setMode(e.target.value as AncestryStorageMode)}>
          {storage.modes.map(v=><option key={v} value={v}>{v==="auto"?`Automatic (${activeLabel})`:v}</option>)}
        </select>
      </label>
      <div className={styles.span2}><button className={styles.button} onClick={create}><Plus size={15}/> Crear ancestry</button></div>
    </section>

    {loading
      ? <div className={styles.empty}>Cargando biblioteca…</div>
      : items.length===0
      ? <div className={styles.empty}>Todavía no hay ascendencias. Crea la primera arriba.</div>
      : <section className={styles.cards}>{items.map(asset=><article className={styles.card} key={asset.id}>
          <div className={styles.media}>
            {asset.poster_url?<img src={asset.poster_url} alt={asset.display_name}/>:<ImageIcon size={34}/>}
            <span className={styles.badge}>{asset.flag_emoji||"◉"} {asset.display_name}</span>
          </div>
          <div className={styles.body}>
            <div className={styles.title}>
              <div><h3>{asset.display_name}</h3><div className={styles.meta}>{asset.country_code||"REGION"} · {asset.latitude??"—"}, {asset.longitude??"—"}</div></div>
              <span>{asset.video_url?"VIDEO ✓":"SIN VIDEO"}</span>
            </div>
            <div className={styles.row}>
              <select value={asset.storage_mode} disabled={busy===asset.id} onChange={e=>void patch(asset.id,{storage_mode:e.target.value})}>
                {storage.modes.map(v=><option key={v} value={v}>{v}</option>)}
              </select>
              <label className={`${styles.ghost} ${styles.upload}`}><Film size={14}/> {asset.video_url?"Reemplazar video":"Subir video"}
                <input type="file" accept="video/mp4,video/webm" onChange={e=>{const f=e.target.files?.[0];e.target.value="";if(f)void videoSelected(asset,f)}}/>
              </label>
              <label className={`${styles.ghost} ${styles.upload}`}><ImageIcon size={14}/> Poster
                <input type="file" accept="image/webp,image/jpeg,image/png" onChange={e=>{const f=e.target.files?.[0];e.target.value="";if(f)void posterSelected(asset,f)}}/>
              </label>
            </div>
            <div className={styles.row}>
              <label><input type="checkbox" checked={asset.is_active} onChange={e=>void patch(asset.id,{is_active:e.target.checked})}/> Visible en AppWeb</label>
              <button className={styles.danger} onClick={()=>void remove(asset.id)}><Trash2 size={14}/> Eliminar</button>
            </div>
          </div>
        </article>)}</section>
    }
  </div>
}
