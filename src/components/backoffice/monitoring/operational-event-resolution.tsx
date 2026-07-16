"use client";

import {
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  OperationalEvent,
  OperationalEventResolveResponse,
} from "@/types/admin-system-monitoring";

interface Props {
  event: OperationalEvent;
  onResolved: (
    event: OperationalEvent,
  ) => void;
}

export function OperationalEventResolution({
  event,
  onResolved,
}: Props) {
  const [note, setNote] =
    useState(
      event.resolution_note ?? "",
    );
  const [isSaving, setIsSaving] =
    useState(false);

  useEffect(() => {
    setNote(
      event.resolution_note ?? "",
    );
  }, [event]);

  const submit = async (
    formEvent: FormEvent,
  ) => {
    formEvent.preventDefault();

    if (!note.trim()) {
      toast.error(
        "La nota de resolución es obligatoria.",
      );
      return;
    }

    if (
      !window.confirm(
        `Se marcará como resuelto el evento #${event.id}. ¿Continuar?`,
      )
    ) {
      return;
    }

    setIsSaving(true);

    try {
      const response =
        await browserApiRequest<OperationalEventResolveResponse>(
          `/api/admin/operational-events/${event.id}/resolve`,
          {
            method: "POST",
            body: JSON.stringify({
              resolution_note:
                note.trim(),
            }),
          },
        );

      onResolved(response.event);
      toast.success(response.message);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible resolver el evento.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (event.is_resolved) {
    return (
      <section className="mt-5 rounded-2xl border border-emerald-500/15 bg-emerald-950/10 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0 text-emerald-400"
          />

          <div>
            <p className="text-xs font-semibold text-emerald-300">
              Evento resuelto
            </p>

            <p className="mt-2 text-xs leading-6 text-zinc-500">
              {event.resolution_note ??
                "Sin nota de resolución."}
            </p>

            <p className="mt-3 text-[10px] text-zinc-700">
              Resuelto por usuario #
              {event.resolved_by_user_id ??
                "—"}
              {" · "}
              {event.resolved_at
                ? new Date(
                    event.resolved_at,
                  ).toLocaleString(
                    "es-MX",
                  )
                : "Fecha no disponible"}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mt-5 rounded-2xl border border-white/7 bg-black/20 p-4"
    >
      <div className="flex items-center gap-2">
        <CheckCircle2
          size={16}
          className="text-red-400"
        />

        <h3 className="text-sm font-semibold text-white">
          Resolver evento
        </h3>
      </div>

      <p className="mt-2 text-xs leading-5 text-zinc-600">
        Registra la acción tomada para dejar
        trazabilidad de la resolución.
      </p>

      <textarea
        value={note}
        onChange={(changeEvent) =>
          setNote(
            changeEvent.target.value,
          )
        }
        maxLength={5000}
        placeholder="Describe cómo se resolvió el evento..."
        className="mt-4 min-h-32 w-full rounded-xl border border-white/8 bg-black/30 p-3 text-sm leading-6 text-white"
      />

      <button
        type="submit"
        disabled={isSaving}
        className="luxia-red-glow mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isSaving ? (
          <LoaderCircle
            size={15}
            className="animate-spin"
          />
        ) : (
          <CheckCircle2 size={15} />
        )}

        Marcar como resuelto
      </button>
    </form>
  );
}
