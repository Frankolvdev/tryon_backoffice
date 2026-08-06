"use client";

import {useCallback,useEffect,useState} from "react";
import {
  Banknote,
  Boxes,
  CircleDollarSign,
  Landmark,
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
  TokenBag,
  TokenBagList,
  Withdrawal,
} from "@/types/finance-cashbox";

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
      const [cashbox,bagList,withdrawalList,expiration,fundingList]=await Promise.all([
        browserApiRequest<CashboxSummary>("/api/admin/finances/cashbox"),
        browserApiRequest<TokenBagList>(`/api/admin/finances/token-bags${query}`),
        browserApiRequest<Withdrawal[]>("/api/admin/finances/withdrawals"),
        browserApiRequest<ExpirationSettings>("/api/admin/finances/token-bag-expiration"),
        browserApiRequest<InfrastructureFunding[]>("/api/admin/finances/infrastructure-fundings"),
      ]);
      setSummary(cashbox);
      setBags(bagList.items);
      setWithdrawals(withdrawalList);
      setExpiry(expiration);
      setFundings(fundingList);
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
        `${result.expired_tokens} tokens vencieron. ${money(result.infrastructure_cash_released_usd)} pasó a utilidad`
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
