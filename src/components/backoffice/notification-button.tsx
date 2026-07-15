"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Bell,
  LoaderCircle,
} from "lucide-react";

import { browserApiRequest } from "@/lib/api/browser-api";

import type { AdminNotificationCountResponse } from "@/types/admin";

export function NotificationButton() {
  const [counts, setCounts] =
    useState<AdminNotificationCountResponse | null>(
      null,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const loadCounts = useCallback(async () => {
    try {
      const response =
        await browserApiRequest<AdminNotificationCountResponse>(
          "/api/admin/notifications/counts",
        );

      setCounts(response);
    } catch {
      setCounts(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCounts();

    const intervalId = window.setInterval(
      () => {
        void loadCounts();
      },
      60_000,
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadCounts]);

  return (
    <button
      type="button"
      title="Notificaciones"
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

      {counts && counts.unread > 0 && (
        <span className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full border-2 border-[#09090a] bg-red-600 px-1 text-[10px] font-semibold text-white">
          {counts.unread > 99
            ? "99+"
            : counts.unread}
        </span>
      )}
    </button>
  );
}