"use client";

import { LoaderCircle, RefreshCcw, ShieldCheck, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { FinancialProtectionReport } from "@/types/admin-pricing-coupons";

export function FinancialProtectionCard() {
  const [report, setReport] = useState<FinancialProtectionReport | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setReport(await browserApiRequest<FinancialProtectionReport>("/api/admin/financial-protection"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible cargar la protección de ganancias.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <section className="luxia-panel mt-5 flex min-h-48 items-center justify-center rounded-3xl"><LoaderCircle className="animate-spin text-red-500" /></section>;
  if (!report) return null;

  return <section className="luxia-panel mt-5 overflow-hidden rounded-3xl">
    <div className="border-b border-white/6 p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-12 items-center justify-center rounded-2xl border border-emerald-500/15 bg-emerald-950/15 text-emerald-400"><ShieldCheck size={22}/></div>
        <div>
          <h2 className="font-semibold text-white">Protección automática de ganancias</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">Los descuentos consumen únicamente la menor Ganancia deseada (USD) entre los módulos activos. Infraestructura, GPU, tiempos, scaledown y margen técnico no se modifican.</p>
        </div>
      </div>
    </div>
    <div className="grid gap-3 p-6 md:grid-cols-4">
      <Metric label="Ganancia segura global" value={report.safe_profit_usd == null ? "—" : `$${report.safe_profit_usd.toFixed(6)} USD`} />
      <Metric label="Máximo permitido" value={`${report.maximum_allowed_discount_percent.toFixed(2)}%`} />
      <Metric label="Mayor descuento activo" value={`${report.highest_active_discount_percent.toFixed(2)}%`} />
      <Metric label="Disponible" value={`${report.available_discount_percentage_points.toFixed(2)} pp`} />
    </div>
    <div className="mx-6 mb-6 rounded-2xl border border-white/7 bg-black/20 p-5 text-sm text-zinc-400">
      <p className="font-semibold text-white">Regla de mayor riesgo: {report.limiting_module_name ?? "Sin configuración"}</p>
      <p className="mt-2">Con 100% de descuento renuncias a toda la ganancia segura, pero no se toca la infraestructura. Más de 100% queda bloqueado.</p>
      {report.warnings.map((item) => <p key={item} className="mt-2 flex gap-2 text-amber-300"><TriangleAlert size={16}/>{item}</p>)}
    </div>
    <div className="flex justify-end border-t border-white/6 p-5"><button type="button" onClick={() => void load()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400"><RefreshCcw size={15}/>Actualizar</button></div>
  </section>;
}

function Metric({label,value}:{label:string;value:string}) { return <div className="rounded-2xl border border-white/7 bg-black/20 p-4"><p className="text-[10px] uppercase tracking-wider text-zinc-600">{label}</p><p className="mt-2 text-lg font-semibold text-white">{value}</p></div>; }
