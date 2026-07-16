"use client";

import {
  LoaderCircle,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  BackgroundJobMaintenanceResponse,
} from "@/types/admin-background-jobs";

interface Props {
  onCompleted: () => Promise<void>;
}

export function BackgroundJobMaintenance({
  onCompleted,
}: Props) {
  const [isOpen, setIsOpen] =
    useState(false);
  const [isRunning, setIsRunning] =
    useState(false);
  const [maxItems, setMaxItems] =
    useState(1000);
  const [recoverExpired, setRecoverExpired] =
    useState(true);
  const [signalQueues, setSignalQueues] =
    useState(true);
  const [result, setResult] =
    useState<BackgroundJobMaintenanceResponse | null>(
      null,
    );

  const run = async () => {
    if (
      !window.confirm(
        "Se ejecutará mantenimiento de procesos en segundo plano. ¿Continuar?",
      )
    ) {
      return;
    }

    setIsRunning(true);

    try {
      const response =
        await browserApiRequest<BackgroundJobMaintenanceResponse>(
          "/api/admin/background-job-operations/maintenance",
          {
            method: "POST",
            body: JSON.stringify({
              recover_expired_leases:
                recoverExpired,
              signal_ready_queues:
                signalQueues,
              max_items: maxItems,
            }),
          },
        );

      setResult(response);
      toast.success(
        "Mantenimiento completado.",
      );
      await onCompleted();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible ejecutar mantenimiento.",
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <section className="luxia-panel mt-5 rounded-3xl p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3">
          <Wrench
            size={18}
            className="mt-0.5 text-red-400"
          />
          <div>
            <h2 className="font-semibold text-white">
              Mantenimiento
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-600">
              Recupera leases expirados y
              vuelve a señalar colas listas.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setIsOpen(
              (current) => !current,
            )
          }
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400"
        >
          <ShieldCheck size={15} />
          {isOpen
            ? "Ocultar"
            : "Abrir mantenimiento"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-5 rounded-2xl border border-white/7 bg-black/20 p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex items-center justify-between rounded-xl border border-white/7 p-3 text-sm text-zinc-400">
              Recuperar leases
              <input
                type="checkbox"
                checked={recoverExpired}
                onChange={(event) =>
                  setRecoverExpired(
                    event.target.checked,
                  )
                }
                className="accent-red-700"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-white/7 p-3 text-sm text-zinc-400">
              Señalar colas
              <input
                type="checkbox"
                checked={signalQueues}
                onChange={(event) =>
                  setSignalQueues(
                    event.target.checked,
                  )
                }
                className="accent-red-700"
              />
            </label>

            <label>
              <span className="mb-2 block text-xs text-zinc-600">
                Máximo de elementos
              </span>
              <input
                type="number"
                min={1}
                max={10000}
                value={maxItems}
                onChange={(event) =>
                  setMaxItems(
                    Number(
                      event.target.value,
                    ),
                  )
                }
                className="h-10 w-full rounded-xl border border-white/8 bg-black/30 px-3 text-sm text-white"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => void run()}
            disabled={isRunning}
            className="luxia-red-glow mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isRunning && (
              <LoaderCircle
                size={15}
                className="animate-spin"
              />
            )}
            Ejecutar mantenimiento
          </button>

          {result && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                [
                  "Inspeccionados",
                  result.expired_leases_inspected,
                ],
                [
                  "Recuperados",
                  result.recovered_jobs,
                ],
                [
                  "Dead letter",
                  result.dead_lettered_jobs,
                ],
                [
                  "Colas señaladas",
                  result.signaled_queues.length,
                ],
              ].map(([label, value]) => (
                <article
                  key={String(label)}
                  className="rounded-xl border border-white/7 p-3"
                >
                  <p className="text-[10px] text-zinc-700">
                    {String(label)}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {Number(value)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
