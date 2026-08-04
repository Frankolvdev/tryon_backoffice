"use client";

import { Calculator, LoaderCircle, RefreshCcw, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { AppliedPricingRuleResponse } from "@/types/admin-pricing-coupons";

function money(value: number | null | undefined) {
  return value == null ? "—" : new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD", minimumFractionDigits: 4 }).format(value);
}

export function AppliedPricingRules() {
  const [items, setItems] = useState<AppliedPricingRuleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setItems(await browserApiRequest<AppliedPricingRuleResponse[]>("/api/admin/applied-pricing-rules")); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible cargar las reglas aplicadas."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return <section className="luxia-panel mt-5 overflow-hidden rounded-3xl">
    <div className="flex items-start justify-between gap-4 border-b border-white/6 p-6">
      <div className="flex items-start gap-3"><Calculator className="mt-0.5 text-red-400" size={20}/><div><h2 className="font-semibold text-white">Reglas de pricing aplicadas</h2><p className="mt-1 text-xs leading-5 text-zinc-600">Simulación por módulo, proveedor, GPU, tiempo estimado y valor actual del token.</p></div></div>
      <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/8 px-4 text-xs text-zinc-400 disabled:opacity-50"><RefreshCcw size={14} className={loading ? "animate-spin" : ""}/>Actualizar</button>
    </div>
    {loading ? <div className="flex min-h-40 items-center justify-center"><LoaderCircle className="animate-spin text-red-500"/></div>
      : error ? <div className="m-5 flex gap-3 rounded-2xl border border-red-500/15 bg-red-950/10 p-5 text-sm text-red-300"><TriangleAlert size={18}/>{error}</div>
      : items.length === 0 ? <div className="p-10 text-center text-sm text-zinc-600">Aún no hay reglas asignadas a módulos.</div>
      : <div className="overflow-x-auto"><table className="w-full min-w-[1280px] text-left text-xs"><thead className="bg-black/20 uppercase tracking-wider text-zinc-600"><tr><th className="p-4">Módulo / regla</th><th>Proveedor</th><th>GPU</th><th>Estimación</th><th>Scaledown</th><th>Margen</th><th>Segundos cobrables</th><th>Costo infra</th><th>Ganancia</th><th>Precio</th><th>Tokens</th><th>Estado</th></tr></thead><tbody>{items.map(item => <tr key={`${item.rule_id}-${item.generation_module_id}`} className="border-t border-white/5 align-top"><td className="p-4"><p className="font-medium text-white">{item.module_name}</p><p className="mt-1 text-zinc-600">{item.rule_title}</p></td><td className="pt-4 text-zinc-300">{item.provider}</td><td className="pt-4 text-zinc-300">{item.gpu_key ?? "—"}</td><td className="pt-4 text-zinc-300">{item.estimated_duration_seconds.toFixed(1)} s<p className="mt-1 text-[10px] text-zinc-600">{item.estimate_source === "historical_average" ? "promedio histórico" : "valor inicial"}</p></td><td className="pt-4 text-zinc-300">{item.scaledown_seconds} s</td><td className="pt-4 text-zinc-300">{item.technical_margin_seconds} s</td><td className="pt-4 font-medium text-white">{item.estimated_billable_seconds.toFixed(1)} s</td><td className="pt-4 text-zinc-300">{money(item.estimated_infrastructure_cost_usd)}</td><td className="pt-4 text-zinc-300">{money(item.desired_profit_usd)}</td><td className="pt-4 text-zinc-300">{money(item.estimated_final_price_usd)}</td><td className="pt-4 font-semibold text-red-300">{item.estimated_tokens ?? "—"}</td><td className="pr-4 pt-4"><span className={`rounded-full border px-2.5 py-1 text-[10px] ${item.configured ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-amber-500/20 bg-amber-500/10 text-amber-300"}`}>{item.configured ? "Configurado" : "Incompleto"}</span>{item.warnings.length > 0 && <p className="mt-2 max-w-56 text-[10px] leading-4 text-amber-300">{item.warnings.join(" · ")}</p>}</td></tr>)}</tbody></table></div>}
  </section>;
}
