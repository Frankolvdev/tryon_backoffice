"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { browserApiRequest } from "@/lib/api/browser-api";
import { AdminPagination } from "@/components/backoffice/admin-pagination";

type TokenBag = {
  token_bag_id?: number;
  source?: string;
  source_label?: string;
  reference_id?: string | null;
  tokens_used?: number;
  benefit_percent?: number;
  normal_profit_per_token_usd?: number;
  profit_per_token_after_benefit_usd?: number;
  profit_without_benefit_usd?: number;
  benefit_given_usd?: number;
  company_profit_usd?: number;
  profitability_surplus_per_token_usd?: number;
  profitability_surplus_usd?: number;
  coupon_code?: string | null;
  plan_name?: string | null;
  effective_token_value_usd?: number;
  infrastructure_capacity_per_token_usd?: number;
  infrastructure_capacity_from_tokens_usd?: number;
  operational_reserve_per_token_usd?: number;
  operational_reserve_from_tokens_usd?: number;
  cash_value_at_purchase_usd?: number;
  financial_economics_schema?: string | null;
  snapshot_source?: string | null;
};

type FinanceBreakdown = {
  token_bags_used?: TokenBag[];
  money_reserved_for_ai_provider_usd?: number;
  profit_without_benefits_usd?: number;
  benefit_given_to_customer_usd?: number;
  company_profit_usd?: number;
  economic_total_for_generation_usd?: number;
  provider?: string;
  gpu_key?: string;
  real_provider_seconds?: number;
  configured_scaledown_seconds?: number;
  technical_margin_seconds?: number;
  billable_seconds?: number;
  gpu_cost_usd_per_second?: number;
  raw_infrastructure_cost_usd?: number;
  profit_rounding_surplus_usd?: number;
  profit_after_customer_benefits_usd?: number;
  rounding_surplus_for_company_usd?: number;
  profitability_surplus_for_company_usd?: number;
  profit_applied?: boolean;
  billing_policy_key?: string;
  termination_status?: string;
  final_tokens?: number;
  estimated_tokens_before_execution?: number;
  tokens_actually_charged?: number;
  estimated_final_tokens?: number;
  estimated_pending_tokens?: number;
  pending_tokens_not_charged?: number;
  estimated_final_price_usd?: number;
  settlement_pending?: boolean;
  settlement_reason?: string | null;
  result_locked?: boolean;
  billing_access_status?: string | null;
};

type FinanceItem = {
  execution_id: string;
  generation_module_id: number | null;
  module_key: string;
  user_id: number | null;
  status: string;
  tokens_consumed: number;
  recognized_revenue_usd: number;
  infrastructure_cost_usd: number;
  gross_profit_usd: number;
  gross_margin_percent: number | null;
  traceability_status: string;
  breakdown: FinanceBreakdown;
  created_at: string;
};

const PAGE_SIZE = 50;

type Response = {
  items: FinanceItem[];
  total: number;
  skip: number;
  limit: number;
  summary: {
    total_generations: number;
    recognized_revenue_usd: number;
    infrastructure_cost_usd: number;
    gross_profit_usd: number;
    exact_records: number;
    partial_records: number;
    unavailable_records: number;
  };
};

const usd = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(Number(value || 0));

const isPromotionalBag = (bag: TokenBag) =>
  String(bag.source || "").toLowerCase() === "promotional_credit" ||
  String(bag.source_label || "").toLowerCase().includes("promotional");

const sourceName = (bag: TokenBag) => {
  if (isPromotionalBag(bag)) return "Tokens gratis";
  if (bag.plan_name) return `Plan ${bag.plan_name}`;
  if (bag.coupon_code) return `Compra con cupón ${bag.coupon_code}`;
  const source = String(bag.source_label || bag.source || "");
  if (source.includes("subscription")) return "Tokens incluidos en un plan";
  if (source.includes("purchase")) return "Compra de tokens";
  if (source.includes("legacy")) return "Saldo anterior sin detalle";
  return source || "Origen no identificado";
};

const bagKind = (bag: TokenBag) => {
  if (isPromotionalBag(bag)) {
    return {
      label: "Gratis",
      className: "border-violet-500/30 bg-violet-500/10 text-violet-200",
      help: "El cliente no pagó por estos tokens. No generan ganancia ni dinero para gastos del negocio; su IA está respaldada por la caja promocional.",
    };
  }
  if (bag.coupon_code) {
    return {
      label: "Con cupón",
      className: "border-amber-500/30 bg-amber-500/10 text-amber-200",
      help: "El descuento salió de tu ganancia. La parte para IA y el extra para gastos del negocio permanecen protegidos según el snapshot de la bolsa.",
    };
  }
  if (bag.plan_name || String(bag.source || "").includes("subscription")) {
    return {
      label: "Plan",
      className: "border-blue-500/30 bg-blue-500/10 text-blue-200",
      help: "Estos tokens vinieron de un plan. Se usan las condiciones que quedaron congeladas cuando nació esa bolsa.",
    };
  }
  return {
    label: "Compra",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    help: "Tokens pagados por el cliente. Se respetan las condiciones y componentes congelados de esa bolsa.",
  };
};

const mergeTokenBags = (bags: TokenBag[]) => {
  const grouped = new Map<string, TokenBag>();

  bags.forEach((bag, index) => {
    const key = String(
      bag.token_bag_id ??
        `${bag.reference_id || "sin-referencia"}-${bag.coupon_code || "sin-cupon"}-${index}`,
    );
    const current = grouped.get(key);
    if (!current) {
      grouped.set(key, { ...bag });
      return;
    }

    current.tokens_used =
      Number(current.tokens_used || 0) + Number(bag.tokens_used || 0);
    current.profit_without_benefit_usd =
      Number(current.profit_without_benefit_usd || 0) +
      Number(bag.profit_without_benefit_usd || 0);
    current.benefit_given_usd =
      Number(current.benefit_given_usd || 0) +
      Number(bag.benefit_given_usd || 0);
    current.company_profit_usd =
      Number(current.company_profit_usd || 0) +
      Number(bag.company_profit_usd || 0);
    current.profitability_surplus_usd =
      Number(current.profitability_surplus_usd || 0) +
      Number(bag.profitability_surplus_usd || 0);
  });

  return Array.from(grouped.values());
};

export default function GenerationFinancesPage() {
  const [data, setData] = useState<Response | null>(null);
  const [status, setStatus] = useState("");
  const [trace, setTrace] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<FinanceItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), skip: String(page * PAGE_SIZE) });
      if (status) params.set("status", status);
      if (trace) params.set("traceability", trace);
      setData(
        await browserApiRequest<Response>(
          `/api/admin/finances/generations?${params}`,
        ),
      );
    } catch (value) {
      setError(
        value instanceof Error
          ? value.message
          : "No fue posible cargar las finanzas.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, status, trace]);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = data?.summary;
  const cards = useMemo(
    () => [
      {
        label: "Costo real de IA",
        value: usd(summary?.infrastructure_cost_usd ?? 0),
      },
      {
        label: "Ganancia producida por el uso",
        value: usd(summary?.gross_profit_usd ?? 0),
      },
      {
        label: "Dinero procesado en generaciones",
        value: usd(
          (summary?.infrastructure_cost_usd ?? 0) +
            (summary?.gross_profit_usd ?? 0),
        ),
      },
      {
        label: "Generaciones procesadas",
        value: String(summary?.total_generations ?? 0),
      },
    ],
    [summary],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Finanzas por generación
          </h1>
          <p className="text-sm text-zinc-400">
            Separa claramente el dinero para pagar al proveedor de IA de lo que
            realmente ganó tu empresa.
          </p>
        </div>
        <button
          onClick={() => void load()}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200"
        >
          <RefreshCcw className="mr-2 inline h-4 w-4" />
          Actualizar
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/10 bg-zinc-950 p-5"
          >
            <p className="text-xs uppercase text-zinc-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 rounded-2xl border border-white/10 bg-zinc-950 p-4">
        <select
          value={status}
          onChange={(event) => { setPage(0); setStatus(event.target.value); }}
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white"
        >
          <option value="">Todos los estados</option>
          <option value="completed">Completadas</option>
          <option value="cancelled">Canceladas</option>
          <option value="failed">Fallidas</option>
        </select>
        <select
          value={trace}
          onChange={(event) => { setPage(0); setTrace(event.target.value); }}
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white"
        >
          <option value="">Todo el historial</option>
          <option value="exact">Detalle completo</option>
          <option value="partial">Parte del saldo es anterior</option>
          <option value="unavailable">Sin detalle disponible</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-950">
        <table className="w-full min-w-[1120px] text-sm">
          <thead className="bg-white/5 text-left text-zinc-400">
            <tr>
              <th className="p-3">Generación</th>
              <th>Módulo</th>
              <th>Estado</th>
              <th>Tokens usados</th>
              <th>Para pagar al proveedor</th>
              <th>Beneficio entregado</th>
              <th>Extra por rentabilidad</th>
              <th>Lo que ganó tu empresa</th>
              <th className="text-blue-300">Total de la generación</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="p-8 text-center text-zinc-500">
                  Cargando…
                </td>
              </tr>
            ) : (
              data?.items.map((item) => {
                const benefit = Number(
                  item.breakdown.benefit_given_to_customer_usd || 0,
                );
                return (
                  <tr
                    key={item.execution_id}
                    className="border-t border-white/5 text-zinc-300"
                  >
                    <td className="p-3 font-mono text-xs">
                      {item.execution_id.slice(0, 8)}
                    </td>
                    <td>{item.module_key}</td>
                    <td>
                      <span>{item.status}</span>
                      {item.breakdown.settlement_pending && (
                        <p className="mt-1 text-xs font-semibold text-amber-300">
                          Pago pendiente · resultado bloqueado
                        </p>
                      )}
                    </td>
                    <td>
                      <span>{item.tokens_consumed} cobrados</span>
                      {item.breakdown.settlement_pending && (
                        <p className="mt-1 text-xs text-amber-300">
                          +{item.breakdown.estimated_pending_tokens ?? "?"} pendientes aprox.
                        </p>
                      )}
                    </td>
                    <td>{usd(item.infrastructure_cost_usd)}</td>
                    <td>{usd(benefit)}</td>
                    <td className="text-cyan-300">
                      {usd(Number(item.breakdown.profitability_surplus_for_company_usd || 0))}
                    </td>
                    <td className="text-emerald-300">
                      {usd(item.gross_profit_usd)}
                    </td>
                    <td className="font-semibold text-blue-300">
                      {usd(item.infrastructure_cost_usd + item.gross_profit_usd)}
                    </td>
                    <td>
                      <button
                        onClick={() => setSelected(item)}
                        className="px-3 py-2 text-blue-300"
                      >
                        Ver explicación
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination
        page={page}
        pageSize={PAGE_SIZE}
        total={data?.total ?? 0}
        loading={loading}
        label="generaciones"
        onPageChange={setPage}
      />

      {selected && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-2xl border border-white/10 bg-zinc-950 p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  ¿Qué pasó con el dinero de esta generación?
                </h2>
                <p className="text-sm text-zinc-400">
                  Generación {selected.execution_id.slice(0, 8)} ·{" "}
                  {selected.tokens_consumed} tokens usados
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-zinc-400"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <FriendlyValue
                label="Costo protegido del proveedor de IA"
                value={usd(selected.infrastructure_cost_usd)}
                help="Incluye el tiempo real, el tiempo previsto para apagar el contenedor y el margen técnico configurado."
              />
              <FriendlyValue
                label="Beneficio entregado al cliente"
                value={usd(
                  Number(
                    selected.breakdown.benefit_given_to_customer_usd || 0,
                  ),
                )}
                help="Es la parte de tu ganancia a la que renunciaste por el plan, paquete o cupón."
              />
              <FriendlyValue
                label="Extra confirmado por mayor rentabilidad"
                value={usd(Number(selected.breakdown.profitability_surplus_for_company_usd || 0))}
                help="Aparece cuando los tokens usados venían de una bolsa con una ganancia normal segura menor que la ganancia objetivo de este módulo. No incluye redondeo y nunca recupera descuentos del cliente."
              />
              <FriendlyValue
                label="Lo que realmente ganó tu empresa"
                value={usd(selected.gross_profit_usd)}
                help="Incluye la ganancia después de beneficios, el extra confirmado por mayor rentabilidad y cualquier centavo adicional generado por redondear tokens."
              />
              <FriendlyValue
                label="Total de esta generación"
                value={usd(selected.infrastructure_cost_usd + selected.gross_profit_usd)}
                help="Suma el costo protegido del proveedor y todo lo que ganó tu empresa."
                accent="blue"
              />
            </div>

            <section className="mt-6 rounded-2xl border border-white/10 p-5">
              <h3 className="font-semibold text-white">¿Cómo se calculó el costo del proveedor?</h3>
              <p className="mt-1 text-sm text-zinc-400">Aquí puedes ver exactamente qué segundos se sumaron y cuánto representa cada parte.</p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="text-left text-zinc-500"><tr><th className="py-2">Parte del cálculo</th><th>Segundos</th><th>Costo por segundo</th><th>Importe</th></tr></thead>
                  <tbody className="text-zinc-300">
                    <TimeCostRow label="Tiempo real de la generación" seconds={Number(selected.breakdown.real_provider_seconds || 0)} rate={Number(selected.breakdown.gpu_cost_usd_per_second || 0)} />
                    <TimeCostRow label="Tiempo previsto para apagar el contenedor" seconds={Number(selected.breakdown.configured_scaledown_seconds || 0)} rate={Number(selected.breakdown.gpu_cost_usd_per_second || 0)} />
                    <TimeCostRow label="Margen técnico de seguridad" seconds={Number(selected.breakdown.technical_margin_seconds || 0)} rate={Number(selected.breakdown.gpu_cost_usd_per_second || 0)} />
                    <tr className="border-t border-white/10 font-semibold text-white"><td className="py-3">Total protegido</td><td>{Number(selected.breakdown.billable_seconds || 0).toFixed(3)} s</td><td>{usd(Number(selected.breakdown.gpu_cost_usd_per_second || 0))}</td><td>{usd(selected.infrastructure_cost_usd)}</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-zinc-500">Proveedor: {selected.breakdown.provider || "No indicado"} · GPU: {selected.breakdown.gpu_key || "No indicada"}. El margen técnico es una protección configurada; no se presenta como ganancia.</p>
            </section>

            <section className="mt-6 rounded-2xl border border-white/10 p-5">
              <h3 className="font-semibold text-white">
                ¿De dónde salieron los tokens?
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Una generación puede usar tokens de varias compras con
                beneficios distintos.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[850px] text-sm">
                  <thead className="text-left text-zinc-500">
                    <tr>
                      <th className="py-2">Bolsa de tokens</th>
                      <th>¿Cómo se obtuvieron?</th>
                      <th>Tokens usados</th>
                      <th>Beneficio aplicado</th>
                      <th>Lo que normalmente ganarías por token</th>
                      <th>Lo que ganaste por token</th>
                      <th>Extra confirmado por este módulo</th>
                      <th>Lo que ganaste con esta bolsa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mergeTokenBags(
                      selected.breakdown.token_bags_used || [],
                    ).map((bag, index) => (
                        <tr
                          key={`${bag.token_bag_id || index}`}
                          className="border-t border-white/5 text-zinc-300"
                        >
                          <td className="py-3">
                            Bolsa #{bag.token_bag_id || index + 1}
                          </td>
                          <td>
                            <div className="space-y-1.5">
                              <div>{sourceName(bag)}</div>
                              <span
                                className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${bagKind(bag).className}`}
                                title={bagKind(bag).help}
                              >
                                {bagKind(bag).label}
                              </span>
                            </div>
                          </td>
                          <td>{bag.tokens_used || 0}</td>
                          <td>
                            {Number(bag.benefit_percent || 0) > 0
                              ? `${Number(bag.benefit_percent).toFixed(2)} %`
                              : "Sin beneficio"}
                          </td>
                          <td>
                            {usd(
                              Number(
                                bag.normal_profit_per_token_usd || 0,
                              ),
                            )}
                          </td>
                          <td>
                            {usd(
                              Number(
                                bag.profit_per_token_after_benefit_usd || 0,
                              ),
                            )}
                          </td>
                          <td className="text-cyan-300">
                            {usd(Number(bag.profitability_surplus_usd || 0))}
                          </td>
                          <td>
                            {usd(Number(bag.company_profit_usd || 0) + Number(bag.profitability_surplus_usd || 0))}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-white/10 p-5">
              <h3 className="font-semibold text-white">
                ¿Qué tipo de dinero aportó cada bolsa?
              </h3>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                Esta sección solo explica los componentes que ya quedaron registrados en cada bolsa. No recalcula el cobro ni cambia FIFO, descuentos o ganancias.
              </p>
              <div className="mt-4 grid gap-3">
                {mergeTokenBags(selected.breakdown.token_bags_used || []).map((bag, index) => {
                  const kind = bagKind(bag);
                  const promotional = isPromotionalBag(bag);
                  const tokensUsed = Number(bag.tokens_used || 0);
                  const customerPaid = Number(bag.cash_value_at_purchase_usd || 0);
                  const aiAmount = Number(bag.infrastructure_capacity_from_tokens_usd || 0);
                  const operationalAmount = Number(bag.operational_reserve_from_tokens_usd || 0);
                  const profitAmount = Number(bag.company_profit_usd || 0);

                  return (
                    <div
                      key={`money-${bag.token_bag_id || index}`}
                      className="rounded-xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">
                            Bolsa #{bag.token_bag_id || index + 1} · {sourceName(bag)}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-zinc-500">{kind.help}</p>
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${kind.className}`}>
                          {kind.label}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                        <MoneyPart
                          label="Tokens usados"
                          value={String(tokensUsed)}
                          help="Cuántos tokens de esta bolsa participaron en esta generación."
                        />
                        <MoneyPart
                          label="Pagó el cliente"
                          value={usd(customerPaid)}
                          help={promotional ? "USD 0 porque estos tokens fueron regalados." : "Valor histórico correspondiente a los tokens usados de esta bolsa."}
                        />
                        <MoneyPart
                          label="Parte para IA"
                          value={usd(aiAmount)}
                          help="Respaldo de infraestructura asociado a estos tokens según el snapshot de la bolsa."
                        />
                        <MoneyPart
                          label="Gastos del negocio"
                          value={usd(operationalAmount)}
                          help={promotional ? "USD 0: los tokens gratis no generan gasto operativo." : "Componente operativo congelado en esta bolsa para los tokens utilizados."}
                        />
                        <MoneyPart
                          label="Ganancia de la bolsa"
                          value={usd(profitAmount)}
                          help={promotional ? "USD 0: regalar tokens no crea ganancia." : "Ganancia de estos tokens según el snapshot histórico de la bolsa, después de descuentos o beneficios."}
                        />
                        <MoneyPart
                          label="Extra por rentabilidad"
                          value={usd(Number(bag.profitability_surplus_usd || 0))}
                          help={promotional ? "USD 0: los tokens promocionales nunca crean ganancia comercial." : "Extra confirmado porque este módulo exige una ganancia por token mayor que la ganancia normal segura congelada en esta bolsa. Se mantiene separado del redondeo."}
                        />
                      </div>

                      {promotional && (
                        <div className="mt-3 rounded-lg border border-violet-500/20 bg-violet-500/10 p-3 text-xs leading-5 text-violet-100/80">
                          <strong>Tokens gratis:</strong> esta bolsa es promocional. El cliente no pagó por estos tokens y por eso no genera ganancia ni gasto operativo. Su infraestructura se financia con el fondo promocional correspondiente.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-white/10 p-5">
              <h3 className="font-semibold text-white">
                Resumen explicado de forma sencilla
              </h3>
              {selected.breakdown.profit_applied === false && (
                <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-5 text-amber-100/80">
                  Esta ejecución terminó como {selected.breakdown.termination_status || selected.status}. Según tu Política por resultado, no se cobró la ganancia configurada por token; únicamente se protegió el costo del proveedor y se aplicó el redondeo necesario a tokens enteros.
                </div>
              )}
              {selected.breakdown.settlement_pending && (
                <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
                  <p className="font-semibold">Conciliación pendiente y resultado bloqueado</p>
                  <p className="mt-1">
                    Se cobraron {selected.breakdown.tokens_actually_charged ?? selected.tokens_consumed} tokens.
                    El costo final se estima en {selected.breakdown.estimated_final_tokens ?? "?"} tokens,
                    por lo que faltan aproximadamente {selected.breakdown.estimated_pending_tokens ?? "?"} tokens.
                    El costo completo del proveedor ya aparece en esta generación. Cuando el usuario pague,
                    el backend consumirá las bolsas reales mediante FIFO y actualizará este mismo movimiento.
                  </p>
                </div>
              )}
              <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <Row
                  label="Lo que habrías ganado sin beneficios"
                  value={usd(
                    Number(
                      selected.breakdown.profit_without_benefits_usd || 0,
                    ),
                  )}
                />
                <Row
                  label="Lo que regalaste al cliente"
                  value={`- ${usd(
                    Number(
                      selected.breakdown.benefit_given_to_customer_usd || 0,
                    ),
                  )}`}
                />
                <Row
                  label="Ganancia después de aplicar beneficios"
                  value={usd(Number(selected.breakdown.profit_after_customer_benefits_usd ?? selected.breakdown.company_profit_usd ?? 0))}
                />
                <Row
                  label="Extra confirmado por mayor rentabilidad"
                  value={usd(Number(selected.breakdown.profitability_surplus_for_company_usd || 0))}
                />
                <Row
                  label={selected.breakdown.profit_applied === false ? "Diferencia por cobrar un token entero" : "Centavos adicionales por redondear tokens"}
                  value={usd(Number(selected.breakdown.rounding_surplus_for_company_usd ?? selected.breakdown.profit_rounding_surplus_usd ?? 0))}
                />
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 md:col-span-2">
                  <p className="text-sm font-medium text-emerald-200">
                    {selected.breakdown.profit_applied === false
                      ? "¿Por qué queda dinero para tu empresa si no cobraste ganancia?"
                      : "¿A dónde van esos centavos?"}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-emerald-100/70">
                    {selected.breakdown.profit_applied === false
                      ? "La política de este resultado cobró únicamente el costo del proveedor, sin agregar la ganancia configurada por token. Como los tokens se cobran enteros, el sistema necesitó cobrar al menos un token. Después de cubrir al proveedor, la diferencia queda en tu empresa como ajuste de cobro mínimo; no es la ganancia comercial configurada."
                      : "Se suman completamente a la ganancia de tu empresa. Aparecen cuando el costo exacto requeriría una fracción de token, pero el sistema cobra tokens enteros. No se cuentan como costo del proveedor ni se pierden."}
                  </p>
                </div>
                <Row
                  label="Lo que realmente ganó tu empresa"
                  value={usd(selected.gross_profit_usd)}
                  strong
                />
                <Row
                  label="Costo protegido del proveedor de IA"
                  value={usd(selected.infrastructure_cost_usd)}
                />
                <Row
                  label="Total de esta generación"
                  value={usd(selected.infrastructure_cost_usd + selected.gross_profit_usd)}
                  strong
                  accent="blue"
                />
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

function FriendlyValue({
  label,
  value,
  help,
  accent = "default",
}: {
  label: string;
  value: string;
  help: string;
  accent?: "default" | "blue";
}) {
  return (
    <div className={accent === "blue" ? "rounded-xl border border-blue-500/30 bg-blue-500/10 p-4" : "rounded-xl bg-white/5 p-4"}>
      <p className={accent === "blue" ? "text-xs uppercase text-blue-300" : "text-xs uppercase text-zinc-500"}>{label}</p>
      <p className={accent === "blue" ? "mt-2 text-xl font-semibold text-blue-200" : "mt-2 text-xl font-semibold text-white"}>{value}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-500">{help}</p>
    </div>
  );
}


function MoneyPart({ label, value, help }: { label: string; value: string; help: string }) {
  return (
    <div className="rounded-lg bg-white/[0.04] p-3">
      <p className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs leading-5 text-zinc-500">{help}</p>
    </div>
  );
}


function TimeCostRow({ label, seconds, rate }: { label: string; seconds: number; rate: number }) {
  return (
    <tr className="border-t border-white/5">
      <td className="py-3">{label}</td>
      <td>{seconds.toFixed(3)} s</td>
      <td>{usd(rate)}</td>
      <td>{usd(seconds * rate)}</td>
    </tr>
  );
}

function Row({
  label,
  value,
  strong = false,
  accent = "default",
}: {
  label: string;
  value: string;
  strong?: boolean;
  accent?: "default" | "blue";
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-black/30 p-3">
      <span className="text-zinc-400">{label}</span>
      <span className={accent === "blue" ? "font-semibold text-blue-300" : strong ? "font-semibold text-white" : "text-zinc-200"}>
        {value}
      </span>
    </div>
  );
}
