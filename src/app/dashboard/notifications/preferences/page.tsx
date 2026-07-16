"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BellRing,
  FlaskConical,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

import { NotificationChannelEditor } from "@/components/backoffice/notifications/notification-channel-editor";
import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  AdminNotificationChannel,
  AdminNotificationChannelTestResponse,
  AdminNotificationSettings,
} from "@/types/admin-notification-preferences";

export default function NotificationPreferencesPage() {
  const [settings, setSettings] =
    useState<AdminNotificationSettings | null>(
      null,
    );
  const [editor, setEditor] =
    useState<
      AdminNotificationChannel | null | undefined
    >(undefined);
  const [saving, setSaving] =
    useState(false);
  const [actionId, setActionId] =
    useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setSettings(
        await browserApiRequest<AdminNotificationSettings>(
          "/api/admin/notification-preferences",
        ),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible cargar las preferencias.",
      );
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!settings) {
    return (
      <div className="luxia-panel flex min-h-72 items-center justify-center rounded-3xl">
        <LoaderCircle className="animate-spin text-red-500" />
      </div>
    );
  }

  const preference =
    settings.preference;

  const savePreferences = async () => {
    setSaving(true);

    try {
      const updated =
        await browserApiRequest<
          AdminNotificationSettings["preference"]
        >(
          "/api/admin/notification-preferences",
          {
            method: "PUT",
            body: JSON.stringify(
              preference,
            ),
          },
        );

      setSettings({
        ...settings,
        preference: updated,
      });
      toast.success(
        "Preferencias guardadas.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible guardar.",
      );
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (
    key: keyof typeof preference,
    value: unknown,
  ) => {
    setSettings({
      ...settings,
      preference: {
        ...preference,
        [key]: value,
      },
    });
  };

  const saveChannel = (
    channel: AdminNotificationChannel,
  ) => {
    const exists =
      settings.channels.some(
        (item) =>
          item.id === channel.id,
      );

    setSettings({
      ...settings,
      channels: exists
        ? settings.channels.map((item) =>
            item.id === channel.id
              ? channel
              : item,
          )
        : [
            channel,
            ...settings.channels,
          ],
    });
    setEditor(undefined);
  };

  const testChannel = async (
    channel: AdminNotificationChannel,
  ) => {
    setActionId(channel.id);

    try {
      const result =
        await browserApiRequest<AdminNotificationChannelTestResponse>(
          `/api/admin/notification-preferences/channels/${channel.id}/test`,
          {
            method: "POST",
            body: JSON.stringify({
              title:
                "Try-On notification test",
              message:
                "This is a test notification from the AI Virtual Try-On Platform.",
            }),
          },
        );

      result.success
        ? toast.success(result.message)
        : toast.error(result.message);

      await load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible probar el canal.",
      );
    } finally {
      setActionId(null);
    }
  };

  const deleteChannel = async (
    channel: AdminNotificationChannel,
  ) => {
    if (
      !window.confirm(
        `¿Eliminar el canal "${channel.display_name ?? channel.channel_type}"?`,
      )
    ) {
      return;
    }

    const response = await fetch(
      `/api/admin/notification-preferences/channels/${channel.id}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      toast.error(
        "No fue posible eliminar el canal.",
      );
      return;
    }

    setSettings({
      ...settings,
      channels:
        settings.channels.filter(
          (item) =>
            item.id !== channel.id,
        ),
    });
    toast.success("Canal eliminado.");
  };

  return (
    <div>
      <Link
        href="/dashboard/notifications"
        className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-white"
      >
        <ArrowLeft size={15} />
        Volver a notificaciones
      </Link>

      <section className="luxia-panel mt-5 rounded-3xl p-6">
        <div className="flex items-start gap-4">
          <div className="luxia-red-glow flex size-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
            <BellRing size={24} />
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Notificaciones
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">
              Preferencias y canales
            </h1>
            <p className="mt-3 text-sm text-zinc-600">
              Configura prioridad, resumen, horarios silenciosos y destinos externos.
            </p>
          </div>
        </div>
      </section>

      <section className="luxia-panel mt-5 rounded-3xl p-6">
        <h2 className="font-semibold text-white">
          Preferencias personales
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="flex items-center justify-between rounded-2xl border border-white/7 bg-black/20 p-4 text-sm text-zinc-400">
            Notificaciones activas
            <input
              type="checkbox"
              checked={preference.is_enabled}
              onChange={(event) =>
                updatePreference(
                  "is_enabled",
                  event.target.checked,
                )
              }
              className="accent-red-700"
            />
          </label>

          <label>
            <span className="mb-2 block text-xs text-zinc-600">
              Prioridad mínima
            </span>
            <select
              value={preference.minimum_priority}
              onChange={(event) =>
                updatePreference(
                  "minimum_priority",
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

          <label>
            <span className="mb-2 block text-xs text-zinc-600">
              Modo de entrega
            </span>
            <select
              value={preference.digest_mode}
              onChange={(event) =>
                updatePreference(
                  "digest_mode",
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
            >
              <option value="immediate">immediate</option>
              <option value="hourly">hourly</option>
              <option value="daily">daily</option>
            </select>
          </label>

          <label>
            <span className="mb-2 block text-xs text-zinc-600">
              Zona horaria
            </span>
            <input
              value={preference.timezone}
              onChange={(event) =>
                updatePreference(
                  "timezone",
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
            />
          </label>

          <label className="flex items-center justify-between rounded-2xl border border-white/7 bg-black/20 p-4 text-sm text-zinc-400">
            Horario silencioso
            <input
              type="checkbox"
              checked={
                preference.quiet_hours_enabled
              }
              onChange={(event) =>
                updatePreference(
                  "quiet_hours_enabled",
                  event.target.checked,
                )
              }
              className="accent-red-700"
            />
          </label>

          <label className="flex items-center justify-between rounded-2xl border border-white/7 bg-black/20 p-4 text-sm text-zinc-400">
            Permitir urgentes
            <input
              type="checkbox"
              checked={
                preference.allow_urgent_during_quiet_hours
              }
              onChange={(event) =>
                updatePreference(
                  "allow_urgent_during_quiet_hours",
                  event.target.checked,
                )
              }
              className="accent-red-700"
            />
          </label>
        </div>

        {preference.quiet_hours_enabled && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-xs text-zinc-600">
                Inicio
              </span>
              <input
                type="time"
                value={
                  preference.quiet_hours_start ??
                  ""
                }
                onChange={(event) =>
                  updatePreference(
                    "quiet_hours_start",
                    event.target.value || null,
                  )
                }
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
              />
            </label>

            <label>
              <span className="mb-2 block text-xs text-zinc-600">
                Fin
              </span>
              <input
                type="time"
                value={
                  preference.quiet_hours_end ??
                  ""
                }
                onChange={(event) =>
                  updatePreference(
                    "quiet_hours_end",
                    event.target.value || null,
                  )
                }
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
              />
            </label>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            void savePreferences()
          }
          disabled={saving}
          className="luxia-red-glow mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          ) : (
            <Save size={16} />
          )}
          Guardar preferencias
        </button>
      </section>

      <section className="mt-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-white">
              Canales
            </h2>
            <p className="mt-1 text-xs text-zinc-600">
              {settings.channels.length} canales configurados
            </p>
          </div>

          <button
            type="button"
            onClick={() => setEditor(null)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-500/15 bg-red-950/15 px-4 text-sm text-red-300"
          >
            <Plus size={15} />
            Nuevo canal
          </button>
        </div>

        <div className="mt-4 grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {settings.channels.map((channel) => (
            <article
              key={channel.id}
              className="luxia-panel rounded-3xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">
                    {channel.display_name ??
                      channel.channel_type}
                  </p>
                  <p className="mt-1 font-mono text-xs text-zinc-600">
                    {channel.channel_type}
                  </p>
                </div>

                <span className="rounded-full border border-white/8 px-2.5 py-1 text-[10px] text-zinc-400">
                  {channel.status}
                </span>
              </div>

              <p className="mt-5 truncate text-sm text-zinc-500">
                {channel.destination ??
                  "Sin destino"}
              </p>

              {channel.last_error && (
                <p className="mt-3 text-xs leading-5 text-red-300">
                  {channel.last_error}
                </p>
              )}

              <div className="mt-5 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setEditor(channel)
                  }
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/8 text-xs text-zinc-400"
                >
                  <Pencil size={14} />
                  Editar
                </button>

                <button
                  type="button"
                  disabled={
                    actionId === channel.id
                  }
                  onClick={() =>
                    void testChannel(channel)
                  }
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-blue-500/15 text-xs text-blue-300 disabled:opacity-50"
                >
                  {actionId === channel.id ? (
                    <LoaderCircle
                      size={14}
                      className="animate-spin"
                    />
                  ) : (
                    <FlaskConical size={14} />
                  )}
                  Probar
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void deleteChannel(channel)
                  }
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-red-500/15 text-xs text-red-300"
                >
                  <Trash2 size={14} />
                  Borrar
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {editor !== undefined && (
        <NotificationChannelEditor
          channel={editor}
          onClose={() =>
            setEditor(undefined)
          }
          onSaved={saveChannel}
        />
      )}
    </div>
  );
}
