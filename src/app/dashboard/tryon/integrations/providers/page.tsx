"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  CheckCircle2,
  Cpu,
  FlaskConical,
  LoaderCircle,
  RefreshCcw,
  Save,
  Server,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import { AiEngineTabs } from "@/components/backoffice/tryon/ai-engine-tabs";
import { TryOnEmptyState } from "@/components/backoffice/tryon/tryon-empty-state";
import { TryOnModuleHeader } from "@/components/backoffice/tryon/tryon-module-header";
import { browserApiRequest } from "@/lib/api/browser-api";
import { cn } from "@/lib/utils";

import type {
  AiExecutionMode,
  AiProviderHealth,
  AiProvidersOverview,
} from "@/types/admin-ai-providers";

const modes: Array<{
  value: AiExecutionMode;
  label: string;
  description: string;
}> = [
  {
    value: "auto",
    label: "Automático",
    description: "Selecciona el primer proveedor disponible según el orden de respaldo.",
  },
  {
    value: "runpod_serverless",
    label: "RunPod Serverless",
    description: "Usa el endpoint productivo configurado en RunPod.",
  },
  {
    value: "comfyui_local",
    label: "ComfyUI Local",
    description: "Ejecuta los workflows contra la instancia local de ComfyUI.",
  },
  {
    value: "simulated",
    label: "Simulado",
    description: "Permite pruebas funcionales sin GPU ni proveedor externo.",
  },
];

function providerLabel(provider: string): string {
  const labels: Record<string, string> = {
    simulated: "Simulado",
    comfyui_local: "ComfyUI Local",
    runpod_serverless: "RunPod Serverless",
  };
  return labels[provider] ?? provider;
}

function ProviderIcon({ provider }: { provider: string }) {
  if (provider === "runpod_serverless") return <Server size={19} />;
  if (provider === "comfyui_local") return <Cpu size={19} />;
  return <FlaskConical size={19} />;
}

function ProviderCard({ provider }: { provider: AiProviderHealth }) {
  return (
    <article className="rounded-2xl border border-white/7 bg-white/[0.025] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border border-white/8 bg-black/30 text-zinc-300">
            <ProviderIcon provider={provider.provider} />
          </div>
          <div>
            <h3 className="font-medium text-white">
              {providerLabel(provider.provider)}
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              {provider.configured ? "Configurado" : "Sin configurar"}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
            provider.available
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              : "border-amber-500/20 bg-amber-500/10 text-amber-300",
          )}
        >
          {provider.available ? <CheckCircle2 size={13} /> : <TriangleAlert size={13} />}
          {provider.available ? "Disponible" : "No disponible"}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-zinc-400">
        {provider.message ?? "Sin información adicional."}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl border border-white/6 bg-black/20 p-3">
          <span className="text-zinc-600">Habilitado</span>
          <p className="mt-1 text-zinc-300">{provider.enabled ? "Sí" : "No"}</p>
        </div>
        <div className="rounded-xl border border-white/6 bg-black/20 p-3">
          <span className="text-zinc-600">Configurado</span>
          <p className="mt-1 text-zinc-300">{provider.configured ? "Sí" : "No"}</p>
        </div>
      </div>
    </article>
  );
}

export default function AiProvidersPage() {
  const [overview, setOverview] = useState<AiProvidersOverview | null>(null);
  const [selectedMode, setSelectedMode] = useState<AiExecutionMode>("simulated");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await browserApiRequest<AiProvidersOverview>(
        "/api/admin/ai-providers/overview",
      );
      setOverview(result);
      setSelectedMode(result.execution_mode);
    } catch (error) {
      setOverview(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible consultar los proveedores de IA.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const hasChanges = useMemo(
    () => overview?.execution_mode !== selectedMode,
    [overview, selectedMode],
  );

  const saveMode = async () => {
    setIsSaving(true);
    try {
      const result = await browserApiRequest<AiProvidersOverview>(
        "/api/admin/ai-providers/execution-mode",
        {
          method: "PATCH",
          body: JSON.stringify({ execution_mode: selectedMode }),
        },
      );
      setOverview(result);
      setSelectedMode(result.execution_mode);
      toast.success("Motor de ejecución actualizado.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible actualizar el motor.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <TryOnModuleHeader
        title="Proveedores de IA"
        description="Estado real, selección del motor y orden de respaldo para Simulado, ComfyUI Local y RunPod Serverless."
      />
      <AiEngineTabs />

      {isLoading && (
        <section className="luxia-panel mt-5 flex min-h-72 items-center justify-center rounded-3xl">
          <LoaderCircle className="animate-spin text-red-500" />
        </section>
      )}

      {!isLoading && errorMessage && (
        <div className="mt-5">
          <TryOnEmptyState error title="No se pudo cargar el estado" description={errorMessage} />
        </div>
      )}

      {!isLoading && overview && (
        <>
          <section className="luxia-panel mt-5 rounded-3xl p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm text-red-300">
                  <Activity size={16} /> Motor activo
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {providerLabel(overview.selected_provider)}
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                  Modo configurado: {modes.find((mode) => mode.value === overview.execution_mode)?.label}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadOverview()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400 hover:text-white"
              >
                <RefreshCcw size={15} /> Actualizar estado
              </button>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {modes.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setSelectedMode(mode.value)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition",
                    selectedMode === mode.value
                      ? "border-red-500/25 bg-red-950/20"
                      : "border-white/7 bg-white/[0.02] hover:border-white/12",
                  )}
                >
                  <p className="text-sm font-medium text-white">{mode.label}</p>
                  <p className="mt-2 text-xs leading-5 text-zinc-500">{mode.description}</p>
                </button>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                disabled={!hasChanges || isSaving}
                onClick={() => void saveMode()}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSaving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                Guardar motor
              </button>
            </div>
          </section>

          <section className="mt-5 grid gap-4 xl:grid-cols-3">
            {overview.providers.map((provider) => (
              <ProviderCard key={provider.provider} provider={provider} />
            ))}
          </section>

          <section className="luxia-panel mt-5 rounded-3xl p-6">
            <h2 className="font-medium text-white">Orden de respaldo automático</h2>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {overview.fallback_order.map((provider, index) => (
                <div key={provider} className="flex items-center gap-2">
                  <span className="rounded-xl border border-white/7 bg-white/[0.025] px-3 py-2 text-sm text-zinc-300">
                    {index + 1}. {providerLabel(provider)}
                  </span>
                  {index < overview.fallback_order.length - 1 && (
                    <span className="text-zinc-700">→</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
