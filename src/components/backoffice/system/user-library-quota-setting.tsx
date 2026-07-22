"use client";

import { useEffect, useState } from "react";
import { Database, LoaderCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";

type Summary = { quota_mb: number; used_bytes: number; file_count: number; user_count: number };

function formatBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / 1024 ** index).toFixed(index > 1 ? 2 : 0)} ${units[index]}`;
}

export function UserLibraryQuotaSetting() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [quotaMb, setQuotaMb] = useState("1024");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void browserApiRequest<Summary>("/api/admin/user-library/summary")
      .then((value) => { setSummary(value); setQuotaMb(String(value.quota_mb)); })
      .catch(() => undefined);
  }, []);

  async function save() {
    const quota = Number(quotaMb);
    if (!Number.isFinite(quota) || quota < 1) return toast.error("La cuota debe ser mayor a 0 MB.");
    setBusy(true);
    try {
      const value = await browserApiRequest<{ quota_mb: number }>("/api/admin/user-library/quota", {
        method: "PUT",
        body: JSON.stringify({ quota_mb: quota }),
      });
      setQuotaMb(String(value.quota_mb));
      setSummary((current) => current ? { ...current, quota_mb: value.quota_mb } : current);
      toast.success("Cuota global de la librería actualizada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible guardar la cuota.");
    } finally { setBusy(false); }
  }

  return (
    <section className="luxia-panel mb-6 rounded-3xl p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-red-500/15 bg-red-950/25 text-red-300"><Database size={19}/></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-red-400">Almacenamiento de usuarios</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Cuota global de la librería</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Límite máximo que cada usuario final puede ocupar entre archivos subidos y guardados en su librería privada.</p>
            {summary && <p className="mt-2 text-xs text-zinc-600">Uso actual: {formatBytes(summary.used_bytes)} en {summary.file_count} archivos de {summary.user_count} usuarios.</p>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input type="number" min="1" value={quotaMb} onChange={(event)=>setQuotaMb(event.target.value)} className="h-11 w-40 rounded-xl border border-white/7 bg-black/30 px-3 text-white outline-none focus:border-red-500/40"/>
          <span className="text-sm text-zinc-500">MB por usuario</span>
          <button type="button" onClick={()=>void save()} disabled={busy} className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white disabled:opacity-50">
            {busy ? <LoaderCircle size={16} className="animate-spin"/> : <Save size={16}/>} Guardar
          </button>
        </div>
      </div>
    </section>
  );
}
