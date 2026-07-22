"use client";

function collectFiles(value: unknown, found: Array<Record<string, unknown>> = []) {
  if (Array.isArray(value)) value.forEach((item) => collectFiles(item, found));
  else if (value && typeof value === "object") {
    const item=value as Record<string,unknown>; const url=item.download_url??item.public_url??item.preview_url;
    if(typeof url==="string"&&!found.some(entry=>(entry.download_url??entry.public_url??entry.preview_url)===url))found.push(item);
    Object.values(item).forEach(nested=>collectFiles(nested,found));
  }
  return found;
}
export function GenerationResults({outputs}:{outputs:Record<string,unknown>}){
  const files=collectFiles(outputs); if(!files.length)return <pre className="max-h-80 overflow-auto whitespace-pre-wrap text-xs text-zinc-400">{JSON.stringify(outputs,null,2)}</pre>;
  return <div className="grid gap-3 md:grid-cols-2">{files.map((file,index)=>{const url=String(file.download_url??file.public_url??file.preview_url);const type=String(file.content_type??"");const image=type.startsWith("image/")||/\.(png|jpe?g|webp|gif)(\?|$)/i.test(url);return <article key={`${url}-${index}`} className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">{image&&<img src={url} alt={String(file.filename??`Resultado ${index+1}`)} className="h-64 w-full bg-black object-contain"/>}<div className="flex items-center justify-between gap-3 p-3"><span className="truncate text-xs text-zinc-400">{String(file.filename??`Resultado ${index+1}`)}</span><a href={url} download target="_blank" rel="noreferrer" className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white">Descargar</a></div></article>})}</div>;
}
