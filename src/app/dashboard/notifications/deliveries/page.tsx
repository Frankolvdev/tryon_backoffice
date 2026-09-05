"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  LoaderCircle,
  RefreshCcw,
  Search,
  Send,
  TriangleAlert,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

import { NotificationDeliveryDialog } from "@/components/backoffice/notifications/notification-delivery-dialog";
import { browserApiRequest } from "@/lib/api/browser-api";
import { AdminPagination } from "@/components/backoffice/admin-pagination";

import type {
  AdminNotification,
  AdminNotificationListResponse,
} from "@/types/admin-notification-center";
import type {
  AdminNotificationDelivery,
  AdminNotificationDeliveryListResponse,
} from "@/types/admin-notification-deliveries";
import type { AdminNotificationSettings } from "@/types/admin-notification-preferences";

function statusClass(status: string): string {
  if (status === "delivered") {
    return "border-emerald-500/15 bg-emerald-950/15 text-emerald-400";
  }

  if (
    status === "pending" ||
    status === "processing"
  ) {
    return "border-blue-500/15 bg-blue-950/15 text-blue-400";
  }

  if (status === "retrying") {
    return "border-amber-500/15 bg-amber-950/15 text-amber-400";
  }

  return "border-red-500/15 bg-red-950/15 text-red-400";
}

const PAGE_SIZE = 50;

export default function NotificationDeliveriesPage() {
  const [notifications, setNotifications] =
    useState<AdminNotification[]>([]);
  const [notificationTotal, setNotificationTotal] = useState(0);
  const [notificationPage, setNotificationPage] = useState(0);
  const [deliveryPage, setDeliveryPage] = useState(0);
  const [selectedNotificationId, setSelectedNotificationId] =
    useState<number | null>(null);
  const [deliveries, setDeliveries] =
    useState<AdminNotificationDeliveryListResponse>({
      items: [],
      total: 0,
      skip: 0,
      limit: PAGE_SIZE,
    });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [channelOptions, setChannelOptions] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [channel, setChannel] = useState("");
  const [selectedDelivery, setSelectedDelivery] =
    useState<AdminNotificationDelivery | null>(
      null,
    );
  const [loadingNotifications, setLoadingNotifications] =
    useState(true);
  const [loadingDeliveries, setLoadingDeliveries] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoadingNotifications(true);
    setErrorMessage(null);

    try {
      const response =
        await browserApiRequest<AdminNotificationListResponse>(
          `/api/admin/notifications?skip=${notificationPage * PAGE_SIZE}&limit=${PAGE_SIZE}&is_archived=false&include_expired=true`,
        );

      setNotifications(response.items);
      setNotificationTotal(response.total);

      setSelectedNotificationId((current) =>
        current ??
        response.items[0]?.id ??
        null,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar las notificaciones.",
      );
    } finally {
      setLoadingNotifications(false);
    }
  }, [notificationPage]);

  const loadDeliveries = useCallback(async () => {
    if (selectedNotificationId === null) {
      setDeliveries({
        items: [],
        total: 0,
        skip: 0,
        limit: PAGE_SIZE,
      });
      return;
    }

    setLoadingDeliveries(true);

    try {
      setDeliveries(
        await browserApiRequest<AdminNotificationDeliveryListResponse>(
          `/api/admin/notifications/${selectedNotificationId}/deliveries?${new URLSearchParams({
            skip: String(deliveryPage * PAGE_SIZE),
            limit: String(PAGE_SIZE),
            ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
            ...(status ? { status } : {}),
            ...(channel ? { channel_type: channel } : {}),
          }).toString()}`,
        ),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible cargar las entregas.",
      );
    } finally {
      setLoadingDeliveries(false);
    }
  }, [channel, debouncedSearch, deliveryPage, selectedNotificationId, status]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    void loadDeliveries();
  }, [loadDeliveries]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    void browserApiRequest<AdminNotificationSettings>(
      "/api/admin/notification-preferences",
    ).then((settings) => {
      setChannelOptions(Array.from(new Set(settings.channels.map((item) => item.channel_type))).sort());
    }).catch(() => undefined);
  }, []);

  const selectedNotification =
    notifications.find(
      (item) =>
        item.id === selectedNotificationId,
    ) ?? null;

  const visibleDeliveries = deliveries.items;

  const channels = channelOptions;

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
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
              <Send size={24} />
            </div>

            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
                Notificaciones
              </p>

              <h1 className="mt-2 text-2xl font-semibold text-white">
                Entregas por notificación
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                Consulta intentos, respuestas del proveedor,
                errores y reintentos para una notificación
                concreta.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              void loadNotifications();
              void loadDeliveries();
            }}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400"
          >
            <RefreshCcw size={16} />
            Actualizar
          </button>
        </div>
      </section>

      {loadingNotifications && (
        <section className="luxia-panel mt-5 flex min-h-72 items-center justify-center rounded-3xl">
          <LoaderCircle className="animate-spin text-red-500" />
        </section>
      )}

      {!loadingNotifications && errorMessage && (
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

      {!loadingNotifications && !errorMessage && (
        <>
          <section className="luxia-panel mt-5 rounded-3xl p-5">
            <label>
              <span className="mb-2 block text-xs text-zinc-600">
                Notificación
              </span>

              <select
                value={
                  selectedNotificationId ?? ""
                }
                onChange={(event) => {
                  setDeliveryPage(0);
                  setSelectedNotificationId(Number(event.target.value));
                }}
                className="h-12 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
              >
                {notifications.length === 0 && (
                  <option value="">
                    No existen notificaciones
                  </option>
                )}

                {notifications.map(
                  (notification) => (
                    <option
                      key={notification.id}
                      value={notification.id}
                    >
                      #{notification.id} ·{" "}
                      {notification.title}
                    </option>
                  ),
                )}
              </select>
            </label>
            <AdminPagination
              page={notificationPage}
              pageSize={PAGE_SIZE}
              total={notificationTotal}
              loading={loadingNotifications}
              label="notificaciones"
              onPageChange={(nextPage) => {
                setNotificationPage(nextPage);
                setDeliveryPage(0);
                setSelectedNotificationId(null);
              }}
            />

            {selectedNotification && (
              <div className="mt-4 rounded-2xl border border-white/7 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">
                  {selectedNotification.title}
                </p>
                <p className="mt-2 text-xs leading-6 text-zinc-600">
                  {selectedNotification.message}
                </p>
              </div>
            )}
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
                  onChange={(event) => {
                    setDeliveryPage(0);
                    setSearch(event.target.value);
                  }}
                  placeholder="Buscar entrega..."
                  className="h-11 w-full rounded-xl border border-white/8 bg-black/30 pr-4 pl-11 text-sm text-white"
                />
              </label>

              <select
                value={status}
                onChange={(event) => {
                  setDeliveryPage(0);
                  setStatus(event.target.value);
                }}
                className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
              >
                <option value="">
                  Cualquier estado
                </option>
                <option value="pending">pending</option>
                <option value="processing">processing</option>
                <option value="delivered">delivered</option>
                <option value="retrying">retrying</option>
                <option value="failed">failed</option>
                <option value="skipped">skipped</option>
              </select>

              <select
                value={channel}
                onChange={(event) => {
                  setDeliveryPage(0);
                  setChannel(event.target.value);
                }}
                className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
              >
                <option value="">
                  Cualquier canal
                </option>
                {channels.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="luxia-panel mt-5 overflow-hidden rounded-3xl">
            {loadingDeliveries ? (
              <div className="flex min-h-72 items-center justify-center">
                <LoaderCircle className="animate-spin text-red-500" />
              </div>
            ) : visibleDeliveries.length === 0 ? (
              <div className="p-12 text-center text-sm text-zinc-600">
                Esta notificación no tiene entregas o no
                coincide con los filtros.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1180px] text-left">
                  <thead className="border-b border-white/6 bg-black/20 text-[10px] tracking-[0.14em] text-zinc-700 uppercase">
                    <tr>
                      <th className="px-5 py-4">
                        Entrega
                      </th>
                      <th className="px-5 py-4">
                        Canal
                      </th>
                      <th className="px-5 py-4">
                        Destino
                      </th>
                      <th className="px-5 py-4">
                        Estado
                      </th>
                      <th className="px-5 py-4">
                        Intentos
                      </th>
                      <th className="px-5 py-4">
                        Proveedor
                      </th>
                      <th className="px-5 py-4">
                        Error
                      </th>
                      <th className="px-5 py-4 text-right">
                        Acción
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {visibleDeliveries.map(
                      (delivery) => (
                        <tr
                          key={delivery.id}
                          className="hover:bg-white/[0.02]"
                        >
                          <td className="px-5 py-4 text-sm font-semibold text-white">
                            #{delivery.id}
                          </td>

                          <td className="px-5 py-4 text-sm text-zinc-400">
                            {delivery.channel_type}
                          </td>

                          <td className="max-w-xs px-5 py-4">
                            <p className="truncate text-xs text-zinc-500">
                              {delivery.destination ?? "—"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClass(
                                delivery.status,
                              )}`}
                            >
                              {delivery.status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-zinc-300">
                            {delivery.attempt_count} /{" "}
                            {delivery.max_attempts}
                          </td>

                          <td className="max-w-xs px-5 py-4">
                            <p className="truncate font-mono text-xs text-zinc-500">
                              {delivery.provider_message_id ?? "—"}
                            </p>
                          </td>

                          <td className="max-w-xs px-5 py-4">
                            <p className="truncate text-xs text-red-300">
                              {delivery.error_message ?? "—"}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedDelivery(
                                  delivery,
                                )
                              }
                              className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/8 px-3 text-xs text-zinc-400"
                            >
                              <Eye size={14} />
                              Ver
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <AdminPagination
              page={deliveryPage}
              pageSize={PAGE_SIZE}
              total={deliveries.total}
              loading={loadingDeliveries}
              label="entregas"
              onPageChange={setDeliveryPage}
            />
          </section>
        </>
      )}

      {selectedDelivery && (
        <NotificationDeliveryDialog
          delivery={selectedDelivery}
          onClose={() =>
            setSelectedDelivery(null)
          }
          onRetried={() =>
            void loadDeliveries()
          }
        />
      )}
    </div>
  );
}
