"use client";

import {
  AlertTriangle,
  LoaderCircle,
  Trash2,
} from "lucide-react";
import {
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  AuditRetentionRequest,
  AuditRetentionResponse,
} from "@/types/admin-audit-operations";

interface AuditRetentionFormProps {
  onCompleted: (
    response: AuditRetentionResponse,
  ) => void;
}

export function AuditRetentionForm({
  onCompleted,
}: AuditRetentionFormProps) {
  const [
    successfulDays,
    setSuccessfulDays,
  ] = useState("365");
  const [failedDays, setFailedDays] =
    useState("730");
  const [
    readEventsDays,
    setReadEventsDays,
  ] = useState("90");
  const [batchSize, setBatchSize] =
    useState("1000");
  const [
    preserveRestorable,
    setPreserveRestorable,
  ] = useState(true);
  const [
    preserveRestoreActions,
    setPreserveRestoreActions,
  ] = useState(true);
  const [
    preserveFailed,
    setPreserveFailed,
  ] = useState(true);
  const [isRunning, setIsRunning] =
    useState(false);

  const submit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const payload: AuditRetentionRequest = {
      delete_successful_older_than_days:
        Number(successfulDays),
      delete_failed_older_than_days:
        Number(failedDays),
      delete_read_events_older_than_days:
        Number(readEventsDays),
      preserve_restorable_entries:
        preserveRestorable,
      preserve_restore_actions:
        preserveRestoreActions,
      preserve_failed_entries:
        preserveFailed,
      batch_size: Number(batchSize),
    };

    const values = [
      payload.delete_successful_older_than_days,
      payload.delete_failed_older_than_days,
      payload.delete_read_events_older_than_days,
    ];

    if (
      values.some(
        (value) =>
          !Number.isInteger(value) ||
          value < 1 ||
          value > 3650,
      )
    ) {
      toast.error(
        "Los días deben estar entre 1 y 3650.",
      );
      return;
    }

    if (
      !Number.isInteger(
        payload.batch_size,
      ) ||
      payload.batch_size < 1 ||
      payload.batch_size > 10000
    ) {
      toast.error(
        "El tamaño de lote debe estar entre 1 y 10000.",
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Esta operación puede eliminar entradas de auditoría de forma permanente. ¿Deseas continuar?",
      );

    if (!confirmed) {
      return;
    }

    setIsRunning(true);

    try {
      const response =
        await browserApiRequest<AuditRetentionResponse>(
          "/api/admin/audit-operations/retention",
          {
            method: "POST",
            body: JSON.stringify(
              payload,
            ),
          },
        );

      toast.success(
        `Retención completada: ${response.total_deleted} entradas eliminadas.`,
      );

      onCompleted(response);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible ejecutar la retención.",
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="luxia-panel rounded-3xl p-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/15 bg-red-950/20 text-red-400">
          <Trash2 size={21} />
        </div>

        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
            Mantenimiento
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Retención de auditoría
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Elimina entradas antiguas según las reglas
            reales del backend.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <label>
          <span className="mb-2 block text-sm text-zinc-500">
            Exitosas: antigüedad en días
          </span>
          <input
            type="number"
            min={1}
            max={3650}
            value={successfulDays}
            onChange={(event) =>
              setSuccessfulDays(
                event.target.value,
              )
            }
            className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm text-zinc-500">
            Fallidas: antigüedad en días
          </span>
          <input
            type="number"
            min={1}
            max={3650}
            value={failedDays}
            onChange={(event) =>
              setFailedDays(
                event.target.value,
              )
            }
            className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm text-zinc-500">
            Eventos leídos: antigüedad
          </span>
          <input
            type="number"
            min={1}
            max={3650}
            value={readEventsDays}
            onChange={(event) =>
              setReadEventsDays(
                event.target.value,
              )
            }
            className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm text-zinc-500">
            Tamaño de lote
          </span>
          <input
            type="number"
            min={1}
            max={10000}
            value={batchSize}
            onChange={(event) =>
              setBatchSize(
                event.target.value,
              )
            }
            className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          {
            label:
              "Preservar entradas restaurables",
            checked: preserveRestorable,
            setChecked:
              setPreserveRestorable,
          },
          {
            label:
              "Preservar acciones de restauración",
            checked:
              preserveRestoreActions,
            setChecked:
              setPreserveRestoreActions,
          },
          {
            label:
              "Preservar entradas fallidas",
            checked: preserveFailed,
            setChecked:
              setPreserveFailed,
          },
        ].map((item) => (
          <label
            key={item.label}
            className="flex items-center justify-between gap-4 rounded-2xl border border-white/7 bg-black/20 p-4 text-sm text-zinc-400"
          >
            {item.label}
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(event) =>
                item.setChecked(
                  event.target.checked,
                )
              }
              className="size-4 accent-red-700"
            />
          </label>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-500/10 bg-amber-950/10 p-4">
        <AlertTriangle
          size={18}
          className="mt-0.5 shrink-0 text-amber-400"
        />

        <p className="text-xs leading-6 text-amber-300/80">
          La retención elimina datos permanentemente.
          Mantén activadas las opciones de preservación
          salvo que tengas una razón operativa clara para
          desactivarlas.
        </p>
      </div>

      <div className="mt-6 flex justify-end border-t border-white/6 pt-5">
        <button
          type="submit"
          disabled={isRunning}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/20 px-5 text-sm font-semibold text-red-300 disabled:opacity-50"
        >
          {isRunning ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          ) : (
            <Trash2 size={16} />
          )}
          Ejecutar retención
        </button>
      </div>
    </form>
  );
}
