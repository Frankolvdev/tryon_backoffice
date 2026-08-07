"use client";

import {useCallback,useEffect,useState,type ReactNode} from "react";
import {createPortal} from "react-dom";
import {
  Banknote,
  Boxes,
  CircleDollarSign,
  CircleHelp,
  ChevronDown,
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

const sourceNames:Record<string,string>={
  stripe_token_purchase:"Compra directa",
  subscription_period_grant:"Plan / suscripción",
  promotional_credit:"Tokens gratis",
  admin_grant:"Asignación manual",
  free_signup:"Regalo de bienvenida",
};

function sourceText(value?:string|null){
  if(!value)return "—";
  if(sourceNames[value])return sourceNames[value];
  if(!value.includes("_"))return value;
  const readable=value.replaceAll("_"," ");
  return readable.charAt(0).toUpperCase()+readable.slice(1);
}

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


function HelpTip({text}:{text:string}){
  const [open,setOpen]=useState(false);
  const [pinned,setPinned]=useState(false);
  const [position,setPosition]=useState({top:0,left:0,above:false});

  function place(target:HTMLElement){
    const rect=target.getBoundingClientRect();
    const tooltipWidth=288;
    const left=Math.min(
      Math.max(12,rect.left+(rect.width/2)-(tooltipWidth/2)),
      Math.max(12,window.innerWidth-tooltipWidth-12),
    );
    const above=rect.bottom+170>window.innerHeight;
    setPosition({
      left,
      top:above?rect.top-10:rect.bottom+10,
      above,
    });
  }

  function show(target:HTMLElement){
    place(target);
    setOpen(true);
  }

  function hide(){
    if(!pinned)setOpen(false);
  }

  const tooltip=open&&typeof document!=="undefined"
    ? createPortal(
      <div
        role="tooltip"
        style={{
          position:"fixed",
          left:position.left,
          top:position.top,
          transform:position.above?"translateY(-100%)":"none",
          width:288,
        }}
        className="pointer-events-none z-[9999] rounded-xl border border-white/15 bg-zinc-950 px-3 py-2.5 text-left text-xs font-normal normal-case leading-5 tracking-normal text-zinc-200 shadow-2xl"
      >
        {text}
      </div>,
      document.body,
    )
    : null;

  return <>
    <button
      type="button"
      aria-label={`Ayuda: ${text}`}
      aria-expanded={open}
      className="ml-1 inline-flex size-5 shrink-0 cursor-help items-center justify-center rounded-full text-zinc-500 outline-none transition hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white"
      onMouseEnter={event=>show(event.currentTarget)}
      onMouseLeave={hide}
      onFocus={event=>show(event.currentTarget)}
      onBlur={hide}
      onClick={event=>{
        event.preventDefault();
        event.stopPropagation();
        place(event.currentTarget);
        setPinned(current=>{
          const next=!current;
          setOpen(next);
          return next;
        });
      }}
    >
      <CircleHelp size={14}/>
    </button>
    {tooltip}
  </>;
}

function AccordionSection({
  title,
  description,
  children,
  defaultOpen=false,
}:{title:string;description:string;children?:ReactNode;defaultOpen?:boolean}){
  return <details open={defaultOpen} className="group luxia-panel overflow-visible rounded-3xl">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 [&::-webkit-details-marker]:hidden">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">{description}</p>
      </div>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/8 text-zinc-500 transition group-open:text-white">
        <ChevronDown size={18} className="transition-transform duration-200 group-open:rotate-180"/>
      </div>
    </summary>
    <div className="border-t border-white/6 p-6">
      {children}
    </div>
  </details>;
}

const metricHelp:Record<string,string>={
  "Ganancia que ya está disponible":"Parte de tu ganancia que ya puedes contar como disponible.",
  "Dinero extra ya confirmado":"Ahorros o redondeos ya confirmados después de pagar el costo real de infraestructura.",
  "Respaldo IA de tokens que quedan":"Dato de control: cuánto respaldo de IA corresponde a los tokens que todavía quedan en esta bolsa. No es una caja adicional.",
  "Costo real de IA generado":"Lo que las generaciones hechas con esta bolsa ya costaron realmente en IA.",
  "Dinero enviado al proveedor desde esta bolsa":"Dinero de esta bolsa que ya registraste como enviado a Modal, RunPod, Beam u otro proveedor.",
  "Dinero de IA que aún tienes en caja":"Dinero de esta bolsa que todavía está contigo y puedes enviar a Modal, RunPod, Beam u otro proveedor.",
  "Dinero que quedó dentro del proveedor":"Parte del dinero que ya habías enviado a Modal, RunPod o Beam y que, al vencer tokens, ya no pudo regresar a tu caja. No es dinero nuevo ni dinero que puedas retirar.",
  "Extra para gastos por token":"Lo extra que se cobró por cada token de esta bolsa para pagar hosting, correo, dominios y otros gastos.",
  "Extra total para gastos":"Total que esta bolsa separó para los gastos del negocio.",
  "Extra para gastos ya disponible":"Parte del fondo de gastos de esta bolsa que ya dejó de estar bloqueada por reembolso.",
  "IA protegida por cada token":"Dinero de IA protegido por cada token. Los descuentos salen de tu ganancia y no reducen esta parte.",
};

const bagTableHelp:Record<string,string>={
  "Bolsa":"Identificador de este grupo de tokens. Cada compra, plan o regalo crea su propia bolsa.",
  "Usuario":"Persona dueña de estos tokens.",
  "Origen":"De dónde salieron los tokens: compra directa, plan, promoción u otra acreditación.",
  "Estado":"Activa = todavía tiene tokens. Agotada = ya los gastó todos. Expirada = quedaron tokens sin usar y vencieron. Reembolsada = se devolvió la compra.",
  "Tokens":"Muestra cuántos quedan de los que tenía originalmente. Ejemplo: 80/100 significa que todavía puede gastar 80.",
  "Pagó el cliente":"Lo que realmente pagó el cliente por esta bolsa, después de descuentos o beneficios.",
  "Ganancia":"Tu ganancia de esta bolsa según las condiciones con las que se vendió. Si hubo descuento, se descuenta de aquí.",
  "Dinero extra":"Dinero que terminó sobrando a tu favor, por ejemplo por redondeos o porque el costo real de IA fue un poco menor.",
  "Disponible para ti":"Lo que esta bolsa ya aportó a tu dinero libre. Es ganancia más extras ya confirmados.",
  "IA aún en tu caja":"Dinero de esta bolsa destinado a IA que todavía no has enviado físicamente a Modal, RunPod, Beam u otro proveedor.",
  "IA ya enviada":"Dinero de esta bolsa que ya registraste como enviado físicamente a un proveedor de IA.",
  "Vencimiento":"Indica cuándo vence o venció la bolsa. Si se agotó antes, conserva la fecha original solo como historial.",
  "Acción":"Abre todos los detalles financieros de esta bolsa.",
};

function BagTableHead({label}:{label:string}){
  return <th className="border-b border-white/6 px-3 py-3 align-top">
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      {label}<HelpTip text={bagTableHelp[label]||"Información de esta columna."}/>
    </span>
  </th>;
}


function Info({label,value,help}:{label:string;value:string;help?:string}){
  return <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
    <p className="flex items-center text-xs text-zinc-600">{label}{help&&<HelpTip text={help}/>}</p>
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
  const [operationalConcept,setOperationalConcept]=useState("Gasto del negocio");
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
  const [fundingConcept,setFundingConcept]=useState("Transferencia para infraestructura");
  const [fundingMethod,setFundingMethod]=useState("");

  const [action,setAction]=useState<string|null>(null);

  const summaryCards:Array<{
    label:string;
    value:number;
    icon:LucideIcon;
    className:string;
    panelClassName:string;
    help:string;
  }>=summary?[
    {
      label:"Dinero libre para ti",
      value:summary.available_usd,
      icon:WalletCards,
      className:"text-emerald-300",
      panelClassName:"border-emerald-500/20 bg-emerald-500/[0.045]",
      help:"Dinero que ya puedes usar o retirar. No incluye dinero destinado a IA ni importes que ya mandaste a proveedores.",
    },
    {
      label:"IA aún en tu caja",
      value:summary.infrastructure_cash_available_usd,
      icon:ShieldCheck,
      className:"text-sky-300",
      panelClassName:"border-sky-500/25 bg-sky-500/[0.055]",
      help:"Dinero destinado a pagar IA que todavía está contigo. Puedes enviarlo a Modal, RunPod, Beam u otro proveedor.",
    },
    {
      label:"IA ya enviada",
      value:summary.infrastructure_funded_usd,
      icon:ServerCog,
      className:"text-violet-300",
      panelClassName:"border-violet-500/20 bg-violet-500/[0.045]",
      help:"Dinero que ya registraste como enviado físicamente a Modal, RunPod, Beam u otros proveedores.",
    },
    {
      label:"Cobros pendientes",
      value:summary.pending_recovery_economic_estimated_usd,
      icon:CircleDollarSign,
      className:"text-orange-300",
      panelClassName:"border-orange-500/20 bg-orange-500/[0.045]",
      help:`${summary.pending_recovery_generations} generación(es) bloqueada(s) · ${summary.pending_recovery_tokens} token(s) por recuperar. Incluye infraestructura pendiente exacta y ganancia potencial estimada.`,
    },
    {
      label:"Ganancia todavía en espera",
      value:summary.blocked_profit_usd,
      icon:Boxes,
      className:"text-amber-300",
      panelClassName:"border-amber-500/20 bg-amber-500/[0.045]",
      help:"Ganancia de compras que todavía sigue bloqueada por las reglas de reembolso. Aún no la cuentes como dinero libre.",
    },
    {
      label:"Dinero ya retirado",
      value:summary.withdrawals_usd,
      icon:Banknote,
      className:"text-rose-300",
      panelClassName:"border-rose-500/20 bg-rose-500/[0.045]",
      help:"Retiros de utilidad. No incluye transferencias hechas a proveedores de IA.",
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
    if(!confirm(`Registrar transferencia de ${money(value)} a ${provider}? El sistema la repartirá automáticamente entre las bolsas correspondientes.`))return;
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
        `Transferencia registrada y repartida entre ${result.allocations.length} bolsa(s).`,
      );
      setFundingAmount("");
      void load();
    }catch(error){
      toast.error(error instanceof Error?error.message:"No fue posible registrar la transferencia.");
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
    if(!Number.isFinite(value)||value<=0){toast.error("Escribe un importe válido.");return;}
    if(!operationalCategory.trim()||!operationalConcept.trim()){toast.error("Completa categoría y concepto.");return;}
    if(!confirm(`Registrar gasto del negocio por ${money(value)}?`))return;
    setAction("operational-expense");
    try{
      await browserApiRequest<OperationalExpense>("/api/admin/finances/operational-expenses",{
        method:"POST",body:JSON.stringify({
          amount_usd:value,category:operationalCategory.trim(),beneficiary:operationalBeneficiary||null,
          concept:operationalConcept.trim(),method:operationalMethod||null,
        }),
      });
      toast.success("Gasto registrado. Solo se descontó del dinero para gastos del negocio.");
      setOperationalAmount("");void load();
    }catch(error){toast.error(error instanceof Error?error.message:"No fue posible registrar el gasto.");}
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
              ? ` y ${money(result.provider_credit_released_usd)} quedó dentro del proveedor y no regresó a tu caja${providers?` (${providers})`:""}.`
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
          <h1 className="mt-2 text-2xl font-semibold text-white">Tu dinero, separado y fácil de revisar</h1>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-zinc-500">
            Arriba ves lo importante de un vistazo. Debajo puedes abrir compras, dinero para IA, tokens gratis, gastos y vencimientos por separado.
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
        {summaryCards.map(({label,value,icon:Icon,className,panelClassName,help})=>
          <article key={label} className={`luxia-panel rounded-3xl border p-5 ${panelClassName}`}>
            <Icon className={className} size={20}/>
            <p className="mt-5 text-xs uppercase tracking-widest text-zinc-600">{label}</p>
            <p className={`mt-2 text-2xl font-semibold ${className}`}>{money(value)}</p>
            <p className="mt-3 text-xs leading-5 text-zinc-600">{help}</p>
          </article>,
        )}
      </section>}

    {promotional&&<AccordionSection title="Promociones y tokens gratis" description="Controla el dinero que respalda los tokens gratis y decide cuántos regalar y a quién."><section className="rounded-2xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-fuchsia-300">Tokens gratis respaldados</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Dinero para tokens gratis</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
            Aquí registras el dinero o crédito que usarás para regalar tokens. Esos tokens no generan ganancia ni gastos operativos.
          </p>
        </div>
        <div className="text-right"><p className="text-xs text-zinc-600">Disponible</p><p className="mt-1 text-2xl font-semibold text-fuchsia-300">{money(promotional.total_available_usd)}</p><p className="mt-1 text-xs text-zinc-600">Dinero apartado por token gratis: {money(promotional.reserve_per_token_usd)} / token</p><p className="mt-1 text-xs text-zinc-700">La regla de generación conserva {money(promotional.generation_infrastructure_reserve_per_token_usd)} de capacidad IA por token; el crédito promocional no utilizado regresa a esta caja.</p></div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {promotional.provider_balances.map(item=><article key={item.provider} className="rounded-2xl border border-white/6 bg-black/20 p-4"><p className="text-xs font-semibold uppercase text-fuchsia-300">{item.provider}</p><p className="mt-3 text-xl font-semibold text-white">{money(item.available_usd)}</p><p className="mt-1 text-xs text-zinc-600">≈ {item.available_tokens} tokens que puedes regalar</p></article>)}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/6 p-5">
          <h3 className="font-semibold text-white">Agregar dinero para tokens gratis</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input value={promoFundAmount} onChange={e=>setPromoFundAmount(e.target.value)} type="number" min="0" step="0.01" placeholder="USD" className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white"/>
            <select value={promoFundProvider} onChange={e=>setPromoFundProvider(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white"><option value="modal">Modal</option><option value="runpod">RunPod</option><option value="beam">Beam</option><option value="general">General</option></select>
            <input value={promoFundReference} onChange={e=>setPromoFundReference(e.target.value)} placeholder="Referencia opcional" className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white"/>
            <input value={promoFundDescription} onChange={e=>setPromoFundDescription(e.target.value)} placeholder="Concepto" className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white"/>
          </div>
          <button disabled={action!==null} onClick={()=>void addPromotionalFund()} className="mt-4 rounded-xl bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Agregar dinero</button>
        </div>

        <div className="rounded-2xl border border-white/6 p-5">
          <h3 className="font-semibold text-white">Cómo se reparten los tokens gratis</h3>
          <div className="mt-4 space-y-4 text-sm">
            <label className="flex items-center justify-between gap-4 text-zinc-300"><span>Dar tokens al registrarse</span><input type="checkbox" checked={promotional.settings.signup_enabled} onChange={e=>setPromotional({...promotional,settings:{...promotional.settings,signup_enabled:e.target.checked}})}/></label>
            <label className="block text-zinc-400"><span>Tokens por nuevo usuario</span><input type="number" min="0" value={promotional.settings.signup_tokens} onChange={e=>setPromotional({...promotional,settings:{...promotional.settings,signup_tokens:Number(e.target.value)||0}})} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white"/></label>
            <label className="block text-zinc-400"><span>De qué proveedor sale el dinero</span><select value={promotional.settings.signup_provider} onChange={e=>setPromotional({...promotional,settings:{...promotional.settings,signup_provider:e.target.value}})} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white"><option value="modal">Modal</option><option value="runpod">RunPod</option><option value="beam">Beam</option><option value="general">General</option></select></label>
            <label className="flex items-start justify-between gap-4 text-zinc-300"><span><b>Permitir promocionales para deudas anteriores</b><small className="mt-1 block max-w-md text-zinc-600">Apagado por defecto: los tokens gratis sirven para generaciones nuevas, pero no para desbloquear resultados que ya debían tokens.</small></span><input type="checkbox" checked={promotional.settings.allow_pending_settlement} onChange={e=>setPromotional({...promotional,settings:{...promotional.settings,allow_pending_settlement:e.target.checked}})}/></label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3"><button disabled={action!==null} onClick={()=>void savePromotionalSettings()} className="rounded-xl border border-fuchsia-500/30 px-4 py-2 text-sm text-fuchsia-200 disabled:opacity-40">Guardar política</button><button onClick={()=>void openPromotionalGrant()} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white"><UserPlus size={15}/>Asignar a usuario</button></div>
        </div>
      </div>

      {promotional.grants.length>0&&<div className="mt-6 overflow-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="text-xs uppercase text-zinc-600"><tr><th className="p-3">Usuario</th><th>Tokens</th><th>Proveedor</th><th>Dinero usado</th><th>Tipo</th><th>Fecha</th></tr></thead><tbody>{promotional.grants.slice(0,20).map(grant=><tr key={grant.id} className="border-t border-white/5"><td className="p-3 text-zinc-300">{grant.user_email||`#${grant.user_id}`}</td><td>{grant.tokens_granted}</td><td className="uppercase">{promotional.funds.find(f=>f.id===grant.fund_id)?.provider||"—"}</td><td>{money(grant.amount_reserved_usd)}</td><td>{grant.grant_type}</td><td className="text-xs text-zinc-600">{date(grant.created_at)}</td></tr>)}</tbody></table></div>}
    </section></AccordionSection>}

    {pendingRecoveries&&pendingRecoveries.items.length>0&&
      <AccordionSection title="Cobros pendientes" description="Generaciones que ya terminaron pero todavía tienen tokens por cobrar. Aquí puedes ver cuánto falta recuperar."><section className="rounded-2xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-orange-300">Cobros por recuperar</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Generaciones que todavía deben pagarse</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
              La imagen ya se generó, pero faltaron tokens para cubrir el costo final. El resultado sigue bloqueado hasta recuperar esos tokens.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-right text-xs">
            <div><span className="text-zinc-600">IA que falta recuperar</span><b className="mt-1 block text-orange-200">{money(pendingRecoveries.summary.infrastructure_pending_usd)}</b></div>
            <div><span className="text-zinc-600">Ganancia si se cobra</span><b className="mt-1 block text-amber-200">{money(pendingRecoveries.summary.profit_pending_estimated_usd)}</b></div>
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
                <th className="border-b border-white/6 px-3 py-3">IA que falta recuperar</th>
                <th className="border-b border-white/6 px-3 py-3">Ganancia si se cobra</th>
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
      </section></AccordionSection>}

    {summary&&summary.provider_balances.length>0&&
      <AccordionSection title="Dinero en proveedores de IA" description="Mira cuánto dinero registraste como enviado a Modal, RunPod o Beam y cuánto se ha usado en generaciones."><section className="rounded-2xl">
        <h2 className="text-lg font-semibold text-white">Qué pasó con el dinero enviado</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Aquí comparas lo que enviaste con el costo real de las generaciones. Los importes son registros internos; no consultan automáticamente el saldo real del proveedor.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summary.provider_balances.map(provider=>
            <article key={provider.provider} className="rounded-2xl border border-white/6 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">{provider.provider}</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4"><dt className="flex items-center text-zinc-600">Dinero enviado<HelpTip text="Todo lo que registraste como transferido físicamente a este proveedor."/></dt><dd className="text-zinc-200">{money(provider.funded_usd)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="flex items-center text-zinc-600">Costo de generaciones<HelpTip text="Lo que las generaciones realmente han costado en este proveedor según tus registros."/></dt><dd className="text-zinc-200">{money(provider.infrastructure_cost_usd)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="flex items-center text-zinc-600">Saldo estimado dentro<HelpTip text="Estimación interna: dinero enviado menos costos registrados. No consulta automáticamente la cuenta real del proveedor."/></dt><dd className="text-emerald-300">{money(provider.credit_available_usd)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="flex items-center text-zinc-600">Costo aún sin cubrir<HelpTip text="Costo de IA registrado que todavía no está cubierto por el dinero que marcaste como enviado a este proveedor."/></dt><dd className="text-amber-300">{money(provider.unfunded_cost_usd)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="flex items-center text-zinc-600">Quedó dentro al vencer<HelpTip text="Dinero que ya habías enviado al proveedor y no pudo volver a tu utilidad cuando vencieron tokens. No es dinero nuevo ni retirable."/></dt><dd className="text-sky-300">{money(provider.released_credit_usd)}</dd></div>
              </dl>
            </article>,
          )}
        </div>
      </section></AccordionSection>}

    <AccordionSection title="Sacar dinero o enviarlo a IA" description="Aquí registras dos cosas distintas: dinero que retiras para ti y dinero que mandas a Modal, RunPod, Beam u otro proveedor."><section className="grid gap-6 xl:grid-cols-2">
      <article className="luxia-panel rounded-3xl p-6">
        <h2 className="text-lg font-semibold text-white">Registrar retiro de utilidad</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Solo descuenta tu dinero libre. Nunca toma dinero destinado a IA ni dinero que ya mandaste a proveedores.
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
        <h2 className="text-lg font-semibold text-white">Enviar dinero a proveedor de IA</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Usa únicamente el dinero para IA que todavía está contigo. El sistema registra de qué bolsas salió para que después los vencimientos cuadren correctamente.
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
          {action==="fund-provider"?"Asignando bolsas…":"Registrar transferencia"}
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
    </section></AccordionSection>

    {operational&&<AccordionSection title="Gastos del negocio" description="Dinero separado para hosting, correo, dominios, storage, software y otros costos operativos."><section className="rounded-2xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fuchsia-400">Dinero para gastos</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Hosting, correo, dominios y gastos del negocio</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
            Aquí registras los pagos de hosting, correo, dominios y otros gastos. El dinero disponible proviene únicamente del extra por gastos del negocio que quedó congelado en cada bolsa.
          </p>
        </div>
        <div className="rounded-2xl border border-fuchsia-500/15 bg-fuchsia-950/10 px-5 py-4 text-right">
          <p className="text-xs text-zinc-600">Disponible para gastar</p>
          <p className="mt-1 text-xl font-semibold text-fuchsia-200">{money(operational.available_operational_funds_usd)}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Info label="Extra para gastos por token" value={money(operational.operational_reserve_per_token_usd)} help="Cantidad adicional que se cobra por cada token para formar esta caja. Se configura en la vista de precios/configuración de tokens."/>
        <Info label="Total que ya estuvo disponible" value={money(operational.released_operational_funds_usd)} help="Todo el dinero para gastos que, con el tiempo, dejó de estar bloqueado por posibles reembolsos."/>
        <Info label="Todavía reservado por posibles reembolsos" value={money(operational.blocked_operational_funds_usd)} help="Esta parte todavía no se puede gastar porque corresponde a compras que aún podrían devolverse al cliente."/>
        <Info label="Ya gastado" value={money(operational.spent_operational_funds_usd)} help="Suma de los gastos del negocio que ya registraste desde esta caja."/>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
          <h3 className="font-semibold text-white">Registrar gasto del negocio</h3>
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
            {operationalExpenses.length===0&&<p className="text-sm text-zinc-600">Todavía no hay gastos del negocio registrados.</p>}
            {operationalExpenses.slice(0,8).map(item=><div key={item.id} className="rounded-xl border border-white/6 p-3 text-sm">
              <div className="flex justify-between gap-4"><span className="text-zinc-400">{item.category} · {item.concept}</span><b className="text-fuchsia-300">-{money(item.amount_usd)}</b></div>
              <p className="mt-1 text-xs text-zinc-700">{item.beneficiary||"Sin beneficiario"} · {date(item.spent_at)}</p>
            </div>)}
          </div>
        </div>
      </div>
    </section></AccordionSection>}

    <AccordionSection title="Cuándo vencen los tokens" description="Decide si los tokens caducan. Cuando vencen, el sistema aplica automáticamente las reglas financieras de esa bolsa."><section className="rounded-2xl">
      <h2 className="text-lg font-semibold text-white">Cuándo vencen los tokens</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-500">
        Al vencer, solo el dinero para IA que todavía tienes contigo puede pasar a tu utilidad. Lo que ya habías enviado a Modal, RunPod o Beam no puede regresar a tu caja y queda registrado como dinero que permaneció dentro del proveedor.
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
          El movimiento es real, auditable y respeta las transferencias ya registradas por bolsa.
        </p>}
    </section></AccordionSection>

    <AccordionSection defaultOpen title="Compras y bolsas de tokens" description="Historial de cada grupo de tokens. Esta sección se abre por defecto porque aquí puedes comprobar de dónde salió cada peso y qué pasó con él."><section className="rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Compras y bolsas de tokens</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Cada fila resume una bolsa. Usa el botón <CircleHelp size={13} className="mx-1 inline text-zinc-500"/> de cada columna: funciona al pasar el mouse, con teclado y también al hacer clic.
          </p>
        </div>
        <select value={status} onChange={event=>setStatus(event.target.value)} className="h-10 rounded-xl border border-white/10 bg-black px-3 text-sm text-white">
          <option value="">Todos los estados</option>
          {Object.entries(labels).map(([value,label])=><option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.025] p-4">
        <div className="flex items-start gap-3">
          <CircleHelp className="mt-0.5 shrink-0 text-zinc-400" size={18}/>
          <div>
            <p className="text-sm font-semibold text-white">Cómo leer esta tabla</p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              <b className="text-emerald-300">Disponible para ti</b> es dinero ya libre para la empresa.{" "}
              <b className="text-sky-300">IA aún en tu caja</b> todavía está contigo para pagar proveedores.{" "}
              <b className="text-violet-300">IA ya enviada</b> ya salió físicamente hacia Modal, RunPod, Beam u otro proveedor.
              Los datos más técnicos quedan dentro de <b className="text-zinc-300">Ver detalle</b>.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-auto">
        <table className="w-full min-w-[1480px] text-left text-sm">
          <thead className="text-xs uppercase text-zinc-600">
            <tr>
              {[
                "Bolsa","Usuario","Origen","Estado","Tokens","Pagó el cliente",
                "Ganancia","Dinero extra","Disponible para ti",
                "IA aún en tu caja","IA ya enviada","Vencimiento","Acción",
              ].map(label=><BagTableHead key={label} label={label}/>)}
            </tr>
          </thead>
          <tbody>
            {bags.map(bag=><tr key={bag.id} className="border-b border-white/5 text-zinc-300">
              <td className="px-3 py-4">#{bag.id}</td>
              <td className="px-3 py-4">{bag.user_email||`#${bag.user_id}`}</td>
              <td className="px-3 py-4">{sourceText(bag.source_label)}</td>
              <td className="px-3 py-4">{labels[bag.status]||bag.status}</td>
              <td className="px-3 py-4">{bag.remaining_tokens}/{bag.original_tokens}</td>
              <td className="px-3 py-4">{money(bag.amount_paid_usd)}</td>
              <td className="px-3 py-4 text-emerald-200">{money(bag.commercial_profit_released_usd)}</td>
              <td className="px-3 py-4 text-amber-200">{money(bag.realized_extra_profit_usd)}</td>
              <td className="px-3 py-4 font-semibold text-emerald-300">{money(bag.total_available_from_bag_usd)}</td>
              <td className="px-3 py-4 text-sky-300">{money(bag.infrastructure_unfunded_usd)}</td>
              <td className="px-3 py-4 text-violet-300">{money(bag.infrastructure_funded_usd)}</td>
              <td className="max-w-[240px] px-3 py-4 text-xs leading-5">{expirationText(bag)}</td>
              <td className="px-3 py-4">
                <button onClick={()=>void openBag(bag.id)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white">Ver detalle</button>
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section></AccordionSection>

    {promoGrantOpen&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"><article className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#09090a] p-6"><header className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-widest text-fuchsia-300">Tokens gratis</p><h2 className="mt-2 text-xl font-semibold text-white">Asignar tokens a un usuario</h2></div><button onClick={()=>setPromoGrantOpen(false)}><X className="text-zinc-400"/></button></header><input value={promoUserSearch} onChange={e=>setPromoUserSearch(e.target.value)} placeholder="Buscar por correo o nombre" className="mt-5 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white"/><div className="mt-3 max-h-52 overflow-auto rounded-xl border border-white/6">{promoUsers.filter(user=>`${user.email} ${user.full_name||""}`.toLowerCase().includes(promoUserSearch.toLowerCase())).slice(0,30).map(user=><button key={user.id} onClick={()=>setPromoSelectedUser(user)} className={`block w-full border-b border-white/5 p-3 text-left text-sm ${promoSelectedUser?.id===user.id?"bg-fuchsia-500/10 text-fuchsia-200":"text-zinc-300"}`}>{user.email}<small className="ml-2 text-zinc-600">#{user.id}</small></button>)}</div><div className="mt-4 grid gap-3 sm:grid-cols-2"><input value={promoGrantTokens} onChange={e=>setPromoGrantTokens(e.target.value)} type="number" min="1" placeholder="Tokens" className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white"/><select value={promoGrantProvider} onChange={e=>setPromoGrantProvider(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white"><option value="modal">Modal</option><option value="runpod">RunPod</option><option value="beam">Beam</option><option value="general">General</option></select></div><p className="mt-3 text-xs leading-5 text-zinc-600">La asignación manual exige respaldo completo. Si la caja elegida no alcanza, no se crea ningún token.</p><button disabled={action!==null||!promoSelectedUser} onClick={()=>void grantPromotionalTokens()} className="mt-5 rounded-xl bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"><Gift className="mr-2 inline" size={15}/>Asignar tokens</button></article></div>}

    {detail&&
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <article className="max-h-[94vh] w-full max-w-6xl overflow-auto rounded-3xl border border-white/10 bg-[#09090a] p-6">
          <header className="flex justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-sky-400">Bolsa #{detail.bag.id}</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{sourceText(detail.bag.source_label)}</h2>
            </div>
            <button onClick={()=>setDetail(null)}><X className="text-zinc-400"/></button>
          </header>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Dinero pagado por el cliente",detail.bag.amount_paid_usd],
              ["Ganancia original de la compra",detail.bag.commercial_profit_total_usd],
              ["Ganancia que ya está disponible",detail.bag.commercial_profit_released_usd],
              ["Dinero extra ya confirmado",detail.bag.realized_extra_profit_usd],
              ["Total que puedes retirar de esta bolsa",detail.bag.total_available_from_bag_usd],
              ["Respaldo IA de tokens que quedan",detail.bag.protected_infrastructure_remaining_usd],
              ["Costo real de IA generado",detail.bag.infrastructure_used_usd],
              ["Dinero enviado al proveedor desde esta bolsa",detail.bag.infrastructure_funded_usd],
              ["Dinero de IA que aún tienes en caja",detail.bag.infrastructure_unfunded_usd],
              ["Dinero que quedó dentro del proveedor",detail.bag.provider_credit_released_usd],
              ["Precio real pagado por token",detail.bag.effective_token_value_usd],
              ["Extra para gastos por token",detail.bag.operational_reserve_per_token_usd],
              ["Extra total para gastos",detail.bag.operational_reserve_total_usd],
              ["Extra para gastos ya disponible",detail.bag.operational_reserve_released_usd],
              ["Ganancia normal por token",detail.bag.normal_profit_per_token_usd],
              ["Ganancia real por token",detail.bag.effective_profit_per_token_usd],
              ["IA protegida por cada token",detail.bag.infrastructure_capacity_per_token_usd],
              ["Extra por redondeo disponible",detail.bag.rounding_surplus_usd],
              ["Redondeo que quedó dentro del proveedor",detail.bag.provider_rounding_credit_usd],
            ].map(([label,value])=>
              <div key={String(label)} className="rounded-2xl border border-white/6 p-4">
                <p className="flex items-center text-xs text-zinc-600">{String(label)}{metricHelp[String(label)]&&<HelpTip text={metricHelp[String(label)]}/>}</p>
                <p className="mt-2 font-semibold text-white">{money(Number(value))}</p>
              </div>,
            )}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Info label="Cómo se obtuvieron estos tokens" value={sourceText(detail.bag.source_label)}/>
            <Info label="Beneficio aplicado" value={detail.bag.profit_discount_percent>0?`${detail.bag.profit_discount_percent.toFixed(2)} %${detail.bag.benefit_label?` · ${detail.bag.benefit_label}`:""}`:"Sin descuento"}/>
            <Info label="Cupón" value={detail.bag.coupon_code||"No se utilizó"}/>
            <Info label="Plan o paquete" value={detail.bag.plan_name||detail.bag.package_name||"Compra libre"}/>
            <Info label="Registro financiero congelado" value={`v${detail.bag.snapshot_version||1} · ${detail.bag.snapshot_source||"histórico"}`} help="Guarda las reglas, descuentos y valores que tenía esta bolsa al momento de crearse. Cambios futuros no modifican este registro."/>
            <Info label="Estado del pago" value={detail.bag.payment_status||"Sin estado"}/>
            <Info label="Tokens utilizados" value={`${detail.bag.consumed_tokens} de ${detail.bag.original_tokens}`}/>
            <Info label={expirationLabel(detail.bag)} value={expirationText(detail.bag)}/>
          </div>

          <div className="mt-4 rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4 text-sm leading-6 text-zinc-400">
            <b className="text-emerald-300">Así cuadra esta bolsa:</b>{" "}
            el descuento solo modifica su ganancia. La reserva congelada conserva su trazabilidad.
            Las transferencias a proveedores se asignan automáticamente a esta bolsa. Si después vencen tokens, solo el dinero que todavía seguía en tu caja puede pasar a utilidad; lo que ya estaba dentro del proveedor se registra aparte para no fingir que todavía puedes retirarlo.
          </div>

          <div className="mt-6 rounded-2xl border border-white/6 p-4">
            <p className="text-sm text-zinc-400">¿Se puede devolver esta compra?</p>
            <p className={`mt-2 font-semibold ${detail.bag.refundable?"text-emerald-300":"text-amber-300"}`}>{detail.bag.refund_reason}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button disabled={!detail.purchase_id||action!==null} onClick={reconcile} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white disabled:opacity-40">
                <RotateCcw size={15}/>Comprobar con Stripe
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
