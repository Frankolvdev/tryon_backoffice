"use client";

import { LoaderCircle, Save, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import type { ExecutionBillingPolicy } from "@/types/admin-pricing-coupons";

const labels: Record<keyof ExecutionBillingPolicy, { title: string; description: string }> = {
  completed: { title: "Completada", description: "La generación terminó y entregó resultado." },
  cancelled: { title: "Cancelada", description: "El usuario canceló después de consumir recursos." },
  failed_workflow_or_user: { title: "Fallo de workflow o datos", description: "El runtime alcanzó el workflow, pero falló por datos, nodos, modelos o configuración del trabajo." },
  failed_platform_or_provider: { title: "Fallo interno o del proveedor", description: "La plataforma o el proveedor falló antes de completar el trabajo." },
};

export function ExecutionBillingPolicyCard() {
  const [policy, setPolicy] = useState<ExecutionBillingPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void browserApiRequest<ExecutionBillingPolicy>("/api/admin/execution-billing-policy")
      .then(setPolicy)
      .catch((error) => toast.error(error instanceof Error ? error.message : "No fue posible cargar la política de cobro."))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (row: keyof ExecutionBillingPolicy, field: "charge_infrastructure" | "apply_profit") => {
    setPolicy((current) => current ? { ...current, [row]: { ...current[row], [field]: !current[row][field] } } : current);
  };

  const save = async () => {
    if (!policy) return;
    setSaving(true);
    try {
      const result = await browserApiRequest<ExecutionBillingPolicy>("/api/admin/execution-billing-policy", {
        method: "PATCH",
        body: JSON.stringify(policy),
      });
      setPolicy(result);
      toast.success("Política de cobro actualizada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible guardar la política de cobro.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="luxia-panel mt-5 rounded-3xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400"><ShieldCheck size={21} /></div>
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">Política por resultado</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Qué se cobra según cómo termine</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-600">Controla por separado el costo de infraestructura y la ganancia. Los cambios aplican a ejecuciones futuras; el historial conserva su desglose original.</p>
        </div>
      </div>

      {loading || !policy ? (
        <div className="mt-6 flex h-24 items-center justify-center"><LoaderCircle className="animate-spin text-red-500" /></div>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/8">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-zinc-500"><tr><th className="px-4 py-3">Resultado</th><th className="px-4 py-3 text-center">Cobrar infraestructura</th><th className="px-4 py-3 text-center">Aplicar ganancia</th></tr></thead>
              <tbody>
                {(Object.keys(labels) as Array<keyof ExecutionBillingPolicy>).map((row) => (
                  <tr key={row} className="border-t border-white/8">
                    <td className="px-4 py-4"><p className="font-medium text-white">{labels[row].title}</p><p className="mt-1 max-w-xl text-xs leading-5 text-zinc-600">{labels[row].description}</p></td>
                    {(["charge_infrastructure", "apply_profit"] as const).map((field) => (
                      <td key={field} className="px-4 py-4 text-center"><button type="button" role="switch" aria-checked={policy[row][field]} onClick={() => toggle(row, field)} className={`relative inline-flex h-6 w-11 rounded-full transition ${policy[row][field] ? "bg-red-600" : "bg-zinc-800"}`}><span className={`absolute top-1 size-4 rounded-full bg-white transition ${policy[row][field] ? "left-6" : "left-1"}`} /></button></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end"><button type="button" onClick={() => void save()} disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white disabled:opacity-50">{saving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />} Guardar política</button></div>
        </>
      )}
    </section>
  );
}
