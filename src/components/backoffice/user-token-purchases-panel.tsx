"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Coins,
  LoaderCircle,
  Receipt,
  RefreshCcw,
  RotateCcw,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import { cn } from "@/lib/utils";

import type {
  TokenPurchaseDetailResponse,
  TokenPurchaseListResponse,
  TokenPurchaseReconcileResponse,
  TokenPurchaseRefundRequest,
  TokenPurchaseRefundResponse,
  TokenPurchaseResponse,
  TokenPurchaseStatus,
} from "@/types/admin-users";

interface UserTokenPurchasesPanelProps {
  userId: number;
}

function formatDate(value: string | null): string {
  if (!value) return "No disponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha inválida";
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatMoney(amount: string, currency: string): string {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return `${amount} ${currency}`;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(numeric);
}

function statusClass(status: TokenPurchaseStatus): string {
  if (status === "credited" || status === "paid") {
    return "border-emerald-500/15 bg-emerald-950/20 text-emerald-400";
  }
  if (status === "failed" || status === "canceled" || status === "refunded") {
    return "border-red-500/15 bg-red-950/20 text-red-400";
  }
  return "border-amber-500/15 bg-amber-950/20 text-amber-400";
}

export function UserTokenPurchasesPanel({
  userId,
}: UserTokenPurchasesPanelProps) {
  const [purchases, setPurchases] = useState<TokenPurchaseResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<"" | TokenPurchaseStatus>("");
  const [selected, setSelected] =
    useState<TokenPurchaseDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPurchases = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const query = new URLSearchParams({
        user_id: String(userId),
        skip: "0",
        limit: "100",
      });

      if (status) query.set("status", status);

      const response = await browserApiRequest<TokenPurchaseListResponse>(
        `/api/admin/token-purchases?${query.toString()}`,
      );

      setPurchases(response.items);
      setTotal(response.total);
    } catch (error) {
      setPurchases([]);
      setTotal(0);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar las compras.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId, status]);

  useEffect(() => {
    void loadPurchases();
  }, [loadPurchases]);

  const openDetail = async (purchaseId: number) => {
    setActionId(purchaseId);
    try {
      const response = await browserApiRequest<TokenPurchaseDetailResponse>(
        `/api/admin/token-purchases/${purchaseId}`,
      );
      setSelected(response);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo cargar el detalle.",
      );
    } finally {
      setActionId(null);
    }
  };

  const reconcile = async (purchase: TokenPurchaseResponse) => {
    setActionId(purchase.id);
    try {
      const response =
        await browserApiRequest<TokenPurchaseReconcileResponse>(
          `/api/admin/token-purchases/${purchase.id}/reconcile`,
          {
            method: "POST",
            body: JSON.stringify({ force: false }),
          },
        );
      toast.success(response.message);
      await loadPurchases();
      if (selected?.purchase.id === purchase.id) {
        await openDetail(purchase.id);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo reconciliar.",
      );
    } finally {
      setActionId(null);
    }
  };

  const refund = async (purchase: TokenPurchaseResponse) => {
    const confirmed = window.confirm(
      "¿Reembolsar esta compra y retirar los tokens acreditados?",
    );
    if (!confirmed) return;

    const payload: TokenPurchaseRefundRequest = {
      amount: null,
      reason: "requested_by_customer",
      remove_tokens: true,
    };

    setActionId(purchase.id);
    try {
      const response = await browserApiRequest<TokenPurchaseRefundResponse>(
        `/api/admin/token-purchases/${purchase.id}/refund`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
      toast.success(response.message);
      setSelected(null);
      await loadPurchases();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo reembolsar.",
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Compras de tokens
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            {total} compras registradas para este usuario.
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "" | TokenPurchaseStatus)
            }
            className="h-10 rounded-xl border border-white/8 bg-[#09090a] px-3 text-sm text-white"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="paid">Pagada</option>
            <option value="credited">Acreditada</option>
            <option value="failed">Fallida</option>
            <option value="canceled">Cancelada</option>
            <option value="refunded">Reembolsada</option>
          </select>

          <button
            type="button"
            onClick={() => void loadPurchases()}
            className="flex size-10 items-center justify-center rounded-xl border border-white/8 text-zinc-400"
          >
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex min-h-72 items-center justify-center">
          <LoaderCircle className="animate-spin text-red-500" />
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="mt-6 rounded-2xl border border-red-500/15 bg-red-950/15 p-5">
          <AlertTriangle className="text-red-500" />
          <p className="mt-3 text-sm text-red-300">{errorMessage}</p>
        </div>
      )}

      {!isLoading && !errorMessage && purchases.length === 0 && (
        <div className="mt-6 flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-white/8 text-center">
          <div>
            <Coins size={34} className="mx-auto text-zinc-700" />
            <h3 className="mt-4 font-semibold text-white">Sin compras</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Este usuario no tiene compras con el filtro seleccionado.
            </p>
          </div>
        </div>
      )}

      {!isLoading && purchases.length > 0 && (
        <div className="mt-6 space-y-3">
          {purchases.map((purchase) => (
            <article
              key={purchase.id}
              className="rounded-2xl border border-white/7 bg-black/20 p-5"
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-red-500/15 bg-red-950/20 text-red-400">
                    <Receipt size={19} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-white">
                        Compra #{purchase.id}
                      </p>
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[10px] uppercase",
                          statusClass(purchase.status),
                        )}
                      >
                        {purchase.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-500">
                      {purchase.total_tokens.toLocaleString("es-MX")} tokens ·{" "}
                      {formatMoney(purchase.amount, purchase.currency)}
                    </p>
                    <p className="mt-2 text-xs text-zinc-700">
                      Creada {formatDate(purchase.created_at)} · pagada{" "}
                      {formatDate(purchase.paid_at)} · acreditada{" "}
                      {formatDate(purchase.credited_at)}
                    </p>
                    {purchase.provider_payment_intent_id && (
                      <p className="mt-2 break-all font-mono text-[10px] text-zinc-800">
                        {purchase.provider_payment_intent_id}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={actionId === purchase.id}
                    onClick={() => void openDetail(purchase.id)}
                    className="flex h-9 items-center gap-2 rounded-xl border border-white/8 px-3 text-xs text-zinc-400 disabled:opacity-50"
                  >
                    {actionId === purchase.id ? (
                      <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                      <Receipt size={14} />
                    )}
                    Detalle
                  </button>

                  {purchase.status !== "refunded" && (
                    <button
                      type="button"
                      disabled={actionId === purchase.id}
                      onClick={() => void reconcile(purchase)}
                      className="flex h-9 items-center gap-2 rounded-xl border border-amber-500/15 bg-amber-950/15 px-3 text-xs text-amber-300 disabled:opacity-50"
                    >
                      <RotateCcw size={14} />
                      Reconciliar
                    </button>
                  )}

                  {(purchase.status === "paid" ||
                    purchase.status === "credited") && (
                    <button
                      type="button"
                      disabled={actionId === purchase.id}
                      onClick={() => void refund(purchase)}
                      className="flex h-9 items-center gap-2 rounded-xl border border-red-500/15 bg-red-950/20 px-3 text-xs text-red-300 disabled:opacity-50"
                    >
                      <Undo2 size={14} />
                      Reembolsar
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Cerrar detalle"
            onClick={() => setSelected(null)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <section className="luxia-panel relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-white">
              Compra #{selected.purchase.id}
            </h2>
            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-xl border border-white/7 bg-black/25 p-4">
                <dt className="text-zinc-600">Estado</dt>
                <dd className="mt-2 text-white">{selected.purchase.status}</dd>
              </div>
              <div className="rounded-xl border border-white/7 bg-black/25 p-4">
                <dt className="text-zinc-600">Total</dt>
                <dd className="mt-2 text-white">
                  {formatMoney(
                    selected.purchase.amount,
                    selected.purchase.currency,
                  )}
                </dd>
              </div>
              <div className="rounded-xl border border-white/7 bg-black/25 p-4">
                <dt className="text-zinc-600">Tokens base</dt>
                <dd className="mt-2 text-white">
                  {selected.purchase.tokens_amount.toLocaleString("es-MX")}
                </dd>
              </div>
              <div className="rounded-xl border border-white/7 bg-black/25 p-4">
                <dt className="text-zinc-600">Bonificación</dt>
                <dd className="mt-2 text-white">
                  {selected.purchase.bonus_tokens.toLocaleString("es-MX")}
                </dd>
              </div>
            </dl>

            <pre className="mt-5 overflow-auto rounded-2xl border border-white/7 bg-black/35 p-4 text-xs leading-6 text-zinc-500">
              {JSON.stringify(selected.payment, null, 2)}
            </pre>

            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-5 h-11 w-full rounded-xl bg-red-700 text-sm font-semibold text-white"
            >
              Cerrar
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
