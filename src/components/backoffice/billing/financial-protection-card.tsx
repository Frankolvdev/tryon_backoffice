"use client";

import { LoaderCircle, RefreshCcw, Save, ShieldCheck, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { FinancialProtectionReport } from "@/types/admin-pricing-coupons";

export function FinancialProtectionCard() {
  const [report, setReport] = useState<FinancialProtectionReport | null>(null);
  const [protectedDiscount, setProtectedDiscount] = useState("0");
  const [buffer, setBuffer] = useState("10");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await browserApiRequest<FinancialProtectionReport>("/api/admin/financial-protection");
      setReport(data);
      setProtectedDiscount(String(data.protected_discount_percent));
      setBuffer(String(data.duration_safety_buffer_percent));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible cargar la protección financiera.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    const nextProtected = Number(protectedDiscount);
    const nextBuffer = Number(buffer);
    if (!Number.isFinite(nextProtected) || nextProtected < 0 || nextProtected > 100 || !Number.isFinite(nextBuffer) || nextBuffer < 0 || nextBuffer > 200) {
      toast.error("Revisa los porcentajes configurados."); return;
    }
    setSaving(true);
    try {
      const data = await browserApiRequest<FinancialProtectionReport>("/api/admin/financial-protection", {
        method: "PATCH",
        body: JSON.stringify({ protected_discount_percent: nextProtected, duration_safety_buffer_percent: nextBuffer }),
      });
      setReport(data); toast.success("Protección financiera actualizada.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible guardar la protección."); }
    finally { setSaving(false); }
  };

  if (loading) return <section className="luxia-panel mt-5 flex min-h-48 items-center justify-center rounded-3xl"><LoaderCircle className="animate-spin text-red-500" /></section>;
  if (!report) return null;

  const safe = report.calculated_maximum_safe_discount_percent;
  const headroom = report.available_headroom_percentage_points;
  return <section className="luxia-panel mt-5 overflow-hidden rounded-3xl">
    <div className="border-b border-white/6 p-6"><div className="flex items-start gap-4"><div className="flex size-12 items-center justify-center rounded-2xl border border-emerald-500/15 bg-emerald-950/15 text-emerald-400"><ShieldCheck size={22}/></div><div><h2 className="font-semibold text-white">Protección global de descuentos</h2><p className="mt-2 text-sm leading-6 text-zinc-600">Impide vender planes, paquetes o tokens por debajo del costo conservador de infraestructura.</p></div></div></div>
    <div className="grid gap-5 p-6 xl:grid-cols-[1fr_1fr_1.4fr]">
      <label><span className="mb-2 block text-sm text-zinc-500">Máximo global protegido (%)</span><input type="number" min={0} max={100} step="0.01" value={protectedDiscount} onChange={(e)=>setProtectedDiscount(e.target.value)} className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-white"/></label>
      <label><span className="mb-2 block text-sm text-zinc-500">Buffer de duración (%)</span><input type="number" min={0} max={200} step="0.01" value={buffer} onChange={(e)=>setBuffer(e.target.value)} className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-white"/></label>
      <div className="grid grid-cols-3 gap-3">
        <Metric label="Máximo seguro" value={safe == null ? "—" : `${safe.toFixed(2)}%`} />
        <Metric label="Holgura" value={headroom == null ? "—" : `${headroom.toFixed(2)} pp`} />
        <Metric label="Estado" value={report.status} />
      </div>
    </div>
    {(report.limiting_module_name || report.warnings.length > 0) && <div className="mx-6 mb-6 rounded-2xl border border-amber-500/15 bg-amber-950/10 p-5 text-sm text-amber-200"><div className="flex gap-3"><TriangleAlert size={18} className="mt-0.5 shrink-0"/><div><p className="font-semibold">Regla limitante: {report.limiting_module_name ?? "Configuración incompleta"}</p><p className="mt-1 text-xs text-amber-300/70">{report.limiting_provider ?? "—"}{report.limiting_gpu_key ? ` · ${report.limiting_gpu_key}` : ""}</p>{report.warnings.map((item)=><p key={item} className="mt-2 text-xs">{item}</p>)}</div></div></div>}
    <div className="flex justify-end gap-3 border-t border-white/6 p-5"><button type="button" onClick={()=>void load()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400"><RefreshCcw size={15}/>Actualizar</button><button type="button" onClick={()=>void save()} disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white disabled:opacity-50">{saving?<LoaderCircle size={15} className="animate-spin"/>:<Save size={15}/>}Guardar</button></div>
  </section>;
}

function Metric({label,value}:{label:string;value:string}) { return <div className="rounded-2xl border border-white/7 bg-black/20 p-4"><p className="text-[10px] uppercase tracking-wider text-zinc-700">{label}</p><p className="mt-2 text-lg font-semibold text-white">{value}</p></div>; }
