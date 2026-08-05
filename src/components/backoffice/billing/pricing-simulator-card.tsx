"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Calculator, LoaderCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { AppliedPricingRuleResponse, PricingSimulatorResponse } from "@/types/admin-pricing-coupons";

const money = (value: number) => `USD ${value.toFixed(6).replace(/0+$/, "").replace(/\.$/, "")}`;

export function PricingSimulatorCard() {
  const [modules, setModules] = useState<AppliedPricingRuleResponse[]>([]);
  const [moduleId, setModuleId] = useState("");
  const [tokenValue, setTokenValue] = useState("");
  const [profitPerToken, setProfitPerToken] = useState("");
  const [discount, setDiscount] = useState("15");
  const [targetProfit, setTargetProfit] = useState("1");
  const [minTokens, setMinTokens] = useState("8");
  const [maxTokens, setMaxTokens] = useState("12");
  const [durationMode, setDurationMode] = useState("historical");
  const [manualDuration, setManualDuration] = useState("120");
  const [result, setResult] = useState<PricingSimulatorResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void browserApiRequest<AppliedPricingRuleResponse[]>("/api/admin/applied-pricing-rules")
      .then((rows) => {
        setModules(rows.filter((row) => row.configured));
        if (rows[0]) setModuleId(String(rows[0].generation_module_id));
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "No fue posible cargar los módulos."));
  }, []);

  const selected = useMemo(() => modules.find((row) => String(row.generation_module_id) === moduleId), [modules, moduleId]);
  useEffect(() => {
    if (!selected) return;
    setTokenValue(String(selected.token_value_usd));
    setProfitPerToken(String(selected.desired_profit_per_token_usd));
  }, [selected]);

  async function simulate(event?: FormEvent) {
    event?.preventDefault();
    const tv = Number(tokenValue), profit = Number(profitPerToken), worst = Number(discount);
    if (!moduleId || !Number.isFinite(tv) || tv <= 0 || !Number.isFinite(profit) || profit < 0 || profit >= tv) {
      toast.error("La ganancia por token debe ser menor que el valor del token.");
      return;
    }
    setLoading(true);
    try {
      const response = await browserApiRequest<PricingSimulatorResponse>("/api/admin/pricing-simulator", {
        method: "POST",
        body: JSON.stringify({
          generation_module_id: Number(moduleId), token_value_usd: tv,
          desired_profit_per_token_usd: profit, duration_mode: durationMode,
          manual_duration_seconds: durationMode === "manual" ? Number(manualDuration) : null,
          scenarios: [
            { label: "Sin descuento", discount_percent: 0 },
            { label: "Peor descuento", discount_percent: worst },
          ],
          target_profit_usd: Number(targetProfit), target_tokens_min: Number(minTokens),
          target_tokens_max: Number(maxTokens), worst_discount_percent: worst,
        }),
      });
      setResult(response);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible simular.");
    } finally { setLoading(false); }
  }

  return <section className="luxia-panel mt-5 rounded-3xl p-6">
    <div className="flex items-start gap-4"><div className="flex size-12 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-950/20 text-sky-300"><Calculator size={21}/></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-400">Sin guardar cambios</p><h2 className="mt-1 text-lg font-semibold text-white">Simulador de precios y ganancias</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">Elige un módulo real. El simulador usa su GPU, historial, tiempo de apagado y margen técnico, pero no modifica ninguna regla.</p></div></div>
    <form onSubmit={simulate} className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Field label="Módulo"><select value={moduleId} onChange={(e)=>setModuleId(e.target.value)} className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-3 text-sm text-white outline-none focus:border-sky-500/30"><option value="">Selecciona</option>{modules.map((row)=><option key={row.generation_module_id} value={row.generation_module_id}>{row.module_name}</option>)}</select></Field>
      <Field label="Tiempo de referencia"><select value={durationMode} onChange={(e)=>setDurationMode(e.target.value)} className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-3 text-sm text-white outline-none focus:border-sky-500/30"><option value="historical">Historial del módulo</option><option value="initial">Tiempo inicial</option><option value="manual">Tiempo manual</option></select></Field>
      {durationMode === "manual" && <Field label="Segundos manuales"><input className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-3 text-sm text-white outline-none focus:border-sky-500/30" value={manualDuration} onChange={(e)=>setManualDuration(e.target.value)}/></Field>}
      <Field label="Valor de 1 token (USD)"><input className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-3 text-sm text-white outline-none focus:border-sky-500/30" value={tokenValue} onChange={(e)=>setTokenValue(e.target.value)}/></Field>
      <Field label="Ganancia deseada por token (USD)"><input className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-3 text-sm text-white outline-none focus:border-sky-500/30" value={profitPerToken} onChange={(e)=>setProfitPerToken(e.target.value)}/></Field>
      <Field label="Peor descuento a soportar (%)"><input className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-3 text-sm text-white outline-none focus:border-sky-500/30" value={discount} onChange={(e)=>setDiscount(e.target.value)}/></Field>
      <Field label="Quiero ganar aprox. (USD)"><input className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-3 text-sm text-white outline-none focus:border-sky-500/30" value={targetProfit} onChange={(e)=>setTargetProfit(e.target.value)}/></Field>
      <Field label="Tokens deseados"><div className="grid grid-cols-2 gap-2"><input className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-3 text-sm text-white outline-none focus:border-sky-500/30" value={minTokens} onChange={(e)=>setMinTokens(e.target.value)} placeholder="Mín."/><input className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-3 text-sm text-white outline-none focus:border-sky-500/30" value={maxTokens} onChange={(e)=>setMaxTokens(e.target.value)} placeholder="Máx."/></div></Field>
      <button disabled={loading} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-sky-500/20 bg-sky-950/20 px-4 text-sm font-semibold text-sky-200 disabled:opacity-50">{loading?<LoaderCircle className="animate-spin" size={16}/>:<Sparkles size={16}/>}Calcular</button>
    </form>
    {result && <div className="mt-6 space-y-5">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6"><Metric label="Tiempo usado" value={`${result.duration_seconds.toFixed(1)} s`}/><Metric label="Historial" value={`${result.historical_samples_used} registros`}/><Metric label="Segundos facturables" value={`${result.billable_seconds.toFixed(1)} s`}/><Metric label="Costo proveedor" value={money(result.infrastructure_cost_usd)}/><Metric label="GPU" value={result.gpu_key || "Sin GPU"}/><Metric label="Fuente" value={friendlySource(result.duration_source)}/></div>
      <div><h3 className="mb-3 font-semibold text-white">Qué pasaría con esta configuración</h3><div className="overflow-x-auto rounded-2xl border border-white/6"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-white/[0.03] text-xs text-zinc-500"><tr><th className="p-3">Escenario</th><th>Tokens</th><th>Cliente paga</th><th>Proveedor</th><th>Beneficio</th><th>Tu ganancia</th></tr></thead><tbody>{result.scenarios.map((row)=><tr key={row.label} className="border-t border-white/6"><td className="p-3 text-white">{row.label} ({row.discount_percent.toFixed(1)}%)</td><td>{row.tokens}</td><td>{money(row.customer_value_usd)}</td><td>{money(row.infrastructure_cost_usd)}</td><td>{money(row.discount_given_usd)}</td><td className="font-semibold text-emerald-300">{money(row.company_total_usd)}</td></tr>)}</tbody></table></div></div>
      <div><h3 className="mb-2 font-semibold text-white">Configuraciones cercanas a tu objetivo</h3><p className="mb-3 text-xs text-zinc-600">Son propuestas matemáticas; no se guardan. Están ordenadas por cercanía a la ganancia objetivo incluso soportando el peor descuento indicado.</p>{result.recommendations.length===0?<p className="rounded-xl border border-amber-500/15 bg-amber-950/10 p-4 text-sm text-amber-200">No se encontró una combinación dentro del rango de tokens indicado. Amplía el rango o reduce la ganancia objetivo.</p>:<div className="grid gap-3 lg:grid-cols-2">{result.recommendations.map((row,index)=><article key={`${row.token_value_usd}-${row.desired_profit_per_token_usd}-${index}`} className="rounded-2xl border border-white/6 bg-black/20 p-4"><div className="flex justify-between gap-3"><div><p className="text-xs text-zinc-600">Opción {index+1}</p><p className="mt-1 font-semibold text-white">Token {money(row.token_value_usd)} · Ganancia/token {money(row.desired_profit_per_token_usd)}</p></div><span className="text-sky-300">{row.tokens} tokens</span></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><Metric label="Tu ganancia" value={money(row.estimated_company_profit_usd)}/><Metric label="Cliente paga" value={money(row.estimated_customer_value_usd)}/></div></article>)}</div>}</div>
    </div>}
  </section>;
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block"><span className="mb-2 block text-xs text-zinc-500">{label}</span>{children}</label>}
function Metric({label,value}:{label:string;value:string}){return <div className="rounded-xl border border-white/6 bg-black/20 p-3"><p className="text-[10px] text-zinc-600">{label}</p><p className="mt-1 text-sm font-semibold text-white">{value}</p></div>}
function friendlySource(source:string){return source.includes("historical")?"Historial":source==="manual"?"Manual":"Inicial"}
