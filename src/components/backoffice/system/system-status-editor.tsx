"use client";

import {
  AlertTriangle,
  LoaderCircle,
  Save,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  SystemStatusResponse,
  SystemStatusUpdate,
} from "@/types/admin-system-settings";

interface SystemStatusEditorProps {
  status: SystemStatusResponse;
  onSaved: (
    status: SystemStatusResponse,
  ) => void;
}

export function SystemStatusEditor({
  status,
  onSaved,
}: SystemStatusEditorProps) {
  const [
    maintenanceMode,
    setMaintenanceMode,
  ] = useState(
    status.maintenance_mode,
  );
  const [
    registrationEnabled,
    setRegistrationEnabled,
  ] = useState(
    status.registration_enabled,
  );
  const [tryonEnabled, setTryonEnabled] =
    useState(status.tryon_enabled);
  const [publicMessage, setPublicMessage] =
    useState(
      status.public_message ?? "",
    );
  const [
    internalMessage,
    setInternalMessage,
  ] = useState(
    status.internal_message ?? "",
  );
  const [isSaving, setIsSaving] =
    useState(false);

  useEffect(() => {
    setMaintenanceMode(
      status.maintenance_mode,
    );
    setRegistrationEnabled(
      status.registration_enabled,
    );
    setTryonEnabled(
      status.tryon_enabled,
    );
    setPublicMessage(
      status.public_message ?? "",
    );
    setInternalMessage(
      status.internal_message ?? "",
    );
  }, [status]);

  const submit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const payload: SystemStatusUpdate = {
      maintenance_mode:
        maintenanceMode,
      registration_enabled:
        registrationEnabled,
      tryon_enabled: tryonEnabled,
      public_message:
        publicMessage.trim() || null,
      internal_message:
        internalMessage.trim() || null,
    };

    setIsSaving(true);

    try {
      const response =
        await browserApiRequest<SystemStatusResponse>(
          "/api/admin/system-status",
          {
            method: "PATCH",
            body: JSON.stringify(
              payload,
            ),
          },
        );

      toast.success(
        "Estado global actualizado.",
      );
      onSaved(response);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible actualizar el estado global.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="luxia-panel rounded-3xl p-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/15 bg-red-950/20 text-red-400">
          <Wrench size={21} />
        </div>

        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
            Operación global
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Estado de la plataforma
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Controles reales expuestos por
            <span className="font-mono">
              {" "}
              /admin/system-status
            </span>
            .
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <label className="rounded-2xl border border-white/7 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-white">
                Mantenimiento
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-600">
                Muestra el mensaje público y limita la
                operación normal.
              </p>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(event) =>
                setMaintenanceMode(
                  event.target.checked,
                )
              }
              className="size-5 accent-red-700"
            />
          </div>
        </label>

        <label className="rounded-2xl border border-white/7 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-white">
                Registro
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-600">
                Permite o bloquea nuevos registros.
              </p>
            </div>
            <input
              type="checkbox"
              checked={registrationEnabled}
              onChange={(event) =>
                setRegistrationEnabled(
                  event.target.checked,
                )
              }
              className="size-5 accent-red-700"
            />
          </div>
        </label>

        <label className="rounded-2xl border border-white/7 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-white">
                Try-On
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-600">
                Habilita o pausa el servicio Try-On.
              </p>
            </div>
            <input
              type="checkbox"
              checked={tryonEnabled}
              onChange={(event) =>
                setTryonEnabled(
                  event.target.checked,
                )
              }
              className="size-5 accent-red-700"
            />
          </div>
        </label>
      </div>

      {maintenanceMode && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-500/15 bg-amber-950/10 p-4">
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0 text-amber-400"
          />
          <p className="text-xs leading-6 text-amber-300/80">
            El modo mantenimiento afecta la configuración
            pública que consume el frontend de usuarios.
          </p>
        </div>
      )}

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm text-zinc-500">
            Mensaje público
          </span>
          <textarea
            value={publicMessage}
            onChange={(event) =>
              setPublicMessage(
                event.target.value,
              )
            }
            placeholder="Mensaje visible para usuarios finales."
            className="min-h-32 w-full rounded-xl border border-white/8 bg-black/30 p-4 text-sm text-white outline-none focus:border-red-500/50"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm text-zinc-500">
            Mensaje interno
          </span>
          <textarea
            value={internalMessage}
            onChange={(event) =>
              setInternalMessage(
                event.target.value,
              )
            }
            placeholder="Nota interna para administradores."
            className="min-h-32 w-full rounded-xl border border-white/8 bg-black/30 p-4 text-sm text-white outline-none focus:border-red-500/50"
          />
        </label>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/6 pt-5">
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <ShieldCheck size={15} />
          Última actualización:{" "}
          {new Date(
            status.updated_at,
          ).toLocaleString("es-MX")}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isSaving ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          ) : (
            <Save size={16} />
          )}
          Guardar estado
        </button>
      </div>
    </form>
  );
}
