"use client";

import {useCallback,useEffect,useState} from "react";
import {
  Banknote,
  Boxes,
  CircleDollarSign,
  Landmark,
  Gift,
  UserPlus,
  RefreshCcw,
  RotateCcw,
  ServerCog,
  ShieldCheck,
  WalletCards,
  X,
} from "lucide-react";
import type {LucideIcon} from "lucide-react";
import {toast} from "sonner";

import {browserApiRequest} from "@/lib/api/browser-api";
import type {
  BagDetail,
  CashboxSummary,
  ExpirationSettings,
  ExpirationSimulationResult,
  InfrastructureFunding,
  OperationalCashboxSummary,
  OperationalExpense,
  PendingRecoveryList,
  PromotionalCreditSummary,
  PromotionalGrantResult,
  TokenBag,
  TokenBagList,
  Withdrawal,
} from "@/types/finance-cashbox";
import type {AdminUser} from "@/types/admin-users";

const money=(value:number)=>`USD ${Number(value||0).toFixed(6)}`;
const date=(value?:string|null)=>value
  ? new Intl.DateTimeFormat("es-MX",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value))
  : "—";

const labels:Record<string,string>={
  new:"Nueva",
  active:"Activa",
  exhausted:"Agotada",
  expired:"Expirada",
  refunded:"Reembolsada",
};

function expirationText(bag:TokenBag){
  if(bag.status==="expired")return `Venció ${date(bag.expired_at||bag.expires_at)}`;
  if(bag.status==="exhausted"){
    return bag.expires_at
      ? `Agotada antes del vencimiento · ${date(bag.expires_at)}`
      : "Agotada · sin fecha histórica";
  }
  return date(bag.expires_at);
}

function expirationLabel(bag:TokenBag){
  if(bag.status==="exhausted")return "Vencimiento original";
  if(bag.status==="expired")return "Fecha de vencimiento";
  return "Vencimiento";
}

function Info({label,value}:{label:string;value:string}){
  return <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
    <p className="text-xs text-zinc-600">{label}</p>
    <p className="mt-2 text-sm font-medium text-zinc-200">{value}</p>
  </div>;
}

export default function CashboxPage(){
  const [summary,setSummary]=useState<CashboxSummary|null>(null);
  const [bags,setBags]=useState<TokenBag[]>([]);
  const [withdrawals,setWithdrawals]=useState<Withdrawal[]>([]);
  const [fundings,setFundings]=useState<InfrastructureFunding[]>([]);
  const [pendingRecoveries,setPendingRecoveries]=useState<PendingRecoveryList|null>(null);
  const [promotional,setPromotional]=useState<PromotionalCreditSummary|null>(null);
  const [operational,setOperational]=useState<OperationalCashboxSummary|null>(null);
  const [operationalExpenses,setOperationalExpenses]=useState<OperationalExpense[]>([]);
  const [operationalAmount,setOperationalAmount]=useState("");
  const [operationalCategory,setOperationalCategory]=useState("hosting");
  const [operationalBeneficiary,setOperationalBeneficiary]=useState("");
  const [operationalConcept,setOperationalConcept]=useState("Gasto operativo");
  const [operationalMethod,setOperationalMethod]=useState("");
  const [promoFundAmount,setPromoFundAmount]=useState("");
  const [promoFundProvider,setPromoFundProvider]=useState("modal");
  const [promoFundReference,setPromoFundReference]=useState("");
  const [promoFundDescription,setPromoFundDescription]=useState("Crédito promocional de infraestructura");
  const [promoGrantOpen,setPromoGrantOpen]=useState(false);
  const [promoUsers,setPromoUsers]=useState<AdminUser[]>([]);
  const [promoUserSearch,setPromoUserSearch]=useState("");
  const [promoSelectedUser,setPromoSelectedUser]=useState<AdminUser|null>(null);
  const [promoGrantTokens,setPromoGrantTokens]=useState("");
  const [promoGrantProvider,setPromoGrantProvider]=useState("modal");
  const [expiry,setExpiry]=useState<ExpirationSettings>({
    enabled:true,
    days:730,
    simulation_enabled:false,
  });
  const [detail,setDetail]=useState<BagDetail|null>(null);
  const [loading,setLoading]=useState(true);
  const [status,setStatus]=useState("");

  const [amount,setAmount]=useState("");
  const [concept,setConcept]=useState("Retiro de utilidad");
  const [beneficiary,setBeneficiary]=useState("");

  const [fundingAmount,setFundingAmount]=useState("");
  const [fundingProvider,setFundingProvider]=useState("modal");
  const [fundingBeneficiary,setFundingBeneficiary]=useState("");
  const [fundingConcept,setFundingConcept]=useState("Fondeo de infraestructura");
  const [fundingMethod,setFundingMethod]=useState("");

  const [action,setAction]=useState<string|null>(null);

  const summaryCards:Array<{
    label:string;
    value:number;
    icon:LucideIcon;
    className:string;
    help:string;
  }>=summary?[
    {
      label:"Puedes gastar o retirar",
      value:summary.available_usd,
      icon:WalletCards,
      className:"text-emerald-300",
      help:"Utilidad realmente libre. No incluye dinero reservado ni fondeado.",
    },
    {
      label:"Caja IA sin transferir",
      value:summary.infrastructure_cash_available_usd,
      icon:ShieldCheck,
      className:"text-sky-300",
      help:"Dinero de infraestructura que todavía sigue en tu caja y puede enviarse a proveedores.",
    },
    {
      label:"Fondeado en proveedores",
      value:summary.infrastructure_funded_usd,
      icon:ServerCog,
      className:"text-violet-300",
      help:"Transferencias registradas a Modal, RunPod, Beam u otros proveedores.",
    },
    {
      label:"Pérdidas pendientes",
      value:summary.pending_recovery_economic_estimated_usd,
      icon:CircleDollarSign,
      className:"text-orange-300",
      help:`${summary.pending_recovery_generations} generación(es) bloqueada(s) · ${summary.pending_recovery_tokens} token(s) por recuperar. Incluye infraestructura pendiente exacta y ganancia potencial estimada.`,
    },
    {
      label:"Reserva de tokens vigentes",
      value:summary.protected_infrastructure_usd,
      icon:Landmark,
      className:"text-cyan-300",
      help:"Respaldo que todavía corresponde a tokens no consumidos ni vencidos.",
    },
    {
      label:"Ganancia todavía bloqueada",
      value:summary.blocked_profit_usd,
      icon:Boxes,
      className:"text-amber-300",
      help:"Ganancia de bolsas nuevas que aún no han sido utilizadas.",
    },
    {
      label:"Dinero ya retirado",
      value:summary.withdrawals_usd,
      icon:Banknote,
      className:"text-rose-300",
      help:"Retiros de utilidad. No incluye fondeos a proveedores.",
    },
  ]:[];

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const query=status?`?status=${status}`:"";
      const [cashbox,bagList,withdrawalList,expiration,fundingList,pendingList,promoSummary,operationalSummary,operationalExpenseList]=await Promise.all([
        browserApiRequest<CashboxSummary>("/api/admin/finances/cashbox"),
        browserApiRequest<TokenBagList>(`/api/admin/finances/token-bags${query}`),
        browserApiRequest<Withdrawal[]>("/api/admin/finances/withdrawals"),
        browserApiRequest<ExpirationSettings>("/api/admin/finances/token-bag-expiration"),
        browserApiRequest<InfrastructureFunding[]>("/api/admin/finances/infrastructure-fundings"),
        browserApiRequest<PendingRecoveryList>("/api/admin/finances/pending-recoveries"),
        browserApiRequest<PromotionalCreditSummary>("/api/admin/finances/promotional-credits"),
        browserApiRequest<OperationalCashboxSummary>("/api/admin/finances/operational-cashbox"),
        browserApiRequest<OperationalExpense[]>("/api/admin/finances/operational-expenses"),
      ]);
      setSummary(cashbox);
      setBags(bagList.items);
      setWithdrawals(withdrawalList);
      setExpiry(expiration);
      setFundings(fundingList);
      setPendingRecoveries(pendingList);
      setPromotional(promoSummary);
      setOperational(operationalSummary);
      setOperationalExpenses(operationalExpenseList);
    }catch(error){
      toast.error(error instanceof Error?error.message:"No fue posible cargar la caja.");
    }finally{
      setLoading(false);
    }
  },[status]);

  useEffect(()=>{void load();},[load]);

  async function openBag(id:number){
    try{
      setDetail(await browserApiRequest<BagDetail>(`/api/admin/finances/token-bags/${id}`));
    }catch(error){
      toast.error(error instanceof Error?error.message:"No fue posible abrir la bolsa.");
    }
  }

  async function saveExpiry(){
    try{
      const result=await browserApiRequest<ExpirationSettings>(
        "/api/admin/finances/token-bag-expiration",
        {method:"PUT",body:JSON.stringify(expiry)},
      );
      setExpiry(result);
      toast.success("Caducidad guardada. Las bolsas existentes conservan su fecha.");
      void load();
    }catch(error){
      toast.error(error instanceof Error?error.message:"No fue posible guardar.");
    }
  }

  async function withdraw(){
    const value=Number(amount);
    if(!Number.isFinite(value)||value<=0){
      toast.error("Escribe un importe válido.");
      return;
    }
    if(!confirm(`Registrar retiro de utilidad por ${money(value)}?`))return;
    try{
      await browserApiRequest("/api/admin/finances/withdrawals",{
        method:"POST",
        body:JSON.stringify({
          amount_usd:value,
          concept,
          beneficiary:beneficiary||null,
        }),
      });
      toast.success("Retiro de utilidad registrado.");
      setAmount("");
      void load();
    }catch(error){
      toast.error(error instanceof Error?error.message:"No fue posible registrar el retiro.");
    }
  }

  async function fundProvider(){
    const value=Number(fundingAmount);
    const provider=fundingProvider.trim().toLowerCase();
    if(!Number.isFinite(value)||value<=0){
      toast.error("Escribe un importe válido.");
      return;
    }
    if(provider.length<2){
      toast.error("Escribe el proveedor que recibirá el dinero.");
      return;
    }
    if(!confirm(`Registrar fondeo de ${money(value)} a ${provider}? El sistema lo asignará FIFO a las bolsas exactas.`))return;
    setAction("fund-provider");
    try{
      const result=await browserApiRequest<InfrastructureFunding>(
        "/api/admin/finances/infrastructure-fundings",
        {
          method:"POST",
          body:JSON.stringify({
            amount_usd:value,
            provider,
            beneficiary:fundingBeneficiary||null,
            concept:fundingConcept,
            method:fundingMethod||null,
          }),
        },
      );
      toast.success(
        `Fondeo registrado y repartido entre ${result.allocations.length} bolsa(s).`,
      );
      setFundingAmount("");
      void load();
    }catch(error){
      toast.error(error instanceof Error?error.message:"No fue posible registrar el fondeo.");
    }finally{
      setAction(null);
    }
  }

  async function addPromotionalFund(){
    const value=Number(promoFundAmount);
    if(!Number.isFinite(value)||value<=0){toast.error("Escribe un importe promocional válido.");return;}
    setAction("promo-fund");
    try{
      await browserApiRequest("/api/admin/finances/promotional-credits/funds",{
        method:"POST",body:JSON.stringify({amount_usd:value,provider:promoFundProvider,reference:promoFundReference||null,description:promoFundDescription||null}),
      });
      toast.success("Crédito promocional agregado sin tocar Caja verde ni Caja IA comercial.");
      setPromoFundAmount(""); setPromoFundReference(""); void load();
    }catch(error){toast.error(error instanceof Error?error.message:"No fue posible agregar el crédito promocional.");}
    finally{setAction(null);}
  }

  async function savePromotionalSettings(){
    if(!promotional)return;
    setAction("promo-settings");
    try{
      const settings=await browserApiRequest<PromotionalCreditSummary["settings"]>("/api/admin/finances/promotional-credits/settings",{
        method:"PUT",body:JSON.stringify(promotional.settings),
      });
      setPromotional({...promotional,settings}); toast.success("Política promocional guardada.");
    }catch(error){toast.error(error instanceof Error?error.message:"No fue posible guardar la política promocional.");}
    finally{setAction(null);}
  }

  async function openPromotionalGrant(){
    setPromoGrantOpen(true);
    if(promoUsers.length)return;
    try{setPromoUsers(await browserApiRequest<AdminUser[]>("/api/admin/users?skip=0&limit=100&include_deleted=false"));}
    catch(error){toast.error(error instanceof Error?error.message:"No fue posible cargar los usuarios.");}
  }

  async function grantPromotionalTokens(){
    const tokens=Number(promoGrantTokens);
    if(!promoSelectedUser||!Number.isInteger(tokens)||tokens<=0){toast.error("Selecciona un usuario y una cantidad válida.");return;}
    setAction("promo-grant");
    try{
      const result=await browserApiRequest<PromotionalGrantResult>("/api/admin/finances/promotional-credits/grants",{
        method:"POST",body:JSON.stringify({user_id:promoSelectedUser.id,tokens,provider:promoGrantProvider}),
      });
      toast.success(`${result.granted_tokens} token(s) promocionales asignados.`);
      setPromoGrantOpen(false);setPromoSelectedUser(null);setPromoGrantTokens("");void load();
    }catch(error){toast.error(error instanceof Error?error.message:"No fue posible asignar los tokens promocionales.");}
    finally{setAction(null);}
  }

  async function registerOperationalExpense(){
    const value=Number(operationalAmount);
    if(!Number.isFinite(value)||value<=0){toast.error("Escribe un gasto operativo válido.");return;}
    if(!operationalCategory.trim()||!operationalConcept.trim()){toast.error("Completa categoría y concepto.");return;}
    if(!confirm(`Registrar gasto operativo por ${money(value)}?`))return;
    setAction("operational-expense");
    try{
      await browserApiRequest<OperationalExpense>("/api/admin/finances/operational-expenses",{
        method:"POST",body:JSON.stringify({
          amount_usd:value,category:operationalCategory.trim(),beneficiary:operationalBeneficiary||null,
          concept:operationalConcept.trim(),method:operationalMethod||null,
        }),
      });
      toast.success("Gasto registrado únicamente contra la Caja Operativa.");
      setOperationalAmount("");void load();
    }catch(error){toast.error(error instanceof Error?error.message:"No fue posible registrar el gasto operativo.");}
    finally{setAction(null);}
  }

  async function reconcile(){
    if(!detail?.purchase_id)return;
    setAction("reconcile");
    try{
      await browserApiRequest(`/api/admin/token-purchases/${detail.purchase_id}/reconcile`,{
        method:"POST",
        body:JSON.stringify({force:false}),
      });
      toast.success("Pago conciliado con Stripe.");
      setDetail(await browserApiRequest<BagDetail>(`/api/admin/finances/token-bags/${detail.bag.id}`));
      void load();
    }catch(error){
      toast.error(error instanceof Error?error.message:"No fue posible conciliar.");
    }finally{
      setAction(null);
    }
  }

  async function refund(){
    if(!detail?.purchase_id||!detail.bag.refundable)return;
    if(!confirm("Esta operación reembolsará la compra y retirará los tokens de la bolsa. ¿Continuar?"))return;
    setAction("refund");
    try{
      await browserApiRequest(`/api/admin/token-purchases/${detail.purchase_id}/refund`,{
        method:"POST",
        body:JSON.stringify({
          amount:null,
          reason:"requested_by_customer",
          remove_tokens:true,
        }),
      });
      toast.success("Reembolso solicitado correctamente.");
      setDetail(null);
      void load();
    }catch(error){
      toast.error(error instanceof Error?error.message:"No fue posible reembolsar.");
    }finally{
      setAction(null);
    }
  }

  async function simulateExpiration(){
    if(!detail||!expiry.simulation_enabled)return;
    if(!confirm(`Esta prueba hará vencer realmente la bolsa #${detail.bag.id} y eliminará sus ${detail.bag.remaining_tokens} tokens restantes. ¿Continuar?`))return;
    setAction("simulate-expiration");
    try{
      const result=await browserApiRequest<ExpirationSimulationResult>(
        `/api/admin/finances/token-bags/${detail.bag.id}/simulate-expiration`,
        {method:"POST",body:JSON.stringify({confirm:true})},
      );
      const providers=Object.entries(result.provider_credit_released_by_provider||{})
        .filter(([,value])=>Number(value)>0)
        .map(([provider,value])=>`${provider}: ${money(value)}`)
        .join(" · ");
      toast.success(
        result.promotional_credit_returned_usd>0
          ? `${result.expired_tokens} tokens promocionales vencieron. ${money(result.promotional_credit_returned_usd)} regresó a la caja promocional y USD 0 pasó a utilidad.`
          : `${result.expired_tokens} tokens vencieron. ${money(result.infrastructure_cash_released_usd)} pasó a utilidad`
            + (result.provider_credit_released_usd>0
              ? ` y ${money(result.provider_credit_released_usd)} quedó como crédito fondeado${providers?` (${providers})`:""}.`
              : "."),
      );
      setDetail(await browserApiRequest<BagDetail>(`/api/admin/finances/token-bags/${detail.bag.id}`));
      void load();
    }catch(error){
      toast.error(error instanceof Error?error.message:"No fue posible simular el vencimiento.");
    }finally{
      setAction(null);
    }
  }

  return <main className="space-y-6">
    <section className="luxia-panel rounded-3xl p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-emerald-400">Dinero de la empresa</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Utilidad e infraestructura, sin mezclar</h1>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-zinc-500">
            La caja verde conserva la utilidad. La caja de IA registra el dinero cobrado para infraestructura,
            lo que sigue en banco y lo que ya fue fondeado a cada proveedor.
          </p>
        </div>
        <button onClick={()=>void load()} className="rounded-xl border border-white/10 p-3 text-zinc-400 hover:text-white">
          <RefreshCcw size={18}/>
        </button>
      </div>
    </section>

    {loading
      ? <div className="luxia-panel rounded-3xl p-10 text-center text-zinc-500">Calculando las cajas…</div>
      : summary&&<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map(({label,value,icon:Icon,className,help})=>
          <article key={label} className="luxia-panel rounded-3xl p-5">
            <Icon className={className} size={20}/>
            <p className="mt-5 text-xs uppercase tracking-widest text-zinc-600">{label}</p>
            <p className={`mt-2 text-2xl font-semibold ${className}`}>{money(value)}</p>
            <p className="mt-3 text-xs leading-5 text-zinc-600">{help}</p>
          </article>,
        )}
      </section>}

    {promotional&&<section className="luxia-panel rounded-3xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-fuchsia-300">Infraestructura patrocinada</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Créditos promocionales</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
            Dinero o crédito gratuito aportado por proveedores para financiar tokens sin ganancia. No entra a Caja verde ni a la Caja IA comercial.
          </p>
        </div>
        <div className="text-right"><p className="text-xs text-zinc-600">Disponible</p><p className="mt-1 text-2xl font-semibold text-fuchsia-300">{money(promotional.total_available_usd)}</p><p className="mt-1 text-xs text-zinc-600">Crédito promocional reservado: {money(promotional.reserve_per_token_usd)} / token</p><p className="mt-1 text-xs text-zinc-700">La regla de generación conserva {money(promotional.generation_infrastructure_reserve_per_token_usd)} de capacidad IA por token; el crédito promocional no utilizado regresa a esta caja.</p></div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {promotional.provider_balances.map(item=><article key={item.provider} className="rounded-2xl border border-white/6 bg-black/20 p-4"><p className="text-xs font-semibold uppercase text-fuchsia-300">{item.provider}</p><p className="mt-3 text-xl font-semibold text-white">{money(item.available_usd)}</p><p className="mt-1 text-xs text-zinc-600">≈ {item.available_tokens} tokens financiables</p></article>)}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/6 p-5">
          <h3 className="font-semibold text-white">Agregar crédito gratuito</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input value={promoFundAmount} onChange={e=>setPromoFundAmount(e.target.value)} type="number" min="0" step="0.01" placeholder="USD" className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white"/>
            <select value={promoFundProvider} onChange={e=>setPromoFundProvider(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white"><option value="modal">Modal</option><option value="runpod">RunPod</option><option value="beam">Beam</option><option value="general">General</option></select>
            <input value={promoFundReference} onChange={e=>setPromoFundReference(e.target.value)} placeholder="Referencia opcional" className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white"/>
            <input value={promoFundDescription} onChange={e=>setPromoFundDescription(e.target.value)} placeholder="Concepto" className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white"/>
          </div>
          <button disabled={action!==null} onClick={()=>void addPromotionalFund()} className="mt-4 rounded-xl bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Registrar crédito</button>
        </div>

        <div className="rounded-2xl border border-white/6 p-5">
          <h3 className="font-semibold text-white">Política de entrega</h3>
          <div className="mt-4 space-y-4 text-sm">
            <label className="flex items-center justify-between gap-4 text-zinc-300"><span>Dar tokens al registrarse</span><input type="checkbox" checked={promotional.settings.signup_enabled} onChange={e=>setPromotional({...promotional,settings:{...promotional.settings,signup_enabled:e.target.checked}})}/></label>
            <label className="block text-zinc-400"><span>Tokens por nuevo usuario</span><input type="number" min="0" value={promotional.settings.signup_tokens} onChange={e=>setPromotional({...promotional,settings:{...promotional.settings,signup_tokens:Number(e.target.value)||0}})} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white"/></label>
            <label className="block text-zinc-400"><span>Proveedor que respalda el bono</span><select value={promotional.settings.signup_provider} onChange={e=>setPromotional({...promotional,settings:{...promotional.settings,signup_provider:e.target.value}})} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white"><option value="modal">Modal</option><option value="runpod">RunPod</option><option value="beam">Beam</option><option value="general">General</option></select></label>
            <label className="flex items-start justify-between gap-4 text-zinc-300"><span><b>Permitir promocionales para deudas anteriores</b><small className="mt-1 block max-w-md text-zinc-600">Apagado por defecto: los tokens gratis sirven para generaciones nuevas, pero no para desbloquear resultados que ya debían tokens.</small></span><input type="checkbox" checked={promotional.settings.allow_pending_settlement} onChange={e=>setPromotional({...promotional,settings:{...promotional.settings,allow_pending_settlement:e.target.checked}})}/></label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3"><button disabled={action!==null} onClick={()=>void savePromotionalSettings()} className="rounded-xl border border-fuchsia-500/30 px-4 py-2 text-sm text-fuchsia-200 disabled:opacity-40">Guardar política</button><button onClick={()=>void openPromotionalGrant()} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white"><UserPlus size={15}/>Asignar a usuario</button></div>
        </div>
      </div>

      {promotional.grants.length>0&&<div className="mt-6 overflow-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="text-xs uppercase text-zinc-600"><tr><th className="p-3">Usuario</th><th>Tokens</th><th>Proveedor</th><th>Reserva utilizada</th><th>Tipo</th><th>Fecha</th></tr></thead><tbody>{promotional.grants.slice(0,20).map(grant=><tr key={grant.id} className="border-t border-white/5"><td className="p-3 text-zinc-300">{grant.user_email||`#${grant.user_id}`}</td><td>{grant.tokens_granted}</td><td className="uppercase">{promotional.funds.find(f=>f.id===grant.fund_id)?.provider||"—"}</td><td>{money(grant.amount_reserved_usd)}</td><td>{grant.grant_type}</td><td className="text-xs text-zinc-600">{date(grant.created_at)}</td></tr>)}</tbody></table></div>}
    </section>}

    {pendingRecoveries&&pendingRecoveries.items.length>0&&
      <section className="luxia-panel rounded-3xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-orange-300">Cobros por recuperar</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Pérdidas pendientes</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
              Son generaciones ya producidas cuyo ajuste final todavía no fue cobrado. La infraestructura pendiente es un costo real ya incurrido; la ganancia pendiente es una estimación hasta conocer qué bolsas pagarán el ajuste.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-right text-xs">
            <div><span className="text-zinc-600">Infraestructura pendiente</span><b className="mt-1 block text-orange-200">{money(pendingRecoveries.summary.infrastructure_pending_usd)}</b></div>
            <div><span className="text-zinc-600">Ganancia potencial</span><b className="mt-1 block text-amber-200">{money(pendingRecoveries.summary.profit_pending_estimated_usd)}</b></div>
          </div>
        </div>
        <div className="mt-5 overflow-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-600">
              <tr>
                <th className="border-b border-white/6 px-3 py-3">Generación</th>
                <th className="border-b border-white/6 px-3 py-3">Usuario</th>
                <th className="border-b border-white/6 px-3 py-3">Proveedor</th>
                <th className="border-b border-white/6 px-3 py-3">Cobrado</th>
                <th className="border-b border-white/6 px-3 py-3">Pendiente</th>
                <th className="border-b border-white/6 px-3 py-3">Infraestructura pendiente</th>
                <th className="border-b border-white/6 px-3 py-3">Ganancia potencial</th>
                <th className="border-b border-white/6 px-3 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {pendingRecoveries.items.map(item=>
                <tr key={item.execution_id} className="border-b border-white/5 text-zinc-300">
                  <td className="px-3 py-4"><b>{item.execution_id.slice(0,8)}</b><small className="ml-2 text-zinc-600">{item.module_key}</small></td>
                  <td className="px-3 py-4">{item.user_email||`#${item.user_id??"—"}`}</td>
                  <td className="px-3 py-4 uppercase text-zinc-500">{item.provider||"—"}</td>
                  <td className="px-3 py-4">{item.tokens_charged} ✦</td>
                  <td className="px-3 py-4 font-semibold text-orange-300">+{item.pending_tokens} ✦</td>
                  <td className="px-3 py-4 text-orange-200">{money(item.infrastructure_pending_usd)}</td>
                  <td className="px-3 py-4 text-amber-200">{money(item.profit_pending_estimated_usd)}</td>
                  <td className="px-3 py-4 text-xs text-zinc-600">{date(item.created_at)}</td>
                </tr>,
              )}
            </tbody>
          </table>
        </div>
      </section>}

    {summary&&summary.provider_balances.length>0&&
      <section className="luxia-panel rounded-3xl p-6">
        <h2 className="text-lg font-semibold text-white">Saldo por proveedor</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Un proveedor puede tener crédito disponible y otro costo pendiente; el sistema no los mezcla.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summary.provider_balances.map(provider=>
            <article key={provider.provider} className="rounded-2xl border border-white/6 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">{provider.provider}</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-zinc-600">Fondeado</dt><dd className="text-zinc-200">{money(provider.funded_usd)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-zinc-600">Costo generado</dt><dd className="text-zinc-200">{money(provider.infrastructure_cost_usd)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-zinc-600">Crédito estimado</dt><dd className="text-emerald-300">{money(provider.credit_available_usd)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-zinc-600">Costo sin fondear</dt><dd className="text-amber-300">{money(provider.unfunded_cost_usd)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-zinc-600">Crédito liberado por vencimientos</dt><dd className="text-sky-300">{money(provider.released_credit_usd)}</dd></div>
              </dl>
            </article>,
          )}
        </div>
      </section>}

    <section className="grid gap-6 xl:grid-cols-2">
      <article className="luxia-panel rounded-3xl p-6">
        <h2 className="text-lg font-semibold text-white">Registrar retiro de utilidad</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Solo descuenta la caja verde. Nunca utiliza reserva ni crédito de proveedores.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <input value={amount} onChange={event=>setAmount(event.target.value)} placeholder="Importe USD" type="number" step="0.01" className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-white"/>
          <input value={beneficiary} onChange={event=>setBeneficiary(event.target.value)} placeholder="Beneficiario" className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-white"/>
          <input value={concept} onChange={event=>setConcept(event.target.value)} placeholder="Concepto" className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-white sm:col-span-2"/>
        </div>
        <button onClick={withdraw} className="mt-4 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black">
          Registrar retiro de utilidad
        </button>
        <div className="mt-6 space-y-2">
          {withdrawals.slice(0,6).map(item=>
            <div key={item.id} className="flex justify-between rounded-xl border border-white/6 p-3 text-sm">
              <span className="text-zinc-400">{item.concept}<small className="ml-2 text-zinc-700">{date(item.withdrawn_at)}</small></span>
              <b className="text-rose-300">-{money(item.amount_usd)}</b>
            </div>,
          )}
        </div>
      </article>

      <article className="luxia-panel rounded-3xl p-6">
        <h2 className="text-lg font-semibold text-white">Fondear proveedor de IA</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Descuenta únicamente la caja de infraestructura y reparte el movimiento FIFO entre las bolsas exactas.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <input value={fundingAmount} onChange={event=>setFundingAmount(event.target.value)} placeholder="Importe USD" type="number" step="0.01" className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-white"/>
          <div>
            <input list="ai-provider-options" value={fundingProvider} onChange={event=>setFundingProvider(event.target.value)} placeholder="Proveedor" className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white"/>
            <datalist id="ai-provider-options">
              <option value="modal"/>
              <option value="runpod"/>
              <option value="beam"/>
            </datalist>
          </div>
          <input value={fundingBeneficiary} onChange={event=>setFundingBeneficiary(event.target.value)} placeholder="Beneficiario o cuenta" className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-white"/>
          <input value={fundingMethod} onChange={event=>setFundingMethod(event.target.value)} placeholder="Método o referencia" className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-white"/>
          <input value={fundingConcept} onChange={event=>setFundingConcept(event.target.value)} placeholder="Concepto" className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-white sm:col-span-2"/>
        </div>
        <button disabled={action!==null} onClick={fundProvider} className="mt-4 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-black disabled:opacity-40">
          {action==="fund-provider"?"Asignando bolsas…":"Registrar fondeo FIFO"}
        </button>
        <div className="mt-6 space-y-2">
          {fundings.slice(0,6).map(item=>
            <div key={item.id} className="rounded-xl border border-white/6 p-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-zinc-400">{item.provider} · {item.concept}</span>
                <b className="text-sky-300">-{money(item.amount_usd)}</b>
              </div>
              <p className="mt-2 text-xs text-zinc-700">
                {date(item.funded_at)} · {item.allocations.length} bolsa(s): {item.allocations.map(row=>`#${row.lot_id} ${money(row.amount_usd)}`).join(" · ")}
              </p>
            </div>,
          )}
        </div>
      </article>
    </section>

    {operational&&<section className="luxia-panel rounded-3xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fuchsia-400">Caja operativa</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Hosting, correo, dominios y gastos del negocio</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
            Se alimenta únicamente del componente operativo congelado en cada bolsa. No usa Caja verde ni reserva IA.
          </p>
        </div>
        <div className="rounded-2xl border border-fuchsia-500/15 bg-fuchsia-950/10 px-5 py-4 text-right">
          <p className="text-xs text-zinc-600">Disponible para gastar</p>
          <p className="mt-1 text-xl font-semibold text-fuchsia-200">{money(operational.available_operational_funds_usd)}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Info label="Fondo operativo / token actual" value={money(operational.operational_reserve_per_token_usd)}/>
        <Info label="Liberado y disponible históricamente" value={money(operational.released_operational_funds_usd)}/>
        <Info label="Todavía bloqueado por reembolso" value={money(operational.blocked_operational_funds_usd)}/>
        <Info label="Gastos ya registrados" value={money(operational.spent_operational_funds_usd)}/>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
          <h3 className="font-semibold text-white">Registrar gasto operativo</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input value={operationalAmount} onChange={e=>setOperationalAmount(e.target.value)} type="number" step="0.01" placeholder="Importe USD" className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-white"/>
            <select value={operationalCategory} onChange={e=>setOperationalCategory(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-white">
              <option value="hosting">Hosting</option><option value="email">Correo</option><option value="domain">Dominio</option><option value="storage">Storage</option><option value="software">Software</option><option value="accounting">Contabilidad</option><option value="other">Otro</option>
            </select>
            <input value={operationalBeneficiary} onChange={e=>setOperationalBeneficiary(e.target.value)} placeholder="Proveedor / beneficiario" className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-white"/>
            <input value={operationalMethod} onChange={e=>setOperationalMethod(e.target.value)} placeholder="Método / referencia" className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-white"/>
            <input value={operationalConcept} onChange={e=>setOperationalConcept(e.target.value)} placeholder="Concepto" className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-white sm:col-span-2"/>
          </div>
          <button disabled={action!==null} onClick={registerOperationalExpense} className="mt-4 rounded-xl bg-fuchsia-500 px-5 py-3 text-sm font-semibold text-black disabled:opacity-40">
            {action==="operational-expense"?"Registrando…":"Registrar gasto"}
          </button>
        </div>
        <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
          <h3 className="font-semibold text-white">Últimos gastos</h3>
          <div className="mt-4 space-y-2">
            {operationalExpenses.length===0&&<p className="text-sm text-zinc-600">Todavía no hay gastos operativos registrados.</p>}
            {operationalExpenses.slice(0,8).map(item=><div key={item.id} className="rounded-xl border border-white/6 p-3 text-sm">
              <div className="flex justify-between gap-4"><span className="text-zinc-400">{item.category} · {item.concept}</span><b className="text-fuchsia-300">-{money(item.amount_usd)}</b></div>
              <p className="mt-1 text-xs text-zinc-700">{item.beneficiary||"Sin beneficiario"} · {date(item.spent_at)}</p>
            </div>)}
          </div>
        </div>
      </div>
    </section>}

    <section className="luxia-panel rounded-3xl p-6">
      <h2 className="text-lg font-semibold text-white">Cuándo vencen los tokens</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-500">
        Al vencer, solo el dinero de infraestructura que todavía sigue en caja pasa a utilidad.
        Lo ya fondeado permanece como crédito del proveedor y queda registrado por bolsa.
      </p>
      <label className="mt-5 flex items-center gap-3 text-sm text-zinc-300">
        <input type="checkbox" checked={expiry.enabled} onChange={event=>setExpiry({...expiry,enabled:event.target.checked})}/>
        Hacer que los tokens tengan fecha de vencimiento
      </label>
      <input value={expiry.days} onChange={event=>setExpiry({...expiry,days:Number(event.target.value)})} type="number" min={1} max={3650} className="mt-4 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white"/>
      <p className="mt-2 text-xs text-zinc-600">Ejemplo: 730 días = 2 años; 1095 días = 3 años.</p>
      <button onClick={saveExpiry} className="mt-4 rounded-xl border border-white/10 px-5 py-3 text-sm text-white">Guardar configuración</button>
      {expiry.simulation_enabled&&
        <p className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-200">
          Modo de prueba activo: abre una bolsa con tokens y usa “Simular vencimiento”.
          El movimiento es real, auditable y respeta sus fondeos FIFO.
        </p>}
    </section>

    <section className="luxia-panel rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Compras y bolsas de tokens</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Cada fila conserva su snapshot, descuento, reserva, fondeos y saldo pendiente de transferir.
          </p>
        </div>
        <select value={status} onChange={event=>setStatus(event.target.value)} className="h-10 rounded-xl border border-white/10 bg-black px-3 text-sm text-white">
          <option value="">Todos los estados</option>
          {Object.entries(labels).map(([value,label])=><option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      <div className="mt-5 overflow-auto">
        <table className="w-full min-w-[1750px] text-left text-sm">
          <thead className="text-xs uppercase text-zinc-600">
            <tr>
              {[
                "Bolsa","Usuario","Origen","Estado","Tokens","Pagó el cliente",
                "Ganancia base","Dinero extra","Total disponible","Reserva vigente IA",
                "Fondeado","Pendiente de fondear","Crédito liberado","Expira","Acción",
              ].map(label=><th key={label} className="border-b border-white/6 px-3 py-3">{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {bags.map(bag=><tr key={bag.id} className="border-b border-white/5 text-zinc-300">
              <td className="px-3 py-4">#{bag.id}</td>
              <td className="px-3 py-4">{bag.user_email||`#${bag.user_id}`}</td>
              <td className="px-3 py-4">{bag.source_label}</td>
              <td className="px-3 py-4">{labels[bag.status]||bag.status}</td>
              <td className="px-3 py-4">{bag.remaining_tokens}/{bag.original_tokens}</td>
              <td className="px-3 py-4">{money(bag.amount_paid_usd)}</td>
              <td className="px-3 py-4 text-emerald-200">{money(bag.commercial_profit_released_usd)}</td>
              <td className="px-3 py-4 text-amber-200">{money(bag.realized_extra_profit_usd)}</td>
              <td className="px-3 py-4 font-semibold text-emerald-300">{money(bag.total_available_from_bag_usd)}</td>
              <td className="px-3 py-4 text-cyan-300">{money(bag.protected_infrastructure_remaining_usd)}</td>
              <td className="px-3 py-4 text-violet-300">{money(bag.infrastructure_funded_usd)}</td>
              <td className="px-3 py-4 text-sky-300">{money(bag.infrastructure_unfunded_usd)}</td>
              <td className="px-3 py-4 text-blue-300">{money(bag.provider_credit_released_usd)}</td>
              <td className="max-w-[240px] px-3 py-4 text-xs leading-5">{expirationText(bag)}</td>
              <td className="px-3 py-4">
                <button onClick={()=>void openBag(bag.id)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white">Ver detalle</button>
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>

    {promoGrantOpen&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"><article className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#09090a] p-6"><header className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-widest text-fuchsia-300">Créditos promocionales</p><h2 className="mt-2 text-xl font-semibold text-white">Asignar tokens a un usuario</h2></div><button onClick={()=>setPromoGrantOpen(false)}><X className="text-zinc-400"/></button></header><input value={promoUserSearch} onChange={e=>setPromoUserSearch(e.target.value)} placeholder="Buscar por correo o nombre" className="mt-5 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white"/><div className="mt-3 max-h-52 overflow-auto rounded-xl border border-white/6">{promoUsers.filter(user=>`${user.email} ${user.full_name||""}`.toLowerCase().includes(promoUserSearch.toLowerCase())).slice(0,30).map(user=><button key={user.id} onClick={()=>setPromoSelectedUser(user)} className={`block w-full border-b border-white/5 p-3 text-left text-sm ${promoSelectedUser?.id===user.id?"bg-fuchsia-500/10 text-fuchsia-200":"text-zinc-300"}`}>{user.email}<small className="ml-2 text-zinc-600">#{user.id}</small></button>)}</div><div className="mt-4 grid gap-3 sm:grid-cols-2"><input value={promoGrantTokens} onChange={e=>setPromoGrantTokens(e.target.value)} type="number" min="1" placeholder="Tokens" className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white"/><select value={promoGrantProvider} onChange={e=>setPromoGrantProvider(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white"><option value="modal">Modal</option><option value="runpod">RunPod</option><option value="beam">Beam</option><option value="general">General</option></select></div><p className="mt-3 text-xs leading-5 text-zinc-600">La asignación manual exige respaldo completo. Si la caja elegida no alcanza, no se crea ningún token.</p><button disabled={action!==null||!promoSelectedUser} onClick={()=>void grantPromotionalTokens()} className="mt-5 rounded-xl bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"><Gift className="mr-2 inline" size={15}/>Asignar tokens</button></article></div>}

    {detail&&
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <article className="max-h-[94vh] w-full max-w-6xl overflow-auto rounded-3xl border border-white/10 bg-[#09090a] p-6">
          <header className="flex justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-sky-400">Bolsa #{detail.bag.id}</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{detail.bag.source_label}</h2>
            </div>
            <button onClick={()=>setDetail(null)}><X className="text-zinc-400"/></button>
          </header>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Dinero pagado por el cliente",detail.bag.amount_paid_usd],
              ["Ganancia base de la compra",detail.bag.commercial_profit_total_usd],
              ["Ganancia base ya disponible",detail.bag.commercial_profit_released_usd],
              ["Dinero extra ya confirmado",detail.bag.realized_extra_profit_usd],
              ["Total que puedes retirar de esta bolsa",detail.bag.total_available_from_bag_usd],
              ["Reserva de tokens vigentes",detail.bag.protected_infrastructure_remaining_usd],
              ["Costo atribuido a proveedores",detail.bag.infrastructure_used_usd],
              ["Fondeado desde esta bolsa",detail.bag.infrastructure_funded_usd],
              ["Pendiente de transferir desde esta bolsa",detail.bag.infrastructure_unfunded_usd],
              ["Crédito liberado por vencimiento",detail.bag.provider_credit_released_usd],
              ["Precio real pagado por token",detail.bag.effective_token_value_usd],
              ["Fondo operativo congelado por token",detail.bag.operational_reserve_per_token_usd],
              ["Fondo operativo total de la bolsa",detail.bag.operational_reserve_total_usd],
              ["Fondo operativo ya liberado",detail.bag.operational_reserve_released_usd],
              ["Ganancia normal por token",detail.bag.normal_profit_per_token_usd],
              ["Ganancia real por token",detail.bag.effective_profit_per_token_usd],
              ["Parte de cada token apartada para IA",detail.bag.infrastructure_capacity_per_token_usd],
              ["Dinero extra por redondeo disponible",detail.bag.rounding_surplus_usd],
              ["Redondeo retenido como crédito de proveedor",detail.bag.provider_rounding_credit_usd],
            ].map(([label,value])=>
              <div key={String(label)} className="rounded-2xl border border-white/6 p-4">
                <p className="text-xs text-zinc-600">{String(label)}</p>
                <p className="mt-2 font-semibold text-white">{money(Number(value))}</p>
              </div>,
            )}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Info label="Cómo se compró" value={detail.bag.source_label}/>
            <Info label="Beneficio aplicado" value={detail.bag.profit_discount_percent>0?`${detail.bag.profit_discount_percent.toFixed(2)} %${detail.bag.benefit_label?` · ${detail.bag.benefit_label}`:""}`:"Sin descuento"}/>
            <Info label="Cupón" value={detail.bag.coupon_code||"No se utilizó"}/>
            <Info label="Plan o paquete" value={detail.bag.plan_name||detail.bag.package_name||"Compra libre"}/>
            <Info label="Snapshot financiero" value={`v${detail.bag.snapshot_version||1} · ${detail.bag.snapshot_source||"histórico"}`}/>
            <Info label="Estado del pago" value={detail.bag.payment_status||"Sin estado"}/>
            <Info label="Tokens utilizados" value={`${detail.bag.consumed_tokens} de ${detail.bag.original_tokens}`}/>
            <Info label={expirationLabel(detail.bag)} value={expirationText(detail.bag)}/>
          </div>

          <div className="mt-4 rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4 text-sm leading-6 text-zinc-400">
            <b className="text-emerald-300">Así cuadra esta bolsa:</b>{" "}
            el descuento solo modifica su ganancia. La reserva congelada conserva su trazabilidad.
            Los fondeos se asignan FIFO a esta bolsa y, al vencer, solo el efectivo no transferido pasa a utilidad;
            el resto permanece como crédito del proveedor.
          </div>

          <div className="mt-6 rounded-2xl border border-white/6 p-4">
            <p className="text-sm text-zinc-400">¿Se puede devolver esta compra?</p>
            <p className={`mt-2 font-semibold ${detail.bag.refundable?"text-emerald-300":"text-amber-300"}`}>{detail.bag.refund_reason}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button disabled={!detail.purchase_id||action!==null} onClick={reconcile} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white disabled:opacity-40">
                <RotateCcw size={15}/>Conciliar con Stripe
              </button>
              <button disabled={!detail.bag.refundable||!detail.purchase_id||action!==null} onClick={refund} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
                Reembolsar
              </button>
              {expiry.simulation_enabled&&detail.bag.remaining_tokens>0&&!["expired","refunded"].includes(detail.bag.status)&&
                <button disabled={action!==null} onClick={simulateExpiration} className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200 disabled:opacity-40">
                  {action==="simulate-expiration"?"Expirando…":"Simular vencimiento"}
                </button>}
            </div>
          </div>

          <h3 className="mt-7 font-semibold text-white">En qué generaciones se usaron estos tokens</h3>
          <div className="mt-3 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-zinc-600">
                <tr>
                  <th className="p-2 text-left">Generación</th>
                  <th>Tokens</th>
                  <th>Parte atribuida al proveedor</th>
                  <th>Ganancia de esta bolsa</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {detail.generations.map((generation,index)=>
                  <tr key={`${generation.execution_id}-${index}`} className="border-t border-white/5">
                    <td className="p-2 text-zinc-300">{generation.execution_id.slice(0,8)}</td>
                    <td className="text-center">{generation.tokens_used}</td>
                    <td className="text-center">{money(generation.infrastructure_cost_usd)}</td>
                    <td className="text-center">{money(generation.company_profit_usd)}</td>
                    <td className="text-center">{date(generation.created_at)}</td>
                  </tr>,
                )}
              </tbody>
            </table>
          </div>
        </article>
      </div>}
  </main>;
}
