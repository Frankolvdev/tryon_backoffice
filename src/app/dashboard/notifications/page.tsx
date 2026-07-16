"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Archive,
  Bell,
  CheckCheck,
  CircleAlert,
  Eye,
  LoaderCircle,
  RefreshCcw,
  Search,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  AdminNotification,
  AdminNotificationCountResponse,
  AdminNotificationListResponse,
} from "@/types/admin-notification-center";

const LIMIT = 100;

function formatDate(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("es-MX");
}

function priorityClass(priority: string): string {
  if (
    priority === "urgent" ||
    priority === "critical"
  ) {
    return "border-red-500/20 bg-red-950/20 text-red-300";
  }

  if (priority === "high") {
    return "border-amber-500/20 bg-amber-950/20 text-amber-300";
  }

  return "border-white/8 bg-black/20 text-zinc-400";
}

export default function NotificationsPage() {
  const [list, setList] =
    useState<AdminNotificationListResponse>({
      items: [],
      total: 0,
      unread: 0,
      skip: 0,
      limit: LIMIT,
    });
  const [counts, setCounts] =
    useState<AdminNotificationCountResponse>({
      total: 0,
      unread: 0,
      urgent: 0,
      requires_action: 0,
    });
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [readFilter, setReadFilter] = useState("");
  const [selected, setSelected] =
    useState<AdminNotification | null>(null);
  const [isLoading, setIsLoading] =
    useState(true);
  const [actionId, setActionId] =
    useState<number | null>(null);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams({
      skip: "0",
      limit: String(LIMIT),
      is_archived: "false",
    });

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (priority) {
      params.set("priority", priority);
    }

    if (readFilter) {
      params.set("is_read", readFilter);
    }

    return params.toString();
  }, [priority, readFilter, search]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [notifications, countResponse] =
        await Promise.all([
          browserApiRequest<AdminNotificationListResponse>(
            `/api/admin/notifications?${query}`,
          ),
          browserApiRequest<AdminNotificationCountResponse>(
            "/api/admin/notifications/counts",
          ),
        ]);

      setList(notifications);
      setCounts(countResponse);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar las notificaciones.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateItem = (
    updated: AdminNotification,
  ) => {
    setList((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === updated.id
          ? updated
          : item,
      ),
    }));

    setSelected((current) =>
      current?.id === updated.id
        ? updated
        : current,
    );
  };

  const markRead = async (
    notification: AdminNotification,
  ) => {
    setActionId(notification.id);

    try {
      const updated =
        await browserApiRequest<AdminNotification>(
          `/api/admin/notifications/${notification.id}/read`,
          { method: "POST" },
        );

      updateItem(updated);
      setCounts((current) => ({
        ...current,
        unread: Math.max(
          0,
          current.unread -
            (notification.is_read ? 0 : 1),
        ),
      }));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible marcar la notificación.",
      );
    } finally {
      setActionId(null);
    }
  };

  const archive = async (
    notification: AdminNotification,
  ) => {
    setActionId(notification.id);

    try {
      await browserApiRequest<AdminNotification>(
        `/api/admin/notifications/${notification.id}/archive`,
        { method: "POST" },
      );

      setList((current) => ({
        ...current,
        total: Math.max(0, current.total - 1),
        items: current.items.filter(
          (item) =>
            item.id !== notification.id,
        ),
      }));
      setSelected(null);
      toast.success("Notificación archivada.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible archivar.",
      );
    } finally {
      setActionId(null);
    }
  };

  const markAllRead = async () => {
    try {
      await browserApiRequest(
        "/api/admin/notifications/mark-all-read",
        { method: "POST" },
      );
      toast.success(
        "Todas las notificaciones fueron marcadas como leídas.",
      );
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible completar la operación.",
      );
    }
  };

  return (
    <div>
      <section className="luxia-panel rounded-3xl p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
              <Bell size={24} />
            </div>

            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
                Administración
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-white">
                Centro de notificaciones
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                Revisa avisos internos, prioridades,
                acciones requeridas y eventos del sistema.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400"
            >
              <CheckCheck size={16} />
              Marcar todo leído
            </button>

            <button
              type="button"
              onClick={() => void load()}
              disabled={isLoading}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400 disabled:opacity-50"
            >
              <RefreshCcw
                size={16}
                className={
                  isLoading
                    ? "animate-spin"
                    : undefined
                }
              />
              Actualizar
            </button>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total", counts.total, Bell],
          ["Sin leer", counts.unread, Eye],
          ["Urgentes", counts.urgent, ShieldAlert],
          [
            "Requieren acción",
            counts.requires_action,
            CircleAlert,
          ],
        ].map(([label, value, Icon]) => {
          const MetricIcon =
            Icon as typeof Bell;

          return (
            <article
              key={String(label)}
              className="luxia-panel rounded-2xl p-5"
            >
              <MetricIcon
                size={18}
                className="text-red-400"
              />
              <p className="mt-4 text-xs text-zinc-600">
                {String(label)}
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {Number(value)}
              </p>
            </article>
          );
        })}
      </section>

      <section className="luxia-panel mt-5 rounded-3xl p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-zinc-700"
            />
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Buscar..."
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 pr-4 pl-11 text-sm text-white"
            />
          </label>

          <select
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value)
            }
            className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
          >
            <option value="">
              Cualquier prioridad
            </option>
            <option value="normal">normal</option>
            <option value="high">high</option>
            <option value="urgent">urgent</option>
            <option value="critical">critical</option>
          </select>

          <select
            value={readFilter}
            onChange={(event) =>
              setReadFilter(event.target.value)
            }
            className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
          >
            <option value="">
              Leídas y no leídas
            </option>
            <option value="false">Sin leer</option>
            <option value="true">Leídas</option>
          </select>
        </div>
      </section>

      {isLoading && (
        <section className="luxia-panel mt-5 flex min-h-80 items-center justify-center rounded-3xl">
          <LoaderCircle className="animate-spin text-red-500" />
        </section>
      )}

      {!isLoading && errorMessage && (
        <section className="luxia-panel mt-5 rounded-3xl p-6">
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/15 bg-red-950/15 p-5">
            <TriangleAlert
              size={19}
              className="mt-0.5 text-red-400"
            />
            <p className="text-sm text-red-300">
              {errorMessage}
            </p>
          </div>
        </section>
      )}

      {!isLoading && !errorMessage && (
        <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_420px]">
          <div className="luxia-panel overflow-hidden rounded-3xl">
            {list.items.length === 0 ? (
              <div className="p-12 text-center text-sm text-zinc-600">
                No existen notificaciones que coincidan.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {list.items.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => {
                      setSelected(notification);
                      if (!notification.is_read) {
                        void markRead(notification);
                      }
                    }}
                    className={
                      notification.is_read
                        ? "block w-full p-5 text-left hover:bg-white/[0.02]"
                        : "block w-full bg-red-950/[0.06] p-5 text-left hover:bg-white/[0.02]"
                    }
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${priorityClass(
                              notification.priority,
                            )}`}
                          >
                            {notification.priority}
                          </span>

                          <span className="text-[10px] text-zinc-700">
                            {notification.source}
                          </span>
                        </div>

                        <p className="mt-3 truncate text-sm font-semibold text-white">
                          {notification.title}
                        </p>

                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-600">
                          {notification.message}
                        </p>
                      </div>

                      {!notification.is_read && (
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-red-500" />
                      )}
                    </div>

                    <p className="mt-3 text-[10px] text-zinc-700">
                      {formatDate(
                        notification.created_at,
                      )}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <aside className="luxia-panel rounded-3xl p-6">
            {!selected ? (
              <div className="flex min-h-72 flex-col items-center justify-center text-center">
                <Bell className="text-zinc-800" />
                <p className="mt-4 text-sm text-zinc-600">
                  Selecciona una notificación para ver sus detalles.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${priorityClass(
                        selected.priority,
                      )}`}
                    >
                      {selected.priority}
                    </span>

                    <h2 className="mt-4 text-lg font-semibold text-white">
                      {selected.title}
                    </h2>
                  </div>

                  {selected.requires_action && (
                    <CircleAlert
                      className="text-amber-400"
                    />
                  )}
                </div>

                <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-zinc-500">
                  {selected.message}
                </p>

                <dl className="mt-5 space-y-3 text-xs">
                  {[
                    ["Tipo", selected.notification_type],
                    ["Origen", selected.source],
                    [
                      "Evento",
                      selected.event_type ?? "—",
                    ],
                    [
                      "Entidad",
                      selected.entity_type
                        ? `${selected.entity_type} #${selected.entity_id ?? "—"}`
                        : "—",
                    ],
                    [
                      "Creada",
                      formatDate(selected.created_at),
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between gap-4 border-b border-white/5 pb-3"
                    >
                      <dt className="text-zinc-700">
                        {label}
                      </dt>
                      <dd className="max-w-64 break-all text-right text-zinc-400">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                {selected.action_url && (
                  <a
                    href={selected.action_url}
                    className="mt-5 inline-flex h-10 items-center rounded-xl border border-red-500/15 px-4 text-sm text-red-300"
                  >
                    {selected.action_label ??
                      "Abrir acción"}
                  </a>
                )}

                <button
                  type="button"
                  disabled={
                    actionId === selected.id
                  }
                  onClick={() =>
                    void archive(selected)
                  }
                  className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/8 text-sm text-zinc-400 disabled:opacity-50"
                >
                  {actionId === selected.id ? (
                    <LoaderCircle
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <Archive size={15} />
                  )}
                  Archivar
                </button>
              </>
            )}
          </aside>
        </section>
      )}
    </div>
  );
}
