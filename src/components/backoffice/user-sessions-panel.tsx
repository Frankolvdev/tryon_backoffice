"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Globe2,
  LoaderCircle,
  MonitorSmartphone,
  RefreshCcw,
  ShieldOff,
} from "lucide-react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  AdminUserSession,
  SuccessResponse,
} from "@/types/admin-users";

interface UserSessionsPanelProps {
  userId: number;
}

function formatDate(value: string | null): string {
  if (!value) {
    return "No disponible";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function UserSessionsPanel({
  userId,
}: UserSessionsPanelProps) {
  const [sessions, setSessions] =
    useState<AdminUserSession[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [revokingSessionId, setRevokingSessionId] =
    useState<number | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response =
        await browserApiRequest<
          AdminUserSession[]
        >(`/api/admin/users/${userId}/sessions`);

      setSessions(response);
    } catch (error) {
      setSessions([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar las sesiones.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const revokeSession = async (
    session: AdminUserSession,
  ) => {
    const confirmed = window.confirm(
      `¿Revocar la sesión #${session.id}?`,
    );

    if (!confirmed) {
      return;
    }

    setRevokingSessionId(session.id);

    try {
      const response =
        await browserApiRequest<SuccessResponse>(
          `/api/admin/sessions/${session.id}/revoke`,
          {
            method: "POST",
          },
        );

      toast.success(response.message);
      await loadSessions();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible revocar la sesión.",
      );
    } finally {
      setRevokingSessionId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-72 items-center justify-center">
        <LoaderCircle className="animate-spin text-red-500" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-400">
          {errorMessage}
        </p>

        <button
          type="button"
          onClick={() => void loadSessions()}
          className="mt-5 flex h-10 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400"
        >
          <RefreshCcw size={16} />
          Intentar nuevamente
        </button>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="p-8 text-center">
        <MonitorSmartphone
          size={34}
          className="mx-auto text-zinc-700"
        />

        <h2 className="mt-5 text-lg font-semibold text-white">
          Sin sesiones registradas
        </h2>

        <p className="mt-2 text-sm text-zinc-600">
          Este usuario no tiene sesiones disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/6">
      {sessions.map((session) => {
        const active =
          !session.is_revoked &&
          !session.is_expired;

        return (
          <article
            key={session.id}
            className="p-5"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/7 bg-black/25 text-zinc-500">
                  <MonitorSmartphone size={20} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-zinc-200">
                      {session.device_name ||
                        "Dispositivo desconocido"}
                    </p>

                    <span
                      className={
                        active
                          ? "rounded-full border border-emerald-500/15 bg-emerald-950/20 px-2.5 py-1 text-[10px] text-emerald-400"
                          : "rounded-full border border-red-500/15 bg-red-950/20 px-2.5 py-1 text-[10px] text-red-400"
                      }
                    >
                      {session.is_revoked
                        ? "Revocada"
                        : session.is_expired
                          ? "Expirada"
                          : "Activa"}
                    </span>

                    {session.is_current && (
                      <span className="rounded-full border border-red-500/15 bg-red-950/20 px-2.5 py-1 text-[10px] text-red-300">
                        Sesión actual
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-zinc-600">
                    {session.browser_name ||
                      "Navegador desconocido"}{" "}
                    ·{" "}
                    {session.operating_system ||
                      "Sistema desconocido"}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs text-zinc-700">
                    <Globe2 size={14} />
                    {session.ip_address ||
                      "IP no disponible"}
                  </div>

                  {session.user_agent && (
                    <p className="mt-3 max-w-3xl break-words text-[11px] leading-5 text-zinc-800">
                      {session.user_agent}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-3 lg:items-end">
                <div className="text-xs leading-6 text-zinc-600">
                  <p>
                    Creada:{" "}
                    {formatDate(session.created_at)}
                  </p>

                  <p>
                    Expira:{" "}
                    {formatDate(session.expires_at)}
                  </p>

                  {session.revoked_at && (
                    <p>
                      Revocada:{" "}
                      {formatDate(session.revoked_at)}
                    </p>
                  )}
                </div>

                {active && (
                  <button
                    type="button"
                    onClick={() =>
                      void revokeSession(session)
                    }
                    disabled={
                      revokingSessionId === session.id
                    }
                    className="flex h-9 items-center justify-center gap-2 rounded-xl border border-red-500/15 bg-red-950/20 px-3 text-xs text-red-400 disabled:opacity-50"
                  >
                    {revokingSessionId ===
                    session.id ? (
                      <LoaderCircle
                        size={14}
                        className="animate-spin"
                      />
                    ) : (
                      <ShieldOff size={14} />
                    )}

                    Revocar sesión
                  </button>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}