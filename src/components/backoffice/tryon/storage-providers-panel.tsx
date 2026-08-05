"use client";

import { CheckCircle2, Cloud, HardDrive, LoaderCircle, Save, Server, TestTube2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import type { StorageProviderConfig, StorageProvidersResponse } from "@/types/admin-storage";

type ProviderKey = "local" | "amazon_s3" | "cloudflare_r2";

type FormState = {
  local: { local_storage_dir: string };
  amazon_s3: { name: string; is_enabled: boolean; api_key: string; api_secret: string; bucket: string; region: string; endpoint_url: string; public_base_url: string; addressing_style: string };
  cloudflare_r2: { name: string; is_enabled: boolean; account_id: string; api_key: string; api_secret: string; bucket: string; endpoint_url: string; public_base_url: string; addressing_style: string };
};

const EMPTY: FormState = {
  local: { local_storage_dir: "" },
  amazon_s3: { name: "Amazon S3", is_enabled: false, api_key: "", api_secret: "", bucket: "", region: "", endpoint_url: "", public_base_url: "", addressing_style: "virtual" },
  cloudflare_r2: { name: "Cloudflare R2", is_enabled: false, account_id: "", api_key: "", api_secret: "", bucket: "", endpoint_url: "", public_base_url: "", addressing_style: "path" },
};

function text(config: Record<string, unknown> | undefined, key: string): string {
  const value = config?.[key];
  return typeof value === "string" ? value : "";
}

export function StorageProvidersPanel({ onChanged }: { onChanged?: () => void }) {
  const [data, setData] = useState<StorageProvidersResponse | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const result = await browserApiRequest<StorageProvidersResponse>("/api/admin/storage/providers");
      setData(result);
      setForm({
        local: { local_storage_dir: result.local.local_storage_dir ?? "" },
        amazon_s3: {
          name: result.amazon_s3.name,
          is_enabled: result.amazon_s3.is_enabled,
          api_key: "",
          api_secret: "",
          bucket: text(result.amazon_s3.config, "bucket"),
          region: text(result.amazon_s3.config, "region"),
          endpoint_url: text(result.amazon_s3.config, "endpoint_url"),
          public_base_url: text(result.amazon_s3.config, "public_base_url"),
          addressing_style: text(result.amazon_s3.config, "addressing_style") || "virtual",
        },
        cloudflare_r2: {
          name: result.cloudflare_r2.name,
          is_enabled: result.cloudflare_r2.is_enabled,
          account_id: text(result.cloudflare_r2.config, "account_id"),
          api_key: "",
          api_secret: "",
          bucket: text(result.cloudflare_r2.config, "bucket"),
          endpoint_url: text(result.cloudflare_r2.config, "endpoint_url"),
          public_base_url: text(result.cloudflare_r2.config, "public_base_url"),
          addressing_style: text(result.cloudflare_r2.config, "addressing_style") || "path",
        },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible cargar los proveedores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const save = async (provider: ProviderKey, activate = false) => {
    setBusy(`${provider}:${activate ? "activate" : "save"}`);
    try {
      let payload: Record<string, unknown>;
      if (provider === "local") {
        payload = { local_storage_dir: form.local.local_storage_dir, ...(activate ? { active_provider: provider } : {}) };
      } else if (provider === "amazon_s3") {
        const current = form.amazon_s3;
        payload = {
          name: current.name, is_enabled: current.is_enabled,
          ...(current.api_key ? { api_key: current.api_key } : {}),
          ...(current.api_secret ? { api_secret: current.api_secret } : {}),
          config: { bucket: current.bucket, region: current.region, endpoint_url: current.endpoint_url || null, public_base_url: current.public_base_url || null, addressing_style: current.addressing_style },
          ...(activate ? { active_provider: provider } : {}),
        };
      } else {
        const current = form.cloudflare_r2;
        payload = {
          name: current.name, is_enabled: current.is_enabled,
          ...(current.api_key ? { api_key: current.api_key } : {}),
          ...(current.api_secret ? { api_secret: current.api_secret } : {}),
          config: { account_id: current.account_id, bucket: current.bucket, endpoint_url: current.endpoint_url || null, public_base_url: current.public_base_url || null, addressing_style: current.addressing_style },
          ...(activate ? { active_provider: provider } : {}),
        };
      }
      const result = await browserApiRequest<StorageProvidersResponse>(`/api/admin/storage/providers/${provider}`, { method: "PATCH", body: JSON.stringify(payload) });
      setData(result);
      toast.success(activate ? "Proveedor activado para archivos nuevos." : "Configuración guardada.");
      await load();
      onChanged?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible guardar.");
    } finally { setBusy(null); }
  };

  const test = async (provider: ProviderKey) => {
    setBusy(`${provider}:test`);
    try {
      const result = await browserApiRequest<{ status: string; message: string }>(`/api/admin/storage/providers/${provider}/health`, { method: "POST" });
      result.status === "healthy" ? toast.success(result.message) : toast.warning(result.message);
      await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Falló la prueba de conexión."); }
    finally { setBusy(null); }
  };

  if (loading) return <div className="luxia-panel mt-5 flex min-h-40 items-center justify-center rounded-3xl"><LoaderCircle className="animate-spin text-red-500" /></div>;
  if (!data) return null;

  const cards: Array<{ key: ProviderKey; label: string; icon: typeof HardDrive; config: StorageProviderConfig }> = [
    { key: "local", label: "Almacenamiento local", icon: HardDrive, config: data.local },
    { key: "amazon_s3", label: "Amazon S3", icon: Server, config: data.amazon_s3 },
    { key: "cloudflare_r2", label: "Cloudflare R2", icon: Cloud, config: data.cloudflare_r2 },
  ];

  return (
    <section className="luxia-panel mt-5 rounded-3xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs uppercase tracking-[0.2em] text-red-400">Proveedor para archivos nuevos</p><h2 className="mt-2 text-xl font-semibold text-white">Configuración de almacenamiento</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">Cambiar el proveedor activo no mueve archivos anteriores. Cada archivo conserva la ubicación donde fue guardado.</p></div>
        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-300">Activo: {cards.find((item) => item.key === data.active_provider)?.label}</span>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {cards.map(({ key, label, icon: Icon, config }) => {
          const active = data.active_provider === key;
          return <article key={key} className={`rounded-2xl border p-4 ${active ? "border-blue-500/30 bg-blue-500/[0.06]" : "border-white/7 bg-black/20"}`}>
            <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Icon size={18} className={active ? "text-blue-300" : "text-red-400"}/><div><h3 className="text-sm font-semibold text-white">{label}</h3><p className="text-[11px] text-zinc-600">{active ? "Recibe archivos nuevos" : "Disponible para configurar"}</p></div></div>{active && <CheckCircle2 size={18} className="text-blue-300" />}</div>

            {key === "local" && <div className="mt-4"><label className="text-xs text-zinc-500">Directorio local</label><input value={form.local.local_storage_dir} onChange={(e)=>setForm((c)=>({...c,local:{local_storage_dir:e.target.value}}))} className="mt-2 h-10 w-full rounded-xl border border-white/7 bg-black/30 px-3 text-xs text-zinc-200 outline-none" /></div>}
            {key === "amazon_s3" && <RemoteFields kind="amazon" value={form.amazon_s3} setValue={(next)=>setForm((c)=>({...c,amazon_s3:next}))} configuredKey={config.api_key_configured} configuredSecret={config.api_secret_configured} />}
            {key === "cloudflare_r2" && <RemoteFields kind="r2" value={form.cloudflare_r2} setValue={(next)=>setForm((c)=>({...c,cloudflare_r2:next}))} configuredKey={config.api_key_configured} configuredSecret={config.api_secret_configured} />}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={()=>void save(key)} disabled={busy!==null} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] text-xs text-zinc-300 disabled:opacity-50"><Save size={14}/>Guardar</button>
              <button onClick={()=>void test(key)} disabled={busy!==null} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] text-xs text-zinc-300 disabled:opacity-50"><TestTube2 size={14}/>Probar</button>
              <button onClick={()=>void save(key,true)} disabled={busy!==null || active} className="col-span-2 inline-flex h-9 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-xs text-blue-300 disabled:opacity-40">Usar para archivos nuevos</button>
            </div>
            {config.last_health_message && <p className="mt-3 text-[11px] leading-5 text-zinc-600">{config.last_health_message}</p>}
          </article>;
        })}
      </div>
    </section>
  );
}

function RemoteFields({ kind, value, setValue, configuredKey, configuredSecret }: { kind: "amazon" | "r2"; value: any; setValue: (value:any)=>void; configuredKey?: boolean; configuredSecret?: boolean }) {
  const update=(key:string,val:string|boolean)=>setValue({...value,[key]:val});
  return <div className="mt-4 space-y-2">
    <label className="flex items-center gap-2 text-xs text-zinc-500"><input type="checkbox" checked={value.is_enabled} onChange={(e)=>update("is_enabled",e.target.checked)}/>Integración habilitada</label>
    {kind === "r2" && <input value={value.account_id} onChange={(e)=>update("account_id",e.target.value)} placeholder="Account ID" className="field"/>}
    <input value={value.api_key} onChange={(e)=>update("api_key",e.target.value)} placeholder={configuredKey ? "Access Key configurada (escribe para reemplazar)" : "Access Key ID"} className="field"/>
    <input type="password" value={value.api_secret} onChange={(e)=>update("api_secret",e.target.value)} placeholder={configuredSecret ? "Secret configurado (escribe para reemplazar)" : "Secret Access Key"} className="field"/>
    <input value={value.bucket} onChange={(e)=>update("bucket",e.target.value)} placeholder="Bucket" className="field"/>
    {kind === "amazon" && <input value={value.region} onChange={(e)=>update("region",e.target.value)} placeholder="Región, por ejemplo us-east-1" className="field"/>}
    <input value={value.endpoint_url} onChange={(e)=>update("endpoint_url",e.target.value)} placeholder={kind === "r2" ? "Endpoint R2 (opcional si hay Account ID)" : "Endpoint personalizado (opcional)"} className="field"/>
    <input value={value.public_base_url} onChange={(e)=>update("public_base_url",e.target.value)} placeholder="URL pública o dominio CDN (opcional)" className="field"/>
    <style jsx>{`.field{height:2.5rem;width:100%;border-radius:.75rem;border:1px solid rgba(255,255,255,.07);background:rgba(0,0,0,.3);padding:0 .75rem;font-size:.75rem;color:#e4e4e7;outline:none}`}</style>
  </div>;
}
