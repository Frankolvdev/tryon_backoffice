"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgePercent, LoaderCircle, Pencil, Plus, RefreshCcw, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { CommercialEconomyCard } from "@/components/backoffice/billing/commercial-economy-card";
import { ExecutionBillingPolicyCard } from "@/components/backoffice/billing/execution-billing-policy-card";
import { FinancialProtectionCard } from "@/components/backoffice/billing/financial-protection-card";
import { PricingRuleEditor } from "@/components/backoffice/billing/pricing-rule-editor";
import { AppliedPricingRules } from "@/components/backoffice/billing/applied-pricing-rules";
import { PricingSimulatorCard } from "@/components/backoffice/billing/pricing-simulator-card";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { PricingRuleResponse } from "@/types/admin-pricing-coupons";

export default function PricingPage() {
  const [rules,setRules]=useState<PricingRuleResponse[]>([]);
  const [editing,setEditing]=useState<PricingRuleResponse|null|undefined>(undefined);
  const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null); const [action,setAction]=useState<number|null>(null);
  const load=useCallback(async()=>{setLoading(true);setError(null);try{setRules(await browserApiRequest<PricingRuleResponse[]>("/api/admin/pricing-rules"));}catch(e){setError(e instanceof Error?e.message:"No fue posible cargar pricing.");}finally{setLoading(false);}},[]);
  useEffect(()=>{void load();},[load]);
  const saved=(rule:PricingRuleResponse)=>{setRules(c=>c.some(x=>x.id===rule.id)?c.map(x=>x.id===rule.id?rule:x):[rule,...c]);setEditing(undefined);};
  const remove=async(rule:PricingRuleResponse)=>{if(!window.confirm(`¿Eliminar la regla "${rule.title}"?`))return;setAction(rule.id);try{await browserApiRequest<void>(`/api/admin/pricing-rules/${rule.id}`,{method:"DELETE"});setRules(c=>c.filter(x=>x.id!==rule.id));toast.success("Regla eliminada.");}catch(e){toast.error(e instanceof Error?e.message:"No fue posible eliminar la regla.");}finally{setAction(null);}};
  return <div>
    <section className="luxia-panel overflow-hidden rounded-3xl"><div className="border-b border-white/6 p-6"><div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between"><div className="flex items-start gap-4"><div className="luxia-red-glow flex size-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400"><BadgePercent size={24}/></div><div><p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">Comercial</p><h1 className="mt-2 text-2xl font-semibold text-white">Pricing</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">Valor del token, protección global, reglas de precio y simulaciones aplicadas.</p></div></div><button type="button" onClick={()=>void load()} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400"><RefreshCcw size={16}/>Actualizar</button></div></div></section>
    <CommercialEconomyCard onUpdated={()=>void load()}/><ExecutionBillingPolicyCard/><FinancialProtectionCard/><PricingSimulatorCard/>
    {loading&&<section className="luxia-panel mt-5 flex min-h-64 items-center justify-center rounded-3xl"><LoaderCircle className="animate-spin text-red-500"/></section>}
    {!loading&&error&&<section className="luxia-panel mt-5 rounded-3xl p-6"><div className="flex gap-3 rounded-2xl border border-red-500/15 bg-red-950/15 p-5 text-red-300"><TriangleAlert size={19}/><p>{error}</p></div></section>}
    {!loading&&!error&&<><section className="mt-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold text-white">Reglas de pricing</h2><p className="mt-1 text-xs text-zinc-600">{rules.length} reglas registradas</p></div><button type="button" onClick={()=>setEditing(null)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-500/15 bg-red-950/15 px-4 text-sm text-red-300"><Plus size={15}/>Nueva regla</button></div><div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">{rules.map(rule=><article key={rule.id} className="luxia-panel rounded-3xl p-6"><div className="flex justify-between gap-4"><div><p className="font-semibold text-white">{rule.title}</p><p className="mt-1 text-xs text-zinc-600">{rule.generation_module_id?`Módulo #${rule.generation_module_id}`:"Sin módulo"}</p></div><span className={rule.is_active?"text-emerald-400":"text-zinc-600"}>{rule.is_active?"ACTIVA":"INACTIVA"}</span></div><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><Metric label="Ganancia" value={`${rule.desired_profit_usd.toFixed(2)} USD`}/><Metric label="Duración inicial" value={`${rule.initial_estimated_duration_seconds} s`}/><Metric label="Margen técnico" value={`${rule.technical_margin_seconds} s`}/><Metric label="Tokens actuales" value={String(rule.required_tokens)}/></div><div className="mt-5 grid grid-cols-2 gap-2"><button onClick={()=>setEditing(rule)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/8 text-sm text-zinc-400"><Pencil size={15}/>Editar</button><button onClick={()=>void remove(rule)} disabled={action===rule.id} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-500/15 text-sm text-red-300 disabled:opacity-50">{action===rule.id?<LoaderCircle size={15} className="animate-spin"/>:<Trash2 size={15}/>}Eliminar</button></div></article>)}</div></section><AppliedPricingRules/></>}
    {editing!==undefined&&<PricingRuleEditor rule={editing} onClose={()=>setEditing(undefined)} onSaved={saved}/>} 
  </div>;
}
function Metric({label,value}:{label:string;value:string}){return <div className="rounded-xl border border-white/6 bg-black/20 p-3"><p className="text-[10px] text-zinc-700">{label}</p><p className="mt-1 font-semibold text-white">{value}</p></div>}
