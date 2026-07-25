"use client";

import { CloudCog, Container, LoaderCircle, RefreshCcw, Save, ServerCog } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { TryOnModuleHeader } from "@/components/backoffice/tryon/tryon-module-header";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { ModalProviderConfig, ProviderActionResponse } from "@/types/admin-infrastructure-providers";
import type { RuntimeModelExportSettings } from "@/types/admin-runtime-builder";

const inputClass = "h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-red-500/50";

type Tab = "docker" | "modal";

const modalDefaults: ModalProviderConfig = {
  enabled: false,
  token_id: "",
  token_secret: "",
  token_secret_configured: false,
  environment: "main",
  app_name: "tryon-generation-runtime",
  volume_name: "tryon-models",
  gpu: "L40S",
  timeout_seconds: 900,
};

export default function InfrastructureProvidersPage() {
  const [tab, setTab] = useState<Tab>("docker");
  const [docker, setDocker] = useState<RuntimeModelExportSettings | null>(null);
  const [modal, setModal] = useState<ModalProviderConfig>(modalDefaults);
  const [volumes, setVolumes] = useState<Array<{ name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dockerSettings, volumeResponse, modalSettings] = await Promise.all([
        browserApiRequest<RuntimeModelExportSettings>("/api/admin/runtime-builder/models-volume/settings"),
        browserApiRequest<{ items: Array<{ name: string }> }>("/api/admin/docker-file-manager/volumes"),
        browserApiRequest<ModalProviderConfig>("/api/admin/infrastructure-providers/modal"),
      ]);
      setDocker(dockerSettings);
      setVolumes(volumeResponse.items);
      setModal({ ...modalDefaults, ...modalSettings, token_secret: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cargar la configuración.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const saveDocker = async () => {
    if (!docker) return;
    setBusy("docker-save");
    try {
      const saved = await browserApiRequest<RuntimeModelExportSettings>(
        "/api/admin/runtime-builder/models-volume/settings",
        { method: "PUT", body: JSON.stringify(docker) },
      );
      setDocker(saved);
      toast.success("Configuración Docker local guardada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar Docker local.");
    } finally { setBusy(null); }
  };

  const saveModal = async () => {
    setBusy("modal-save");
    try {
      const saved = await browserApiRequest<ModalProviderConfig>(
        "/api/admin/infrastructure-providers/modal",
        { method: "PUT", body: JSON.stringify(modal) },
      );
      setModal({ ...saved, token_secret: "" });
      toast.success("Configuración Modal guardada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar Modal.");
    } finally { setBusy(null); }
  };

  const modalAction = async (action: "test" | "volume") => {
    setBusy(`modal-${action}`);
    try {
      const result = await browserApiRequest<ProviderActionResponse>(
        `/api/admin/infrastructure-providers/modal/${action}`,
        { method: "POST" },
      );
      (result.success ? toast.success : toast.error)(result.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "La operación con Modal falló.");
    } finally { setBusy(null); }
  };

  return (
    <div>
      <TryOnModuleHeader
        title="Proveedores de infraestructura"
        description="Administra Docker local y Modal sin alterar el flujo actual de Runtime Builder."
      />

      <div className="mt-5 flex gap-2 rounded-2xl border border-white/8 bg-black/20 p-2">
        <button type="button" onClick={() => setTab("docker")} className={`flex h-11 items-center gap-2 rounded-xl px-4 text-sm ${tab === "docker" ? "bg-red-500/15 text-red-300" : "text-zinc-400 hover:text-white"}`}>
          <Container size={16} /> Docker local
        </button>
        <button type="button" onClick={() => setTab("modal")} className={`flex h-11 items-center gap-2 rounded-xl px-4 text-sm ${tab === "modal" ? "bg-red-500/15 text-red-300" : "text-zinc-400 hover:text-white"}`}>
          <CloudCog size={16} /> Modal
        </button>
        <button type="button" onClick={() => void load()} className="ml-auto flex h-11 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400 hover:text-white">
          <RefreshCcw size={15} /> Recargar
        </button>
      </div>

      {loading ? (
        <section className="luxia-panel mt-5 flex min-h-72 items-center justify-center rounded-3xl"><LoaderCircle className="animate-spin text-red-500" /></section>
      ) : tab === "docker" && docker ? (
        <section className="luxia-panel mt-5 rounded-3xl p-6">
          <div className="flex items-center gap-2 text-sm text-red-300"><ServerCog size={16} /> Docker local</div>
          <h2 className="mt-2 text-xl font-semibold text-white">Atajo de configuración existente</h2>
          <p className="mt-2 text-sm text-zinc-500">Este formulario usa exactamente la misma configuración guardada por Runtime Builder.</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <label className="space-y-2 text-sm text-zinc-300">Ruta local de ComfyUI<input className={inputClass} value={docker.comfyui_path} onChange={(e) => setDocker({ ...docker, comfyui_path: e.target.value })} /></label>
            <label className="space-y-2 text-sm text-zinc-300">Directorio local de salida<input className={inputClass} value={docker.output_directory} onChange={(e) => setDocker({ ...docker, output_directory: e.target.value })} /></label>
            <label className="space-y-2 text-sm text-zinc-300">Destino<select className={inputClass} value={docker.destination_type} onChange={(e) => setDocker({ ...docker, destination_type: e.target.value as RuntimeModelExportSettings["destination_type"] })}><option value="local">Directorio local</option><option value="docker_volume">Volumen Docker</option></select></label>
            <label className="space-y-2 text-sm text-zinc-300">Volumen Docker<select className={inputClass} value={docker.docker_volume} onChange={(e) => setDocker({ ...docker, docker_volume: e.target.value })}><option value="">Seleccionar volumen</option>{volumes.map((volume) => <option key={volume.name} value={volume.name}>{volume.name}</option>)}</select></label>
            <label className="space-y-2 text-sm text-zinc-300 lg:col-span-2">Subcarpeta opcional dentro del volumen<input className={inputClass} value={docker.docker_path} onChange={(e) => setDocker({ ...docker, docker_path: e.target.value })} /></label>
          </div>
          <button type="button" onClick={() => void saveDocker()} disabled={busy !== null} className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-medium text-white disabled:opacity-50"><Save size={16} /> {busy === "docker-save" ? "Guardando..." : "Guardar configuración"}</button>
        </section>
      ) : (
        <section className="luxia-panel mt-5 rounded-3xl p-6">
          <div className="flex items-center gap-2 text-sm text-red-300"><CloudCog size={16} /> Modal</div>
          <h2 className="mt-2 text-xl font-semibold text-white">Configuración del proveedor</h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/20 p-4 text-sm text-zinc-300"><input type="checkbox" checked={modal.enabled} onChange={(e) => setModal({ ...modal, enabled: e.target.checked })} /> Proveedor activo</label>
            <div />
            <label className="space-y-2 text-sm text-zinc-300">Token ID<input className={inputClass} value={modal.token_id} onChange={(e) => setModal({ ...modal, token_id: e.target.value })} /></label>
            <label className="space-y-2 text-sm text-zinc-300">Token Secret<input type="password" className={inputClass} value={modal.token_secret} placeholder={modal.token_secret_configured ? "Configurado; deja vacío para conservarlo" : "Introduce el Token Secret"} onChange={(e) => setModal({ ...modal, token_secret: e.target.value })} /></label>
            <label className="space-y-2 text-sm text-zinc-300">Environment<input className={inputClass} value={modal.environment} onChange={(e) => setModal({ ...modal, environment: e.target.value })} /></label>
            <label className="space-y-2 text-sm text-zinc-300">Nombre de aplicación<input className={inputClass} value={modal.app_name} onChange={(e) => setModal({ ...modal, app_name: e.target.value })} /></label>
            <label className="space-y-2 text-sm text-zinc-300">Nombre de volumen<input className={inputClass} value={modal.volume_name} onChange={(e) => setModal({ ...modal, volume_name: e.target.value })} /></label>
            <label className="space-y-2 text-sm text-zinc-300">GPU<select className={inputClass} value={modal.gpu} onChange={(e) => setModal({ ...modal, gpu: e.target.value })}><option value="L40S">L40S</option><option value="A100-80GB">A100 80 GB</option><option value="H100">H100</option><option value="B200">B200</option></select></label>
            <label className="space-y-2 text-sm text-zinc-300">Timeout (segundos)<input type="number" min={60} max={86400} className={inputClass} value={modal.timeout_seconds} onChange={(e) => setModal({ ...modal, timeout_seconds: Number(e.target.value) })} /></label>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => void saveModal()} disabled={busy !== null} className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-medium text-white disabled:opacity-50"><Save size={16} /> {busy === "modal-save" ? "Guardando..." : "Guardar"}</button>
            <button type="button" onClick={() => void modalAction("test")} disabled={busy !== null} className="h-11 rounded-xl border border-white/10 px-5 text-sm text-zinc-300 disabled:opacity-50">{busy === "modal-test" ? "Probando..." : "Probar conexión"}</button>
            <button type="button" onClick={() => void modalAction("volume")} disabled={busy !== null} className="h-11 rounded-xl border border-white/10 px-5 text-sm text-zinc-300 disabled:opacity-50">{busy === "modal-volume" ? "Comprobando..." : "Crear o comprobar volumen"}</button>
          </div>
        </section>
      )}
    </div>
  );
}
