"use client";

import { useEffect, useState } from "react";
import { DatabaseZap, LoaderCircle, RefreshCcw, ShieldCheck, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";

type Preview = { confirmation_text: string; can_execute: boolean; active_execution_ids: string[]; active_tryon_job_ids: number[]; counts: Record<string, number>; };
type Result = { success: boolean; targeted_end_users?: number; deleted_storage_files: number; zeroed_users: number; stripe_subscriptions_cancelled: number; stripe_payments_refunded: number; deleted: Record<string, number>; };

const LABELS: Record<string, string> = {
  end_users_targeted: "Usuarios finales cuya actividad se limpiará",
  ai_model_profiles: "Modelos IA creados por usuarios",
  generation_module_executions: "Generaciones de módulos",
  legacy_generation_jobs: "Generaciones heredadas",
  generation_financial_records: "Registros financieros de generaciones",
  token_consumption_allocations: "Asignaciones de consumo",
  token_transactions: "Movimientos de tokens",
  token_value_lots: "Bolsas/lotes contables",
  token_purchases: "Compras de tokens",
  billing_payments: "Pagos locales",
  billing_invoices: "Facturas locales",
  billing_events: "Eventos de facturación",
  user_subscriptions: "Planes/suscripciones comprados",
  billing_customers: "Clientes de facturación",
  user_gallery_items: "Elementos de galería",
  user_notifications: "Notificaciones de usuarios finales",
  support_tickets: "Tickets creados por usuarios finales",
  finance_withdrawals: "Retiros de caja de pruebas",
  infrastructure_funding_movements: "Fondeos de infraestructura de pruebas",
  infrastructure_funding_allocations: "Asignaciones FIFO de fondeos",
  infrastructure_provider_credit_releases: "Créditos liberados en proveedores",
  promotional_credit_returns: "Devoluciones promocionales",
  promotional_token_grants: "Tokens promocionales asignados",
  promotional_funding_cycles: "Ciclos promocionales generados",
  promotional_credit_funds: "Fondos promocionales operativos",
  operational_expenses: "Gastos operativos de pruebas",
  storage_files: "Imágenes/archivos de usuarios que se eliminarán",
  tokens_to_zero: "Tokens de usuarios que se pondrán en cero",
  users_preserved: "Usuarios que permanecen registrados",
  account_files_preserved: "Archivos de cuenta preservados",
  configuration_files_preserved: "Archivos de configuración preservados",
  promotional_funding_sources_preserved: "Configuraciones promocionales preservadas",
};

export function GenerationDataResetCard() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [deleteFiles, setDeleteFiles] = useState(true);
  const [cancelStripe, setCancelStripe] = useState(true);
  const [refundStripe, setRefundStripe] = useState(false);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreview = async () => {
    setLoading(true); setError(null);
    try { setPreview(await browserApiRequest<Preview>("/api/admin/maintenance/generation-reset/preview")); }
    catch (e) { const m=e instanceof Error?e.message:"No se pudo revisar el reinicio."; setError(m); toast.error(m); }
    finally { setLoading(false); }
  };
  useEffect(() => { void loadPreview(); }, []);

  const execute = async () => {
    if (!preview || confirmation !== preview.confirmation_text) return;
    setExecuting(true);
    try {
      const r=await browserApiRequest<Result>("/api/admin/maintenance/generation-reset", {
        method:"POST",
        body:JSON.stringify({confirmation,delete_storage_files:deleteFiles,cancel_stripe_subscriptions:cancelStripe,refund_stripe_payments:refundStripe}),
      });
      toast.success(`Actividad de usuarios eliminada: ${r.targeted_end_users ?? 0} usuarios finales conservados, ${r.zeroed_users} saldos puestos en cero, ${r.deleted_storage_files} archivos físicos eliminados.`);
      setConfirmation("");
      await loadPreview();
    } catch(e) { toast.error(e instanceof Error?e.message:"No se pudo reiniciar la actividad."); }
    finally { setExecuting(false); }
  };

  return <section className="luxia-panel mt-5 overflow-hidden rounded-3xl border border-red-500/15">
    <div className="border-b border-red-500/10 bg-red-950/10 p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/30 text-red-400"><DatabaseZap size={22}/></div>
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">Modo mantenimiento</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Borrar actividad de pruebas de usuarios finales</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">Limpia la actividad comercial y creativa generada por usuarios finales sin borrar sus cuentas. Elimina modelos IA creados, generaciones, galería, imágenes/archivos, tokens, bolsas, compras, pagos, facturas, suscripciones compradas y movimientos financieros de prueba.</p>
        </div>
      </div>
    </div>
    <div className="p-6">
      <div className="mb-5 flex gap-3 rounded-2xl border border-emerald-500/15 bg-emerald-950/10 p-4 text-sm text-emerald-100">
        <ShieldCheck size={19} className="mt-0.5 shrink-0 text-emerald-400"/>
        <div><b className="block">Protegido: configuración y cuentas</b><span className="mt-1 block text-xs leading-5 text-emerald-200/65">Permanecen usuarios, owners/admins, avatares y seguridad de cuenta; pricing, módulos y sus inputs/outputs, workflows, runtimes, proveedores/GPU, planes, paquetes, cupones, fuentes promocionales y catálogos/assets administrativos. Las aceptaciones legales de registro/cuenta también permanecen.</span></div>
      </div>
      {loading?<div className="flex h-28 items-center justify-center"><LoaderCircle className="animate-spin text-red-400"/></div>:error?<div className="rounded-2xl border border-red-500/20 bg-red-950/15 p-4 text-sm text-red-200">{error}<button onClick={()=>void loadPreview()} className="ml-3 underline">Reintentar</button></div>:preview?<>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{Object.entries(preview.counts).map(([k,v])=><div key={k} className="rounded-2xl border border-white/7 bg-black/20 p-4"><p className="text-xs text-zinc-600">{LABELS[k]??k}</p><p className="mt-2 text-xl font-semibold text-white">{v.toLocaleString()}</p></div>)}</div>
        {!preview.can_execute&&<div className="mt-5 flex gap-3 rounded-2xl border border-amber-500/20 bg-amber-950/15 p-4 text-sm text-amber-200"><TriangleAlert size={18}/>Hay generaciones activas de usuarios finales. Debes terminarlas o cancelarlas primero.</div>}
        <label className="mt-5 flex gap-3 rounded-2xl border border-white/7 bg-black/20 p-4"><input type="checkbox" checked={deleteFiles} onChange={e=>setDeleteFiles(e.target.checked)} className="mt-1"/><span><b className="block text-sm text-white">Eliminar físicamente imágenes y archivos de usuarios</b><span className="text-xs text-zinc-600">Borra únicamente archivos atribuibles a la actividad de usuarios finales en Local, Amazon S3 o Cloudflare R2. Avatares y archivos usados por catálogos/configuración quedan blindados.</span></span></label>
        <label className="mt-3 flex gap-3 rounded-2xl border border-white/7 bg-black/20 p-4"><input type="checkbox" checked={cancelStripe} onChange={e=>setCancelStripe(e.target.checked)} className="mt-1"/><span><b className="block text-sm text-white">Cancelar suscripciones activas de usuarios finales en Stripe</b><span className="text-xs text-zinc-600">Solo toca suscripciones de usuarios finales. Si Stripe falla, no se borra la información local.</span></span></label>
        <label className="mt-3 flex gap-3 rounded-2xl border border-white/7 bg-black/20 p-4"><input type="checkbox" checked={refundStripe} onChange={e=>setRefundStripe(e.target.checked)} className="mt-1"/><span><b className="block text-sm text-white">Reembolsar pagos de prueba de usuarios finales en Stripe</b><span className="text-xs text-zinc-600">Stripe no permite borrar pagos históricos. Esta opción devuelve el importe pendiente antes de limpiar los registros locales. Si un reembolso falla, no se ejecuta el borrado local.</span></span></label>
        <div className="mt-5 rounded-2xl border border-red-500/15 bg-red-950/10 p-5"><p className="text-sm text-red-200">Escribe exactamente <strong>{preview.confirmation_text}</strong>.</p><input value={confirmation} onChange={e=>setConfirmation(e.target.value)} className="mt-3 h-11 w-full rounded-xl border border-red-500/20 bg-black/30 px-4 text-sm text-white" placeholder={preview.confirmation_text}/>
          <div className="mt-4 flex gap-3"><button onClick={()=>void execute()} disabled={!preview.can_execute||confirmation!==preview.confirmation_text||executing} className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white disabled:opacity-40">{executing?<LoaderCircle size={16} className="animate-spin"/>:<DatabaseZap size={16}/>}Borrar actividad de pruebas</button><button onClick={()=>void loadPreview()} disabled={executing} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400"><RefreshCcw size={16}/>Actualizar resumen</button></div>
        </div>
      </>:null}
    </div>
  </section>;
}
