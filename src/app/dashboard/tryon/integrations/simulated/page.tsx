"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { FlaskConical, LoaderCircle, Play, Save, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { AiEngineTabs } from "@/components/backoffice/tryon/ai-engine-tabs";
import { TryOnModuleHeader } from "@/components/backoffice/tryon/tryon-module-header";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { AiExecutionMode, SimulatedEngineSettingsResponse, SimulatedEngineTestResponse } from "@/types/admin-simulated-engine";

export default function SimulatedEnginePage() {
  const [settings, setSettings] = useState<SimulatedEngineSettingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [action, setAction] = useState<"save" | "test" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true); setErrorMessage(null);
    try { setSettings(await browserApiRequest<SimulatedEngineSettingsResponse>("/api/admin/simulated-engine/settings")); }
    catch (error) { setErrorMessage(error instanceof Error ? error.message : "No fue posible cargar el motor simulado."); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!settings) return; setAction("save");
    try {
      const result = await browserApiRequest<SimulatedEngineSettingsResponse>("/api/admin/simulated-engine/settings", { method: "PATCH", body: JSON.stringify(settings) });
      setSettings(result); toast.success("Configuración del motor simulado guardada.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible guardar."); }
    finally { setAction(null); }
  };
  const test = async () => {
    setAction("test");
    try { const result = await browserApiRequest<SimulatedEngineTestResponse>("/api/admin/simulated-engine/test", { method: "POST" }); toast.success(`Motor ${result.status.toLowerCase()}: ${result.delay_seconds}s, fallo ${result.failure_rate_percent}%.`); }
    catch (error) { toast.error(error instanceof Error ? error.message : "La prueba falló."); }
    finally { setAction(null); }
  };

  return <div>
    <TryOnModuleHeader title="Motor simulado" description="Prueba el flujo completo de Try-On sin GPU, con demora y errores configurables." />
    <AiEngineTabs />
    {isLoading ? <div className="mt-6 flex h-64 items-center justify-center rounded-3xl border border-white/7"><LoaderCircle className="animate-spin text-red-400" /></div> : errorMessage || !settings ? <div className="mt-6 flex gap-3 rounded-2xl border border-red-500/20 bg-red-950/20 p-5 text-sm text-red-300"><TriangleAlert size={18}/>{errorMessage}</div> :
    <form onSubmit={save} className="luxia-panel mt-6 rounded-3xl p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm text-zinc-400"><span>Modo de ejecución global</span><select value={settings.execution_mode} onChange={(e)=>setSettings({...settings, execution_mode:e.target.value as AiExecutionMode})} className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-white"><option value="simulated">Simulado</option><option value="comfyui_local">ComfyUI local</option><option value="runpod_serverless">RunPod Serverless</option><option value="auto">Automático</option></select></label>
        <label className="space-y-2 text-sm text-zinc-400"><span>Demora simulada (segundos)</span><input type="number" min="0" max="30" step="0.1" value={settings.delay_seconds} onChange={(e)=>setSettings({...settings,delay_seconds:Number(e.target.value)})} className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-white"/></label>
        <label className="space-y-2 text-sm text-zinc-400"><span>Probabilidad de error (%)</span><input type="number" min="0" max="100" step="0.1" value={settings.failure_rate_percent} onChange={(e)=>setSettings({...settings,failure_rate_percent:Number(e.target.value)})} className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-white"/></label>
        <div className="space-y-3 rounded-2xl border border-white/7 bg-white/[0.02] p-4">
          <label className="flex items-center justify-between text-sm text-zinc-300"><span>Motor simulado activo</span><input type="checkbox" checked={settings.enabled} onChange={(e)=>setSettings({...settings,enabled:e.target.checked})}/></label>
          <label className="flex items-center justify-between text-sm text-zinc-300"><span>Copiar imagen como resultado</span><input type="checkbox" checked={settings.copy_person_image_as_result} onChange={(e)=>setSettings({...settings,copy_person_image_as_result:e.target.checked})}/></label>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3"><button disabled={action!==null} className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-50"><Save size={16}/>{action==="save"?<LoaderCircle size={16} className="animate-spin"/>:"Guardar"}</button><button type="button" onClick={()=>void test()} disabled={action!==null} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 px-5 text-sm text-zinc-300 disabled:opacity-50"><Play size={16}/>{action==="test"?"Probando...":"Probar motor"}</button></div>
    </form>}
  </div>;
}
