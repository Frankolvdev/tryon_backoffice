"use client";

import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, RefreshCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { ProviderGpuPricingTable } from "@/components/backoffice/infrastructure/provider-gpu-pricing-table";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { LocalComfyProviderConfig, ProviderActionResponse } from "@/types/admin-infrastructure-providers";

const input = "h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-red-500/50";
const LOCAL_GPUS = ["NVIDIA GeForce RTX 5090"] as const;
const defaults: LocalComfyProviderConfig = {
  enabled: false,
  endpoint: "http://127.0.0.1:8188",
  gpu: "NVIDIA GeForce RTX 5090",
  timeout_seconds: 900,
};

type LocalProvider = "local-docker" | "owner-local";

export function LocalComfyProviderPanel({
  provider,
  title,
  description,
}: {
  provider: LocalProvider;
  title: string;
  description: string;
}) {
  const [value, setValue] = useState<LocalComfyProviderConfig>(defaults);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"save" | "test" | null>(null);
  const endpoint = `/api/admin/infrastructure-providers/${provider}`;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await browserApiRequest<LocalComfyProviderConfig>(endpoint);
      setValue({ ...defaults, ...result });
    } catch (error) {
      // Failure is intentionally contained here. Existing providers are not
      // part of this request path.
      toast.error(error instanceof Error ? error.message : `No se pudo cargar ${title}.`);
    } finally {
      setLoading(false);
    }
  }, [endpoint, title]);

  useEffect(() => { void load(); }, [load]);

  async function save() {
    setBusy("save");
    try {
      const result = await browserApiRequest<LocalComfyProviderConfig>(endpoint, {
        method: "PUT",
        body: JSON.stringify(value),
      });
      setValue({ ...defaults, ...result });
      toast.success(`${title} guardado.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `No se pudo guardar ${title}.`);
    } finally {
      setBusy(null);
    }
  }

  async function test() {
    setBusy("test");
    try {
      const result = await browserApiRequest<ProviderActionResponse>(`${endpoint}/test`, { method: "POST" });
      (result.success ? toast.success : toast.error)(result.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo probar la conexión.");
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return <section className="luxia-panel mt-5 flex min-h-52 items-center justify-center rounded-3xl"><LoaderCircle className="animate-spin text-red-500" /></section>;
  }

  return <section className="luxia-panel mt-5 rounded-3xl p-6">
    <div className="text-sm text-red-300">{title}</div>
    <p className="mt-2 text-sm text-zinc-500">{description}</p>
    <div className="mt-6 grid gap-5 lg:grid-cols-2">
      <label className="flex items-center gap-3 rounded-xl border border-white/8 p-4 text-sm text-zinc-300"><input type="checkbox" checked={value.enabled} onChange={e => setValue({ ...value, enabled: e.target.checked })} />Proveedor activo</label>
      <label className="space-y-2 text-sm text-zinc-300"><span>Endpoint ComfyUI</span><input className={input} value={value.endpoint} onChange={e => setValue({ ...value, endpoint: e.target.value })} /></label>
      {provider === "owner-local" && <label className="space-y-2 text-sm text-zinc-300"><span>Sistema operativo</span><select className={input} value={value.operating_system ?? "linux"} onChange={e => setValue({ ...value, operating_system: e.target.value as "linux" | "windows" })}><option value="linux">Linux</option><option value="windows">Windows</option></select><small className="block text-zinc-500">{(value.operating_system ?? "linux") === "windows" ? "Conserva las rutas del workflow tal como fueron exportadas." : "Usa la normalización histórica de rutas Linux."}</small></label>}
      <label className="space-y-2 text-sm text-zinc-300"><span>GPU</span><select className={input} value={value.gpu} onChange={e => setValue({ ...value, gpu: e.target.value })}>{LOCAL_GPUS.map(gpu => <option key={gpu} value={gpu}>{gpu}</option>)}</select></label>
      <label className="space-y-2 text-sm text-zinc-300"><span>Timeout de ejecución (segundos)</span><input type="number" min={30} max={86400} className={input} value={value.timeout_seconds} onChange={e => setValue({ ...value, timeout_seconds: Number.isFinite(e.target.valueAsNumber) ? e.target.valueAsNumber : 900 })} /></label>
      <div className="lg:col-span-2"><ProviderGpuPricingTable provider={provider === "local-docker" ? "local_docker" : "owner_local"} gpuKeys={LOCAL_GPUS} /></div>
    </div>
    <div className="mt-6 flex flex-wrap gap-3">
      <button disabled={busy !== null} onClick={() => void save()} className="h-11 rounded-xl bg-red-600 px-5 text-sm text-white disabled:opacity-60">{busy === "save" ? <LoaderCircle size={16} className="mr-2 inline animate-spin" /> : <Save size={16} className="mr-2 inline" />}{busy === "save" ? "Guardando…" : "Guardar"}</button>
      <button disabled={busy !== null} onClick={() => void test()} className="h-11 rounded-xl border border-white/10 px-5 text-sm text-zinc-300 disabled:opacity-60">{busy === "test" && <LoaderCircle size={16} className="mr-2 inline animate-spin" />}{busy === "test" ? "Probando…" : "Probar conexión"}</button>
      <button disabled={busy !== null} onClick={() => void load()} className="h-11 rounded-xl border border-white/10 px-5 text-sm text-zinc-300 disabled:opacity-60"><RefreshCcw size={15} className="mr-2 inline" />Recargar local</button>
    </div>
  </section>;
}
