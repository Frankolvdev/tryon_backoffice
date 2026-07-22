"use client";

import { useCallback, useEffect, useState } from "react";
import { Cpu, HelpCircle, LoaderCircle, RefreshCcw, Save, ServerCog, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { TryOnEmptyState } from "@/components/backoffice/tryon/tryon-empty-state";
import { TryOnModuleHeader } from "@/components/backoffice/tryon/tryon-module-header";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { AiEngineSettings, AiEngineSettingsUpdate } from "@/types/admin-ai-engine-settings";

type NumberFieldProps = {
  label: string;
  description: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
};

function NumberField({ label, description, value, min = 1, max, onChange }: NumberFieldProps) {
  return (
    <label className="rounded-2xl border border-white/7 bg-black/20 p-4">
      <span className="flex items-center gap-2 text-sm font-medium text-white">
        {label}
        <span title={description} className="cursor-help text-zinc-600 hover:text-zinc-300">
          <HelpCircle size={15} />
        </span>
      </span>
      <p className="mt-2 min-h-10 text-xs leading-5 text-zinc-500">{description}</p>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-3 text-sm text-white outline-none focus:border-red-500/40"
      />
    </label>
  );
}

export default function AiEnginePage() {
  const [settings, setSettings] = useState<AiEngineSettings | null>(null);
  const [draft, setDraft] = useState<AiEngineSettingsUpdate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const value = await browserApiRequest<AiEngineSettings>("/api/admin/ai-providers/engine-settings");
      setSettings(value);
      setDraft({
        local_parallel_executions: value.local_parallel_executions,
        runpod_min_workers: value.runpod_min_workers,
        runpod_max_workers: value.runpod_max_workers,
        runpod_dispatch_workers: value.runpod_dispatch_workers,
        runpod_max_in_flight: value.runpod_max_in_flight,
        queue_block_seconds: value.queue_block_seconds,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible cargar la configuración del Motor IA.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const update = (key: keyof AiEngineSettingsUpdate, value: number) => {
    setDraft((current) => current ? { ...current, [key]: value } : current);
  };

  const save = async () => {
    if (
      !draft ||
      !Number.isFinite(draft.runpod_min_workers) ||
      draft.runpod_min_workers < 0 ||
      Object.entries(draft).some(
        ([key, value]) => key !== "runpod_min_workers" && (!Number.isFinite(value) || value < 1),
      ) ||
      draft.runpod_max_workers < draft.runpod_min_workers
    ) {
      toast.error("Revisa los valores: el mínimo de RunPod puede ser 0 y el máximo debe ser igual o mayor.");
      return;
    }
    setSaving(true);
    try {
      const value = await browserApiRequest<AiEngineSettings>("/api/admin/ai-providers/engine-settings", {
        method: "PUT",
        body: JSON.stringify(draft),
      });
      setSettings(value);
      setDraft({
        local_parallel_executions: value.local_parallel_executions,
        runpod_min_workers: value.runpod_min_workers,
        runpod_max_workers: value.runpod_max_workers,
        runpod_dispatch_workers: value.runpod_dispatch_workers,
        runpod_max_in_flight: value.runpod_max_in_flight,
        queue_block_seconds: value.queue_block_seconds,
      });
      toast.success("Configuración del Motor IA guardada. Reinicia el backend para aplicarla.");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "No fue posible guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <TryOnModuleHeader
        title="Motor IA"
        description="Parámetros técnicos de concurrencia y despacho. El motor utilizado por cada módulo se sigue seleccionando dentro de Módulos de generación."
      />

      {loading && (
        <section className="luxia-panel mt-5 flex min-h-72 items-center justify-center rounded-3xl">
          <LoaderCircle className="animate-spin text-red-500" />
        </section>
      )}

      {!loading && error && <div className="mt-5"><TryOnEmptyState error title="No se pudo cargar la configuración" description={error} /></div>}

      {!loading && draft && settings && (
        <section className="luxia-panel mt-5 rounded-3xl p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-red-300"><Cpu size={16} /> Configuración de ejecución</div>
              <h2 className="mt-2 text-2xl font-semibold text-white">Concurrencia del Motor IA</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
                Estos valores controlan cuántos trabajos procesa el backend de forma simultánea. No activan ni seleccionan proveedores.
              </p>
            </div>
            <button type="button" onClick={() => void load()} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400 hover:text-white">
              <RefreshCcw size={15} /> Recargar
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-white/7 bg-black/20 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-white"><Cpu size={16} /> Configuración local</div>
            <p className="mt-2 text-xs leading-5 text-zinc-500">Controla únicamente la concurrencia del worker local y ComfyUI.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
            <NumberField
              label="Ejecuciones locales en paralelo"
              description="Cantidad de trabajos locales que pueden ejecutarse simultáneamente. Con una sola GPU se recomienda mantener 1 para evitar saturación de VRAM y conflictos en ComfyUI."
              value={draft.local_parallel_executions}
              max={32}
              onChange={(value) => update("local_parallel_executions", value)}
            />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/7 bg-black/20 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-white"><ServerCog size={16} /> Configuración RunPod</div>
            <p className="mt-2 text-xs leading-5 text-zinc-500">Escalado remoto y capacidad de despacho. La pestaña RunPod queda reservada para conexión y despliegue.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
            <NumberField
              label="Workers mínimos de RunPod"
              description="Cantidad mínima de workers remotos que RunPod debe mantener disponibles. Usa 0 para permitir que el endpoint escale a cero cuando no haya trabajos."
              value={draft.runpod_min_workers}
              min={0}
              max={128}
              onChange={(value) => update("runpod_min_workers", value)}
            />
            <NumberField
              label="Workers máximos de RunPod"
              description="Cantidad máxima de workers remotos que RunPod puede levantar para atender la cola. Debe ser igual o mayor que los workers mínimos."
              value={draft.runpod_max_workers}
              max={256}
              onChange={(value) => update("runpod_max_workers", value)}
            />
            <NumberField
              label="Dispatcher workers de RunPod"
              description="Hilos del backend dedicados a tomar trabajos de la cola y despacharlos hacia RunPod. No modifica el escalado de workers dentro de RunPod."
              value={draft.runpod_dispatch_workers}
              max={128}
              onChange={(value) => update("runpod_dispatch_workers", value)}
            />
            <NumberField
              label="Máximo de RunPod en vuelo"
              description="Número máximo de trabajos RunPod que el backend permite mantener activos al mismo tiempo. La concurrencia efectiva será el menor valor entre este límite y los dispatcher workers."
              value={draft.runpod_max_in_flight}
              max={512}
              onChange={(value) => update("runpod_max_in_flight", value)}
            />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/7 bg-black/20 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-white"><ServerCog size={16} /> Configuración de cola</div>
            <p className="mt-2 text-xs leading-5 text-zinc-500">Ajusta la espera del consumidor de Redis sin seleccionar ni activar proveedores.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
            <NumberField
              label="Espera de lectura de cola"
              description="Segundos que cada worker espera por un trabajo nuevo antes de volver a consultar Redis. Un valor bajo reacciona más rápido; uno alto reduce consultas vacías."
              value={draft.queue_block_seconds}
              max={60}
              onChange={(value) => update("queue_block_seconds", value)}
            />
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-amber-500/15 bg-amber-500/[0.05] p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-3">
              <TriangleAlert className="mt-0.5 shrink-0 text-amber-300" size={18} />
              <div>
                <p className="text-sm font-medium text-amber-200">Reinicio requerido</p>
                <p className="mt-1 text-xs leading-5 text-amber-200/60">Los workers se crean al iniciar el backend. Guarda los cambios y reinicia Uvicorn para aplicarlos.</p>
                <p className="mt-1 text-xs text-zinc-500">Paralelismo RunPod efectivo actual: {settings.effective_runpod_parallelism}</p>
              </div>
            </div>
            <button type="button" disabled={saving} onClick={() => void save()} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50">
              {saving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />} Guardar configuración
            </button>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-zinc-600"><ServerCog size={14} /> Toda la capacidad y concurrencia de ejecución se administra aquí. RunPod conserva únicamente los datos de conexión y despliegue.</div>
        </section>
      )}
    </div>
  );
}
