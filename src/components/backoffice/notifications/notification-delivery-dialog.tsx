"use client";

import {
  LoaderCircle,
  RefreshCcw,
  X,
} from "lucide-react";
import {
  useState,
} from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  AdminNotificationDelivery,
  AdminNotificationRetryResponse,
} from "@/types/admin-notification-deliveries";

interface Props {
  delivery: AdminNotificationDelivery;
  onClose: () => void;
  onRetried: () => void;
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

export function NotificationDeliveryDialog({
  delivery,
  onClose,
  onRetried,
}: Props) {
  const [retrying, setRetrying] =
    useState(false);

  const retry = async () => {
    if (
      !window.confirm(
        `Se reintentará la entrega #${delivery.id}. ¿Continuar?`,
      )
    ) {
      return;
    }

    setRetrying(true);

    try {
      const response =
        await browserApiRequest<AdminNotificationRetryResponse>(
          `/api/admin/notification-deliveries/${delivery.id}/retry`,
          {
            method: "POST",
          },
        );

      response.success
        ? toast.success(response.message)
        : toast.warning(response.message);

      onRetried();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible reintentar la entrega.",
      );
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <article className="luxia-panel max-h-[94vh] w-full max-w-5xl overflow-auto rounded-3xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/6 bg-[#09090a]/95 p-6 backdrop-blur">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Entrega #{delivery.id}
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              {delivery.channel_type} · {delivery.status}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl border border-white/8 text-zinc-500"
            aria-label="Cerrar"
          >
            <X size={17} />
          </button>
        </header>

        <div className="p-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              [
                "Notificación",
                `#${delivery.notification_id}`,
              ],
              [
                "Canal",
                delivery.channel_type,
              ],
              [
                "Intentos",
                `${delivery.attempt_count} / ${delivery.max_attempts}`,
              ],
              [
                "Destino",
                delivery.destination ?? "No disponible",
              ],
            ].map(([label, value]) => (
              <article
                key={String(label)}
                className="rounded-2xl border border-white/7 bg-black/20 p-4"
              >
                <p className="text-xs text-zinc-600">
                  {String(label)}
                </p>
                <p className="mt-2 break-all text-sm font-semibold text-white">
                  {String(value)}
                </p>
              </article>
            ))}
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-2">
            <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
              <h3 className="font-semibold text-white">
                Proveedor
              </h3>

              <dl className="mt-4 space-y-3 text-xs">
                {[
                  [
                    "Message ID",
                    delivery.provider_message_id ??
                      "No disponible",
                  ],
                  [
                    "Código de estado",
                    delivery.provider_status_code ??
                      "No disponible",
                  ],
                  [
                    "Tipo de error",
                    delivery.error_type ??
                      "No disponible",
                  ],
                  [
                    "Mensaje de error",
                    delivery.error_message ??
                      "No disponible",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="flex justify-between gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0"
                  >
                    <dt className="text-zinc-600">
                      {String(label)}
                    </dt>
                    <dd className="max-w-xs break-all text-right text-zinc-300">
                      {String(value)}
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
                    "Programada",
                    delivery.scheduled_at,
                  ],
                  [
                    "Procesamiento",
                    delivery.processing_started_at,
                  ],
                  [
                    "Entregada",
                    delivery.delivered_at,
                  ],
                  [
                    "Fallida",
                    delivery.failed_at,
                  ],
                  [
                    "Próximo reintento",
                    delivery.next_retry_at,
                  ],
                  [
                    "Creada",
                    delivery.created_at,
                  ],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="flex justify-between gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0"
                  >
                    <dt className="text-zinc-600">
                      {String(label)}
                    </dt>
                    <dd className="text-right text-zinc-300">
                      {formatDate(
                        value as string | null,
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          </section>

          <section className="mt-5 rounded-2xl border border-white/7 bg-black/20 p-5">
            <h3 className="font-semibold text-white">
              Respuesta del proveedor
            </h3>

            <pre className="mt-4 max-h-80 overflow-auto rounded-xl bg-[#050506] p-4 font-mono text-xs leading-6 text-zinc-400">
              {JSON.stringify(
                delivery.provider_response,
                null,
                2,
              )}
            </pre>
          </section>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => void retry()}
              disabled={
                retrying ||
                delivery.status === "delivered"
              }
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-500/15 bg-red-950/15 px-5 text-sm font-semibold text-red-300 disabled:opacity-40"
            >
              {retrying ? (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <RefreshCcw size={16} />
              )}
              Reintentar entrega
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
