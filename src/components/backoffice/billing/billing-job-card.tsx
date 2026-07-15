"use client";

import {
  Clock3,
  LoaderCircle,
  Play,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  BillingJobCatalogItem,
  BillingJobResult,
} from "@/types/admin-billing-operations";

interface BillingJobCardProps {
  job: BillingJobCatalogItem;
}

export function BillingJobCard({
  job,
}: BillingJobCardProps) {
  const [maxItems, setMaxItems] =
    useState("100");
  const [result, setResult] =
    useState<BillingJobResult | null>(null);
  const [isRunning, setIsRunning] =
    useState(false);

  const runJob = async () => {
    const parsed = Number(maxItems);

    if (
      !Number.isInteger(parsed) ||
      parsed < 1 ||
      parsed > 1000
    ) {
      toast.error(
        "max_items debe estar entre 1 y 1000.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Se ejecutará ${job.name} con un máximo de ${parsed} elementos. ¿Deseas continuar?`,
    );

    if (!confirmed) return;

    setIsRunning(true);
    setResult(null);

    try {
      const response =
        await browserApiRequest<BillingJobResult>(
          `/api/admin/billing/jobs/${encodeURIComponent(
            job.name,
          )}/run`,
          {
            method: "POST",
            body: JSON.stringify({
              max_items: parsed,
            }),
          },
        );

      setResult(response);

      if (response.success) {
        toast.success(
          `Job completado: ${response.succeeded} exitosos.`,
        );
      } else {
        toast.warning(
          `Job terminó con ${response.failed} fallos.`,
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible ejecutar el job.",
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <article className="luxia-panel rounded-3xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm font-semibold text-white">
            {job.name}
          </p>

          <p className="mt-3 text-sm leading-6 text-zinc-600">
            {job.description}
          </p>
        </div>

        <span
          className={
            job.enabled
              ? "rounded-full border border-emerald-500/15 bg-emerald-950/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-400"
              : "rounded-full border border-white/8 bg-black/20 px-2.5 py-1 text-[10px] font-semibold text-zinc-500"
          }
        >
          {job.enabled
            ? "HABILITADO"
            : "DESHABILITADO"}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/6 bg-black/20 px-4 py-3">
        <Clock3
          size={14}
          className="text-zinc-600"
        />
        <span className="font-mono text-xs text-zinc-400">
          {job.recommended_schedule}
        </span>
      </div>

      <div className="mt-5 flex gap-3">
        <input
          type="number"
          min={1}
          max={1000}
          value={maxItems}
          onChange={(event) =>
            setMaxItems(event.target.value)
          }
          className="h-10 min-w-0 flex-1 rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
          aria-label="Máximo de elementos"
        />

        <button
          type="button"
          onClick={() => void runJob()}
          disabled={
            isRunning || !job.enabled
          }
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-500/15 bg-red-950/15 px-4 text-sm text-red-300 disabled:opacity-40"
        >
          {isRunning ? (
            <LoaderCircle
              size={15}
              className="animate-spin"
            />
          ) : (
            <Play size={15} />
          )}
          Ejecutar
        </button>
      </div>

      {result && (
        <section className="mt-5 rounded-2xl border border-white/7 bg-black/20 p-4">
          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            {[
              ["Procesados", result.processed],
              ["Exitosos", result.succeeded],
              ["Fallidos", result.failed],
              ["Omitidos", result.skipped],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <p className="text-zinc-700">
                  {String(label)}
                </p>
                <p className="mt-1 font-semibold text-white">
                  {Number(value)}
                </p>
              </div>
            ))}
          </div>

          {result.errors.length > 0 && (
            <pre className="mt-4 max-h-56 overflow-auto rounded-xl bg-[#050506] p-4 font-mono text-xs leading-6 text-red-300">
              {JSON.stringify(
                result.errors,
                null,
                2,
              )}
            </pre>
          )}
        </section>
      )}
    </article>
  );
}
