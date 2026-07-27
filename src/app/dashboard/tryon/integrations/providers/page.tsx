"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Cpu, FlaskConical, HelpCircle, LoaderCircle, RefreshCcw, Save, Server, ServerCog, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { TryOnEmptyState } from "@/components/backoffice/tryon/tryon-empty-state";
import { TryOnModuleHeader } from "@/components/backoffice/tryon/tryon-module-header";
import { browserApiRequest } from "@/lib/api/browser-api";
import { cn } from "@/lib/utils";
import type { AiEngineSettings, AiEngineSettingsUpdate } from "@/types/admin-ai-engine-settings";
import type { AiProviderHealth, AiProvidersOverview } from "@/types/admin-ai-providers";
type NumberFieldProps = {
  label: string;
  description: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
};

function NumberField({ label, description, value, min = 1, max, onChange }: NumberFieldProps) {
  const safeValue = Number.isFinite(value) ? value : min;
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
        value={safeValue}
        onChange={(event) => {
          const nextValue = event.target.valueAsNumber;
          onChange(Number.isFinite(nextValue) ? nextValue : min);
        }}
        className="mt-3 h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-3 text-sm text-white outline-none focus:border-red-500/40"
      />
    </label>
  );
}
const DEFAULT_MODAL_SETTINGS: AiEngineSettingsUpdate = {
  local_parallel_executions: 1,
  runpod_min_workers: 0,
  runpod_max_workers: 3,
  runpod_dispatch_workers: 3,
  runpod_max_in_flight: 50,
  modal_gpu: "L40S",
  modal_min_containers: 0,
  modal_max_containers: 3,
  modal_concurrency: 1,
  modal_input_concurrency: 1000,
  modal_scaledown_window_seconds: 300,
  modal_execution_timeout_seconds: 1800,
  queue_block_seconds: 5,
};
function toSettingsDraft(value: Partial<AiEngineSettings> | null | undefined): AiEngineSettingsUpdate {
  return {
    local_parallel_executions:
      value?.local_parallel_executions ?? DEFAULT_MODAL_SETTINGS.local_parallel_executions,
    runpod_min_workers:
      value?.runpod_min_workers ?? DEFAULT_MODAL_SETTINGS.runpod_min_workers,
    runpod_max_workers:
      value?.runpod_max_workers ?? DEFAULT_MODAL_SETTINGS.runpod_max_workers,
    runpod_dispatch_workers:
      value?.runpod_dispatch_workers ?? DEFAULT_MODAL_SETTINGS.runpod_dispatch_workers,
    runpod_max_in_flight:
      value?.runpod_max_in_flight ?? DEFAULT_MODAL_SETTINGS.runpod_max_in_flight,
    modal_gpu:
      value?.modal_gpu || DEFAULT_MODAL_SETTINGS.modal_gpu,
    modal_min_containers:
      value?.modal_min_containers ?? DEFAULT_MODAL_SETTINGS.modal_min_containers,
    modal_max_containers:
      value?.modal_max_containers ?? DEFAULT_MODAL_SETTINGS.modal_max_containers,
    modal_concurrency:
      value?.modal_concurrency ?? DEFAULT_MODAL_SETTINGS.modal_concurrency,
    modal_input_concurrency:
      value?.modal_input_concurrency ?? DEFAULT_MODAL_SETTINGS.modal_input_concurrency,
    modal_scaledown_window_seconds:
      value?.modal_scaledown_window_seconds
      ?? DEFAULT_MODAL_SETTINGS.modal_scaledown_window_seconds,
    modal_execution_timeout_seconds:
      value?.modal_execution_timeout_seconds
      ?? DEFAULT_MODAL_SETTINGS.modal_execution_timeout_seconds,
    queue_block_seconds:
      value?.queue_block_seconds ?? DEFAULT_MODAL_SETTINGS.queue_block_seconds,
  };
}
function providerLabel(provider: string): string {
  const labels: Record<string, string> = {
    simulated: "Simulado",
    comfyui_local: "ComfyUI Local",
    local_docker: "ComfyUI Local",
    runpod_serverless: "RunPod Serverless",
    modal: "Modal",
    beam: "Beam",
  };
  return labels[provider] ?? provider;
}
function ProviderIcon({ provider }: { provider: string }) {
  if (provider === "runpod_serverless" || provider === "modal" || provider === "beam") return <Server size={19} />;
  if (provider === "comfyui_local" || provider === "local_docker") return <Cpu size={19} />;
  return <FlaskConical size={19} />;
}
function ConfiguredEngineCard({ provider }: { provider: AiProviderHealth }) {
  return (
    <article className="rounded-2xl border border-white/7 bg-white/[0.025] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border border-white/8 bg-black/30 text-zinc-300">
            <ProviderIcon provider={provider.provider} />
          </div>
          <div>
            <h3 className="font-medium text-white">{providerLabel(provider.provider)}</h3>
            <p className="mt-1 text-xs text-zinc-500">Motor configurado</p>
          </div>
        </div>
        <span className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
          provider.available
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
            : "border-amber-500/20 bg-amber-500/10 text-amber-300",
        )}>
          {provider.available ? <CheckCircle2 size={13} /> : <TriangleAlert size={13} />}
          {provider.available ? "Disponible" : "No disponible"}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-zinc-400">
        {provider.message ?? "Configurado para ser utilizado por los módulos de generación que lo tengan seleccionado."}
      </p>
    </article>
  );
}
export default function AiEnginePage() {
  const [settings, setSettings] = useState<AiEngineSettings | null>(null);
  const [overview, setOverview] = useState<AiProvidersOverview | null>(null);
  const [draft, setDraft] = useState<AiEngineSettingsUpdate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [value, providersOverview] = await Promise.all([
        browserApiRequest<AiEngineSettings>("/api/admin/ai-providers/engine-settings"),
        browserApiRequest<AiProvidersOverview>("/api/admin/ai-providers/overview"),
      ]);
      setSettings(value);
      setOverview(providersOverview);
      setDraft(toSettingsDraft(value));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible cargar la configuración del Motor IA.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const update = <K extends keyof AiEngineSettingsUpdate>(key: K, value: AiEngineSettingsUpdate[K]) => {
    setDraft((current) => current ? { ...current, [key]: value } : current);
  };

  const save = async () => {
    if (!draft) return;
    const payload: AiEngineSettingsUpdate = {
      ...toSettingsDraft(draft),
      modal_scaledown_window_seconds: Math.max(
        1,
        Number.isFinite(draft.modal_scaledown_window_seconds)
          ? draft.modal_scaledown_window_seconds
          : DEFAULT_MODAL_SETTINGS.modal_scaledown_window_seconds,
      ),
      modal_execution_timeout_seconds: Math.max(
        60,
        Number.isFinite(draft.modal_execution_timeout_seconds)
          ? draft.modal_execution_timeout_seconds
          : DEFAULT_MODAL_SETTINGS.modal_execution_timeout_seconds,
      ),
      modal_min_containers: Math.max(
        0,
        Number.isFinite(draft.modal_min_containers)
          ? draft.modal_min_containers
          : DEFAULT_MODAL_SETTINGS.modal_min_containers,
      ),
      modal_max_containers: Math.max(
        1,
        Number.isFinite(draft.modal_max_containers)
          ? draft.modal_max_containers
          : DEFAULT_MODAL_SETTINGS.modal_max_containers,
      ),
    };
    payload.modal_max_containers = Math.max(
      payload.modal_max_containers,
      payload.modal_min_containers,
    );
    setDraft(payload);
    setSaving(true);
    try {
      const value = await browserApiRequest<AiEngineSettings>("/api/admin/ai-providers/engine-settings", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setSettings(value);
      setDraft(toSettingsDraft(value));
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
        <>
          <section className="luxia-panel mt-5 rounded-3xl p-6">
            <div>
              <p className="text-sm font-medium text-red-300">Motores configurados</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Motores disponibles para los módulos</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Se muestran únicamente los motores que ya existen y están configurados. La selección del motor se realiza dentro de cada módulo de generación.
              </p>
            </div>
            {overview?.providers.filter((provider) => provider.configured).length ? (
              <div className="mt-5 grid gap-4 xl:grid-cols-3">
                {overview.providers.filter((provider) => provider.configured).map((provider) => (
                  <ConfiguredEngineCard key={provider.provider} provider={provider} />
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-white/7 bg-black/20 p-5 text-sm text-zinc-500">
                No hay motores configurados todavía. Configura la conexión correspondiente antes de asignarla a un módulo.
              </div>
            )}
          </section>
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
            <div className="flex items-center gap-2 text-sm font-semibold text-white"><ServerCog size={16} /> Configuración Modal</div>
            <p className="mt-2 text-xs leading-5 text-zinc-500">Parámetros obligatorios y esenciales para escalar el runtime de generación en Modal. Se validan junto con Configuración del proveedor antes de cada Deploy.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <NumberField label="Contenedores mínimos" description="Usa 0 para escalar a cero cuando no haya trabajos." value={draft.modal_min_containers} min={0} max={100} onChange={(v) => update("modal_min_containers", v)} />
              <NumberField label="Contenedores máximos" description="Máximo de contenedores GPU que Modal podrá levantar para atender la demanda." value={draft.modal_max_containers} max={100} onChange={(v) => update("modal_max_containers", v)} />
              <NumberField label="Workflows simultáneos por GPU" description="Cantidad máxima de workflows pesados que cada contenedor GPU puede ejecutar simultáneamente. Se recomienda mantener 1 para evitar saturación de VRAM." value={draft.modal_concurrency} max={16} onChange={(v) => update("modal_concurrency", v)} />
              <NumberField label="Conexiones HTTP/WebSocket por contenedor" description="Cantidad máxima de entradas HTTP y WebSocket que el mismo contenedor puede atender. No aumenta los workflows simultáneos ni el uso de VRAM. Si no existe un valor guardado se usa el máximo predeterminado: 1000." value={draft.modal_input_concurrency} max={1000} onChange={(v) => update("modal_input_concurrency", v)} />
              <NumberField label="Apagado por inactividad (segundos)" description="Tiempo sin actividad antes de liberar el contenedor. Recomendado: 300." value={draft.modal_scaledown_window_seconds} min={1} max={3600} onChange={(v) => update("modal_scaledown_window_seconds", v)} />
              <NumberField label="Timeout de ejecución (segundos)" description="Tiempo máximo permitido para una generación. Recomendado: 1800." value={draft.modal_execution_timeout_seconds} min={60} max={86400} onChange={(v) => update("modal_execution_timeout_seconds", v)} />
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
                <p className="mt-1 text-xs text-zinc-500">La configuración de Modal se aplicará al siguiente runtime generado y se validará antes de cada Deploy.</p>
              </div>
            </div>
            <button type="button" disabled={saving} onClick={() => void save()} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50">
              {saving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />} Guardar configuración
            </button>
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs text-zinc-600"><ServerCog size={14} /> La capacidad de Modal se administra aquí; credenciales, aplicación, entorno y volumen permanecen en Configuración del proveedor.</div>
        </section>
        </>
      )}
    </div>
  );
}
