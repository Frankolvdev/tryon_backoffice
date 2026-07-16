"use client";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Eye,
  LoaderCircle,
  RefreshCcw,
  Search,
  ShieldAlert,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  OperationalEvent,
  OperationalEventListResponse,
  OperationalEventSummary,
} from "@/types/admin-system-monitoring";

function severityClass(
  severity: string,
): string {
  if (severity === "critical") {
    return "border-red-500/20 bg-red-950/20 text-red-300";
  }

  if (severity === "error") {
    return "border-orange-500/20 bg-orange-950/20 text-orange-300";
  }

  if (severity === "warning") {
    return "border-amber-500/20 bg-amber-950/20 text-amber-300";
  }

  return "border-blue-500/20 bg-blue-950/20 text-blue-300";
}

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("es-MX");
}

export default function OperationalEventsPage() {
  const [events, setEvents] =
    useState<OperationalEvent[]>([]);
  const [summary, setSummary] =
    useState<OperationalEventSummary | null>(
      null,
    );
  const [selected, setSelected] =
    useState<OperationalEvent | null>(
      null,
    );
  const [search, setSearch] =
    useState("");
  const [severity, setSeverity] =
    useState("");
  const [resolved, setResolved] =
    useState("");
  const [source, setSource] =
    useState("");
  const [isLoading, setIsLoading] =
    useState(true);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params =
        new URLSearchParams({
          skip: "0",
          limit: "500",
        });

      if (severity) {
        params.set("severity", severity);
      }

      if (resolved) {
        params.set(
          "is_resolved",
          resolved,
        );
      }

      if (source) {
        params.set("source", source);
      }

      if (search.trim()) {
        params.set(
          "search",
          search.trim(),
        );
      }

      const [list, summaryResponse] =
        await Promise.all([
          browserApiRequest<OperationalEventListResponse>(
            `/api/admin/operational-events?${params.toString()}`,
          ),
          browserApiRequest<OperationalEventSummary>(
            "/api/admin/operational-events/summary",
          ),
        ]);

      setEvents(list.items);
      setSummary(summaryResponse);
      setSelected((current) =>
        current
          ? list.items.find(
              (item) =>
                item.id === current.id,
            ) ?? list.items[0] ?? null
          : list.items[0] ?? null,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar los eventos.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    resolved,
    search,
    severity,
    source,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const sources = useMemo(
    () =>
      summary
        ? Object.keys(
            summary.by_source,
          ).sort()
        : [],
    [summary],
  );

  return (
    <div>
      <section className="luxia-panel rounded-3xl p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Monitoreo
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">
              Eventos operativos
            </h1>
            <p className="mt-3 text-sm leading-7 text-zinc-600">
              Incidencias y sucesos técnicos generados
              por servicios, jobs, proveedores e
              infraestructura.
            </p>
          </div>

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
      </section>

      {summary && (
        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {[
            [
              "Total",
              summary.total,
              Activity,
            ],
            [
              "Sin resolver",
              summary.unresolved,
              ShieldAlert,
            ],
            [
              "Info",
              summary.info,
              Eye,
            ],
            [
              "Warnings",
              summary.warnings,
              TriangleAlert,
            ],
            [
              "Errores",
              summary.errors,
              XCircle,
            ],
            [
              "Críticos",
              summary.critical,
              AlertTriangle,
            ],
          ].map(
            ([label, value, Icon]) => {
              const MetricIcon =
                Icon as typeof Activity;

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
            },
          )}
        </section>
      )}

      <section className="luxia-panel mt-5 rounded-3xl p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative">
            <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-zinc-700" size={16} />
            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Buscar evento..."
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 pr-4 pl-11 text-sm text-white"
            />
          </label>

          <select
            value={severity}
            onChange={(event) =>
              setSeverity(
                event.target.value,
              )
            }
            className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
          >
            <option value="">
              Cualquier severidad
            </option>
            <option value="info">info</option>
            <option value="warning">warning</option>
            <option value="error">error</option>
            <option value="critical">critical</option>
          </select>

          <select
            value={resolved}
            onChange={(event) =>
              setResolved(
                event.target.value,
              )
            }
            className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
          >
            <option value="">
              Resueltos y pendientes
            </option>
            <option value="false">
              Sin resolver
            </option>
            <option value="true">
              Resueltos
            </option>
          </select>

          <select
            value={source}
            onChange={(event) =>
              setSource(
                event.target.value,
              )
            }
            className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
          >
            <option value="">
              Cualquier origen
            </option>
            {sources.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
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
          <p className="text-sm text-red-300">
            {errorMessage}
          </p>
        </section>
      )}

      {!isLoading && !errorMessage && (
        <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_440px]">
          <div className="luxia-panel overflow-hidden rounded-3xl">
            {events.length === 0 ? (
              <div className="p-12 text-center text-sm text-zinc-600">
                No existen eventos que coincidan.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {events.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() =>
                      setSelected(event)
                    }
                    className={
                      selected?.id ===
                      event.id
                        ? "block w-full bg-red-950/[0.08] p-5 text-left"
                        : "block w-full p-5 text-left hover:bg-white/[0.02]"
                    }
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${severityClass(
                              event.severity,
                            )}`}
                          >
                            {event.severity}
                          </span>
                          <span className="text-[10px] text-zinc-700">
                            {event.source}
                          </span>
                          {event.is_resolved && (
                            <span className="text-[10px] text-emerald-400">
                              resuelto
                            </span>
                          )}
                        </div>

                        <p className="mt-3 truncate text-sm font-semibold text-white">
                          {event.event_type}
                        </p>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-600">
                          {event.message}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-[10px] text-zinc-700">
                      {formatDate(
                        event.created_at,
                      )}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <aside className="luxia-panel rounded-3xl p-6">
            {!selected ? (
              <div className="flex min-h-72 items-center justify-center text-sm text-zinc-600">
                Selecciona un evento.
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-red-500 uppercase">
                      Evento #{selected.id}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-white">
                      {selected.event_type}
                    </h2>
                  </div>

                  {selected.is_resolved ? (
                    <CheckCircle2 className="text-emerald-400" />
                  ) : (
                    <AlertTriangle className="text-red-400" />
                  )}
                </div>

                <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-zinc-500">
                  {selected.message}
                </p>

                <dl className="mt-5 space-y-3 text-xs">
                  {[
                    [
                      "Origen",
                      selected.source,
                    ],
                    [
                      "Severidad",
                      selected.severity,
                    ],
                    [
                      "Correlation ID",
                      selected.correlation_id ??
                        "—",
                    ],
                    [
                      "Usuario",
                      selected.user_id ??
                        "—",
                    ],
                    [
                      "Background Job",
                      selected.background_job_id ??
                        "—",
                    ],
                    [
                      "Try-On Job",
                      selected.tryon_job_id ??
                        "—",
                    ],
                    [
                      "Provider Job",
                      selected.provider_job_id ??
                        "—",
                    ],
                    [
                      "Creado",
                      formatDate(
                        selected.created_at,
                      ),
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="flex justify-between gap-4 border-b border-white/5 pb-3"
                    >
                      <dt className="text-zinc-700">
                        {String(label)}
                      </dt>
                      <dd className="max-w-64 break-all text-right text-zinc-300">
                        {String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>

                {(selected.exception_type ||
                  selected.exception_message) && (
                  <div className="mt-5 rounded-2xl border border-red-500/15 bg-red-950/15 p-4">
                    <p className="text-xs font-semibold text-red-300">
                      {selected.exception_type ??
                        "Excepción"}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-zinc-500">
                      {selected.exception_message ??
                        "Sin mensaje"}
                    </p>
                  </div>
                )}

                <pre className="mt-5 max-h-72 overflow-auto rounded-xl bg-[#050506] p-4 font-mono text-[11px] leading-6 text-zinc-400">
                  {JSON.stringify(
                    selected.details,
                    null,
                    2,
                  )}
                </pre>

                {selected.is_resolved &&
                  selected.resolution_note && (
                    <div className="mt-5 rounded-2xl border border-emerald-500/15 bg-emerald-950/10 p-4">
                      <p className="text-xs font-semibold text-emerald-300">
                        Resolución
                      </p>
                      <p className="mt-2 text-xs leading-6 text-zinc-500">
                        {
                          selected.resolution_note
                        }
                      </p>
                    </div>
                  )}
              </>
            )}
          </aside>
        </section>
      )}
    </div>
  );
}
