"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Bell,
  Check,
  ChevronRight,
  LoaderCircle,
  RefreshCcw,
} from "lucide-react";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  AdminNotification,
  AdminNotificationCountResponse,
  AdminNotificationListResponse,
} from "@/types/admin-notification-center";

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "es-MX",
    {
      dateStyle: "short",
      timeStyle: "short",
    },
  ).format(date);
}

export function NotificationButton() {
  const [counts, setCounts] =
    useState<AdminNotificationCountResponse | null>(
      null,
    );
  const [notifications, setNotifications] =
    useState<AdminNotification[]>([]);
  const [isOpen, setIsOpen] =
    useState(false);
  const [isLoading, setIsLoading] =
    useState(true);
  const [isRefreshing, setIsRefreshing] =
    useState(false);
  const containerRef =
    useRef<HTMLDivElement>(null);

  const load = useCallback(
    async (
      showSpinner = false,
    ) => {
      if (showSpinner) {
        setIsRefreshing(true);
      }

      try {
        const [
          countResponse,
          listResponse,
        ] = await Promise.all([
          browserApiRequest<AdminNotificationCountResponse>(
            "/api/admin/notifications/counts",
          ),
          browserApiRequest<AdminNotificationListResponse>(
            "/api/admin/notifications?skip=0&limit=6&is_archived=false&is_read=false",
          ),
        ]);

        setCounts(countResponse);
        setNotifications(
          listResponse.items,
        );
      } catch {
        // Keep the last successful state and do not
        // interrupt the rest of the BackOffice.
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    void load();

    const intervalId =
      window.setInterval(
        () => {
          void load();
        },
        60_000,
      );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [load]);

  useEffect(() => {
    const close = (
      event: PointerEvent,
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      close,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        close,
      );
    };
  }, []);

  const markRead = async (
    notification: AdminNotification,
  ) => {
    try {
      await browserApiRequest<AdminNotification>(
        `/api/admin/notifications/${notification.id}/read`,
        {
          method: "POST",
        },
      );

      setNotifications((current) =>
        current.filter(
          (item) =>
            item.id !== notification.id,
        ),
      );

      setCounts((current) =>
        current
          ? {
              ...current,
              unread: Math.max(
                0,
                current.unread - 1,
              ),
            }
          : current,
      );
    } catch {
      // The full notification center remains available.
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        title="Notificaciones"
        aria-label="Abrir notificaciones"
        aria-expanded={isOpen}
        onClick={() =>
          setIsOpen(
            (current) => !current,
          )
        }
        className="relative flex size-10 items-center justify-center rounded-xl border border-white/7 bg-white/[0.025] text-zinc-500 transition hover:border-red-500/15 hover:bg-red-950/20 hover:text-white"
      >
        {isLoading ? (
          <LoaderCircle
            size={17}
            className="animate-spin"
          />
        ) : (
          <Bell size={17} />
        )}

        {counts &&
          counts.unread > 0 && (
            <span className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full border-2 border-[#09090a] bg-red-600 px-1 text-[10px] font-semibold text-white">
              {counts.unread > 99
                ? "99+"
                : counts.unread}
            </span>
          )}
      </button>

      {isOpen && (
        <section className="absolute top-[calc(100%+10px)] right-0 z-50 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-white/8 bg-[#101012] shadow-2xl">
          <header className="flex items-center justify-between gap-4 border-b border-white/6 p-4">
            <div>
              <p className="text-sm font-semibold text-white">
                Notificaciones
              </p>
              <p className="mt-1 text-[10px] text-zinc-600">
                {counts?.unread ?? 0} sin leer
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void load(true)
              }
              disabled={isRefreshing}
              className="flex size-9 items-center justify-center rounded-xl border border-white/7 text-zinc-500 disabled:opacity-40"
              aria-label="Actualizar notificaciones"
            >
              <RefreshCcw
                size={15}
                className={
                  isRefreshing
                    ? "animate-spin"
                    : undefined
                }
              />
            </button>
          </header>

          <div className="max-h-[430px] overflow-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Check
                  size={22}
                  className="mx-auto text-emerald-400"
                />
                <p className="mt-3 text-sm text-zinc-500">
                  No tienes notificaciones
                  pendientes.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map(
                  (notification) => (
                    <article
                      key={notification.id}
                      className="p-4 hover:bg-white/[0.025]"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-red-500" />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">
                            {
                              notification.title
                            }
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-600">
                            {
                              notification.message
                            }
                          </p>
                          <p className="mt-2 text-[10px] text-zinc-700">
                            {formatDate(
                              notification.created_at,
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            void markRead(
                              notification,
                            )
                          }
                          className="inline-flex h-8 items-center gap-2 rounded-lg border border-white/7 px-3 text-[11px] text-zinc-500 hover:text-white"
                        >
                          <Check size={13} />
                          Marcar leída
                        </button>
                      </div>
                    </article>
                  ),
                )}
              </div>
            )}
          </div>

          <footer className="border-t border-white/6 p-2">
            <Link
              href="/dashboard/notifications"
              onClick={() =>
                setIsOpen(false)
              }
              className="flex h-10 items-center justify-between rounded-xl px-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              Ver todas las notificaciones
              <ChevronRight size={15} />
            </Link>
          </footer>
        </section>
      )}
    </div>
  );
}
