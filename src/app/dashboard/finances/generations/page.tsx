"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { browserApiRequest } from "@/lib/api/browser-api";

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
  coupon_code?: string | null;
  plan_name?: string | null;
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
  billable_seconds?: number;
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

const sourceName = (bag: TokenBag) => {
  if (bag.plan_name) return `Plan ${bag.plan_name}`;
  if (bag.coupon_code) return `Compra con cupón ${bag.coupon_code}`;
  const source = String(bag.source_label || bag.source || "");
  if (source.includes("subscription")) return "Tokens incluidos en un plan";
  if (source.includes("purchase")) return "Compra de tokens";
  if (source.includes("legacy")) return "Saldo anterior sin detalle";
  return source || "Origen no identificado";
};

export default function GenerationFinancesPage() {
  const [data, setData] = useState<Response | null>(null);
  const [status, setStatus] = useState("");
  const [trace, setTrace] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<FinanceItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "500" });
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
  }, [status, trace]);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = data?.summary;
  const cards = useMemo(
    () => [
      {
        label: "Dinero reservado para proveedores de IA",
        value: usd(summary?.infrastructure_cost_usd ?? 0),
      },
      {
        label: "Lo que realmente ganó tu empresa",
        value: usd(summary?.gross_profit_usd ?? 0),
      },
      {
        label: "Total económico de las generaciones",
        value: usd(
          (summary?.infrastructure_cost_usd ?? 0) +
            (summary?.gross_profit_usd ?? 0),
        ),
      },
      {
        label: "Generaciones registradas",
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
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white"
        >
          <option value="">Todos los estados</option>
          <option value="completed">Completadas</option>
          <option value="cancelled">Canceladas</option>
          <option value="failed">Fallidas</option>
        </select>
        <select
          value={trace}
          onChange={(event) => setTrace(event.target.value)}
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
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-white/5 text-left text-zinc-400">
            <tr>
              <th className="p-3">Generación</th>
              <th>Módulo</th>
              <th>Estado</th>
              <th>Tokens usados</th>
              <th>Para pagar al proveedor</th>
              <th>Beneficio entregado</th>
              <th>Lo que ganó tu empresa</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-zinc-500">
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
                    <td>{item.status}</td>
                    <td>{item.tokens_consumed}</td>
                    <td>{usd(item.infrastructure_cost_usd)}</td>
                    <td>{usd(benefit)}</td>
                    <td className="text-emerald-300">
                      {usd(item.gross_profit_usd)}
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

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <FriendlyValue
                label="Dinero para pagar al proveedor de IA"
                value={usd(selected.infrastructure_cost_usd)}
                help="Este dinero no es ganancia. Se reserva para Modal, Beam, RunPod o el proveedor utilizado."
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
                label="Lo que realmente ganó tu empresa"
                value={usd(selected.gross_profit_usd)}
                help="Este sí es el dinero que queda como ganancia después del beneficio."
              />
            </div>

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
                      <th>Lo que ganaste con esta bolsa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.breakdown.token_bags_used || []).map(
                      (bag, index) => (
                        <tr
                          key={`${bag.token_bag_id || index}`}
                          className="border-t border-white/5 text-zinc-300"
                        >
                          <td className="py-3">
                            Bolsa #{bag.token_bag_id || index + 1}
                          </td>
                          <td>{sourceName(bag)}</td>
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
                          <td>
                            {usd(Number(bag.company_profit_usd || 0))}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-white/10 p-5">
              <h3 className="font-semibold text-white">
                Resumen explicado de forma sencilla
              </h3>
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
                  label="Lo que realmente ganó tu empresa"
                  value={usd(selected.gross_profit_usd)}
                  strong
                />
                <Row
                  label="Dinero reservado para pagar al proveedor"
                  value={usd(selected.infrastructure_cost_usd)}
                />
                <Row
                  label="Total económico de esta generación"
                  value={usd(
                    selected.infrastructure_cost_usd +
                      selected.gross_profit_usd,
                  )}
                  strong
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
}: {
  label: string;
  value: string;
  help: string;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-4">
      <p className="text-xs uppercase text-zinc-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-500">{help}</p>
    </div>
  );
}

function Row({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-black/30 p-3">
      <span className="text-zinc-400">{label}</span>
      <span className={strong ? "font-semibold text-white" : "text-zinc-200"}>
        {value}
      </span>
    </div>
  );
}
