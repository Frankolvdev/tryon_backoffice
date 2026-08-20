"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle, Play, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";
import { buildInitialGenerationValues, DynamicGenerationForm, validateGenerationValues } from "./dynamic-generation-form";
import { GenerationResults } from "./generation-results";
import type { GenerationModule, GenerationModuleExecution } from "@/types/admin-generation-modules";

export function GenerationTestConsole({ module, hasUnsavedChanges = false }: { module: GenerationModule; hasUnsavedChanges?: boolean }) {
  const [values, setValues] = useState<Record<string, unknown>>(() => buildInitialGenerationValues(module.inputs));
  const [execution, setExecution] = useState<GenerationModuleExecution | null>(null);
  const [busy, setBusy] = useState(false);
  const engineNeedsTarget = ["modal", "runpod_serverless", "beam", "local_docker"].includes(
    module.default_execution_engine ?? "",
  );
  const targetValue = String(module.endpoint ?? "").trim();
  const targetMissing = engineNeedsTarget && (
    !targetValue ||
    (module.default_execution_engine === "local_docker" && !targetValue.startsWith("docker-local://"))
  );

  useEffect(() => setValues(buildInitialGenerationValues(module.inputs)), [module.id, module.inputs]);

  const refresh = useCallback(async () => {
    if (!execution) return;
    try {
      setExecution(await browserApiRequest(`/api/admin/generation-modules/executions/${execution.id}`));
    } catch {
      // El polling volverá a intentar en el siguiente intervalo.
    }
  }, [execution]);

  useEffect(() => {
    if (!execution || !["queued", "running"].includes(execution.status)) return;
    const timer = window.setInterval(() => void refresh(), 2000);
    return () => clearInterval(timer);
  }, [execution, refresh]);

  const run = async () => {
    if (!module.default_execution_engine) {
      toast.error("Selecciona y guarda un motor antes de ejecutar una prueba.");
      return;
    }
    if (hasUnsavedChanges) {
      toast.error("Guarda los cambios del módulo antes de ejecutar una prueba.");
      return;
    }
    if (targetMissing) {
      toast.error("Selecciona y guarda el runtime/destino requerido por este proveedor antes de ejecutar la prueba.");
      return;
    }
    const error = validateGenerationValues(module.inputs, values);
    if (error) {
      toast.error(error);
      return;
    }

    setBusy(true);
    setExecution(null);

    try {
      const plainInputs = Object.fromEntries(Object.entries(values).filter(([, value]) => !(value instanceof File)));
      const form = new FormData();
      form.set("payload", JSON.stringify({ engine: module.default_execution_engine, inputs: plainInputs }));

      for (const [key, value] of Object.entries(values)) {
        if (value instanceof File) {
          form.append("file_keys", key);
          form.append("files", value, value.name);
        }
      }

      const result = await browserApiRequest<GenerationModuleExecution>(
        `/api/admin/generation-modules/${module.id}/test-execution`,
        { method: "POST", body: form },
      );
      setExecution(result);
      toast.success("Prueba enviada al motor.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible ejecutar la prueba.");
    } finally {
      setBusy(false);
    }
  };

  const lastLog = useMemo(() => execution?.logs?.at(-1)?.message ?? "Sin eventos todavía.", [execution]);
  const terminal = execution ? ["completed", "failed", "cancelled"].includes(execution.status) : false;
  const visibleOutputs = useMemo(() => {
    if (!execution) return {};
    if (execution.outputs && Object.keys(execution.outputs).length > 0) return execution.outputs;
    const finalStep = [...(execution.steps ?? [])].reverse().find((step) => step.outputs && Object.keys(step.outputs).length > 0);
    return finalStep?.outputs ?? {};
  }, [execution]);
  const hasOutputs = Object.keys(visibleOutputs).length > 0;

  return (
    <section className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-2xl border border-white/8 bg-black/20 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Formulario automático de prueba</h3>
              <p className="mt-1 text-xs text-zinc-500">Generado desde las entradas reales del módulo.</p>
              <p className="mt-2 max-w-2xl text-[11px] leading-5 text-amber-200/80">
                Modo de prueba administrativa: ejecuta el workflow y mide proveedor/GPU, pero no consume tokens,
                no usa FIFO ni bolsas y no genera movimientos comerciales, utilidad ni registros financieros.
                La ejecución técnica sí queda disponible en el historial para diagnóstico.
              </p>
            </div>
            <button onClick={() => void run()} disabled={busy || !module.is_active || !module.default_execution_engine || targetMissing || hasUnsavedChanges} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-40">
              {busy ? <LoaderCircle className="animate-spin" size={16} /> : <Play size={16} />}
              Ejecutar prueba
            </button>
          </div>
          <DynamicGenerationForm inputs={module.inputs} values={values} onChange={setValues} disabled={busy} />
          {!module.default_execution_engine ? <p className="mt-4 text-xs text-amber-300">Este módulo todavía no tiene motor. Elige uno arriba y guarda antes de probarlo.</p> : hasUnsavedChanges ? <p className="mt-4 text-xs text-amber-300">Hay cambios sin guardar. Guarda el módulo para que la prueba utilice exactamente la configuración persistida.</p> : targetMissing ? <p className="mt-4 text-xs text-amber-300">Falta seleccionar y guardar el runtime/destino obligatorio para {module.default_execution_engine.replaceAll("_", " ")}.</p> : !module.is_active && <p className="mt-4 text-xs text-amber-300">El módulo está inactivo. Actívalo y guarda antes de probarlo.</p>}
        </div>

        <aside className="rounded-2xl border border-white/8 bg-black/30 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Monitor</h3>
            <button onClick={() => void refresh()} className="rounded-lg border border-white/10 p-2 text-zinc-400"><RefreshCw size={14} /></button>
          </div>
          {!execution ? (
            <p className="mt-8 text-sm text-zinc-600">Ejecuta una prueba para ver progreso, pasos y logs.</p>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between"><span className="text-xs uppercase text-zinc-500">{execution.status} · {execution.engine.replaceAll("_"," ")}{execution.accounting_mode ? ` · ${execution.accounting_mode}` : ""}</span><span className="text-sm text-white">{execution.progress}%</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full bg-red-600" style={{ width: `${execution.progress}%` }} /></div>
              <p className="rounded-xl bg-white/[.03] p-3 text-xs text-zinc-400">{lastLog}</p>
              <div className="space-y-2">{execution.steps.map((step) => <div key={step.step_key} className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2 text-xs"><span className="text-zinc-300">{step.step_name}</span><span className={step.status === "completed" ? "text-emerald-400" : step.status === "failed" ? "text-red-400" : "text-zinc-500"}>{step.status}</span></div>)}</div>
              {execution.error && <p className="text-xs text-red-300">{execution.error}</p>}
            </div>
          )}
        </aside>
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/8 bg-black/20">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/7 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300"><CheckCircle2 size={18} /></div>
            <div><h3 className="font-semibold text-white">Resultados de la prueba</h3><p className="mt-0.5 text-xs text-zinc-500">Las salidas finales del nodo Output aparecerán aquí.</p></div>
          </div>
          {execution?.duration_ms != null && <span className="text-xs text-zinc-500">Duración: {(execution.duration_ms / 1000).toFixed(2)} s</span>}
        </div>
        <div className="p-5">
          {!execution && <p className="rounded-xl border border-white/7 bg-white/[.02] p-4 text-sm text-zinc-500">Ejecuta una prueba para visualizar aquí sus imágenes, archivos y demás resultados.</p>}
          {execution && !terminal && <p className="rounded-xl border border-blue-500/15 bg-blue-500/[.04] p-4 text-sm text-blue-200">La ejecución sigue en proceso. Los resultados se mostrarán automáticamente al finalizar.</p>}
          {execution && terminal && hasOutputs && <GenerationResults outputs={visibleOutputs} />}
          {execution && terminal && !hasOutputs && <p className="rounded-xl border border-amber-500/15 bg-amber-500/[.04] p-4 text-sm text-amber-200">La ejecución terminó, pero el nodo Output no devolvió resultados visibles. Revisa sus conexiones y los logs del monitor.</p>}
        </div>
      </section>
    </section>
  );
}
