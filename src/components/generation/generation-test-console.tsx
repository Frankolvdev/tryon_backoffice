"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle, Play, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";
import { buildInitialGenerationValues, DynamicGenerationForm, validateGenerationValues } from "./dynamic-generation-form";
import { GenerationResults } from "./generation-results";
import type { GenerationModule, GenerationModuleExecution } from "@/types/admin-generation-modules";

export function GenerationTestConsole({ module }: { module: GenerationModule }) {
  const [values, setValues] = useState<Record<string, unknown>>(() => buildInitialGenerationValues(module.inputs));
  const [execution, setExecution] = useState<GenerationModuleExecution | null>(null);
  const [busy, setBusy] = useState(false);

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
  const completed = execution?.status === "completed";
  const hasOutputs = completed && execution.outputs && Object.keys(execution.outputs).length > 0;

  return (
    <section className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-2xl border border-white/8 bg-black/20 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Formulario automático de prueba</h3>
              <p className="mt-1 text-xs text-zinc-500">Generado desde las entradas reales del módulo.</p>
            </div>
            <button onClick={() => void run()} disabled={busy || !module.is_active} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-40">
              {busy ? <LoaderCircle className="animate-spin" size={16} /> : <Play size={16} />}
              Ejecutar prueba
            </button>
          </div>
          <DynamicGenerationForm inputs={module.inputs} values={values} onChange={setValues} disabled={busy} />
          {!module.is_active && <p className="mt-4 text-xs text-amber-300">El módulo está inactivo. Actívalo y guarda antes de probarlo.</p>}
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
              <div className="flex items-center justify-between"><span className="text-xs uppercase text-zinc-500">{execution.status}</span><span className="text-sm text-white">{execution.progress}%</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full bg-red-600" style={{ width: `${execution.progress}%` }} /></div>
              <p className="rounded-xl bg-white/[.03] p-3 text-xs text-zinc-400">{lastLog}</p>
              <div className="space-y-2">{execution.steps.map((step) => <div key={step.step_key} className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2 text-xs"><span className="text-zinc-300">{step.step_name}</span><span className={step.status === "completed" ? "text-emerald-400" : step.status === "failed" ? "text-red-400" : "text-zinc-500"}>{step.status}</span></div>)}</div>
              {execution.error && <p className="text-xs text-red-300">{execution.error}</p>}
            </div>
          )}
        </aside>
      </div>

      {completed && (
        <section className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/[.035]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/15 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300"><CheckCircle2 size={18} /></div>
              <div><h3 className="font-semibold text-white">Resultados de la prueba</h3><p className="mt-0.5 text-xs text-zinc-500">Salidas finales entregadas por el nodo Output.</p></div>
            </div>
            {execution.duration_ms != null && <span className="text-xs text-zinc-500">Duración: {(execution.duration_ms / 1000).toFixed(2)} s</span>}
          </div>
          <div className="p-5">
            {hasOutputs ? <GenerationResults outputs={execution.outputs} /> : <p className="rounded-xl border border-amber-500/15 bg-amber-500/[.04] p-4 text-sm text-amber-200">La ejecución terminó, pero el nodo Output no devolvió resultados visibles.</p>}
          </div>
        </section>
      )}
    </section>
  );
}
