"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BadgeDollarSign,
  Banknote,
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  LoaderCircle,
  PackageOpen,
  RefreshCcw,
  RotateCcw,
  SearchCheck,
  TriangleAlert,
  Users,
  WalletCards,
} from "lucide-react";

import { BillingBreakdownPanel } from "@/components/backoffice/billing/billing-breakdown-panel";
import { BillingMetricCard } from "@/components/backoffice/billing/billing-metric-card";
import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  BillingDashboardResponse,
} from "@/types/admin-billing-dashboard";

const DEFAULT_CURRENCY = "USD";

function formatMoney(
  value: string,
  currency: string,
): string {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return value;
  }

  return new Intl.NumberFormat(
    "es-MX",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    },
  ).format(parsed);
}

function formatInteger(
  value: number,
): string {
  return value.toLocaleString(
    "es-MX",
  );
}

function toIsoStart(
  value: string,
): string | null {
  if (!value) return null;

  return new Date(
    `${value}T00:00:00`,
  ).toISOString();
}

function toIsoEnd(
  value: string,
): string | null {
  if (!value) return null;

  return new Date(
    `${value}T23:59:59`,
  ).toISOString();
}

export default function BillingDashboardPage() {
  const [dashboard, setDashboard] =
    useState<BillingDashboardResponse | null>(
      null,
    );

  const [currency, setCurrency] =
    useState(DEFAULT_CURRENCY);

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const queryString = useMemo(() => {
    const params =
      new URLSearchParams();

    params.set(
      "currency",
      currency.toUpperCase(),
    );

    const start =
      toIsoStart(startDate);

    const end =
      toIsoEnd(endDate);

    if (start) {
      params.set("start", start);
    }

    if (end) {
      params.set("end", end);
    }

    return params.toString();
  }, [
    currency,
    endDate,
    startDate,
  ]);

  const loadDashboard =
    useCallback(async () => {
      if (
        currency.trim().length !== 3
      ) {
        setErrorMessage(
          "La moneda debe usar un código ISO de tres letras.",
        );
        setIsLoading(false);
        return;
      }

      if (
        startDate &&
        endDate &&
        startDate > endDate
      ) {
        setErrorMessage(
          "La fecha inicial no puede ser posterior a la fecha final.",
        );
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response =
          await browserApiRequest<BillingDashboardResponse>(
            `/api/admin/billing-analytics/dashboard?${queryString}`,
          );

        setDashboard(response);
      } catch (error) {
        setDashboard(null);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No fue posible cargar el dashboard comercial.",
        );
      } finally {
        setIsLoading(false);
      }
    }, [
      currency,
      endDate,
      queryString,
      startDate,
    ]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const resetPeriod = () => {
    setStartDate("");
    setEndDate("");
    setCurrency(
      DEFAULT_CURRENCY,
    );
  };

  const revenue =
    dashboard?.revenue;

  const subscriptions =
    dashboard?.subscriptions;

  const tokens =
    dashboard?.tokens;

  return (
    <div>
      <section className="luxia-panel overflow-hidden rounded-3xl">
        <div className="border-b border-white/6 p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
                <BadgeDollarSign
                  size={24}
                />
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
                  Comercial
                </p>

                <h1 className="mt-2 text-2xl font-semibold text-white">
                  Dashboard de facturación
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                  Resumen real de ingresos, pagos,
                  suscripciones y compras de tokens
                  calculado por el backend.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadDashboard()
              }
              disabled={isLoading}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400 disabled:opacity-50"
            >
              <RefreshCcw
                size={16}
                className={
                  isLoading
                    ? "animate-spin"
                    : undefined
                }
              />
              Actualizar
            </button>
          </div>
        </div>
      </section>

      <section className="luxia-panel mt-5 rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <CalendarDays className="text-red-400" />

          <div>
            <h2 className="font-semibold text-white">
              Periodo y moneda
            </h2>

            <p className="mt-1 text-xs text-zinc-600">
              Los tres parámetros se envían directamente
              al endpoint de analítica comercial.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_180px_auto]">
          <label>
            <span className="mb-2 block text-xs text-zinc-600">
              Fecha inicial
            </span>

            <input
              type="date"
              value={startDate}
              onChange={(event) =>
                setStartDate(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-zinc-300"
            />
          </label>

          <label>
            <span className="mb-2 block text-xs text-zinc-600">
              Fecha final
            </span>

            <input
              type="date"
              value={endDate}
              onChange={(event) =>
                setEndDate(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-zinc-300"
            />
          </label>

          <label>
            <span className="mb-2 block text-xs text-zinc-600">
              Moneda ISO
            </span>

            <input
              value={currency}
              maxLength={3}
              onChange={(event) =>
                setCurrency(
                  event.target.value
                    .toUpperCase(),
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm uppercase text-white"
            />
          </label>

          <button
            type="button"
            onClick={resetPeriod}
            className="mt-auto inline-flex h-11 items-center justify-center rounded-xl border border-white/8 px-4 text-sm text-zinc-500 hover:text-white"
          >
            Restablecer
          </button>
        </div>
      </section>

      {isLoading && (
        <section className="luxia-panel mt-5 flex min-h-80 items-center justify-center rounded-3xl">
          <LoaderCircle className="animate-spin text-red-500" />
        </section>
      )}

      {!isLoading &&
        errorMessage && (
          <section className="luxia-panel mt-5 rounded-3xl p-6">
            <div className="flex items-start gap-3 rounded-2xl border border-red-500/15 bg-red-950/15 p-5">
              <TriangleAlert
                size={19}
                className="mt-0.5 shrink-0 text-red-400"
              />

              <p className="text-sm leading-6 text-red-300">
                {errorMessage}
              </p>
            </div>
          </section>
        )}

      {!isLoading &&
        !errorMessage &&
        dashboard &&
        revenue &&
        subscriptions &&
        tokens && (
          <>
            <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <BillingMetricCard
                label="Ingresos brutos"
                value={formatMoney(
                  revenue.gross_revenue,
                  revenue.currency,
                )}
                description="Total antes de descontar reembolsos."
                icon={Banknote}
              />

              <BillingMetricCard
                label="Ingresos netos"
                value={formatMoney(
                  revenue.net_revenue,
                  revenue.currency,
                )}
                description="Ingresos después de reembolsos."
                icon={CircleDollarSign}
              />

              <BillingMetricCard
                label="MRR"
                value={formatMoney(
                  subscriptions.monthly_recurring_revenue,
                  subscriptions.currency,
                )}
                description="Ingreso recurrente mensual estimado."
                icon={WalletCards}
              />

              <BillingMetricCard
                label="Tokens vendidos"
                value={formatInteger(
                  tokens.tokens_sold,
                )}
                description="Tokens incluidos en compras completadas."
                icon={PackageOpen}
              />
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-3">
              <BillingBreakdownPanel
                title="Ingresos"
                description="Desglose financiero del periodo."
                icon={BadgeDollarSign}
                items={[
                  {
                    label:
                      "Suscripciones",
                    value: formatMoney(
                      revenue.subscription_revenue,
                      revenue.currency,
                    ),
                  },
                  {
                    label:
                      "Compras de tokens",
                    value: formatMoney(
                      revenue.token_purchase_revenue,
                      revenue.currency,
                    ),
                  },
                  {
                    label:
                      "Otros ingresos",
                    value: formatMoney(
                      revenue.other_revenue,
                      revenue.currency,
                    ),
                  },
                  {
                    label:
                      "Reembolsado",
                    value: formatMoney(
                      revenue.refunded_revenue,
                      revenue.currency,
                    ),
                  },
                ]}
              />

              <BillingBreakdownPanel
                title="Pagos"
                description="Resultado de pagos registrados."
                icon={CreditCard}
                items={[
                  {
                    label:
                      "Exitosos",
                    value: formatInteger(
                      revenue.successful_payments,
                    ),
                  },
                  {
                    label:
                      "Fallidos",
                    value: formatInteger(
                      revenue.failed_payments,
                    ),
                  },
                  {
                    label:
                      "Reembolsados",
                    value: formatInteger(
                      revenue.refunded_payments,
                    ),
                  },
                  {
                    label:
                      "Parcialmente reembolsados",
                    value: formatInteger(
                      revenue.partially_refunded_payments,
                    ),
                  },
                ]}
              />

              <BillingBreakdownPanel
                title="Suscripciones"
                description="Estado comercial de suscriptores."
                icon={Users}
                items={[
                  {
                    label:
                      "Activas",
                    value: formatInteger(
                      subscriptions.active_subscriptions,
                    ),
                  },
                  {
                    label:
                      "En prueba",
                    value: formatInteger(
                      subscriptions.trialing_subscriptions,
                    ),
                  },
                  {
                    label:
                      "Vencidas",
                    value: formatInteger(
                      subscriptions.past_due_subscriptions,
                    ),
                  },
                  {
                    label:
                      "Canceladas",
                    value: formatInteger(
                      subscriptions.canceled_subscriptions,
                    ),
                  },
                  {
                    label:
                      "Impagadas",
                    value: formatInteger(
                      subscriptions.unpaid_subscriptions,
                    ),
                  },
                ]}
              />
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-2">
              <BillingBreakdownPanel
                title="Movimiento de suscripciones"
                description="Altas, bajas y churn del periodo."
                icon={SearchCheck}
                items={[
                  {
                    label:
                      "Nuevas",
                    value: formatInteger(
                      subscriptions.new_subscriptions,
                    ),
                  },
                  {
                    label:
                      "Canceladas en el periodo",
                    value: formatInteger(
                      subscriptions.canceled_during_period,
                    ),
                  },
                  {
                    label:
                      "Churn",
                    value: `${Number(
                      subscriptions.subscriber_churn_rate,
                    ).toLocaleString(
                      "es-MX",
                      {
                        maximumFractionDigits: 2,
                      },
                    )}%`,
                  },
                  {
                    label:
                      "ARR",
                    value: formatMoney(
                      subscriptions.annual_recurring_revenue,
                      subscriptions.currency,
                    ),
                  },
                ]}
              />

              <BillingBreakdownPanel
                title="Compras de tokens"
                description="Estado de las compras y tokens concedidos."
                icon={RotateCcw}
                items={[
                  {
                    label:
                      "Completadas",
                    value: formatInteger(
                      tokens.completed_purchases,
                    ),
                  },
                  {
                    label:
                      "Pendientes",
                    value: formatInteger(
                      tokens.pending_purchases,
                    ),
                  },
                  {
                    label:
                      "Fallidas",
                    value: formatInteger(
                      tokens.failed_purchases,
                    ),
                  },
                  {
                    label:
                      "Reembolsadas",
                    value: formatInteger(
                      tokens.refunded_purchases,
                    ),
                  },
                  {
                    label:
                      "Tokens de bonificación",
                    value: formatInteger(
                      tokens.bonus_tokens_granted,
                    ),
                  },
                  {
                    label:
                      "Total concedido",
                    value: formatInteger(
                      tokens.total_tokens_granted,
                    ),
                  },
                ]}
              />
            </section>

            <section className="mt-5 rounded-2xl border border-white/7 bg-black/20 p-4 text-xs leading-6 text-zinc-600">
              Datos generados por el backend el{" "}
              {new Date(
                dashboard.generated_at,
              ).toLocaleString(
                "es-MX",
              )}
              . Periodo de ingresos:{" "}
              {new Date(
                revenue.period_start,
              ).toLocaleString(
                "es-MX",
              )}{" "}
              a{" "}
              {new Date(
                revenue.period_end,
              ).toLocaleString(
                "es-MX",
              )}
              .
            </section>
          </>
        )}
    </div>
  );
}
