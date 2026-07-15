"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Files,
  Filter,
  LoaderCircle,
  RefreshCcw,
  Search,
  ShieldCheck,
  ShieldX,
  TriangleAlert,
  Undo2,
} from "lucide-react";

import { AuditEntryInspector } from "@/components/backoffice/audit/audit-entry-inspector";
import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  AuditEntryListResponse,
  AuditEntryResponse,
  AuditSummaryResponse,
} from "@/types/admin-audit-entries";

const PAGE_SIZE = 100;

type BooleanFilter =
  | "all"
  | "true"
  | "false";

function appendOptional(
  params: URLSearchParams,
  key: string,
  value: string,
) {
  const normalized = value.trim();

  if (normalized) {
    params.set(key, normalized);
  }
}

export default function AuditEntriesPage() {
  const [response, setResponse] =
    useState<AuditEntryListResponse>({
      items: [],
      total: 0,
      skip: 0,
      limit: PAGE_SIZE,
    });

  const [summary, setSummary] =
    useState<AuditSummaryResponse | null>(
      null,
    );

  const [page, setPage] =
    useState(0);

  const [search, setSearch] =
    useState("");

  const [actorType, setActorType] =
    useState("");

  const [action, setAction] =
    useState("");

  const [entityType, setEntityType] =
    useState("");

  const [success, setSuccess] =
    useState<BooleanFilter>("all");

  const [restorable, setRestorable] =
    useState<BooleanFilter>("all");

  const [createdFrom, setCreatedFrom] =
    useState("");

  const [createdTo, setCreatedTo] =
    useState("");

  const [selectedEntry, setSelectedEntry] =
    useState<AuditEntryResponse | null>(
      null,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const queryString = useMemo(() => {
    const params =
      new URLSearchParams();

    params.set(
      "skip",
      String(page * PAGE_SIZE),
    );
    params.set(
      "limit",
      String(PAGE_SIZE),
    );

    appendOptional(
      params,
      "search",
      search,
    );
    appendOptional(
      params,
      "actor_type",
      actorType,
    );
    appendOptional(
      params,
      "action",
      action,
    );
    appendOptional(
      params,
      "entity_type",
      entityType,
    );

    if (success !== "all") {
      params.set(
        "success",
        success,
      );
    }

    if (restorable !== "all") {
      params.set(
        "is_restorable",
        restorable,
      );
    }

    if (createdFrom) {
      params.set(
        "created_from",
        new Date(
          `${createdFrom}T00:00:00`,
        ).toISOString(),
      );
    }

    if (createdTo) {
      params.set(
        "created_to",
        new Date(
          `${createdTo}T23:59:59`,
        ).toISOString(),
      );
    }

    return params.toString();
  }, [
    action,
    actorType,
    createdFrom,
    createdTo,
    entityType,
    page,
    restorable,
    search,
    success,
  ]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [
        entriesResponse,
        summaryResponse,
      ] = await Promise.all([
        browserApiRequest<AuditEntryListResponse>(
          `/api/admin/audit-entries?${queryString}`,
        ),
        browserApiRequest<AuditSummaryResponse>(
          "/api/admin/audit-entries/summary",
        ),
      ]);

      setResponse(entriesResponse);
      setSummary(summaryResponse);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar las entradas avanzadas.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const resetFilters = () => {
    setSearch("");
    setActorType("");
    setAction("");
    setEntityType("");
    setSuccess("all");
    setRestorable("all");
    setCreatedFrom("");
    setCreatedTo("");
    setPage(0);
  };

  const totalPages = Math.max(
    1,
    Math.ceil(
      response.total / PAGE_SIZE,
    ),
  );

  return (
    <div>
      <section className="luxia-panel overflow-hidden rounded-3xl">
        <div className="border-b border-white/6 p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
                <Files size={24} />
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
                  Auditoría
                </p>

                <h1 className="mt-2 text-2xl font-semibold text-white">
                  Entradas avanzadas
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                  Explora snapshots, diferencias,
                  metadatos, errores, correlación e
                  historial por entidad.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadData()
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

      {summary && (
        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [
              "Total",
              summary.total_entries,
              Files,
            ],
            [
              "Exitosas",
              summary.successful_entries,
              ShieldCheck,
            ],
            [
              "Fallidas",
              summary.failed_entries,
              ShieldX,
            ],
            [
              "Restaurables",
              summary.restorable_entries,
              Undo2,
            ],
          ].map(([label, value, Icon]) => {
            const MetricIcon =
              Icon as typeof Files;

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
                  {Number(
                    value,
                  ).toLocaleString(
                    "es-MX",
                  )}
                </p>
              </article>
            );
          })}
        </section>
      )}

      <section className="luxia-panel mt-5 rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <Filter className="text-red-400" />
          <h2 className="font-semibold text-white">
            Filtros del backend
          </h2>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative xl:col-span-2">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-zinc-700"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value,
                );
                setPage(0);
              }}
              placeholder="Búsqueda global..."
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 pr-4 pl-11 text-sm text-white"
            />
          </label>

          <input
            value={actorType}
            onChange={(event) => {
              setActorType(
                event.target.value,
              );
              setPage(0);
            }}
            placeholder="Tipo de actor"
            className="h-11 rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
          />

          <input
            value={action}
            onChange={(event) => {
              setAction(
                event.target.value,
              );
              setPage(0);
            }}
            placeholder="Acción exacta"
            className="h-11 rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
          />

          <input
            value={entityType}
            onChange={(event) => {
              setEntityType(
                event.target.value,
              );
              setPage(0);
            }}
            placeholder="Tipo de entidad"
            className="h-11 rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
          />

          <select
            value={success}
            onChange={(event) => {
              setSuccess(
                event.target
                  .value as BooleanFilter,
              );
              setPage(0);
            }}
            className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
          >
            <option value="all">
              Cualquier resultado
            </option>
            <option value="true">
              Exitosas
            </option>
            <option value="false">
              Fallidas
            </option>
          </select>

          <select
            value={restorable}
            onChange={(event) => {
              setRestorable(
                event.target
                  .value as BooleanFilter,
              );
              setPage(0);
            }}
            className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
          >
            <option value="all">
              Cualquier restaurabilidad
            </option>
            <option value="true">
              Restaurables
            </option>
            <option value="false">
              No restaurables
            </option>
          </select>

          <input
            type="date"
            value={createdFrom}
            onChange={(event) => {
              setCreatedFrom(
                event.target.value,
              );
              setPage(0);
            }}
            className="h-11 rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-zinc-300"
          />

          <input
            type="date"
            value={createdTo}
            onChange={(event) => {
              setCreatedTo(
                event.target.value,
              );
              setPage(0);
            }}
            className="h-11 rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-zinc-300"
          />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-9 items-center rounded-xl border border-white/8 px-4 text-xs text-zinc-500 hover:text-white"
          >
            Limpiar filtros
          </button>
        </div>
      </section>

      <section className="luxia-panel mt-5 overflow-hidden rounded-3xl">
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
          response.items.length === 0 && (
            <div className="p-12 text-center text-sm text-zinc-600">
              No existen entradas que coincidan con los filtros.
            </div>
          )}

        {!isLoading &&
          !errorMessage &&
          response.items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] text-left">
                <thead className="border-b border-white/6 bg-black/20 text-[10px] tracking-[0.14em] text-zinc-700 uppercase">
                  <tr>
                    <th className="px-5 py-4">
                      Entrada
                    </th>
                    <th className="px-5 py-4">
                      Actor
                    </th>
                    <th className="px-5 py-4">
                      Entidad
                    </th>
                    <th className="px-5 py-4">
                      Resultado
                    </th>
                    <th className="px-5 py-4">
                      Correlación
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
                  {response.items.map(
                    (entry) => (
                      <tr
                        key={entry.id}
                        className="hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-4">
                          <p className="max-w-xs truncate text-sm font-medium text-white">
                            {entry.action}
                          </p>
                          <p className="mt-1 font-mono text-[10px] text-zinc-700">
                            #{entry.id}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm text-zinc-400">
                            {entry.actor_email ??
                              entry.actor_user_id ??
                              entry.actor_type}
                          </p>
                          <p className="mt-1 text-[10px] text-zinc-700">
                            {entry.actor_type}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm text-zinc-400">
                            {entry.entity_type}
                          </p>
                          <p className="mt-1 max-w-xs truncate font-mono text-[10px] text-zinc-700">
                            {entry.entity_id ??
                              "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={
                              entry.success
                                ? "inline-flex rounded-full border border-emerald-500/15 bg-emerald-950/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-400"
                                : "inline-flex rounded-full border border-red-500/15 bg-red-950/15 px-2.5 py-1 text-[10px] font-semibold text-red-400"
                            }
                          >
                            {entry.success
                              ? "EXITOSA"
                              : "FALLIDA"}
                          </span>

                          {entry.is_restorable && (
                            <span className="ml-2 inline-flex rounded-full border border-blue-500/15 bg-blue-950/15 px-2.5 py-1 text-[10px] font-semibold text-blue-400">
                              RESTAURABLE
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <p className="max-w-xs truncate font-mono text-xs text-zinc-500">
                            {entry.correlation_id ??
                              "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-xs text-zinc-500">
                          {new Date(
                            entry.created_at,
                          ).toLocaleString(
                            "es-MX",
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedEntry(
                                entry,
                              )
                            }
                            className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/8 px-3 text-xs text-zinc-400 hover:text-white"
                          >
                            <Eye size={14} />
                            Inspeccionar
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
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
                Página {page + 1} de{" "}
                {totalPages} ·{" "}
                {response.total.toLocaleString(
                  "es-MX",
                )}{" "}
                entradas
              </span>

              <button
                type="button"
                disabled={
                  page + 1 >=
                  totalPages
                }
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

      {selectedEntry && (
        <AuditEntryInspector
          entry={selectedEntry}
          onClose={() =>
            setSelectedEntry(null)
          }
        />
      )}
    </div>
  );
}
