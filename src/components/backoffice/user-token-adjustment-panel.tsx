"use client";

import { Coins, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import type { AdminUser, AdminUserTokenAdjustmentRequest } from "@/types/admin-users";

interface Props { userId:number; onChanged?:(user:AdminUser)=>void|Promise<void>; }

export function UserTokenAdjustmentPanel({userId,onChanged}:Props){
  const [amount,setAmount]=useState("");
  const [reason,setReason]=useState("");
  const [saving,setSaving]=useState(false);

  async function submit(){
    const parsed=Number(amount);
    if(!Number.isInteger(parsed)||parsed===0){toast.error("Escribe un número entero distinto de cero.");return;}
    if(!reason.trim()){toast.error("Explica por qué haces el ajuste.");return;}
    setSaving(true);
    try{
      const payload:AdminUserTokenAdjustmentRequest={amount:parsed,reason:reason.trim()};
      const user=await browserApiRequest<AdminUser>(`/api/admin/users/${userId}/tokens/adjust`,{method:"POST",body:JSON.stringify(payload)});
      toast.success(parsed>0?`${parsed} token(s) agregados manualmente.`:`${Math.abs(parsed)} token(s) retirados manualmente.`);
      setAmount("");setReason("");await onChanged?.(user);
    }catch(error){toast.error(error instanceof Error?error.message:"No fue posible ajustar los tokens.");}
    finally{setSaving(false)}
  }

  return <section className="luxia-panel rounded-3xl p-6">
    <div className="flex items-start gap-3"><div className="flex size-11 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-950/20 text-amber-300"><Coins size={19}/></div><div><h2 className="font-semibold text-white">Ajuste manual de saldo</h2><p className="mt-1 text-sm leading-6 text-zinc-600">Úsalo solo para correcciones administrativas. Un número positivo agrega tokens; uno negativo los retira. Esto no es lo mismo que regalar tokens desde la caja promocional.</p></div></div>
    <div className="mt-5 grid gap-3 md:grid-cols-[180px_1fr_auto] md:items-end">
      <label><span className="mb-2 block text-xs text-zinc-500">Cambio de tokens</span><input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Ej. 10 o -10" className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-3 text-sm text-white"/></label>
      <label><span className="mb-2 block text-xs text-zinc-500">Motivo</span><input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Ej. corrección por soporte" className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-3 text-sm text-white"/></label>
      <button type="button" onClick={()=>void submit()} disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-950/20 px-5 text-sm font-semibold text-amber-200 disabled:opacity-40">{saving?<LoaderCircle size={16} className="animate-spin"/>:<Coins size={16}/>}Aplicar ajuste</button>
    </div>
  </section>
}
