"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileClock,
  Fingerprint,
  LoaderCircle,
  RefreshCcw,
  Search,
  ShieldCheck,
  TriangleAlert,
  UserRound,
} from "lucide-react";

import { AuditLogDetail } from "@/components/backoffice/audit/audit-log-detail";
import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  AuditLogResponse,
} from "@/types/admin-audit";

const PAGE_SIZE = 100;

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return value;
  }

  return date.toLocaleString(
    "es-MX",
  );
}

export default function AuditLogsPage() {
  const [logs, setLogs] =
    useState<AuditLogResponse[]>([]);

  const [page, setPage] =
    useState(0);

  const [search, setSearch] =
    useState("");

  const [selectedLog, setSelectedLog] =
    useState<AuditLogResponse | null>(
      null,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response =
        await browserApiRequest<
          AuditLogResponse[]
        >(
          `/api/admin/audit-logs?skip=${
            page * PAGE_SIZE
          }&limit=${PAGE_SIZE}`,
        );

      setLogs(response);
    } catch (error) {
      setLogs([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar los registros de auditoría.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const visibleLogs = useMemo(() => {
    const normalized =
      search.trim().toLowerCase();

    if (!normalized) {
      return logs;
    }

    return logs.filter((log) =>
      [
        log.action,
        log.entity_type ?? "",
        log.entity_id ?? "",
        log.description ?? "",
        log.ip_address ?? "",
        log.actor_user_id?.toString() ??
          "",
      ].some((value) =>
        value
          .toLowerCase()
          .includes(normalized),
      ),
    );
  }, [logs, search]);

  const uniqueActions = useMemo(
    () =>
      new Set(
        logs.map((log) => log.action),
      ).size,
    [logs],
  );

  const uniqueActors = useMemo(
    () =>
      new Set(
        logs
          .map(
            (log) =>
              log.actor_user_id,
          )
          .filter(
            (
              value,
            ): value is number =>
              value !== null,
          ),
      ).size,
    [logs],
  );

  const uniqueEntities = useMemo(
    () =>
      new Set(
        logs
          .map(
            (log) =>
              log.entity_type,
          )
          .filter(
            (
              value,
            ): value is string =>
              Boolean(value),
          ),
      ).size,
    [logs],
  );

  const canGoNext =
    logs.length === PAGE_SIZE;

  return (
    <div>
      <section className="luxia-panel overflow-hidden rounded-3xl">
        <div className="border-b border-white/6 p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
                <FileClock size={24} />
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
                  Administración
                </p>

                <h1 className="mt-2 text-2xl font-semibold text-white">
                  Auditoría
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                  Consulta de acciones administrativas
                  registradas por el backend, incluyendo
                  actor, entidad, dirección IP, dispositivo
                  y fecha.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadLogs()
              }
              disabled={isLoading}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400 disabled:opacity-50"
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
          {
            label: "Registros cargados",
            value: logs.length,
            icon: FileClock,
          },
          {
            label: "Acciones distintas",
            value: uniqueActions,
            icon: ShieldCheck,
          },
          {
            label: "Administradores",
            value: uniqueActors,
            icon: UserRound,
          },
          {
            label: "Entidades",
            value: uniqueEntities,
            icon: Fingerprint,
          },
        ].map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              key={metric.label}
              className="luxia-panel rounded-2xl p-5"
            >
              <Icon
                size={18}
                className="text-red-400"
              />

              <p className="mt-4 text-xs text-zinc-600">
                {metric.label}
              </p>

              <p className="mt-2 text-2xl font-semibold text-white">
                {metric.value}
              </p>
            </article>
          );
        })}
      </section>

      <section className="luxia-panel mt-5 overflow-hidden rounded-3xl">
        <div className="flex flex-col gap-4 border-b border-white/6 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-zinc-700"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Buscar acción, entidad, actor, IP..."
              className="h-11 w-full rounded-xl border border-white/7 bg-black/30 pr-4 pl-11 text-sm text-white"
            />
          </div>

          <p className="text-xs text-zinc-600">
            Página {page + 1} ·{" "}
            {visibleLogs.length} resultados visibles
          </p>
        </div>

        {isLoading && (
          <div className="flex min-h-80 items-center justify-center">
            <LoaderCircle className="animate-spin text-red-500" />
          </div>
        )}

        {!isLoading &&
          errorMessage && (
            <div className="p-5">
              <div className="flex items-start gap-3 rounded-2xl border border-red-500/15 bg-red-950/15 p-5">
                <TriangleAlert
                  size={19}
                  className="mt-0.5 shrink-0 text-red-400"
                />

                <p className="text-sm leading-6 text-red-300">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

        {!isLoading &&
          !errorMessage &&
          visibleLogs.length === 0 && (
            <div className="p-12 text-center">
              <FileClock
                size={36}
                className="mx-auto text-zinc-700"
              />

              <h2 className="mt-5 text-lg font-semibold text-white">
                Sin registros
              </h2>

              <p className="mt-2 text-sm text-zinc-600">
                No hay eventos en esta página o no
                coinciden con la búsqueda.
              </p>
            </div>
          )}

        {!isLoading &&
          !errorMessage &&
          visibleLogs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left">
                <thead className="border-b border-white/6 bg-black/20 text-[10px] tracking-[0.14em] text-zinc-700 uppercase">
                  <tr>
                    <th className="px-5 py-4">
                      Evento
                    </th>
                    <th className="px-5 py-4">
                      Actor
                    </th>
                    <th className="px-5 py-4">
                      Entidad
                    </th>
                    <th className="px-5 py-4">
                      IP
                    </th>
                    <th className="px-5 py-4">
                      Fecha
                    </th>
                    <th className="px-5 py-4 text-right">
                      Acción
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {visibleLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="transition hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <p className="max-w-xs truncate text-sm font-medium text-white">
                          {log.action}
                        </p>

                        <p className="mt-1 max-w-xs truncate text-xs text-zinc-600">
                          {log.description ??
                            "Sin descripción"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-400">
                        {log.actor_user_id ??
                          "Sistema"}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-zinc-400">
                          {log.entity_type ??
                            "No disponible"}
                        </p>

                        <p className="mt-1 font-mono text-[10px] text-zinc-700">
                          {log.entity_id ??
                            "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-zinc-500">
                        {log.ip_address ??
                          "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <CalendarClock
                            size={14}
                          />
                          {formatDate(
                            log.created_at,
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedLog(
                              log,
                            )
                          }
                          className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/8 px-3 text-xs text-zinc-400 transition hover:text-white"
                        >
                          <Eye size={14} />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        {!isLoading &&
          !errorMessage && (
            <footer className="flex items-center justify-between gap-4 border-t border-white/6 p-5">
              <button
                type="button"
                disabled={page === 0}
                onClick={() =>
                  setPage((current) =>
                    Math.max(
                      0,
                      current - 1,
                    ),
                  )
                }
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400 disabled:opacity-30"
              >
                <ChevronLeft size={15} />
                Anterior
              </button>

              <span className="text-xs text-zinc-600">
                Registros{" "}
                {page * PAGE_SIZE + 1}–
                {page * PAGE_SIZE +
                  logs.length}
              </span>

              <button
                type="button"
                disabled={!canGoNext}
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1,
                  )
                }
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400 disabled:opacity-30"
              >
                Siguiente
                <ChevronRight size={15} />
              </button>
            </footer>
          )}
      </section>

      {selectedLog && (
        <AuditLogDetail
          log={selectedLog}
          onClose={() =>
            setSelectedLog(null)
          }
        />
      )}
    </div>
  );
}
