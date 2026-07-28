"use client";

import { CloudCog, LoaderCircle, RefreshCcw, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { TryOnModuleHeader } from "@/components/backoffice/tryon/tryon-module-header";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { AiEngineSettings, AiEngineSettingsUpdate } from "@/types/admin-ai-engine-settings";
import type { BeamProviderConfig, ModalProviderConfig, ProviderActionResponse, RunPodProviderConfig } from "@/types/admin-infrastructure-providers";
import type { RuntimeModelExportSettings } from "@/types/admin-runtime-builder";

const input = "h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-red-500/50";
type Tab = "docker" | "modal" | "runpod" | "beam";
const MODAL_GPUS = ["T4", "L4", "A10G", "L40S", "A100-40GB", "A100-80GB", "H100", "H200", "B200"];
const RUNPOD_GPUS = ["NVIDIA GeForce RTX 4090", "NVIDIA RTX A6000", "NVIDIA A40", "NVIDIA L4", "NVIDIA L40", "NVIDIA L40S", "NVIDIA A100 40GB", "NVIDIA A100 80GB", "NVIDIA H100 80GB", "NVIDIA H200"];
const BEAM_GPUS = [...MODAL_GPUS];

const modalDefault: ModalProviderConfig = { enabled: false, token_id: "", token_secret: "", token_secret_configured: false, environment: "main", app_name: "tryon-generation-runtime", runtime_url: "", volume_name: "tryon-models", gpu: "L40S", timeout_seconds: 900 };
const runpodDefault: RunPodProviderConfig = { enabled: false, api_key: "", api_key_configured: false, s3_access_key: "", s3_secret_key: "", s3_secret_key_configured: false, endpoint_id: "", endpoint_name: "tryon-generation-runtime", template_id: "", template_name: "tryon-generation-runtime", registry_auth_id: "", ghcr_username: "", ghcr_token: "", ghcr_token_configured: false, network_volume_id: "", network_volume_name: "tryon-models", network_volume_size_gb: 100, data_center_id: "", gpu_type_ids: ["NVIDIA L40S"], allowed_cuda_versions: ["12.8"], workers_min: 0, workers_max: 5, idle_timeout_seconds: 5, execution_timeout_seconds: 900, scaler_type: "QUEUE_DELAY", scaler_value: 4, flashboot: true, container_disk_gb: 100, timeout_seconds: 900 };
const beamDefault: BeamProviderConfig = { enabled: false, api_key: "", api_key_configured: false, workspace: "", endpoint: "", deployment_name: "tryon-generation-runtime", volume_name: "tryon-models", volume_mount_path: "/models", gpu: "L40S", cpu: 8, memory_mb: 65536, workers: 1, min_containers: 0, max_containers: 5, tasks_per_container: 1, keep_warm_seconds: 300, max_pending_tasks: 100, retries: 2, checkpoint_enabled: false, callback_url: "", authorized: true, timeout_seconds: 1800 };

export default function Page() {
  const [tab, setTab] = useState<Tab>("docker");
  const [docker, setDocker] = useState<RuntimeModelExportSettings | null>(null);
  const [modal, setModal] = useState(modalDefault);
  const [modalEngine, setModalEngine] = useState<AiEngineSettingsUpdate | null>(null);
  const [runpod, setRunpod] = useState(runpodDefault);
  const [beam, setBeam] = useState(beamDefault);
  const [volumes, setVolumes] = useState<Array<{ name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, v, m, engine, r, b] = await Promise.all([
        browserApiRequest<RuntimeModelExportSettings>("/api/admin/runtime-builder/models-volume/settings"),
        browserApiRequest<{ items: Array<{ name: string }> }>("/api/admin/docker-file-manager/volumes"),
        browserApiRequest<ModalProviderConfig>("/api/admin/infrastructure-providers/modal"),
        browserApiRequest<AiEngineSettings>("/api/admin/ai-providers/engine-settings"),
        browserApiRequest<RunPodProviderConfig>("/api/admin/infrastructure-providers/runpod"),
        browserApiRequest<BeamProviderConfig>("/api/admin/infrastructure-providers/beam"),
      ]);
      setDocker(d);
      setVolumes(v.items);
      setModal({ ...modalDefault, ...m, token_secret: "" });
      setModalEngine(engine);
      setRunpod({ ...runpodDefault, ...r, api_key: "", s3_secret_key: "", ghcr_token: "" });
      setBeam({ ...beamDefault, ...b, api_key: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo cargar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const save = async (key: "modal" | "runpod" | "beam", value: unknown) => {
    setBusy(`${key}-save`);
    try {
      if (key === "modal") {
        const [saved, savedEngine] = await Promise.all([
          browserApiRequest<ModalProviderConfig>("/api/admin/infrastructure-providers/modal", { method: "PUT", body: JSON.stringify(value) }),
          browserApiRequest<AiEngineSettings>("/api/admin/ai-providers/engine-settings", { method: "PUT", body: JSON.stringify(modalEngine) }),
        ]);
        setModal({ ...modalDefault, ...saved, token_secret: "" });
        setModalEngine(savedEngine);
      } else {
        const saved = await browserApiRequest<RunPodProviderConfig | BeamProviderConfig>(`/api/admin/infrastructure-providers/${key}`, { method: "PUT", body: JSON.stringify(value) });
        if (key === "runpod") setRunpod({ ...runpodDefault, ...(saved as RunPodProviderConfig), api_key: "", s3_secret_key: "", ghcr_token: "" });
        if (key === "beam") setBeam({ ...beamDefault, ...(saved as BeamProviderConfig), api_key: "" });
      }
      toast.success("Configuración guardada.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setBusy(null);
    }
  };

  const action = async (key: "modal" | "runpod" | "beam", kind: "test" | "volume") => {
    setBusy(`${key}-${kind}`);
    try {
      const response = await browserApiRequest<ProviderActionResponse>(`/api/admin/infrastructure-providers/${key}/${kind}`, { method: "POST" });
      (response.success ? toast.success : toast.error)(response.message);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Operación fallida.");
    } finally {
      setBusy(null);
    }
  };

  const updateModalEngine = <K extends keyof AiEngineSettingsUpdate>(key: K, value: AiEngineSettingsUpdate[K]) => {
    setModalEngine(current => current ? { ...current, [key]: value } : current);
  };

  return <div>
    <TryOnModuleHeader title="Proveedores de infraestructura" description="Configura Local, Modal, RunPod Serverless y Beam de forma independiente." />
    <div className="mt-5 flex flex-wrap gap-2 rounded-2xl border border-white/8 bg-black/20 p-2">
      {([['docker', 'Docker local'], ['modal', 'Modal'], ['runpod', 'RunPod Serverless'], ['beam', 'Beam']] as const).map(([key, label]) => <button key={key} onClick={() => setTab(key)} className={`h-11 rounded-xl px-4 text-sm ${tab === key ? 'bg-red-500/15 text-red-300' : 'text-zinc-400'}`}>{label}</button>)}
      <button onClick={() => void load()} className="ml-auto h-11 rounded-xl border border-white/8 px-4 text-zinc-400"><RefreshCcw size={15} className="mr-2 inline" />Recargar</button>
    </div>

    {loading ? <section className="luxia-panel mt-5 flex min-h-72 items-center justify-center rounded-3xl"><LoaderCircle className="animate-spin text-red-500" /></section>
      : tab === 'docker' && docker ? <section className="luxia-panel mt-5 rounded-3xl p-6"><Title name="Docker local" /><div className="mt-6 grid gap-5 lg:grid-cols-2"><F label="Ruta local de ComfyUI"><input className={input} value={docker.comfyui_path} onChange={e => setDocker({ ...docker, comfyui_path: e.target.value })} /></F><F label="Directorio de salida"><input className={input} value={docker.output_directory} onChange={e => setDocker({ ...docker, output_directory: e.target.value })} /></F><F label="Volumen Docker"><select className={input} value={docker.docker_volume} onChange={e => setDocker({ ...docker, docker_volume: e.target.value })}><option value="">Seleccionar</option>{volumes.map(v => <option key={v.name}>{v.name}</option>)}</select></F></div></section>
      : tab === 'modal' && modalEngine ? <ProviderCard name="Modal" busy={busy} onSave={() => save('modal', modal)} onTest={() => action('modal', 'test')} onVolume={() => action('modal', 'volume')}>
        <Check value={modal.enabled} onChange={v => setModal({ ...modal, enabled: v })} />
        <F label="Token ID"><input className={input} value={modal.token_id} onChange={e => setModal({ ...modal, token_id: e.target.value })} /></F>
        <F label="Token Secret"><input type="password" className={input} value={modal.token_secret} placeholder={modal.token_secret_configured ? 'Configurado; vacío conserva' : 'Token secret'} onChange={e => setModal({ ...modal, token_secret: e.target.value })} /></F>
        <F label="App"><input className={input} value={modal.app_name} onChange={e => setModal({ ...modal, app_name: e.target.value })} /></F>
        <F label="Volumen"><input className={input} value={modal.volume_name} onChange={e => setModal({ ...modal, volume_name: e.target.value })} /></F>
        <F label="GPU"><select className={input} value={modalEngine.modal_gpu} onChange={e => updateModalEngine('modal_gpu', e.target.value as AiEngineSettingsUpdate['modal_gpu'])}>{MODAL_GPUS.map(gpu => <option key={gpu} value={gpu}>{gpu}</option>)}</select></F>
        <NumberInput label="Contenedores mínimos" value={modalEngine.modal_min_containers} onChange={v => updateModalEngine('modal_min_containers', v)} />
        <NumberInput label="Contenedores máximos" value={modalEngine.modal_max_containers} onChange={v => updateModalEngine('modal_max_containers', v)} />
        <NumberInput label="Workflows simultáneos por GPU" value={modalEngine.modal_concurrency} onChange={v => updateModalEngine('modal_concurrency', v)} />
        <NumberInput label="Conexiones HTTP/WebSocket por contenedor" value={modalEngine.modal_input_concurrency} onChange={v => updateModalEngine('modal_input_concurrency', v)} />
        <NumberInput label="Apagado por inactividad (segundos)" value={modalEngine.modal_scaledown_window_seconds} onChange={v => updateModalEngine('modal_scaledown_window_seconds', v)} />
        <NumberInput label="Timeout de ejecución (segundos)" value={modalEngine.modal_execution_timeout_seconds} onChange={v => updateModalEngine('modal_execution_timeout_seconds', v)} />
      </ProviderCard>
      : tab === 'runpod' ? <ProviderCard name="RunPod Serverless" busy={busy} onSave={() => save('runpod', runpod)} onTest={() => action('runpod', 'test')} onVolume={() => action('runpod', 'volume')}>
        <Check value={runpod.enabled} onChange={v => setRunpod({ ...runpod, enabled: v })} />
        <F label="API key"><input type="password" className={input} value={runpod.api_key} placeholder={runpod.api_key_configured ? 'Configurada; vacío conserva' : 'API key'} onChange={e => setRunpod({ ...runpod, api_key: e.target.value })} /></F>
        <F label="S3 Access Key de RunPod"><input className={input} value={runpod.s3_access_key} placeholder="user_..." onChange={e => setRunpod({ ...runpod, s3_access_key: e.target.value })} /></F>
        <F label="S3 Secret Key de RunPod"><input type="password" className={input} value={runpod.s3_secret_key} placeholder={runpod.s3_secret_key_configured ? 'Configurada; vacío conserva' : 'rps_...'} onChange={e => setRunpod({ ...runpod, s3_secret_key: e.target.value })} /></F>
        <F label="Endpoint ID (vacío para crear)"><input className={input} value={runpod.endpoint_id} onChange={e => setRunpod({ ...runpod, endpoint_id: e.target.value })} /></F>
        <F label="Nombre del endpoint"><input className={input} value={runpod.endpoint_name} onChange={e => setRunpod({ ...runpod, endpoint_name: e.target.value })} /></F>
        <F label="Template ID (vacío para crear)"><input className={input} value={runpod.template_id} onChange={e => setRunpod({ ...runpod, template_id: e.target.value })} /></F>
        <F label="Nombre del template"><input className={input} value={runpod.template_name} onChange={e => setRunpod({ ...runpod, template_name: e.target.value })} /></F>
        <F label="Usuario u organización de GHCR"><input className={input} value={runpod.ghcr_username} placeholder="Ej. Frankolvdev" autoComplete="off" onChange={e => setRunpod({ ...runpod, ghcr_username: e.target.value })} /></F>
        <F label="Token de GitHub Container Registry"><input type="password" className={input} value={runpod.ghcr_token} placeholder={runpod.ghcr_token_configured ? 'Configurado; vacío conserva' : 'Token con write:packages'} autoComplete="new-password" onChange={e => setRunpod({ ...runpod, ghcr_token: e.target.value })} /><span className="block text-xs text-zinc-500">Se usa únicamente para publicar la imagen del deploy de RunPod en GHCR.</span></F>
        <F label="Registry Auth ID (solo registro privado)"><input className={input} value={runpod.registry_auth_id} onChange={e => setRunpod({ ...runpod, registry_auth_id: e.target.value })} /></F>
        <F label="Network Volume ID"><input className={input} value={runpod.network_volume_id} onChange={e => setRunpod({ ...runpod, network_volume_id: e.target.value })} /></F>
        <F label="Nombre del volumen"><input className={input} value={runpod.network_volume_name} onChange={e => setRunpod({ ...runpod, network_volume_name: e.target.value })} /></F>
        <NumberInput label="Tamaño del volumen (GB)" value={runpod.network_volume_size_gb} onChange={v => setRunpod({ ...runpod, network_volume_size_gb: v })} />
        <F label="Data Center ID"><input className={input} placeholder="US-KS-2" value={runpod.data_center_id} onChange={e => setRunpod({ ...runpod, data_center_id: e.target.value })} /></F>
        <F label="GPU"><select className={input} value={runpod.gpu_type_ids[0] ?? ""} onChange={e => setRunpod({ ...runpod, gpu_type_ids: e.target.value ? [e.target.value] : [] })}><option value="">Seleccionar GPU</option>{RUNPOD_GPUS.map(gpu => <option key={gpu} value={gpu}>{gpu}</option>)}</select></F>
        <F label="CUDA permitidos (separados por coma)"><input className={input} value={runpod.allowed_cuda_versions.join(", ")} onChange={e => setRunpod({ ...runpod, allowed_cuda_versions: e.target.value.split(",").map(v => v.trim()).filter(Boolean) })} /></F>
        <NumberInput label="Workers mínimos" value={runpod.workers_min} onChange={v => setRunpod({ ...runpod, workers_min: v })} />
        <NumberInput label="Workers máximos" value={runpod.workers_max} onChange={v => setRunpod({ ...runpod, workers_max: v })} />
        <NumberInput label="Idle timeout (segundos)" value={runpod.idle_timeout_seconds} onChange={v => setRunpod({ ...runpod, idle_timeout_seconds: v })} />
        <NumberInput label="Timeout de ejecución (segundos)" value={runpod.execution_timeout_seconds} onChange={v => setRunpod({ ...runpod, execution_timeout_seconds: v })} />
        <F label="Scaler"><select className={input} value={runpod.scaler_type} onChange={e => setRunpod({ ...runpod, scaler_type: e.target.value as RunPodProviderConfig['scaler_type'] })}><option value="QUEUE_DELAY">Queue delay</option><option value="REQUEST_COUNT">Request count</option></select></F>
        <NumberInput label="Valor del scaler" value={runpod.scaler_value} onChange={v => setRunpod({ ...runpod, scaler_value: v })} />
        <NumberInput label="Disco del contenedor (GB)" value={runpod.container_disk_gb} onChange={v => setRunpod({ ...runpod, container_disk_gb: v })} />
        <label className="flex items-center gap-3 rounded-xl border border-white/8 p-4 text-sm text-zinc-300"><input type="checkbox" checked={runpod.flashboot} onChange={e => setRunpod({ ...runpod, flashboot: e.target.checked })} />Activar FlashBoot</label>
      </ProviderCard>
      : <ProviderCard name="Beam" busy={busy} onSave={() => save('beam', beam)} onTest={() => action('beam', 'test')} onVolume={() => action('beam', 'volume')}>
        <Check value={beam.enabled} onChange={v => setBeam({ ...beam, enabled: v })} />
        <F label="Token ID"><input className={input} value={beam.workspace} onChange={e => setBeam({ ...beam, workspace: e.target.value })} /></F>
        <F label="Token Secret"><input type="password" className={input} value={beam.api_key} placeholder={beam.api_key_configured ? 'Configurado; vacío conserva' : 'Token secret'} onChange={e => setBeam({ ...beam, api_key: e.target.value })} /></F>
        <F label="App"><input className={input} value={beam.deployment_name} onChange={e => setBeam({ ...beam, deployment_name: e.target.value })} /></F>
        <F label="Volumen"><input className={input} value={beam.volume_name} onChange={e => setBeam({ ...beam, volume_name: e.target.value })} /></F>
        <F label="GPU"><select className={input} value={beam.gpu} onChange={e => setBeam({ ...beam, gpu: e.target.value })}>{BEAM_GPUS.map(gpu => <option key={gpu} value={gpu}>{gpu}</option>)}</select></F>
        <NumberInput label="Contenedores mínimos" value={beam.min_containers} onChange={v => setBeam({ ...beam, min_containers: v })} />
        <NumberInput label="Contenedores máximos" value={beam.max_containers} onChange={v => setBeam({ ...beam, max_containers: v })} />
        <NumberInput label="Workflows simultáneos por GPU" value={beam.tasks_per_container} onChange={v => setBeam({ ...beam, tasks_per_container: v })} />
        <NumberInput label="Conexiones HTTP/WebSocket por contenedor" value={beam.workers} onChange={v => setBeam({ ...beam, workers: v })} />
        <NumberInput label="Apagado por inactividad (segundos)" value={beam.keep_warm_seconds} onChange={v => setBeam({ ...beam, keep_warm_seconds: v })} />
        <NumberInput label="Timeout de ejecución (segundos)" value={beam.timeout_seconds} onChange={v => setBeam({ ...beam, timeout_seconds: v })} />
      </ProviderCard>}
  </div>;
}

function Title({ name }: { name: string }) { return <><div className="flex items-center gap-2 text-sm text-red-300"><CloudCog size={16} />{name}</div><h2 className="mt-2 text-xl font-semibold text-white">Configuración del proveedor</h2></>; }
function F({ label, children }: { label: string; children: React.ReactNode }) { return <label className="space-y-2 text-sm text-zinc-300"><span>{label}</span>{children}</label>; }
function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <F label={label}><input type="number" className={input} value={Number.isFinite(value) ? value : 0} onChange={e => onChange(Number.isFinite(e.target.valueAsNumber) ? e.target.valueAsNumber : 0)} /></F>; }
function Check({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) { return <label className="flex items-center gap-3 rounded-xl border border-white/8 p-4 text-sm text-zinc-300"><input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} />Proveedor activo</label>; }
function ProviderCard({ name, children, busy, onSave, onTest, onVolume }: { name: string; children: React.ReactNode; busy: string | null; onSave: () => void; onTest: () => void; onVolume: () => void }) { return <section className="luxia-panel mt-5 rounded-3xl p-6"><Title name={name} /><div className="mt-6 grid gap-5 lg:grid-cols-2">{children}</div><div className="mt-6 flex gap-3"><button disabled={!!busy} onClick={onSave} className="h-11 rounded-xl bg-red-600 px-5 text-sm text-white"><Save size={16} className="mr-2 inline" />Guardar</button><button disabled={!!busy} onClick={onTest} className="h-11 rounded-xl border border-white/10 px-5 text-sm text-zinc-300">Probar conexión</button><button disabled={!!busy} onClick={onVolume} className="h-11 rounded-xl border border-white/10 px-5 text-sm text-zinc-300">Crear o comprobar volumen</button></div></section>; }
