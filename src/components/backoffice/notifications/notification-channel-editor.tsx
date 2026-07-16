"use client";

import {
  LoaderCircle,
  Save,
  X,
} from "lucide-react";
import {
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  AdminNotificationChannel,
} from "@/types/admin-notification-preferences";

interface Props {
  channel: AdminNotificationChannel | null;
  onClose: () => void;
  onSaved: (
    channel: AdminNotificationChannel,
  ) => void;
}

export function NotificationChannelEditor({
  channel,
  onClose,
  onSaved,
}: Props) {
  const editing = channel !== null;
  const [channelType, setChannelType] =
    useState(channel?.channel_type ?? "email");
  const [displayName, setDisplayName] =
    useState(channel?.display_name ?? "");
  const [destination, setDestination] =
    useState(channel?.destination ?? "");
  const [provider, setProvider] =
    useState(channel?.integration_provider ?? "");
  const [minimumPriority, setMinimumPriority] =
    useState(channel?.minimum_priority ?? "normal");
  const [configuration, setConfiguration] =
    useState(
      JSON.stringify(
        channel?.configuration ?? {},
        null,
        2,
      ),
    );
  const [isEnabled, setIsEnabled] =
    useState(channel?.is_enabled ?? true);
  const [success, setSuccess] =
    useState(channel?.send_success_notifications ?? false);
  const [info, setInfo] =
    useState(channel?.send_info_notifications ?? true);
  const [warning, setWarning] =
    useState(channel?.send_warning_notifications ?? true);
  const [error, setError] =
    useState(channel?.send_error_notifications ?? true);
  const [critical, setCritical] =
    useState(channel?.send_critical_notifications ?? true);
  const [saving, setSaving] =
    useState(false);

  const submit = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    let parsed: Record<string, unknown>;

    try {
      const value = JSON.parse(
        configuration || "{}",
      ) as unknown;

      if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value)
      ) {
        throw new Error();
      }

      parsed =
        value as Record<string, unknown>;
    } catch {
      toast.error(
        "La configuración debe ser un objeto JSON válido.",
      );
      return;
    }

    if (
      !editing &&
      channelType.trim().length < 2
    ) {
      toast.error(
        "Indica el tipo de canal.",
      );
      return;
    }

    const payload = {
      ...(editing
        ? {}
        : {
            channel_type:
              channelType
                .trim()
                .toLowerCase(),
          }),
      is_enabled: isEnabled,
      destination:
        destination.trim() || null,
      display_name:
        displayName.trim() || null,
      integration_provider:
        provider.trim() || null,
      configuration: parsed,
      minimum_priority:
        minimumPriority,
      send_success_notifications:
        success,
      send_info_notifications: info,
      send_warning_notifications:
        warning,
      send_error_notifications: error,
      send_critical_notifications:
        critical,
    };

    setSaving(true);

    try {
      const saved =
        await browserApiRequest<AdminNotificationChannel>(
          editing
            ? `/api/admin/notification-preferences/channels/${channel.id}`
            : "/api/admin/notification-preferences/channels",
          {
            method: editing
              ? "PUT"
              : "POST",
            body: JSON.stringify(payload),
          },
        );

      onSaved(saved);
      toast.success(
        editing
          ? "Canal actualizado."
          : "Canal creado.",
      );
    } catch (caught) {
      toast.error(
        caught instanceof Error
          ? caught.message
          : "No fue posible guardar el canal.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="luxia-panel max-h-[94vh] w-full max-w-4xl overflow-auto rounded-3xl"
      >
        <header className="sticky top-0 flex items-start justify-between border-b border-white/6 bg-[#09090a]/95 p-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Notificaciones
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {editing
                ? "Editar canal"
                : "Nuevo canal"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl border border-white/8 text-zinc-500"
          >
            <X size={17} />
          </button>
        </header>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Tipo de canal
            </span>
            <input
              value={channelType}
              disabled={editing}
              onChange={(event) =>
                setChannelType(
                  event.target.value,
                )
              }
              placeholder="email, webhook, slack..."
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm text-white disabled:opacity-50"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Nombre visible
            </span>
            <input
              value={displayName}
              onChange={(event) =>
                setDisplayName(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Destino
            </span>
            <input
              value={destination}
              onChange={(event) =>
                setDestination(
                  event.target.value,
                )
              }
              placeholder="correo o URL"
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Proveedor
            </span>
            <input
              value={provider}
              onChange={(event) =>
                setProvider(
                  event.target.value,
                )
              }
              placeholder="smtp, resend, generic..."
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Prioridad mínima
            </span>
            <select
              value={minimumPriority}
              onChange={(event) =>
                setMinimumPriority(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
            >
              <option value="normal">normal</option>
              <option value="high">high</option>
              <option value="urgent">urgent</option>
              <option value="critical">critical</option>
            </select>
          </label>

          <label className="flex items-center justify-between rounded-2xl border border-white/7 bg-black/20 p-4 text-sm text-zinc-400">
            Canal habilitado
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(event) =>
                setIsEnabled(
                  event.target.checked,
                )
              }
              className="size-4 accent-red-700"
            />
          </label>
        </div>

        <div className="px-6">
          <p className="text-sm text-zinc-500">
            Tipos enviados
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ["success", success, setSuccess],
              ["info", info, setInfo],
              ["warning", warning, setWarning],
              ["error", error, setError],
              ["critical", critical, setCritical],
            ].map(([label, checked, setter]) => (
              <label
                key={String(label)}
                className="flex items-center justify-between rounded-xl border border-white/7 bg-black/20 p-3 text-xs text-zinc-400"
              >
                {String(label)}
                <input
                  type="checkbox"
                  checked={Boolean(checked)}
                  onChange={(event) =>
                    (
                      setter as (
                        value: boolean,
                      ) => void
                    )(event.target.checked)
                  }
                  className="accent-red-700"
                />
              </label>
            ))}
          </div>
        </div>

        <label className="m-6 block">
          <span className="mb-2 block text-sm text-zinc-500">
            Configuración JSON
          </span>
          <textarea
            value={configuration}
            onChange={(event) =>
              setConfiguration(
                event.target.value,
              )
            }
            className="min-h-44 w-full rounded-xl border border-white/8 bg-[#050506] p-4 font-mono text-xs leading-6 text-zinc-300"
          />
        </label>

        <footer className="sticky bottom-0 flex justify-end border-t border-white/6 bg-[#09090a]/95 p-5">
          <button
            type="submit"
            disabled={saving}
            className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <Save size={16} />
            )}
            Guardar canal
          </button>
        </footer>
      </form>
    </div>
  );
}
