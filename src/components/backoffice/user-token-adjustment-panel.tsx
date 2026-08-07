"use client";

import { LoaderCircle, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import type { PromotionalRevokeResult, TokenBagList } from "@/types/finance-cashbox";

interface Props { userId:number; onChanged?:()=>void|Promise<void>; }

export function UserTokenAdjustmentPanel({userId,onChanged}:Props){
  const [available,setAvailable]=useState(0);
  const [amount,setAmount]=useState("");
  const [reason,setReason]=useState("");
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const bags=await browserApiRequest<TokenBagList>(`/api/admin/finances/token-bags?user_id=${userId}&limit=200`);
      setAvailable((bags.items??[]).filter(b=>b.source==="promotional_credit").reduce((sum,b)=>sum+b.remaining_tokens,0));
    }catch(error){toast.error(error instanceof Error?error.message:"No fue posible cargar los tokens gratis disponibles.");}
    finally{setLoading(false);}
  },[userId]);

  useEffect(()=>{
    void load();
    const refresh=()=>{void load();};
    window.addEventListener("promotional-tokens-changed",refresh);
    return()=>window.removeEventListener("promotional-tokens-changed",refresh);
  },[load]);

  async function submit(){
    const parsed=Number(amount);
    if(!Number.isInteger(parsed)||parsed<=0){toast.error("Escribe cuántos tokens gratis quieres retirar.");return;}
    if(parsed>available){toast.error(`El usuario solo tiene ${available} token(s) gratis sin usar.`);return;}
    setSaving(true);
    try{
      const result=await browserApiRequest<PromotionalRevokeResult>("/api/admin/finances/promotional-credits/revoke",{method:"POST",body:JSON.stringify({user_id:userId,tokens:parsed,reason:reason.trim()||null})});
      toast.success(`${result.revoked_tokens} token(s) gratis retirados. Su respaldo volvió a la caja promocional.`);
      setAmount("");setReason("");await load();window.dispatchEvent(new Event("promotional-tokens-changed"));await onChanged?.();
    }catch(error){toast.error(error instanceof Error?error.message:"No fue posible retirar los tokens gratis.");}
    finally{setSaving(false);}
  }

  return <section className="luxia-panel rounded-3xl p-6">
    <div className="flex items-start gap-3"><div className="flex size-11 items-center justify-center rounded-2xl border border-fuchsia-500/20 bg-fuchsia-950/20 text-fuchsia-300"><RotateCcw size={19}/></div><div><h2 className="font-semibold text-white">Retirar tokens gratis</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-600">Solo retira tokens promocionales que el usuario todavía no ha gastado. El respaldo de esos tokens vuelve automáticamente a la misma caja promocional de la que salió. Para regalar tokens nuevos usa la tarjeta de arriba.</p></div></div>
    <div className="mt-4 rounded-2xl border border-fuchsia-500/10 bg-fuchsia-950/10 p-4"><p className="text-xs text-zinc-500">Tokens gratis que todavía puedes retirar</p><p className="mt-1 text-xl font-semibold text-white">{loading?"…":available} tokens</p></div>
    <div className="mt-5 grid gap-3 md:grid-cols-[180px_1fr_auto] md:items-end">
      <label><span className="mb-2 block text-xs text-zinc-500">¿Cuántos quieres retirar?</span><input value={amount} onChange={e=>setAmount(e.target.value)} inputMode="numeric" placeholder="Ej. 3" className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-3 text-sm text-white"/></label>
      <label><span className="mb-2 block text-xs text-zinc-500">Motivo (opcional)</span><input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Ej. corrección de cortesía" className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-3 text-sm text-white"/></label>
      <button type="button" onClick={()=>void submit()} disabled={saving||loading||available<=0} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-fuchsia-500/20 bg-fuchsia-950/20 px-5 text-sm font-semibold text-fuchsia-200 disabled:opacity-40">{saving?<LoaderCircle size={16} className="animate-spin"/>:<RotateCcw size={16}/>}Retirar y devolver a caja</button>
    </div>
  </section>;
}
