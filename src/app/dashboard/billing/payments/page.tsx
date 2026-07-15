"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  LoaderCircle,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldAlert,
  TriangleAlert,
  XCircle,
} from "lucide-react";

import { BillingPaymentDialog } from "@/components/backoffice/billing/billing-payment-dialog";
import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  BillingPaymentHistoryListResponse,
  BillingPaymentHistoryResponse,
} from "@/types/admin-billing-payments";

const PAGE_SIZE = 100;

function formatMoney(
  value: string,
  currency: string,
): string {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return `${value} ${currency.toUpperCase()}`;
  }

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

function statusClass(status: string): string {
  if (status === "succeeded") {
    return "border-emerald-500/15 bg-emerald-950/15 text-emerald-400";
  }

  if (
    status === "processing" ||
    status === "pending"
  ) {
    return "border-blue-500/15 bg-blue-950/15 text-blue-400";
  }

  if (
    status === "partially_refunded" ||
    status === "refunded"
  ) {
    return "border-amber-500/15 bg-amber-950/15 text-amber-400";
  }

  return "border-red-500/15 bg-red-950/15 text-red-400";
}

export default function BillingPaymentsPage() {
  const [response, setResponse] =
    useState<BillingPaymentHistoryListResponse>({
      items: [],
      total: 0,
      skip: 0,
      limit: PAGE_SIZE,
    });
  const [page, setPage] = useState(0);
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("");
  const [paymentType, setPaymentType] =
    useState("");
  const [search, setSearch] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] =
    useState<number | null>(null);
  const [isLoading, setIsLoading] =
    useState(true);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    params.set(
      "skip",
      String(page * PAGE_SIZE),
    );
    params.set(
      "limit",
      String(PAGE_SIZE),
    );

    if (userId.trim()) {
      params.set("user_id", userId.trim());
    }

    if (status) {
      params.set("status", status);
    }

    if (paymentType.trim()) {
      params.set(
        "payment_type",
        paymentType.trim(),
      );
    }

    return params.toString();
  }, [page, paymentType, status, userId]);

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result =
        await browserApiRequest<BillingPaymentHistoryListResponse>(
          `/api/admin/billing-payments?${queryString}`,
        );

      setResponse(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar los pagos.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const visibleItems = useMemo(() => {
    const normalized =
      search.trim().toLowerCase();

    if (!normalized) {
      return response.items;
    }

    return response.items.filter((payment) =>
      [
        payment.id,
        payment.user_id,
        payment.payment_type,
        payment.status,
        payment.description ?? "",
        payment.provider_payment_intent_id ?? "",
        payment.provider_charge_id ?? "",
        payment.provider_checkout_session_id ?? "",
        payment.failure_code ?? "",
      ].some((value) =>
        String(value)
          .toLowerCase()
          .includes(normalized),
      ),
    );
  }, [response.items, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(response.total / PAGE_SIZE),
  );

  const metrics = useMemo(
    () => ({
      succeeded: response.items.filter(
        (item) => item.status === "succeeded",
      ).length,
      failed: response.items.filter(
        (item) => item.status === "failed",
      ).length,
      refunded: response.items.filter(
        (item) =>
          item.status === "refunded" ||
          item.status === "partially_refunded",
      ).length,
      canceled: response.items.filter(
        (item) => item.status === "canceled",
      ).length,
    }),
    [response.items],
  );

  const updatePayment = (
    updated: BillingPaymentHistoryResponse,
  ) => {
    setResponse((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === updated.id ? updated : item,
      ),
    }));
  };

  return (
    <div>
      <section className="luxia-panel overflow-hidden rounded-3xl">
        <div className="border-b border-white/6 p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
                <CreditCard size={24} />
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
                  Comercial
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-white">
                  Pagos
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                  Historial de pagos, identificadores de
                  Stripe, fallos, conciliación y
                  reembolsos administrativos.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void loadPayments()}
              disabled={isLoading}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400 disabled:opacity-50"
            >
              <RefreshCcw
                size={16}
                className={
                  isLoading ? "animate-spin" : undefined
                }
              />
              Actualizar
            </button>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Exitosos en página", metrics.succeeded, CheckCircle2],
          ["Fallidos", metrics.failed, ShieldAlert],
          ["Reembolsados", metrics.refunded, RotateCcw],
          ["Cancelados", metrics.canceled, XCircle],
        ].map(([label, value, Icon]) => {
          const MetricIcon = Icon as typeof CreditCard;

          return (
            <article
              key={String(label)}
              className="luxia-panel rounded-2xl p-5"
            >
              <MetricIcon
                size={18}
                className="text-red-400"
              />
              <p className="mt-4 text-xs text-zinc-600">
                {String(label)}
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {Number(value)}
              </p>
            </article>
          );
        })}
      </section>

      <section className="luxia-panel mt-5 rounded-3xl p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-zinc-700"
            />
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Buscar en la página..."
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 pr-4 pl-11 text-sm text-white"
            />
          </label>

          <input
            type="number"
            min={1}
            value={userId}
            onChange={(event) => {
              setUserId(event.target.value);
              setPage(0);
            }}
            placeholder="User ID"
            className="h-11 rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
          />

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(0);
            }}
            className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
          >
            <option value="">
              Cualquier estado
            </option>
            <option value="pending">pending</option>
            <option value="processing">processing</option>
            <option value="succeeded">succeeded</option>
            <option value="failed">failed</option>
            <option value="canceled">canceled</option>
            <option value="refunded">refunded</option>
            <option value="partially_refunded">
              partially_refunded
            </option>
          </select>

          <input
            value={paymentType}
            onChange={(event) => {
              setPaymentType(event.target.value);
              setPage(0);
            }}
            placeholder="Payment type"
            className="h-11 rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
          />
        </div>
      </section>

      {isLoading && (
        <section className="luxia-panel mt-5 flex min-h-80 items-center justify-center rounded-3xl">
          <LoaderCircle className="animate-spin text-red-500" />
        </section>
      )}

      {!isLoading && errorMessage && (
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

      {!isLoading && !errorMessage && (
        <section className="luxia-panel mt-5 overflow-hidden rounded-3xl">
          {visibleItems.length === 0 ? (
            <div className="p-12 text-center text-sm text-zinc-600">
              No existen pagos que coincidan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1320px] text-left">
                <thead className="border-b border-white/6 bg-black/20 text-[10px] tracking-[0.14em] text-zinc-700 uppercase">
                  <tr>
                    <th className="px-5 py-4">Pago</th>
                    <th className="px-5 py-4">Usuario</th>
                    <th className="px-5 py-4">Tipo</th>
                    <th className="px-5 py-4">Estado</th>
                    <th className="px-5 py-4">Importe</th>
                    <th className="px-5 py-4">Reembolsado</th>
                    <th className="px-5 py-4">PaymentIntent</th>
                    <th className="px-5 py-4">Fecha</th>
                    <th className="px-5 py-4 text-right">Acción</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {visibleItems.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-white">
                          #{payment.id}
                        </p>
                        <p className="mt-1 max-w-xs truncate text-xs text-zinc-600">
                          {payment.description ??
                            "Sin descripción"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-400">
                        #{payment.user_id}
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-400">
                        {payment.payment_type}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClass(
                            payment.status,
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-300">
                        {formatMoney(
                          payment.amount,
                          payment.currency,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-400">
                        {formatMoney(
                          payment.refunded_amount,
                          payment.currency,
                        )}
                      </td>

                      <td className="max-w-xs px-5 py-4">
                        <p className="truncate font-mono text-xs text-zinc-500">
                          {payment.provider_payment_intent_id ??
                            "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-xs text-zinc-500">
                        {new Date(
                          payment.created_at,
                        ).toLocaleString("es-MX")}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedPaymentId(
                              payment.id,
                            )
                          }
                          className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/8 px-3 text-xs text-zinc-400 hover:text-white"
                        >
                          <Eye size={14} />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <footer className="flex items-center justify-between gap-4 border-t border-white/6 p-5">
            <button
              type="button"
              disabled={page === 0}
              onClick={() =>
                setPage((current) =>
                  Math.max(0, current - 1),
                )
              }
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400 disabled:opacity-30"
            >
              <ChevronLeft size={15} />
              Anterior
            </button>

            <span className="text-xs text-zinc-600">
              Página {page + 1} de {totalPages} ·{" "}
              {response.total.toLocaleString("es-MX")} pagos
            </span>

            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() =>
                setPage((current) => current + 1)
              }
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400 disabled:opacity-30"
            >
              Siguiente
              <ChevronRight size={15} />
            </button>
          </footer>
        </section>
      )}

      {selectedPaymentId !== null && (
        <BillingPaymentDialog
          paymentId={selectedPaymentId}
          onClose={() =>
            setSelectedPaymentId(null)
          }
          onUpdated={updatePayment}
        />
      )}
    </div>
  );
}
