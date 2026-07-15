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
  Clock3,
  Eye,
  FileText,
  LoaderCircle,
  RefreshCcw,
  Search,
  ShieldAlert,
  TriangleAlert,
  XCircle,
} from "lucide-react";

import { BillingInvoiceDialog } from "@/components/backoffice/billing/billing-invoice-dialog";
import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  BillingInvoiceHistoryListResponse,
} from "@/types/admin-billing-invoices";

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
  if (status === "paid") {
    return "border-emerald-500/15 bg-emerald-950/15 text-emerald-400";
  }

  if (
    status === "draft" ||
    status === "open"
  ) {
    return "border-blue-500/15 bg-blue-950/15 text-blue-400";
  }

  if (status === "uncollectible") {
    return "border-amber-500/15 bg-amber-950/15 text-amber-400";
  }

  return "border-red-500/15 bg-red-950/15 text-red-400";
}

export default function BillingInvoicesPage() {
  const [response, setResponse] =
    useState<BillingInvoiceHistoryListResponse>({
      items: [],
      total: 0,
      skip: 0,
      limit: PAGE_SIZE,
    });
  const [page, setPage] = useState(0);
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] =
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

    return params.toString();
  }, [page, status, userId]);

  const loadInvoices = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result =
        await browserApiRequest<BillingInvoiceHistoryListResponse>(
          `/api/admin/billing-invoices?${queryString}`,
        );

      setResponse(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar las facturas.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  const visibleItems = useMemo(() => {
    const normalized =
      search.trim().toLowerCase();

    if (!normalized) {
      return response.items;
    }

    return response.items.filter((invoice) =>
      [
        invoice.id,
        invoice.user_id,
        invoice.invoice_number ?? "",
        invoice.provider_invoice_id,
        invoice.status,
        invoice.billing_payment_id ?? "",
        invoice.user_subscription_id ?? "",
      ].some((value) =>
        String(value)
          .toLowerCase()
          .includes(normalized),
      ),
    );
  }, [response.items, search]);

  const metrics = useMemo(
    () => ({
      paid: response.items.filter(
        (item) => item.status === "paid",
      ).length,
      open: response.items.filter(
        (item) => item.status === "open",
      ).length,
      uncollectible: response.items.filter(
        (item) =>
          item.status === "uncollectible",
      ).length,
      void: response.items.filter(
        (item) => item.status === "void",
      ).length,
    }),
    [response.items],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(response.total / PAGE_SIZE),
  );

  return (
    <div>
      <section className="luxia-panel overflow-hidden rounded-3xl">
        <div className="border-b border-white/6 p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
                <FileText size={24} />
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
                  Comercial
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-white">
                  Facturas
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                  Consulta facturas sincronizadas, importes,
                  periodos, estado y documentos alojados por
                  Stripe.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void loadInvoices()}
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
          ["Pagadas en página", metrics.paid, CheckCircle2],
          ["Abiertas", metrics.open, Clock3],
          [
            "Incobrables",
            metrics.uncollectible,
            ShieldAlert,
          ],
          ["Anuladas", metrics.void, XCircle],
        ].map(([label, value, Icon]) => {
          const MetricIcon = Icon as typeof FileText;

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
        <div className="grid gap-4 md:grid-cols-3">
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
            <option value="draft">draft</option>
            <option value="open">open</option>
            <option value="paid">paid</option>
            <option value="void">void</option>
            <option value="uncollectible">
              uncollectible
            </option>
          </select>
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
              No existen facturas que coincidan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1320px] text-left">
                <thead className="border-b border-white/6 bg-black/20 text-[10px] tracking-[0.14em] text-zinc-700 uppercase">
                  <tr>
                    <th className="px-5 py-4">Factura</th>
                    <th className="px-5 py-4">Usuario</th>
                    <th className="px-5 py-4">Estado</th>
                    <th className="px-5 py-4">Subtotal</th>
                    <th className="px-5 py-4">Descuento</th>
                    <th className="px-5 py-4">Impuestos</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Periodo</th>
                    <th className="px-5 py-4 text-right">Acción</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {visibleItems.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-white">
                          {invoice.invoice_number ??
                            `#${invoice.id}`}
                        </p>
                        <p className="mt-1 max-w-xs truncate font-mono text-[10px] text-zinc-700">
                          {invoice.provider_invoice_id}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-400">
                        #{invoice.user_id}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClass(
                            invoice.status,
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-400">
                        {formatMoney(
                          invoice.subtotal,
                          invoice.currency,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-400">
                        {formatMoney(
                          invoice.discount_amount,
                          invoice.currency,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-400">
                        {formatMoney(
                          invoice.tax_amount,
                          invoice.currency,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-white">
                        {formatMoney(
                          invoice.total,
                          invoice.currency,
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs text-zinc-500">
                        <p>
                          {invoice.period_start
                            ? new Date(
                                invoice.period_start,
                              ).toLocaleDateString(
                                "es-MX",
                              )
                            : "—"}
                        </p>
                        <p className="mt-1">
                          a{" "}
                          {invoice.period_end
                            ? new Date(
                                invoice.period_end,
                              ).toLocaleDateString(
                                "es-MX",
                              )
                            : "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedInvoiceId(
                              invoice.id,
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
              {response.total.toLocaleString("es-MX")} facturas
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

      {selectedInvoiceId !== null && (
        <BillingInvoiceDialog
          invoiceId={selectedInvoiceId}
          onClose={() =>
            setSelectedInvoiceId(null)
          }
        />
      )}
    </div>
  );
}
