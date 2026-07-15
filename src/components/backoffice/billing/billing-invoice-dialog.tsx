"use client";

import {
  Download,
  ExternalLink,
  FileText,
  LoaderCircle,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  BillingInvoiceDocumentResponse,
  BillingInvoiceHistoryResponse,
} from "@/types/admin-billing-invoices";

interface BillingInvoiceDialogProps {
  invoiceId: number;
  onClose: () => void;
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "No disponible";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("es-MX");
}

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

function openDocument(url: string) {
  window.open(
    url,
    "_blank",
    "noopener,noreferrer",
  );
}

export function BillingInvoiceDialog({
  invoiceId,
  onClose,
}: BillingInvoiceDialogProps) {
  const [invoice, setInvoice] =
    useState<BillingInvoiceHistoryResponse | null>(
      null,
    );
  const [documents, setDocuments] =
    useState<BillingInvoiceDocumentResponse | null>(
      null,
    );
  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadInvoice() {
      setIsLoading(true);

      try {
        const [
          invoiceResponse,
          documentResponse,
        ] = await Promise.all([
          browserApiRequest<BillingInvoiceHistoryResponse>(
            `/api/admin/billing-invoices/${invoiceId}`,
          ),
          browserApiRequest<BillingInvoiceDocumentResponse>(
            `/api/admin/billing-invoices/${invoiceId}/documents`,
          ),
        ]);

        if (!cancelled) {
          setInvoice(invoiceResponse);
          setDocuments(documentResponse);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "No fue posible cargar la factura.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadInvoice();

    return () => {
      cancelled = true;
    };
  }, [invoiceId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="billing-invoice-title"
    >
      <article className="luxia-panel max-h-[94vh] w-full max-w-6xl overflow-auto rounded-3xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/6 bg-[#09090a]/95 p-6 backdrop-blur">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Factura #{invoiceId}
            </p>

            <h2
              id="billing-invoice-title"
              className="mt-2 text-xl font-semibold text-white"
            >
              Detalle de factura
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl border border-white/8 text-zinc-500 hover:text-white"
            aria-label="Cerrar"
          >
            <X size={17} />
          </button>
        </header>

        <div className="p-6">
          {isLoading && (
            <div className="flex min-h-64 items-center justify-center">
              <LoaderCircle className="animate-spin text-red-500" />
            </div>
          )}

          {!isLoading && invoice && (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  [
                    "Número",
                    invoice.invoice_number ??
                      "No disponible",
                  ],
                  [
                    "Estado",
                    invoice.status,
                  ],
                  [
                    "Total",
                    formatMoney(
                      invoice.total,
                      invoice.currency,
                    ),
                  ],
                  [
                    "Pagado",
                    formatMoney(
                      invoice.amount_paid,
                      invoice.currency,
                    ),
                  ],
                ].map(([label, value]) => (
                  <article
                    key={label}
                    className="rounded-2xl border border-white/7 bg-black/20 p-4"
                  >
                    <p className="text-xs text-zinc-600">
                      {label}
                    </p>
                    <p className="mt-2 break-words text-sm font-semibold text-white">
                      {value}
                    </p>
                  </article>
                ))}
              </section>

              <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                  ["Usuario", invoice.user_id],
                  [
                    "Billing Customer",
                    invoice.billing_customer_id,
                  ],
                  [
                    "Suscripción",
                    invoice.user_subscription_id,
                  ],
                  [
                    "Pago asociado",
                    invoice.billing_payment_id,
                  ],
                  [
                    "Proveedor",
                    invoice.provider,
                  ],
                  [
                    "Provider Invoice ID",
                    invoice.provider_invoice_id,
                  ],
                ].map(([label, value]) => (
                  <article
                    key={String(label)}
                    className="rounded-2xl border border-white/7 bg-black/20 p-4"
                  >
                    <p className="text-xs text-zinc-600">
                      {String(label)}
                    </p>
                    <p className="mt-2 break-all font-mono text-xs text-zinc-300">
                      {value === null || value === ""
                        ? "No disponible"
                        : String(value)}
                    </p>
                  </article>
                ))}
              </section>

              <section className="mt-5 grid gap-5 xl:grid-cols-2">
                <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
                  <h3 className="font-semibold text-white">
                    Importes
                  </h3>

                  <dl className="mt-4 space-y-3 text-xs">
                    {[
                      ["Subtotal", invoice.subtotal],
                      [
                        "Descuento",
                        invoice.discount_amount,
                      ],
                      ["Impuestos", invoice.tax_amount],
                      ["Total", invoice.total],
                      [
                        "Importe pagado",
                        invoice.amount_paid,
                      ],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex justify-between gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0"
                      >
                        <dt className="text-zinc-600">
                          {label}
                        </dt>
                        <dd className="font-semibold text-zinc-300">
                          {formatMoney(
                            value,
                            invoice.currency,
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </article>

                <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
                  <h3 className="font-semibold text-white">
                    Fechas
                  </h3>

                  <dl className="mt-4 space-y-3 text-xs">
                    {[
                      [
                        "Inicio del periodo",
                        invoice.period_start,
                      ],
                      [
                        "Fin del periodo",
                        invoice.period_end,
                      ],
                      ["Vencimiento", invoice.due_at],
                      ["Pagada", invoice.paid_at],
                      ["Creada", invoice.created_at],
                      [
                        "Actualizada",
                        invoice.updated_at,
                      ],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex justify-between gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0"
                      >
                        <dt className="text-zinc-600">
                          {label}
                        </dt>
                        <dd className="text-right text-zinc-300">
                          {formatDate(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </article>
              </section>

              <section className="mt-5 rounded-2xl border border-blue-500/10 bg-blue-950/10 p-5">
                <div className="flex items-start gap-3">
                  <FileText
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-400"
                  />

                  <div>
                    <h3 className="font-semibold text-blue-300">
                      Documentos de Stripe
                    </h3>
                    <p className="mt-2 text-xs leading-6 text-blue-300/70">
                      {documents?.message ??
                        "No fue posible determinar la disponibilidad."}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={
                      !documents?.hosted_invoice_url
                    }
                    onClick={() => {
                      if (
                        documents?.hosted_invoice_url
                      ) {
                        openDocument(
                          documents.hosted_invoice_url,
                        );
                      }
                    }}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-blue-500/15 px-4 text-sm text-blue-300 disabled:opacity-35"
                  >
                    <ExternalLink size={15} />
                    Abrir factura alojada
                  </button>

                  <button
                    type="button"
                    disabled={
                      !documents?.invoice_pdf_url
                    }
                    onClick={() => {
                      if (
                        documents?.invoice_pdf_url
                      ) {
                        openDocument(
                          documents.invoice_pdf_url,
                        );
                      }
                    }}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-500/15 px-4 text-sm text-red-300 disabled:opacity-35"
                  >
                    <Download size={15} />
                    Abrir PDF
                  </button>
                </div>
              </section>

              <section className="mt-5 rounded-2xl border border-white/7 bg-black/20 p-5">
                <h3 className="font-semibold text-white">
                  Metadata
                </h3>

                <pre className="mt-4 max-h-80 overflow-auto rounded-xl bg-[#050506] p-4 font-mono text-xs leading-6 text-zinc-400">
                  {JSON.stringify(
                    invoice.metadata,
                    null,
                    2,
                  )}
                </pre>
              </section>
            </>
          )}
        </div>
      </article>
    </div>
  );
}
