"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, LoaderCircle, RefreshCcw, Upload } from "lucide-react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";
import { invalidateBrandingCache, localBrandAssetUrl } from "@/lib/branding";
import type { BrandingConfig } from "@/types/branding";

export function BrandingSettings() {
  const [config, setConfig] = useState<BrandingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<string | null>(null);
  const [brandName, setBrandName] = useState("");
  const logoInput = useRef<HTMLInputElement>(null);
  const faviconInput = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try { const next = await browserApiRequest<BrandingConfig>("/api/admin/branding"); setConfig(next); setBrandName(next.app_name ?? ""); }
    catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo cargar el branding."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const upload = async (kind: "logo" | "favicon", file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Selecciona una imagen PNG, JPG o WEBP."); return; }
    setAction(kind);
    try {
      const body = new FormData(); body.append("file", file);
      const next = await browserApiRequest<BrandingConfig>(`/api/admin/branding/${kind}`, { method: "POST", body });
      setConfig(next); invalidateBrandingCache();
      toast.success(kind === "logo" ? "Logotipo optimizado y publicado." : "Favicon personalizado publicado.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo guardar la imagen."); }
    finally { setAction(null); }
  };

  const saveName = async () => {
    const clean = brandName.trim();
    if (!clean) { toast.error("Escribe el nombre de la plataforma."); return; }
    setAction("name");
    try {
      const next = await browserApiRequest<BrandingConfig>("/api/admin/branding/name", { method: "POST", body: JSON.stringify({ name: clean }) });
      setConfig(next); setBrandName(next.app_name ?? clean); invalidateBrandingCache(); toast.success("Nombre de plataforma actualizado.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo guardar el nombre."); }
    finally { setAction(null); }
  };

  const useAuto = async () => {
    setAction("auto");
    try {
      const next = await browserApiRequest<BrandingConfig>("/api/admin/branding/favicon/use-auto", { method: "POST" });
      setConfig(next); invalidateBrandingCache(); toast.success("Se usará el favicon generado desde el logotipo.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo cambiar el favicon."); }
    finally { setAction(null); }
  };

  if (loading) return <div className="luxia-panel mt-5 flex min-h-64 items-center justify-center rounded-3xl"><LoaderCircle className="animate-spin text-red-500"/></div>;
  const logo = localBrandAssetUrl(config?.logo.medium_url);
  const favicon = localBrandAssetUrl(config?.favicon.url);
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="luxia-panel rounded-3xl p-6 xl:col-span-2">
        <p className="text-xs font-semibold tracking-[.24em] text-red-500 uppercase">Nombre de plataforma</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input value={brandName} maxLength={80} onChange={(e) => setBrandName(e.target.value)} className="h-11 min-w-0 flex-1 rounded-xl border border-white/8 bg-black/40 px-4 text-sm text-white outline-none focus:border-red-500/40" placeholder="Ej. Cherry Kiss"/>
          <button type="button" onClick={() => void saveName()} disabled={!!action} className="h-11 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white disabled:opacity-50">{action === "name" ? "Guardando…" : "Guardar nombre"}</button>
        </div>
        <p className="mt-2 text-xs text-zinc-600">Usa el mismo app_name público ya existente; no crea una segunda fuente de verdad.</p>
      </section>
      <section className="luxia-panel rounded-3xl p-6">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold tracking-[.24em] text-red-500 uppercase">Logotipo</p><h2 className="mt-2 text-xl font-semibold text-white">Identidad principal</h2><p className="mt-2 text-sm leading-6 text-zinc-500">Sube una sola imagen. Backend conserva el original y crea versiones WEBP pequeñas, medianas y grandes para cada superficie.</p></div><ImageIcon className="text-red-400"/></div>
        <div className="mt-6 flex min-h-36 items-center justify-center rounded-2xl border border-white/7 bg-black/50 p-5">{logo ? <img key={logo} src={logo} alt="Logotipo actual" className="max-h-24 max-w-full object-contain"/> : <span className="text-sm text-zinc-600">Aún no hay logotipo publicado.</span>}</div>
        <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => logoInput.current?.click()} disabled={!!action} className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-50"><Upload size={16}/>{action === "logo" ? "Optimizando…" : "Subir logotipo"}</button><button type="button" onClick={() => void load()} disabled={!!action} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400"><RefreshCcw size={15}/>Actualizar</button></div>
        <input ref={logoInput} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => { void upload("logo", e.target.files?.[0]); e.currentTarget.value = ""; }}/>
        <p className="mt-4 text-xs text-zinc-600">Almacenamiento activo: <strong className="text-zinc-400">{config?.active_storage_provider ?? "—"}</strong>. Se respeta el proveedor configurado; no existe una ruta paralela de storage.</p>
      </section>

      <section className="luxia-panel rounded-3xl p-6">
        <div><p className="text-xs font-semibold tracking-[.24em] text-red-500 uppercase">Favicon</p><h2 className="mt-2 text-xl font-semibold text-white">Icono del navegador</h2><p className="mt-2 text-sm leading-6 text-zinc-500">Por defecto se genera automáticamente desde el logotipo. También puedes subir una imagen cuadrada personalizada.</p></div>
        <div className="mt-6 flex min-h-36 items-center justify-center rounded-2xl border border-white/7 bg-black/50 p-5">{favicon ? <img key={favicon} src={favicon} alt="Favicon actual" className="size-16 object-contain"/> : <span className="text-sm text-zinc-600">Se generará al subir el logotipo.</span>}</div>
        <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => faviconInput.current?.click()} disabled={!!action} className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-50"><Upload size={16}/>{action === "favicon" ? "Procesando…" : "Subir favicon custom"}</button><button type="button" onClick={() => void useAuto()} disabled={!!action || !config?.has_logo} className="inline-flex h-11 items-center rounded-xl border border-white/8 px-4 text-sm text-zinc-400 disabled:opacity-40">Usar el del logotipo</button></div>
        <input ref={faviconInput} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => { void upload("favicon", e.target.files?.[0]); e.currentTarget.value = ""; }}/>
        <p className="mt-4 text-xs text-zinc-600">Modo actual: <strong className="text-zinc-400">{config?.favicon.mode === "custom" ? "Personalizado" : "Automático"}</strong>.</p>
      </section>
    </div>
  );
}
