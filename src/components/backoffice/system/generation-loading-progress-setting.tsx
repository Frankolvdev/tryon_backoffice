"use client";

import { Gauge, LoaderCircle, Server, TimerReset } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import type { SystemSettingResponse } from "@/types/admin-system-settings";

type LoadingMode = "backend" | "elapsed_estimate";

export function GenerationLoadingProgressSetting({
  setting,
  onSaved,
}: {
  setting?: SystemSettingResponse;
  onSaved: () => void | Promise<void>;
}) {
  const initial = useMemo<LoadingMode>(
    () => setting?.value === "elapsed_estimate" ? "elapsed_estimate" : "backend",
    [setting?.value],
  );
  const [mode, setMode] = useState<LoadingMode>(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setMode(initial); }, [initial]);

  async function save(next: LoadingMode) {
    setMode(next);
    setSaving(true);
    try {
      if (setting) {
        await browserApiRequest<SystemSettingResponse>(`/api/admin/system-settings/${setting.id}`, {
          method: "PATCH",
          body: JSON.stringify({ value: next }),
        });
      } else {
        await browserApiRequest<SystemSettingResponse>("/api/admin/system-settings", {
          method: "POST",
          body: JSON.stringify({
            category: "frontend",
            key: "generation_loading_progress_mode",
            label: "Generation loading progress mode",
            description: "Controla únicamente el progreso visual de generaciones. No afecta uploads ni otros loadings.",
            value_type: "string",
            value: next,
            default_value: "elapsed_estimate",
            is_public: true,
            is_editable: true,
            is_sensitive: false,
            requires_restart: false,
            sort_order: 5,
          }),
        });
      }
      toast.success(next === "backend" ? "Las generaciones usarán históricos de Tiempo backend." : "Las generaciones usarán el tiempo real de procesamiento, como antes.");
      await onSaved();
    } catch (error) {
      setMode(initial);
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el modo de progreso.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="luxia-panel mt-5 overflow-hidden rounded-3xl">
      <div className="border-b border-white/6 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-red-500/15 bg-red-950/15 text-red-400">
            <Gauge size={19} />
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-red-500 uppercase">Loading de generaciones</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Fuente del tiempo y progressbar</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">Este ajuste aplica solo cuando una generación está queued/running. Subidas de imágenes, rostro y otros loadings conservan su progreso independiente.</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 p-5 lg:grid-cols-2">
        <button type="button" disabled={saving} onClick={() => void save("backend")} className={`rounded-2xl border p-5 text-left transition ${mode === "backend" ? "border-red-500/35 bg-red-950/15" : "border-white/7 bg-black/20 hover:border-white/12"}`}>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-white"><Server size={17} className="text-red-400" />Tiempo backend (nuevo)</span>
            {saving && mode === "backend" ? <LoaderCircle size={16} className="animate-spin text-red-400" /> : <span className={`size-3 rounded-full border ${mode === "backend" ? "border-red-400 bg-red-500" : "border-zinc-700"}`} />}
          </div>
          <p className="mt-3 text-xs leading-5 text-zinc-500">Usa exactamente la misma animación y cálculo visual del modo anterior, pero la ETA se aprende de la columna <code>Tiempo backend</code> de Trabajos IA (<code>duration_ms</code>). No cambia pricing ni costos.</p>
        </button>
        <button type="button" disabled={saving} onClick={() => void save("elapsed_estimate")} className={`rounded-2xl border p-5 text-left transition ${mode === "elapsed_estimate" ? "border-red-500/35 bg-red-950/15" : "border-white/7 bg-black/20 hover:border-white/12"}`}>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-white"><TimerReset size={17} className="text-red-400" />Tiempo real de procesamiento (anterior)</span>
            {saving && mode === "elapsed_estimate" ? <LoaderCircle size={16} className="animate-spin text-red-400" /> : <span className={`size-3 rounded-full border ${mode === "elapsed_estimate" ? "border-red-400 bg-red-500" : "border-zinc-700"}`} />}
          </div>
          <p className="mt-3 text-xs leading-5 text-zinc-500">Mantiene el comportamiento que ya funcionaba: calcula el avance visual con el reloj transcurrido frente a la ETA aprendida del tiempo real de procesamiento del proveedor/Modal.</p>
        </button>
      </div>
    </section>
  );
}
