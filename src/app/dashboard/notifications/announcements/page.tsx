"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BellRing,
  Image,
  Link2,
  LoaderCircle,
  Megaphone,
  Send,
} from "lucide-react";
import {
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  UserAnnouncementCreate,
  UserAnnouncementResponse,
} from "@/types/admin-user-announcements";

function toIsoOrNull(
  value: string,
): string | null {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date.toISOString();
}

export default function UserAnnouncementsPage() {
  const [notificationType, setNotificationType] =
    useState("info");
  const [priority, setPriority] =
    useState("normal");
  const [title, setTitle] =
    useState("");
  const [message, setMessage] =
    useState("");
  const [actionUrl, setActionUrl] =
    useState("");
  const [actionLabel, setActionLabel] =
    useState("");
  const [imageUrl, setImageUrl] =
    useState("");
  const [publishedAt, setPublishedAt] =
    useState("");
  const [expiresAt, setExpiresAt] =
    useState("");
  const [requiresAction, setRequiresAction] =
    useState(false);
  const [metadata, setMetadata] =
    useState("{}");
  const [isSending, setIsSending] =
    useState(false);
  const [created, setCreated] =
    useState<UserAnnouncementResponse | null>(
      null,
    );

  const submit = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error(
        "El título es obligatorio.",
      );
      return;
    }

    if (!message.trim()) {
      toast.error(
        "El mensaje es obligatorio.",
      );
      return;
    }

    let parsedMetadata:
      Record<string, unknown>;

    try {
      const parsed = JSON.parse(
        metadata || "{}",
      ) as unknown;

      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        throw new Error();
      }

      parsedMetadata =
        parsed as Record<string, unknown>;
    } catch {
      toast.error(
        "Metadata debe ser un objeto JSON válido.",
      );
      return;
    }

    if (
      publishedAt &&
      expiresAt &&
      new Date(expiresAt).getTime() <=
        new Date(publishedAt).getTime()
    ) {
      toast.error(
        "La expiración debe ser posterior a la publicación.",
      );
      return;
    }

    const payload:
      UserAnnouncementCreate = {
      notification_type:
        notificationType,
      priority,
      title: title.trim(),
      message: message.trim(),
      action_url:
        actionUrl.trim() || null,
      action_label:
        actionLabel.trim() || null,
      image_url:
        imageUrl.trim() || null,
      requires_action:
        requiresAction,
      published_at:
        toIsoOrNull(publishedAt),
      expires_at:
        toIsoOrNull(expiresAt),
      metadata: parsedMetadata,
    };

    if (
      !window.confirm(
        "Se creará un anuncio global para los usuarios finales. ¿Deseas continuar?",
      )
    ) {
      return;
    }

    setIsSending(true);

    try {
      const response =
        await browserApiRequest<UserAnnouncementResponse>(
          "/api/admin/user-announcements",
          {
            method: "POST",
            body: JSON.stringify(
              payload,
            ),
          },
        );

      setCreated(response);
      toast.success(
        "Anuncio global creado correctamente.",
      );

      setTitle("");
      setMessage("");
      setActionUrl("");
      setActionLabel("");
      setImageUrl("");
      setPublishedAt("");
      setExpiresAt("");
      setRequiresAction(false);
      setMetadata("{}");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible crear el anuncio.",
      );
    } finally {
      setIsSending(false);
    }
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
          <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
            <Megaphone size={24} />
          </div>

          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Notificaciones
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-white">
              Anuncios para usuarios
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
              Crea avisos globales que aparecerán en el
              futuro frontend de usuarios finales.
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={submit}
        className="luxia-panel mt-5 rounded-3xl p-6"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Tipo
            </span>

            <select
              value={notificationType}
              onChange={(event) =>
                setNotificationType(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
            >
              <option value="info">
                Información
              </option>
              <option value="success">
                Éxito
              </option>
              <option value="warning">
                Advertencia
              </option>
              <option value="error">
                Error
              </option>
              <option value="promotion">
                Promoción
              </option>
              <option value="system">
                Sistema
              </option>
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Prioridad
            </span>

            <select
              value={priority}
              onChange={(event) =>
                setPriority(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
            >
              <option value="normal">
                Normal
              </option>
              <option value="high">
                Alta
              </option>
              <option value="urgent">
                Urgente
              </option>
              <option value="critical">
                Crítica
              </option>
            </select>
          </label>
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm text-zinc-500">
            Título
          </span>

          <input
            value={title}
            maxLength={255}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="Mantenimiento programado"
            className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
          />
        </label>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm text-zinc-500">
            Mensaje
          </span>

          <textarea
            value={message}
            maxLength={20000}
            onChange={(event) =>
              setMessage(
                event.target.value,
              )
            }
            placeholder="Escribe el anuncio que recibirán los usuarios..."
            className="min-h-44 w-full rounded-xl border border-white/8 bg-black/30 p-4 text-sm leading-7 text-white"
          />
        </label>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label>
            <span className="mb-2 flex items-center gap-2 text-sm text-zinc-500">
              <Link2 size={14} />
              URL de acción
            </span>

            <input
              value={actionUrl}
              maxLength={2000}
              onChange={(event) =>
                setActionUrl(
                  event.target.value,
                )
              }
              placeholder="/pricing"
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Texto del botón
            </span>

            <input
              value={actionLabel}
              maxLength={120}
              onChange={(event) =>
                setActionLabel(
                  event.target.value,
                )
              }
              placeholder="Ver detalles"
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
            />
          </label>

          <label>
            <span className="mb-2 flex items-center gap-2 text-sm text-zinc-500">
              <Image size={14} />
              URL de imagen
            </span>

            <input
              value={imageUrl}
              maxLength={2000}
              onChange={(event) =>
                setImageUrl(
                  event.target.value,
                )
              }
              placeholder="https://..."
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/7 bg-black/20 p-4 text-sm text-zinc-400">
            Requiere acción
            <input
              type="checkbox"
              checked={requiresAction}
              onChange={(event) =>
                setRequiresAction(
                  event.target.checked,
                )
              }
              className="size-4 accent-red-700"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Publicar desde
            </span>

            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(event) =>
                setPublishedAt(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-zinc-300"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Expira
            </span>

            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(event) =>
                setExpiresAt(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-zinc-300"
            />
          </label>
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm text-zinc-500">
            Metadata JSON
          </span>

          <textarea
            value={metadata}
            spellCheck={false}
            onChange={(event) =>
              setMetadata(
                event.target.value,
              )
            }
            className="min-h-32 w-full rounded-xl border border-white/8 bg-[#050506] p-4 font-mono text-xs leading-6 text-zinc-300"
          />
        </label>

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={isSending}
            className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isSending ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <Send size={16} />
            )}

            Crear anuncio global
          </button>
        </div>
      </form>

      {created && (
        <section className="mt-5 rounded-3xl border border-emerald-500/15 bg-emerald-950/10 p-6">
          <div className="flex items-start gap-3">
            <BellRing
              size={20}
              className="mt-0.5 text-emerald-400"
            />

            <div>
              <p className="font-semibold text-emerald-300">
                Anuncio #{created.id} creado
              </p>

              <p className="mt-2 text-sm text-zinc-400">
                {created.title}
              </p>

              <p className="mt-2 text-xs text-zinc-600">
                Publicación:{" "}
                {created.published_at
                  ? new Date(
                      created.published_at,
                    ).toLocaleString(
                      "es-MX",
                    )
                  : "inmediata"}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
