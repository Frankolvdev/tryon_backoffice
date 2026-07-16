"use client";

import {
  LoaderCircle,
  Save,
  UserRoundCog,
} from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  SupportTicket,
  SupportTicketUpdate,
} from "@/types/admin-support";

interface SupportTicketEditorProps {
  ticket: SupportTicket;
  onUpdated: (
    ticket: SupportTicket,
  ) => void;
}

export function SupportTicketEditor({
  ticket,
  onUpdated,
}: SupportTicketEditorProps) {
  const [status, setStatus] =
    useState(ticket.status);
  const [priority, setPriority] =
    useState(ticket.priority);
  const [assignedAdminUserId, setAssignedAdminUserId] =
    useState(
      ticket.assigned_admin_user_id
        ? String(ticket.assigned_admin_user_id)
        : "",
    );
  const [adminNotes, setAdminNotes] =
    useState(ticket.admin_notes ?? "");
  const [isSaving, setIsSaving] =
    useState(false);

  useEffect(() => {
    setStatus(ticket.status);
    setPriority(ticket.priority);
    setAssignedAdminUserId(
      ticket.assigned_admin_user_id
        ? String(ticket.assigned_admin_user_id)
        : "",
    );
    setAdminNotes(
      ticket.admin_notes ?? "",
    );
  }, [ticket]);

  const submit = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    let parsedAdminUserId:
      number | null = null;

    if (assignedAdminUserId.trim()) {
      parsedAdminUserId = Number(
        assignedAdminUserId,
      );

      if (
        !Number.isInteger(
          parsedAdminUserId,
        ) ||
        parsedAdminUserId <= 0
      ) {
        toast.error(
          "El ID del administrador debe ser un entero positivo.",
        );
        return;
      }
    }

    const payload:
      SupportTicketUpdate = {
      status,
      priority,
      admin_notes:
        adminNotes.trim() || null,
      assigned_admin_user_id:
        parsedAdminUserId,
    };

    setIsSaving(true);

    try {
      const updated =
        await browserApiRequest<SupportTicket>(
          `/api/admin/support-tickets/${ticket.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(
              payload,
            ),
          },
        );

      onUpdated(updated);
      toast.success(
        "Ticket actualizado correctamente.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible actualizar el ticket.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mt-5 rounded-2xl border border-white/7 bg-black/20 p-4"
    >
      <div className="flex items-center gap-2">
        <UserRoundCog
          size={16}
          className="text-red-400"
        />
        <h3 className="text-sm font-semibold text-white">
          Administración del ticket
        </h3>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-xs text-zinc-600">
            Estado
          </span>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value,
              )
            }
            className="h-10 w-full rounded-xl border border-white/8 bg-[#09090a] px-3 text-sm text-zinc-300"
          >
            <option value="open">
              open
            </option>
            <option value="in_progress">
              in_progress
            </option>
            <option value="resolved">
              resolved
            </option>
            <option value="closed">
              closed
            </option>
          </select>
        </label>

        <label>
          <span className="mb-2 block text-xs text-zinc-600">
            Prioridad
          </span>

          <select
            value={priority}
            onChange={(event) =>
              setPriority(
                event.target.value,
              )
            }
            className="h-10 w-full rounded-xl border border-white/8 bg-[#09090a] px-3 text-sm text-zinc-300"
          >
            <option value="low">
              low
            </option>
            <option value="normal">
              normal
            </option>
            <option value="high">
              high
            </option>
            <option value="urgent">
              urgent
            </option>
          </select>
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-xs text-zinc-600">
          ID del administrador asignado
        </span>

        <input
          type="number"
          min={1}
          step={1}
          value={assignedAdminUserId}
          onChange={(event) =>
            setAssignedAdminUserId(
              event.target.value,
            )
          }
          placeholder="Vacío = sin asignar"
          className="h-10 w-full rounded-xl border border-white/8 bg-black/30 px-3 text-sm text-white"
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-2 block text-xs text-zinc-600">
          Notas internas
        </span>

        <textarea
          value={adminNotes}
          onChange={(event) =>
            setAdminNotes(
              event.target.value,
            )
          }
          maxLength={5000}
          placeholder="Notas visibles solo para administradores..."
          className="min-h-32 w-full rounded-xl border border-white/8 bg-black/30 p-3 text-sm leading-6 text-white"
        />
      </label>

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
          <Save size={15} />
        )}
        Guardar cambios
      </button>
    </form>
  );
}
