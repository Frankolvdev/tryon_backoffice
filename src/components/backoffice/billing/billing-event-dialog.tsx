"use client";

import {
  LoaderCircle,
  RefreshCcw,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  BillingEventResponse,
  BillingEventRetryResponse,
} from "@/types/admin-billing-operations";

interface BillingEventDialogProps {
  event: BillingEventResponse;
  onClose: () => void;
  onUpdated: (
    event: BillingEventResponse,
  ) => void;
}

function JsonPanel({
  title,
  value,
}: {
  title: string;
  value: Record<string, unknown>;
}) {
  return (
    <section className="rounded-2xl border border-white/7 bg-black/20 p-5">
      <h3 className="font-semibold text-white">
        {title}
      </h3>

      <pre className="mt-4 max-h-80 overflow-auto rounded-xl bg-[#050506] p-4 font-mono text-xs leading-6 text-zinc-400">
        {JSON.stringify(value, null, 2)}
      </pre>
    </section>
  );
}

export function BillingEventDialog({
  event,
  onClose,
  onUpdated,
}: BillingEventDialogProps) {
  const [currentEvent, setCurrentEvent] =
    useState(event);
  const [isRetrying, setIsRetrying] =
    useState(false);

  const retry = async () => {
    const confirmed = window.confirm(
      `Se reintentará el evento ${currentEvent.provider_event_id}. ¿Deseas continuar?`,
    );

    if (!confirmed) return;

    setIsRetrying(true);

    try {
      const response =
        await browserApiRequest<BillingEventRetryResponse>(
          `/api/admin/billing-events/${currentEvent.id}/retry`,
          {
            method: "POST",
          },
        );

      setCurrentEvent(response.event);
      onUpdated(response.event);
      toast.success(response.message);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible reintentar el evento.",
      );
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="billing-event-title"
    >
      <article className="luxia-panel max-h-[94vh] w-full max-w-6xl overflow-auto rounded-3xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/6 bg-[#09090a]/95 p-6 backdrop-blur">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Evento #{currentEvent.id}
            </p>

            <h2
              id="billing-event-title"
              className="mt-2 text-xl font-semibold text-white"
            >
              {currentEvent.event_type}
            </h2>

            <p className="mt-2 break-all font-mono text-xs text-zinc-600">
              {currentEvent.provider_event_id}
            </p>
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
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Proveedor", currentEvent.provider],
              ["Estado", currentEvent.status],
              [
                "Intentos",
                currentEvent.processing_attempts,
              ],
              [
                "Recibido",
                new Date(
                  currentEvent.received_at,
                ).toLocaleString("es-MX"),
              ],
            ].map(([label, value]) => (
              <article
                key={String(label)}
                className="rounded-2xl border border-white/7 bg-black/20 p-4"
              >
                <p className="text-xs text-zinc-600">
                  {String(label)}
                </p>
                <p className="mt-2 break-words text-sm font-semibold text-white">
                  {String(value)}
                </p>
              </article>
            ))}
          </section>

          {currentEvent.error_message && (
            <section className="mt-5 rounded-2xl border border-red-500/15 bg-red-950/10 p-5">
              <h3 className="font-semibold text-red-300">
                Error
              </h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-red-300/75">
                {currentEvent.error_message}
              </p>
            </section>
          )}

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <JsonPanel
              title="Payload"
              value={currentEvent.payload}
            />
            <JsonPanel
              title="Resultado"
              value={currentEvent.result}
            />
          </div>

          <section className="mt-5 rounded-2xl border border-white/7 bg-black/20 p-5">
            <dl className="grid gap-4 text-xs md:grid-cols-2">
              {[
                [
                  "Procesado",
                  currentEvent.processed_at
                    ? new Date(
                        currentEvent.processed_at,
                      ).toLocaleString("es-MX")
                    : "No procesado",
                ],
                [
                  "Actualizado",
                  new Date(
                    currentEvent.updated_at,
                  ).toLocaleString("es-MX"),
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-zinc-600">
                    {label}
                  </dt>
                  <dd className="mt-2 text-zinc-300">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => void retry()}
              disabled={
                isRetrying ||
                currentEvent.status === "processed"
              }
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-500/15 bg-red-950/15 px-5 text-sm font-semibold text-red-300 disabled:opacity-40"
            >
              {isRetrying ? (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <RefreshCcw size={16} />
              )}
              Reintentar evento
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
