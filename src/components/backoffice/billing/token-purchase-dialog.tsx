"use client";

import {
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
  TokenPurchaseDetailResponse,
  TokenPurchaseReconcileResponse,
  TokenPurchaseRefundRequest,
  TokenPurchaseRefundResponse,
  TokenPurchaseResponse,
} from "@/types/admin-token-commerce";

interface TokenPurchaseDialogProps {
  purchase: TokenPurchaseResponse;
  onClose: () => void;
  onUpdated: (
    purchase: TokenPurchaseResponse,
  ) => void;
}

export function TokenPurchaseDialog({
  purchase,
  onClose,
  onUpdated,
}: TokenPurchaseDialogProps) {
  const [detail, setDetail] =
    useState<TokenPurchaseDetailResponse | null>(
      null,
    );
  const [amount, setAmount] =
    useState("");
  const [reason, setReason] =
    useState<
      TokenPurchaseRefundRequest["reason"]
    >("requested_by_customer");
  const [
    removeTokens,
    setRemoveTokens,
  ] = useState(true);
  const [isLoading, setIsLoading] =
    useState(true);
  const [action, setAction] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDetail() {
      setIsLoading(true);

      try {
        const response =
          await browserApiRequest<TokenPurchaseDetailResponse>(
            `/api/admin/token-purchases/${purchase.id}`,
          );

        if (!cancelled) {
          setDetail(response);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "No fue posible cargar el detalle.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadDetail();

    return () => {
      cancelled = true;
    };
  }, [purchase.id]);

  const reconcile = async () => {
    setAction("reconcile");

    try {
      const response =
        await browserApiRequest<TokenPurchaseReconcileResponse>(
          `/api/admin/token-purchases/${purchase.id}/reconcile`,
          {
            method: "POST",
            body: JSON.stringify({
              force: false,
            }),
          },
        );

      toast.success(response.message);
      setDetail({
        purchase: response.purchase,
        payment: response.payment,
      });
      onUpdated(response.purchase);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible conciliar la compra.",
      );
    } finally {
      setAction(null);
    }
  };

  const refund = async () => {
    const parsedAmount =
      amount.trim()
        ? Number(amount)
        : null;

    if (
      parsedAmount !== null &&
      (
        !Number.isFinite(
          parsedAmount,
        ) ||
        parsedAmount <= 0
      )
    ) {
      toast.error(
        "El importe debe ser mayor que cero.",
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Se solicitará un reembolso para la compra #${purchase.id}. ¿Deseas continuar?`,
      );

    if (!confirmed) return;

    const payload:
      TokenPurchaseRefundRequest = {
        amount: parsedAmount,
        reason,
        remove_tokens:
          removeTokens,
      };

    setAction("refund");

    try {
      const response =
        await browserApiRequest<TokenPurchaseRefundResponse>(
          `/api/admin/token-purchases/${purchase.id}/refund`,
          {
            method: "POST",
            body: JSON.stringify(
              payload,
            ),
          },
        );

      toast.success(response.message);
      setDetail({
        purchase: response.purchase,
        payment: response.payment,
      });
      onUpdated(response.purchase);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible reembolsar la compra.",
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
      aria-labelledby="token-purchase-title"
    >
      <article className="luxia-panel max-h-[94vh] w-full max-w-5xl overflow-auto rounded-3xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/6 bg-[#09090a]/95 p-6 backdrop-blur">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Compra #{purchase.id}
            </p>

            <h2
              id="token-purchase-title"
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
            <div className="flex min-h-48 items-center justify-center">
              <LoaderCircle className="animate-spin text-red-500" />
            </div>
          )}

          {!isLoading && detail && (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  [
                    "Usuario",
                    `#${detail.purchase.user_id}`,
                  ],
                  [
                    "Estado",
                    detail.purchase.status,
                  ],
                  [
                    "Total de tokens",
                    detail.purchase.total_tokens.toLocaleString(
                      "es-MX",
                    ),
                  ],
                  [
                    "Importe",
                    `${detail.purchase.amount} ${detail.purchase.currency.toUpperCase()}`,
                  ],
                ].map(([label, value]) => (
                  <article
                    key={String(label)}
                    className="rounded-2xl border border-white/7 bg-black/20 p-4"
                  >
                    <p className="text-xs text-zinc-600">
                      {String(label)}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {String(value)}
                    </p>
                  </article>
                ))}
              </section>

              <section className="mt-5 grid gap-5 xl:grid-cols-2">
                <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
                  <h3 className="font-semibold text-white">
                    Compra
                  </h3>

                  <pre className="mt-4 max-h-72 overflow-auto rounded-xl bg-[#050506] p-4 font-mono text-xs leading-6 text-zinc-400">
                    {JSON.stringify(
                      detail.purchase,
                      null,
                      2,
                    )}
                  </pre>
                </article>

                <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
                  <h3 className="font-semibold text-white">
                    Pago
                  </h3>

                  <pre className="mt-4 max-h-72 overflow-auto rounded-xl bg-[#050506] p-4 font-mono text-xs leading-6 text-zinc-400">
                    {JSON.stringify(
                      detail.payment ?? {},
                      null,
                      2,
                    )}
                  </pre>
                </article>
              </section>

              <section className="mt-5 rounded-2xl border border-blue-500/10 bg-blue-950/10 p-5">
                <h3 className="font-semibold text-blue-300">
                  Conciliación con Stripe
                </h3>

                <p className="mt-2 text-xs leading-6 text-blue-300/70">
                  Consulta el estado remoto de la compra y
                  actualiza el registro local cuando sea
                  necesario.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    void reconcile()
                  }
                  disabled={Boolean(action)}
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-blue-500/15 px-4 text-sm text-blue-300 disabled:opacity-50"
                >
                  {action ===
                  "reconcile" ? (
                    <LoaderCircle
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <RefreshCcw
                      size={15}
                    />
                  )}
                  Conciliar
                </button>
              </section>

              <section className="mt-5 rounded-2xl border border-red-500/10 bg-red-950/10 p-5">
                <h3 className="font-semibold text-red-300">
                  Reembolso
                </h3>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <label>
                    <span className="mb-2 block text-xs text-zinc-600">
                      Importe opcional
                    </span>

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(event) =>
                        setAmount(
                          event.target.value,
                        )
                      }
                      placeholder="Vacío = total"
                      className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-xs text-zinc-600">
                      Razón
                    </span>

                    <select
                      value={reason}
                      onChange={(event) =>
                        setReason(
                          event.target
                            .value as TokenPurchaseRefundRequest["reason"],
                        )
                      }
                      className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
                    >
                      <option value="requested_by_customer">
                        Solicitado por cliente
                      </option>
                      <option value="duplicate">
                        Duplicado
                      </option>
                      <option value="fraudulent">
                        Fraudulento
                      </option>
                    </select>
                  </label>

                  <label className="mt-auto flex h-11 items-center justify-between gap-4 rounded-xl border border-white/8 bg-black/20 px-4 text-sm text-zinc-400">
                    Retirar tokens
                    <input
                      type="checkbox"
                      checked={removeTokens}
                      onChange={(event) =>
                        setRemoveTokens(
                          event.target.checked,
                        )
                      }
                      className="size-4 accent-red-700"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void refund()
                  }
                  disabled={Boolean(action)}
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-red-500/15 px-4 text-sm text-red-300 disabled:opacity-50"
                >
                  {action === "refund" ? (
                    <LoaderCircle
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <RotateCcw
                      size={15}
                    />
                  )}
                  Ejecutar reembolso
                </button>
              </section>
            </>
          )}
        </div>
      </article>
    </div>
  );
}
