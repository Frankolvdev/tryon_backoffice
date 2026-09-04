"use client";

import {useCallback,useEffect,useState,type ReactNode} from "react";
import {createPortal} from "react-dom";
import {
  Banknote,
  Download,
  History,
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
  PromotionalCycleWebhookResult,
  PromotionalGrantResult,
  TokenBag,
  TokenBagList,
  Withdrawal,
  CashboxMovementHistory,
  CashboxMovementKey,
} from "@/types/finance-cashbox";
import type {AdminUser} from "@/types/admin-users";

const money=(value:number)=>`USD ${Number(value||0).toFixed(6)}`;
const date=(value?:string|null)=>value
  ? new Intl.DateTimeFormat("es-MX",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value))
  : "—";
const dateOnly=(value?:string|null)=>value
  ? new Intl.DateTimeFormat("es-MX",{dateStyle:"medium",timeZone:"UTC"}).format(new Date(`${value}T00:00:00Z`))
  : "—";
const recurrenceText=(value?:string|null)=>({weekly:"Semanal",monthly:"Mensual",quarterly:"Trimestral",yearly:"Anual"}[String(value||"")]||"Mensual");

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



const movementTypeNames:Record<string,string>={
  commercial_profit_release:"Ganancia liberada",
  profitability_surplus:"Extra por rentabilidad",
  rounding_surplus:"Redondeo",
  expiration_release:"Liberación por vencimiento",
  withdrawal:"Retiro",
  provider_funding:"Envío a proveedor",
  profit_blocked:"Ganancia bloqueada",
  profit_unblocked:"Ganancia liberada de espera",
  operational_release:"Fondo operativo liberado",
  operational_expense:"Gasto operativo",
  pending_recovery:"Cobro pendiente",
  infrastructure_cash_obligation:"Reserva/obligación IA actual",
};

function xmlCell(value:string|number,type:"String"|"Number"="String"){
  const escaped=String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
  return `<Cell><Data ss:Type="${type}">${escaped}</Data></Cell>`;
}

function exportMovementHistoryToExcel(history:CashboxMovementHistory){
  const headers=["Fecha y hora","Tipo","Descripción","Antes (USD)","Movimiento (USD)","Después (USD)","Bolsa","Generación","Proveedor","Usuario","Origen","ID origen","Detalle"];
  const detail=(value:Record<string,unknown>)=>Object.entries(value||{}).map(([key,item])=>`${key}: ${String(item??"")}`).join(" | ");
  const rows=history.movements.map(item=>[
    date(item.occurred_at), movementTypeNames[item.movement_type]||item.movement_type, item.label,
    Number(item.balance_before_usd||0), Number(item.amount_usd||0), Number(item.balance_after_usd||0),
    item.lot_id??"", item.execution_id??"", item.provider??"", item.user_email||item.user_id||"",
    item.source_type, item.source_id??"", detail(item.details),
  ]);
  const workbook=`<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Movimientos"><Table>
<Row>${headers.map(value=>xmlCell(value)).join("")}</Row>
${rows.map(row=>`<Row>${row.map((value,index)=>xmlCell(value,index>=3&&index<=5?"Number":"String")).join("")}</Row>`).join("\n")}
</Table></Worksheet>
<Worksheet ss:Name="Resumen"><Table>
<Row>${xmlCell("Caja")}${xmlCell(history.label)}</Row>
<Row>${xmlCell("Saldo actual")}${xmlCell(history.current_balance_usd,"Number")}</Row>
<Row>${xmlCell("Saldo reconstruido")}${xmlCell(history.reconstructed_balance_usd,"Number")}</Row>
<Row>${xmlCell("Cuadra")}${xmlCell(history.reconciled?"Sí":"No")}</Row>
<Row>${xmlCell("Modo")}${xmlCell(history.mode)}</Row>
<Row>${xmlCell("Nota")}${xmlCell(history.note||"")}</Row>
</Table></Worksheet></Workbook>`;
  const blob=new Blob([workbook],{type:"application/vnd.ms-excel;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement("a");
  anchor.href=url;
  anchor.download=`finanzas-${history.cashbox_key}-${new Date().toISOString().slice(0,10)}.xls`;
  document.body.appendChild(anchor);anchor.click();anchor.remove();URL.revokeObjectURL(url);
}

function MovementHistoryModal({history,loading,onClose}:{history:CashboxMovementHistory|null;loading:boolean;onClose:()=>void}){
  if(typeof document==="undefined")return null;
  return createPortal(<div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/75 p-4" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}>
    <section className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
      <header className="flex items-start justify-between gap-4 border-b border-white/8 p-6">
        <div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-emerald-300">Auditoría financiera</p><h2 className="mt-2 text-xl font-semibold text-white">{history?.label||"Movimientos"}</h2><p className="mt-2 text-sm text-zinc-500">Cada fila conserva el saldo antes, el movimiento y el saldo después.</p></div>
        <div className="flex items-center gap-2">{history&&<button type="button" onClick={()=>exportMovementHistoryToExcel(history)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-500/20 px-4 text-sm text-emerald-300 hover:bg-emerald-500/10"><Download size={16}/>Exportar Excel</button>}<button type="button" onClick={onClose} className="rounded-xl border border-white/10 p-2.5 text-zinc-400 hover:text-white"><X size={18}/></button></div>
      </header>
      <div className="max-h-[calc(92vh-106px)] overflow-auto p-6">
        {loading?<div className="py-16 text-center text-zinc-500">Cargando movimientos reales…</div>:history&&<>
          <div className="grid gap-3 md:grid-cols-3">
            <Info label="Saldo actual de la card" value={money(history.current_balance_usd)}/>
            <Info label="Saldo reconstruido" value={money(history.reconstructed_balance_usd)}/>
            <Info label="Comprobación" value={history.reconciled?"CUADRA ✓":"REVISAR"}/>
          </div>
          {history.note&&<p className="mt-4 rounded-2xl border border-sky-500/15 bg-sky-500/[0.035] p-4 text-xs leading-6 text-sky-200/75">{history.note}</p>}
          <div className="mt-5 overflow-x-auto rounded-2xl border border-white/6">
            <table className="min-w-full text-left text-xs"><thead className="bg-white/[0.025] text-zinc-500"><tr>{["Fecha","Tipo","Detalle","Antes","Movimiento","Después","Referencia"].map(label=><th key={label} className="whitespace-nowrap px-3 py-3">{label}</th>)}</tr></thead>
              <tbody>{history.movements.length===0?<tr><td colSpan={7} className="px-4 py-12 text-center text-zinc-600">Todavía no hay movimientos para esta card.</td></tr>:history.movements.map(item=><tr key={item.id} className="border-t border-white/5 align-top">
                <td className="whitespace-nowrap px-3 py-3 text-zinc-500">{date(item.occurred_at)}</td>
                <td className="whitespace-nowrap px-3 py-3 text-zinc-300">{movementTypeNames[item.movement_type]||sourceText(item.movement_type)}</td>
                <td className="min-w-[260px] px-3 py-3"><p className="text-zinc-200">{item.label}</p>{item.user_email&&<p className="mt-1 text-zinc-600">{item.user_email}</p>}{item.provider&&<p className="mt-1 text-zinc-600">Proveedor: {item.provider}</p>}{Number(item.details?.economic_surplus_usd||0)>0&&<p className="mt-1 text-zinc-600">Extra económico: {money(Number(item.details.economic_surplus_usd||0))} · a utilidad: {money(Number(item.details.cash_surplus_usd||0))} · en proveedor: {money(Number(item.details.provider_held_usd||0))}</p>}</td>
                <td className="whitespace-nowrap px-3 py-3 text-zinc-500">{money(item.balance_before_usd)}</td>
                <td className={`whitespace-nowrap px-3 py-3 font-semibold ${item.amount_usd>=0?"text-emerald-300":"text-rose-300"}`}>{item.amount_usd>=0?"+":""}{money(item.amount_usd)}</td>
                <td className="whitespace-nowrap px-3 py-3 text-white">{money(item.balance_after_usd)}</td>
                <td className="whitespace-nowrap px-3 py-3 text-zinc-600">{item.execution_id?`Gen. ${item.execution_id.slice(0,8)}…`:item.lot_id?`Bolsa #${item.lot_id}`:item.source_id?`#${item.source_id}`:"—"}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </>}
      </div>
    </section>
  </div>,document.body);
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
  "Dinero extra ya confirmado":"Extra ya confirmado por redondeo de tokens. Se mantiene separado del extra por mayor rentabilidad.",
  "Extra por mayor rentabilidad disponible":"Dinero adicional confirmado cuando una generación usa una regla con mayor ganancia por token que la ganancia normal congelada de la bolsa. Solo muestra la parte que sigue físicamente en tu caja.",
  "Extra por mayor rentabilidad total":"Total económico descubierto por usar módulos más rentables, antes de separar lo que pudo quedar como crédito dentro de un proveedor.",
  "Mayor rentabilidad que quedó dentro del proveedor":"Parte del extra por mayor rentabilidad que ya está físicamente dentro de Modal, RunPod, Beam u otro proveedor y por eso no es retirable.",
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
  "Dinero extra":"Dinero extra por redondear tokens enteros. No incluye el extra por mayor rentabilidad de un módulo.",
  "Extra por rentabilidad":"Dinero adicional ya confirmado porque los tokens se usaron en un módulo cuya ganancia objetivo fue mayor que la ganancia normal congelada de la bolsa.",
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
  const [promoRecurringName,setPromoRecurringName]=useState("");
  const [promoRecurringProvider,setPromoRecurringProvider]=useState("modal");
  const [promoRecurringCurrent,setPromoRecurringCurrent]=useState("");
  const [promoRecurringNext,setPromoRecurringNext]=useState("");
  const [promoRecurringStart,setPromoRecurringStart]=useState("");
  const [promoRecurringRecurrence,setPromoRecurringRecurrence]=useState("monthly");
  const [promoRecurringSimulation,setPromoRecurringSimulation]=useState(false);
  const [promoRecurringDrafts,setPromoRecurringDrafts]=useState<Record<number,string>>({});
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
  const [movementHistory,setMovementHistory]=useState<CashboxMovementHistory|null>(null);
  const [movementLoading,setMovementLoading]=useState(false);
  const [movementOpen,setMovementOpen]=useState(false);

  async function openMovements(key:CashboxMovementKey){
    setMovementOpen(true);setMovementLoading(true);setMovementHistory(null);
    try{setMovementHistory(await browserApiRequest<CashboxMovementHistory>(`/api/admin/finances/cashbox/movements/${key}`));}
    catch(error){toast.error(error instanceof Error?error.message:"No fue posible cargar los movimientos.");setMovementOpen(false);}
    finally{setMovementLoading(false);}
  }

  const summaryCards:Array<{
    label:string;
    value:number;
    icon:LucideIcon;
    className:string;
    panelClassName:string;
    help:string;
    movementKey:CashboxMovementKey;
  }>=summary?[
    {
      label:"Dinero libre para ti",
      movementKey:"utility",
      value:summary.available_usd,
      icon:WalletCards,
      className:"text-emerald-300",
      panelClassName:"border-emerald-500/20 bg-emerald-500/[0.045]",
      help:"Dinero que ya puedes usar o retirar. No incluye dinero destinado a IA ni importes que ya mandaste a proveedores.",
    },
    {
      label:"IA aún en tu caja",
      movementKey:"infrastructure_cash",
      value:summary.infrastructure_cash_available_usd,
      icon:ShieldCheck,
      className:"text-sky-300",
      panelClassName:"border-sky-500/25 bg-sky-500/[0.055]",
      help:"Dinero destinado a pagar IA que todavía está contigo. Puedes enviarlo a Modal, RunPod, Beam u otro proveedor.",
    },
    {
      label:"IA ya enviada",
      movementKey:"infrastructure_funded",
      value:summary.infrastructure_funded_usd,
      icon:ServerCog,
      className:"text-violet-300",
      panelClassName:"border-violet-500/20 bg-violet-500/[0.045]",
      help:"Dinero que ya registraste como enviado físicamente a Modal, RunPod, Beam u otros proveedores.",
    },
    {
      label:"Cobros pendientes",
      movementKey:"pending_recovery",
      value:summary.pending_recovery_economic_estimated_usd,
      icon:CircleDollarSign,
      className:"text-orange-300",
      panelClassName:"border-orange-500/20 bg-orange-500/[0.045]",
      help:`${summary.pending_recovery_generations} generación(es) bloqueada(s) · ${summary.pending_recovery_tokens} token(s) por recuperar. Incluye infraestructura pendiente exacta y ganancia potencial estimada.`,
    },
    {
      label:"Ganancia todavía en espera",
      movementKey:"blocked_profit",
      value:summary.blocked_profit_usd,
      icon:Boxes,
      className:"text-amber-300",
      panelClassName:"border-amber-500/20 bg-amber-500/[0.045]",
      help:"Ganancia de compras que todavía sigue bloqueada por las reglas de reembolso. Aún no la cuentes como dinero libre.",
    },
    {
      label:"Dinero ya retirado",
      movementKey:"withdrawals",
      value:summary.withdrawals_usd,
      icon:Banknote,
      className:"text-rose-300",
      panelClassName:"border-rose-500/20 bg-rose-500/[0.045]",
      help:"Retiros de utilidad. No incluye transferencias hechas a proveedores de IA.",
    },
    {
      label:"Gastos disponibles",
      movementKey:"operational",
      value:operational?.available_operational_funds_usd??0,
      icon:CircleDollarSign,
      className:"text-fuchsia-300",
      panelClassName:"border-fuchsia-500/20 bg-fuchsia-500/[0.045]",
      help:"Dinero que ya puedes usar para hosting, correo, dominios, storage, software y otros gastos del negocio.",
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

  async function addRecurringPromotionalSource(){
    const current=Number(promoRecurringCurrent);
    const recurring=Number(promoRecurringNext);
    if(!promoRecurringName.trim()){toast.error("Escribe un nombre para este crédito, por ejemplo Modal mensual.");return;}
    if(!Number.isFinite(current)||current<0){toast.error("Escribe cuánto crédito te queda realmente en el ciclo actual.");return;}
    if(!Number.isFinite(recurring)||recurring<=0){toast.error("Escribe cuánto crédito recibes al comenzar cada nuevo ciclo.");return;}
    if(!promoRecurringStart){toast.error("Selecciona cuándo empezó el ciclo actual.");return;}
    setAction("promo-recurring-create");
    try{
      await browserApiRequest("/api/admin/finances/promotional-credits/recurring-sources",{
        method:"POST",body:JSON.stringify({
          name:promoRecurringName.trim(),provider:promoRecurringProvider,
          current_available_usd:current,recurring_amount_usd:recurring,
          cycle_start:promoRecurringStart,recurrence:promoRecurringRecurrence,
          simulation_enabled:promoRecurringSimulation,
        }),
      });
      toast.success("Crédito recurrente guardado. La fecha final se calcula sola según la periodicidad.");
      setPromoRecurringName("");setPromoRecurringCurrent("");setPromoRecurringNext("");
      setPromoRecurringRecurrence("monthly");setPromoRecurringSimulation(false);
      void load();
    }catch(error){toast.error(error instanceof Error?error.message:"No fue posible guardar el crédito recurrente.");}
    finally{setAction(null);}
  }

  async function updateRecurringPromotionalSource(sourceId:number,active:boolean,currentAmount:number,recurrence?:string,simulationEnabled?:boolean){
    const draft=promoRecurringDrafts[sourceId];
    const amount=draft===undefined?currentAmount:Number(draft);
    if(!Number.isFinite(amount)||amount<=0){toast.error("El monto del próximo ciclo debe ser mayor que cero.");return;}
    setAction(`promo-recurring-${sourceId}`);
    try{
      await browserApiRequest(`/api/admin/finances/promotional-credits/recurring-sources/${sourceId}`,{
        method:"PUT",body:JSON.stringify({recurring_amount_usd:amount,active,recurrence,simulation_enabled:simulationEnabled}),
      });
      toast.success(active?"Crédito recurrente actualizado.":"Crédito recurrente pausado.");
      void load();
    }catch(error){toast.error(error instanceof Error?error.message:"No fue posible actualizar el crédito recurrente.");}
    finally{setAction(null);}
  }

  async function triggerRecurringCycle(sourceId:number,simulation:boolean){
    setAction(`${simulation?"promo-cycle-simulate":"promo-cycle-webhook"}-${sourceId}`);
    try{
      const result=await browserApiRequest<PromotionalCycleWebhookResult>(`/api/admin/finances/promotional-credits/recurring-sources/${sourceId}/cycle-webhook`,{
        method:"POST",body:JSON.stringify({simulation}),
      });
      if(simulation){
        toast.success(`Simulación: ${dateOnly(result.projected_cycle_start)} → ${dateOnly(result.projected_cycle_end)} · ${money(result.projected_opening_usd||0)}. No se cambió nada real.`);
      }else{
        toast.success(result.changed_cycles>0?`Ciclo revisado: se renovaron ${result.changed_cycles} ciclo(s).`:"Ciclo revisado: todavía sigue vigente y no se movió dinero.");
        void load();
      }
    }catch(error){toast.error(error instanceof Error?error.message:"No fue posible revisar el ciclo.");}
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

  return <><main className="space-y-6">
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
      : summary&&<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
        {summaryCards.map(({label,value,icon:Icon,className,panelClassName,help,movementKey})=>
          <button type="button" onClick={()=>void openMovements(movementKey)} key={label} className={`luxia-panel group rounded-3xl border p-5 text-left transition hover:-translate-y-0.5 hover:border-white/20 ${panelClassName}`}>
            <div className="flex items-center justify-between"><Icon className={className} size={20}/><History size={16} className="text-zinc-700 transition group-hover:text-zinc-300"/></div>
            <p className="mt-5 text-xs uppercase tracking-widest text-zinc-600">{label}</p>
            <p className={`mt-2 text-2xl font-semibold ${className}`}>{money(value)}</p>
            <p className="mt-3 text-xs leading-5 text-zinc-600">{help}</p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-700 group-hover:text-zinc-400">Click para ver movimientos</p>
          </button>,
        )}
      </section>}

    {promotional&&<AccordionSection title="Promociones y tokens gratis" description="Separa el crédito que te regala un proveedor del dinero que tú decides poner para seguir regalando tokens. El motor de tokens gratis sigue siendo el mismo."><section className="rounded-2xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-fuchsia-300">Tokens gratis respaldados</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Dinero para tokens gratis</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
            Primero se usa el crédito recurrente del proveedor que puede vencer. Si se acaba, el sistema continúa con el dinero propio que hayas agregado para ese proveedor. Son dos fuentes distintas, pero las bolsas promocionales y su contabilidad siguen funcionando igual.
          </p>
        </div>
        <div className="grid min-w-[300px] gap-2 text-right sm:grid-cols-3">
          <div><p className="text-xs text-zinc-600">Total disponible</p><p className="mt-1 text-xl font-semibold text-fuchsia-300">{money(promotional.total_available_usd)}</p></div>
          <div><p className="text-xs text-zinc-600">Crédito de proveedores</p><p className="mt-1 text-lg font-semibold text-cyan-300">{money(promotional.total_recurring_available_usd)}</p></div>
          <div><p className="text-xs text-zinc-600">Dinero propio</p><p className="mt-1 text-lg font-semibold text-amber-300">{money(promotional.total_own_available_usd)}</p></div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {promotional.provider_balances.map(item=><article key={item.provider} className="rounded-2xl border border-white/6 bg-black/20 p-4">
          <p className="text-xs font-semibold uppercase text-fuchsia-300">{item.provider}</p>
          <p className="mt-3 text-xl font-semibold text-white">{money(item.available_usd)}</p>
          <p className="mt-1 text-xs text-zinc-600">≈ {item.available_tokens} tokens que puedes regalar</p>
          <div className="mt-3 border-t border-white/6 pt-3 text-xs leading-5 text-zinc-600">
            <p>Proveedor recurrente: <b className="text-cyan-300">{money(item.recurring_available_usd)}</b></p>
            <p>Dinero propio: <b className="text-amber-300">{money(item.own_available_usd)}</b></p>
          </div>
        </article>)}
      </div>

      <div className="mt-6 rounded-2xl border border-cyan-500/15 bg-cyan-500/[0.025] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-cyan-300">Crédito que renueva el proveedor</p>
            <h3 className="mt-2 font-semibold text-white">Ciclos recurrentes</h3>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">Ejemplo: Modal puede darte USD 30 por ciclo, pero hoy quizá solo te queden USD 19.76. Registras <b className="text-zinc-300">19.76 como saldo actual</b> y <b className="text-zinc-300">30 como monto de los siguientes ciclos</b>. Al terminar el ciclo, lo que sobró no se acumula; el siguiente inicia con el monto configurado.</p>
          </div>
          <span className="rounded-full border border-cyan-500/20 px-3 py-1 text-xs text-cyan-200">Sin webhook obligatorio</span>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.2fr]">
          <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
            <h4 className="text-sm font-semibold text-white">Agregar crédito recurrente</h4>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input value={promoRecurringName} onChange={e=>setPromoRecurringName(e.target.value)} placeholder="Nombre, ej. Modal mensual" className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white sm:col-span-2"/>
              <select value={promoRecurringProvider} onChange={e=>setPromoRecurringProvider(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white"><option value="modal">Modal</option><option value="runpod">RunPod</option><option value="beam">Beam</option><option value="general">General</option></select>
              <input value={promoRecurringCurrent} onChange={e=>setPromoRecurringCurrent(e.target.value)} type="number" min="0" step="0.01" placeholder="Saldo real de este ciclo" className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white"/>
              <label className="text-xs text-zinc-500"><span>Inicio del ciclo actual</span><input value={promoRecurringStart} onChange={e=>setPromoRecurringStart(e.target.value)} type="date" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white"/></label>
              <label className="text-xs text-zinc-500"><span>Periodicidad</span><select value={promoRecurringRecurrence} onChange={e=>setPromoRecurringRecurrence(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white"><option value="weekly">Semanal</option><option value="monthly">Mensual</option><option value="quarterly">Trimestral</option><option value="yearly">Anual</option></select></label>
              <label className="text-xs text-zinc-500 sm:col-span-2"><span>Monto completo que inicia cada ciclo siguiente</span><input value={promoRecurringNext} onChange={e=>setPromoRecurringNext(e.target.value)} type="number" min="0.01" step="0.01" placeholder="Ej. 30" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white"/></label>
              <label className="flex items-start gap-3 rounded-xl border border-white/8 p-3 text-xs text-zinc-400 sm:col-span-2"><input type="checkbox" checked={promoRecurringSimulation} onChange={e=>setPromoRecurringSimulation(e.target.checked)}/><span><b className="text-zinc-200">Permitir simulaciones</b><small className="mt-1 block text-zinc-600">Permite probar cómo sería el siguiente ciclo sin mover dinero real.</small></span></label>
            </div>
            <button disabled={action!==null} onClick={()=>void addRecurringPromotionalSource()} className="mt-4 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-40">Guardar crédito recurrente</button>
          </div>

          <div className="space-y-3">
            {promotional.recurring_sources.length===0&&<div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-zinc-600">Todavía no hay créditos recurrentes. El dinero promocional que ya tenías sigue funcionando como dinero propio y no se reinicia.</div>}
            {promotional.recurring_sources.map(source=>{
              const current=source.cycles.find(c=>c.status==="active");
              const beforeTracking=current?Math.max(current.configured_amount_usd-current.opening_available_usd,0):0;
              const usedHere=current?Math.max(current.opening_available_usd-source.current_available_usd,0):0;
              const draft=promoRecurringDrafts[source.id]??String(source.recurring_amount_usd);
              return <article key={source.id} className={`rounded-2xl border p-4 ${source.active?"border-cyan-500/15 bg-black/20":"border-white/6 bg-black/10 opacity-70"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="font-semibold text-white">{source.name}</p><p className="mt-1 text-xs uppercase text-zinc-600">{source.provider} · {recurrenceText(source.recurrence)} · {source.active?"activo":"pausado"}</p></div>
                  <div className="text-right"><p className="text-xs text-zinc-600">Disponible ahora</p><p className="text-xl font-semibold text-cyan-300">{money(source.current_available_usd)}</p></div>
                </div>
                <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                  <div className="rounded-xl border border-white/6 p-3"><p className="text-zinc-600">Ciclo actual</p><p className="mt-1 text-zinc-300">{dateOnly(source.current_cycle_start)} → {dateOnly(source.current_cycle_end)}</p></div>
                  <div className="rounded-xl border border-white/6 p-3"><p className="text-zinc-600">Saldo con el que empezaste a registrarlo</p><p className="mt-1 text-zinc-300">{money(current?.opening_available_usd||0)}</p></div>
                  <div className="rounded-xl border border-white/6 p-3"><p className="text-zinc-600">Ya usado antes de registrarlo aquí</p><p className="mt-1 text-zinc-300">{money(beforeTracking)}</p></div>
                  <div className="rounded-xl border border-white/6 p-3"><p className="text-zinc-600">Usado/asignado desde que lo registraste</p><p className="mt-1 text-zinc-300">{money(usedHere)}</p></div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="text-xs text-zinc-500"><span>Monto de cada nuevo ciclo</span><input value={draft} onChange={e=>setPromoRecurringDrafts(current=>({...current,[source.id]:e.target.value}))} type="number" min="0.01" step="0.01" className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white"/></label>
                  <label className="text-xs text-zinc-500"><span>Periodicidad de próximos ciclos</span><select value={source.recurrence} onChange={e=>void updateRecurringPromotionalSource(source.id,source.active,source.recurring_amount_usd,e.target.value,source.simulation_enabled)} className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white"><option value="weekly">Semanal</option><option value="monthly">Mensual</option><option value="quarterly">Trimestral</option><option value="yearly">Anual</option></select></label>
                </div>
                <label className="mt-3 flex items-center gap-3 text-xs text-zinc-400"><input type="checkbox" checked={source.simulation_enabled} onChange={e=>void updateRecurringPromotionalSource(source.id,source.active,source.recurring_amount_usd,source.recurrence,e.target.checked)}/><span>Permitir simulaciones de este crédito</span></label>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button disabled={action!==null} onClick={()=>void updateRecurringPromotionalSource(source.id,source.active,source.recurring_amount_usd,source.recurrence,source.simulation_enabled)} className="rounded-xl border border-cyan-500/25 px-4 py-2 text-xs text-cyan-200 disabled:opacity-40">Guardar próximo monto</button>
                  <button disabled={action!==null||!source.active} onClick={()=>void triggerRecurringCycle(source.id,false)} className="rounded-xl border border-emerald-500/25 px-4 py-2 text-xs text-emerald-200 disabled:opacity-40">Revisar ciclo ahora (webhook)</button>
                  {source.simulation_enabled&&<button disabled={action!==null} onClick={()=>void triggerRecurringCycle(source.id,true)} className="rounded-xl border border-fuchsia-500/25 px-4 py-2 text-xs text-fuchsia-200 disabled:opacity-40">Simular +1 ciclo</button>}
                  <button disabled={action!==null} onClick={()=>void updateRecurringPromotionalSource(source.id,!source.active,source.recurring_amount_usd,source.recurrence,source.simulation_enabled)} className="rounded-xl border border-white/10 px-4 py-2 text-xs text-zinc-300 disabled:opacity-40">{source.active?"Pausar":"Activar"}</button>
                </div>
                {!source.active&&<p className="mt-3 text-xs leading-5 text-zinc-600">Pausado: este crédito no se utilizará ni abrirá ciclos nuevos. Tu dinero propio sigue disponible.</p>}
              </article>;
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.02] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-amber-300">Financiamiento propio</p>
          <h3 className="mt-2 font-semibold text-white">Agregar tu propio dinero para tokens gratis</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500">Este dinero <b className="text-zinc-300">no se reinicia ni vence por ciclo</b>. Sirve como respaldo cuando se acaba el crédito gratuito del proveedor. Los fondos promocionales que ya existían antes de esta capa se conservan aquí como propios para no reinterpretar ni modificar tu histórico.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input value={promoFundAmount} onChange={e=>setPromoFundAmount(e.target.value)} type="number" min="0" step="0.01" placeholder="USD" className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white"/>
            <select value={promoFundProvider} onChange={e=>setPromoFundProvider(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white"><option value="modal">Modal</option><option value="runpod">RunPod</option><option value="beam">Beam</option><option value="general">General</option></select>
            <input value={promoFundReference} onChange={e=>setPromoFundReference(e.target.value)} placeholder="Referencia opcional" className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white"/>
            <input value={promoFundDescription} onChange={e=>setPromoFundDescription(e.target.value)} placeholder="Concepto" className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white"/>
          </div>
          <button disabled={action!==null} onClick={()=>void addPromotionalFund()} className="mt-4 rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-40">Agregar dinero propio</button>
        </div>

        <div className="rounded-2xl border border-white/6 p-5">
          <h3 className="font-semibold text-white">Cómo se reparten los tokens gratis</h3>
          <div className="mt-4 space-y-4 text-sm">
            <label className="flex items-center justify-between gap-4 text-zinc-300"><span>Dar tokens al registrarse</span><input type="checkbox" checked={promotional.settings.signup_enabled} onChange={e=>setPromotional({...promotional,settings:{...promotional.settings,signup_enabled:e.target.checked}})}/></label>
            <label className="block text-zinc-400"><span>Tokens por nuevo usuario</span><input type="number" min="0" value={promotional.settings.signup_tokens} onChange={e=>setPromotional({...promotional,settings:{...promotional.settings,signup_tokens:Number(e.target.value)||0}})} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white"/></label>
            <label className="block text-zinc-400"><span>Proveedor que deben usar esos tokens</span><select value={promotional.settings.signup_provider} onChange={e=>setPromotional({...promotional,settings:{...promotional.settings,signup_provider:e.target.value}})} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white"><option value="modal">Modal</option><option value="runpod">RunPod</option><option value="beam">Beam</option><option value="general">General</option></select></label>
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
        <table className="w-full min-w-[1600px] text-left text-sm">
          <thead className="text-xs uppercase text-zinc-600">
            <tr>
              {[
                "Bolsa","Usuario","Origen","Estado","Tokens","Pagó el cliente",
                "Ganancia","Dinero extra","Extra por rentabilidad","Disponible para ti",
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
              <td className="px-3 py-4 text-cyan-200">{money(bag.profitability_surplus_usd)}</td>
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
              ["Extra por mayor rentabilidad disponible",detail.bag.profitability_surplus_usd],
              ["Extra por mayor rentabilidad total",detail.bag.profitability_surplus_total_usd],
              ["Mayor rentabilidad que quedó dentro del proveedor",detail.bag.provider_profitability_credit_usd],
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
                  <th>Ganancia de la bolsa</th>
                  <th>Extra por rentabilidad</th>
                  <th>Redondeo</th>
                  <th>Ganancia total</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {detail.generations.map((generation,index)=>
                  <tr key={`${generation.execution_id}-${index}`} className="border-t border-white/5">
                    <td className="p-2 text-zinc-300">{generation.execution_id.slice(0,8)}</td>
                    <td className="text-center">{generation.tokens_used}</td>
                    <td className="text-center">{money(generation.infrastructure_cost_usd)}</td>
                    <td className="text-center">{money(generation.company_profit_usd - generation.profitability_surplus_usd - generation.rounding_surplus_usd)}</td>
                    <td className="text-center text-cyan-200">{money(generation.profitability_surplus_usd)}</td>
                    <td className="text-center text-amber-200">{money(generation.rounding_surplus_usd)}</td>
                    <td className="text-center font-semibold text-emerald-300">{money(generation.company_profit_usd)}</td>
                    <td className="text-center">{date(generation.created_at)}</td>
                  </tr>,
                )}
              </tbody>
            </table>
          </div>
        </article>
      </div>}
  </main>{movementOpen&&<MovementHistoryModal history={movementHistory} loading={movementLoading} onClose={()=>{setMovementOpen(false);setMovementHistory(null);}}/>}</>;
}
