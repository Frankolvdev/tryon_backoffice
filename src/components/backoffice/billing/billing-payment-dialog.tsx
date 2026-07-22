"use client";

import {
  AlertTriangle,
  LoaderCircle,
  RefreshCcw,
  RotateCcw,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  BillingPaymentHistoryResponse,
  BillingPaymentReconcileResponse,
  BillingPaymentRefundRequest,
  BillingPaymentRefundResponse,
} from "@/types/admin-billing-payments";

interface BillingPaymentDialogProps {
  paymentId: number;
  onClose: () => void;
  onUpdated: (
    payment: BillingPaymentHistoryResponse,
  ) => void;
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

export function BillingPaymentDialog({
  paymentId,
  onClose,
  onUpdated,
}: BillingPaymentDialogProps) {
  const [payment, setPayment] =
    useState<BillingPaymentHistoryResponse | null>(
      null,
    );
  const [refundAmount, setRefundAmount] =
    useState("");
  const [refundReason, setRefundReason] =
    useState<BillingPaymentRefundRequest["reason"]>(
      "requested_by_customer",
    );
  const [removeTokens, setRemoveTokens] = useState(true);
  const [isLoading, setIsLoading] =
    useState(true);
  const [action, setAction] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPayment() {
      setIsLoading(true);

      try {
        const response =
          await browserApiRequest<BillingPaymentHistoryResponse>(
            `/api/admin/billing-payments/${paymentId}`,
          );

        if (!cancelled) {
          setPayment(response);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "No fue posible cargar el pago.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadPayment();

    return () => {
      cancelled = true;
    };
  }, [paymentId]);

  const reconcile = async () => {
    if (!payment) return;

    setAction("reconcile");

    try {
      const response =
        await browserApiRequest<BillingPaymentReconcileResponse>(
          `/api/admin/billing-payments/${payment.id}/reconcile`,
          {
            method: "POST",
          },
        );

      setPayment(response.payment);
      onUpdated(response.payment);
      toast.success(response.message);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible conciliar el pago.",
      );
    } finally {
      setAction(null);
    }
  };

  const refund = async () => {
    if (!payment) return;

    const parsedAmount =
      refundAmount.trim()
        ? Number(refundAmount)
        : null;

    if (
      parsedAmount !== null &&
      (!Number.isFinite(parsedAmount) ||
        parsedAmount <= 0)
    ) {
      toast.error(
        "El importe debe ser mayor que cero.",
      );
      return;
    }

    if (
      parsedAmount !== null &&
      parsedAmount >
        Number(payment.refundable_amount)
    ) {
      toast.error(
        "El importe supera el saldo reembolsable.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Se reembolsará el pago #${payment.id}. ¿Deseas continuar?`,
    );

    if (!confirmed) return;

    const payload: BillingPaymentRefundRequest = {
      amount: parsedAmount,
      reason: refundReason,
      remove_tokens: payment.payment_type === "token_purchase" ? removeTokens : undefined,
    };

    setAction("refund");

    try {
      const response =
        await browserApiRequest<BillingPaymentRefundResponse>(
          `/api/admin/billing-payments/${payment.id}/refund`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );

      setPayment(response.payment);
      onUpdated(response.payment);
      toast.success(response.message);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible reembolsar el pago.",
      );
    } finally {
      setAction(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="billing-payment-title"
    >
      <article className="luxia-panel max-h-[94vh] w-full max-w-6xl overflow-auto rounded-3xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/6 bg-[#09090a]/95 p-6 backdrop-blur">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Pago #{paymentId}
            </p>

            <h2
              id="billing-payment-title"
              className="mt-2 text-xl font-semibold text-white"
            >
              Detalle y operaciones
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

          {!isLoading && payment && (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Usuario", `#${payment.user_id}`],
                  ["Estado", payment.status],
                  [
                    "Importe",
                    formatMoney(
                      payment.amount,
                      payment.currency,
                    ),
                  ],
                  [
                    "Reembolsable",
                    formatMoney(
                      payment.refundable_amount,
                      payment.currency,
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
                  [
                    "PaymentIntent",
                    payment.provider_payment_intent_id,
                  ],
                  ["Charge", payment.provider_charge_id],
                  [
                    "Checkout Session",
                    payment.provider_checkout_session_id,
                  ],
                  [
                    "Billing Customer",
                    payment.billing_customer_id,
                  ],
                  [
                    "Suscripción",
                    payment.user_subscription_id,
                  ],
                  ["Tipo", payment.payment_type],
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

              {payment.failure_message && (
                <section className="mt-5 flex items-start gap-3 rounded-2xl border border-red-500/15 bg-red-950/10 p-5">
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0 text-red-400"
                  />
                  <div>
                    <p className="text-sm font-semibold text-red-300">
                      {payment.failure_code ??
                        "Pago fallido"}
                    </p>
                    <p className="mt-2 text-xs leading-6 text-red-300/75">
                      {payment.failure_message}
                    </p>
                  </div>
                </section>
              )}

              <section className="mt-5 grid gap-5 xl:grid-cols-2">
                <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
                  <h3 className="font-semibold text-white">
                    Fechas
                  </h3>
                  <dl className="mt-4 space-y-3 text-xs">
                    {[
                      ["Creado", payment.created_at],
                      ["Actualizado", payment.updated_at],
                      ["Pagado", payment.paid_at],
                      ["Fallido", payment.failed_at],
                      ["Reembolsado", payment.refunded_at],
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

                <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
                  <h3 className="font-semibold text-white">
                    Metadata
                  </h3>
                  <pre className="mt-4 max-h-72 overflow-auto rounded-xl bg-[#050506] p-4 font-mono text-xs leading-6 text-zinc-400">
                    {JSON.stringify(
                      payment.metadata,
                      null,
                      2,
                    )}
                  </pre>
                </article>
              </section>

              <section className="mt-5 rounded-2xl border border-blue-500/10 bg-blue-950/10 p-5">
                <h3 className="font-semibold text-blue-300">
                  Conciliar con Stripe
                </h3>
                <p className="mt-2 text-xs leading-6 text-blue-300/70">
                  Recupera el PaymentIntent y actualiza
                  estado, importe recibido, cargo, error y
                  metadata de conciliación.
                </p>

                <button
                  type="button"
                  onClick={() => void reconcile()}
                  disabled={
                    Boolean(action) ||
                    !payment.provider_payment_intent_id
                  }
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-blue-500/15 px-4 text-sm text-blue-300 disabled:opacity-40"
                >
                  {action === "reconcile" ? (
                    <LoaderCircle
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <RefreshCcw size={15} />
                  )}
                  Conciliar
                </button>
              </section>

              <section className="mt-5 rounded-2xl border border-red-500/10 bg-red-950/10 p-5">
                <h3 className="font-semibold text-red-300">
                  Reembolso
                </h3>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-xs text-zinc-600">Importe opcional</span>
                    <input type="number" min="0.01" step="0.01" value={refundAmount} onChange={(event) => setRefundAmount(event.target.value)} placeholder={`Vacío = ${payment.refundable_amount}`} className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"/>
                  </label>
                  <label>
                    <span className="mb-2 block text-xs text-zinc-600">Razón</span>
                    <select value={refundReason} onChange={(event) => setRefundReason(event.target.value as BillingPaymentRefundRequest["reason"])} className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300">
                      <option value="requested_by_customer">Solicitado por cliente</option><option value="duplicate">Duplicado</option><option value="fraudulent">Fraudulento</option>
                    </select>
                  </label>
                </div>
                {payment.payment_type === "token_purchase" && <label className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-black/20 p-4 text-sm text-zinc-400"><span><strong className="block text-white">Retirar tokens acreditados</strong><span className="mt-1 block text-xs text-zinc-600">Descuenta del saldo del usuario los tokens relacionados con el reembolso.</span></span><input type="checkbox" checked={removeTokens} onChange={(event) => setRemoveTokens(event.target.checked)} className="size-4 accent-red-700"/></label>}
                <button type="button" onClick={() => void refund()} disabled={Boolean(action) || Number(payment.refundable_amount) <= 0} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-red-500/15 px-4 text-sm text-red-300 disabled:opacity-40">
                  {action === "refund" ? <LoaderCircle size={15} className="animate-spin"/> : <RotateCcw size={15}/>} Reembolsar
                </button>
              </section>
            </>
          )}
        </div>
      </article>
    </div>
  );
}
