"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderCircle,
  RefreshCcw,
  Search,
  ServerCog,
  ShieldAlert,
  TriangleAlert,
  Webhook,
} from "lucide-react";

import { BillingEventDialog } from "@/components/backoffice/billing/billing-event-dialog";
import { BillingJobCard } from "@/components/backoffice/billing/billing-job-card";
import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  BillingEventListResponse,
  BillingEventResponse,
  BillingJobsCatalogResponse,
  BillingValidationResponse,
} from "@/types/admin-billing-operations";

const PAGE_SIZE = 100;

function statusClass(status: string): string {
  if (status === "processed") {
    return "border-emerald-500/15 bg-emerald-950/15 text-emerald-400";
  }

  if (
    status === "received" ||
    status === "processing"
  ) {
    return "border-blue-500/15 bg-blue-950/15 text-blue-400";
  }

  return "border-red-500/15 bg-red-950/15 text-red-400";
}

export default function BillingOperationsPage() {
  const [validation, setValidation] =
    useState<BillingValidationResponse | null>(
      null,
    );
  const [jobs, setJobs] =
    useState<BillingJobsCatalogResponse>({
      jobs: [],
    });
  const [events, setEvents] =
    useState<BillingEventListResponse>({
      items: [],
      total: 0,
      skip: 0,
      limit: PAGE_SIZE,
    });
  const [page, setPage] = useState(0);
  const [eventType, setEventType] =
    useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] =
    useState<BillingEventResponse | null>(
      null,
    );
  const [isLoading, setIsLoading] =
    useState(true);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    params.set(
      "skip",
      String(page * PAGE_SIZE),
    );
    params.set(
      "limit",
      String(PAGE_SIZE),
    );

    if (eventType.trim()) {
      params.set(
        "event_type",
        eventType.trim(),
      );
    }

    if (status) {
      params.set("status", status);
    }

    return params.toString();
  }, [eventType, page, status]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [
        validationResponse,
        jobsResponse,
        eventsResponse,
      ] = await Promise.all([
        browserApiRequest<BillingValidationResponse>(
          "/api/admin/billing/validation",
        ),
        browserApiRequest<BillingJobsCatalogResponse>(
          "/api/admin/billing/jobs",
        ),
        browserApiRequest<BillingEventListResponse>(
          `/api/admin/billing-events?${queryString}`,
        ),
      ]);

      setValidation(validationResponse);
      setJobs(jobsResponse);
      setEvents(eventsResponse);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar las operaciones de billing.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const visibleEvents = useMemo(() => {
    const normalized =
      search.trim().toLowerCase();

    if (!normalized) {
      return events.items;
    }

    return events.items.filter((event) =>
      [
        event.id,
        event.provider,
        event.provider_event_id,
        event.event_type,
        event.status,
        event.error_message ?? "",
      ].some((value) =>
        String(value)
          .toLowerCase()
          .includes(normalized),
      ),
    );
  }, [events.items, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(events.total / PAGE_SIZE),
  );

  const updateEvent = (
    updated: BillingEventResponse,
  ) => {
    setEvents((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === updated.id
          ? updated
          : item,
      ),
    }));
    setSelectedEvent(updated);
  };

  return (
    <div>
      <section className="luxia-panel overflow-hidden rounded-3xl">
        <div className="border-b border-white/6 p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
                <ServerCog size={24} />
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
                  Comercial
                </p>

                <h1 className="mt-2 text-2xl font-semibold text-white">
                  Operaciones de billing
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                  Validación de configuración, jobs de
                  recuperación y eventos Stripe procesados
                  por el backend.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void loadData()}
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
              className="mt-0.5 shrink-0 text-red-400"
            />
            <p className="text-sm leading-6 text-red-300">
              {errorMessage}
            </p>
          </div>
        </section>
      )}

      {!isLoading &&
        !errorMessage &&
        validation && (
          <>
            <section
              className={
                validation.ready
                  ? "mt-5 rounded-3xl border border-emerald-500/15 bg-emerald-950/10 p-6"
                  : "mt-5 rounded-3xl border border-amber-500/15 bg-amber-950/10 p-6"
              }
            >
              <div className="flex items-start gap-4">
                {validation.ready ? (
                  <CheckCircle2
                    size={24}
                    className="shrink-0 text-emerald-400"
                  />
                ) : (
                  <ShieldAlert
                    size={24}
                    className="shrink-0 text-amber-400"
                  />
                )}

                <div>
                  <h2
                    className={
                      validation.ready
                        ? "font-semibold text-emerald-300"
                        : "font-semibold text-amber-300"
                    }
                  >
                    {validation.ready
                      ? "Billing listo"
                      : "Billing requiere atención"}
                  </h2>

                  <p className="mt-2 text-xs leading-6 text-zinc-500">
                    Stripe{" "}
                    {validation.stripe_enabled
                      ? "está habilitado"
                      : "está deshabilitado"}
                    . Validación ejecutada el{" "}
                    {new Date(
                      validation.checked_at,
                    ).toLocaleString("es-MX")}
                    .
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {validation.checks.map((check) => (
                  <article
                    key={check.key}
                    className="rounded-2xl border border-white/7 bg-black/20 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-xs text-zinc-300">
                        {check.key}
                      </p>

                      <span
                        className={
                          check.valid
                            ? "text-[10px] font-semibold text-emerald-400"
                            : "text-[10px] font-semibold text-red-400"
                        }
                      >
                        {check.valid
                          ? "CORRECTO"
                          : "FALLO"}
                      </span>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-zinc-600">
                      {check.message}
                    </p>

                    {check.required && (
                      <p className="mt-2 text-[10px] font-semibold text-amber-400">
                        REQUERIDO
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-5">
              <div className="mb-4">
                <h2 className="font-semibold text-white">
                  Jobs administrativos
                </h2>
                <p className="mt-1 text-xs text-zinc-600">
                  {jobs.jobs.length} tareas disponibles
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {jobs.jobs.map((job) => (
                  <BillingJobCard
                    key={job.name}
                    job={job}
                  />
                ))}
              </div>
            </section>

            <section className="luxia-panel mt-5 overflow-hidden rounded-3xl">
              <div className="border-b border-white/6 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex items-center gap-3">
                    <Webhook className="text-red-400" />
                    <div>
                      <h2 className="font-semibold text-white">
                        Eventos de billing
                      </h2>
                      <p className="mt-1 text-xs text-zinc-600">
                        {events.total.toLocaleString(
                          "es-MX",
                        )}{" "}
                        eventos registrados
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="relative">
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
                        placeholder="Buscar en la página..."
                        className="h-11 w-full rounded-xl border border-white/8 bg-black/30 pr-4 pl-11 text-sm text-white"
                      />
                    </label>

                    <input
                      value={eventType}
                      onChange={(event) => {
                        setEventType(
                          event.target.value,
                        );
                        setPage(0);
                      }}
                      placeholder="Event type"
                      className="h-11 rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
                    />

                    <select
                      value={status}
                      onChange={(event) => {
                        setStatus(
                          event.target.value,
                        );
                        setPage(0);
                      }}
                      className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
                    >
                      <option value="">
                        Cualquier estado
                      </option>
                      <option value="received">
                        received
                      </option>
                      <option value="processing">
                        processing
                      </option>
                      <option value="processed">
                        processed
                      </option>
                      <option value="failed">
                        failed
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {visibleEvents.length === 0 ? (
                <div className="p-12 text-center text-sm text-zinc-600">
                  No existen eventos que coincidan.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1180px] text-left">
                    <thead className="border-b border-white/6 bg-black/20 text-[10px] tracking-[0.14em] text-zinc-700 uppercase">
                      <tr>
                        <th className="px-5 py-4">
                          Evento
                        </th>
                        <th className="px-5 py-4">
                          Proveedor
                        </th>
                        <th className="px-5 py-4">
                          Estado
                        </th>
                        <th className="px-5 py-4">
                          Intentos
                        </th>
                        <th className="px-5 py-4">
                          Recibido
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
                      {visibleEvents.map((event) => (
                        <tr
                          key={event.id}
                          className="hover:bg-white/[0.02]"
                        >
                          <td className="px-5 py-4">
                            <p className="max-w-xs truncate text-sm font-medium text-white">
                              {event.event_type}
                            </p>
                            <p className="mt-1 max-w-xs truncate font-mono text-[10px] text-zinc-700">
                              {event.provider_event_id}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-zinc-400">
                            {event.provider}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClass(
                                event.status,
                              )}`}
                            >
                              {event.status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-zinc-300">
                            {event.processing_attempts}
                          </td>

                          <td className="px-5 py-4 text-xs text-zinc-500">
                            {new Date(
                              event.received_at,
                            ).toLocaleString("es-MX")}
                          </td>

                          <td className="max-w-xs px-5 py-4">
                            <p className="truncate text-xs text-red-300">
                              {event.error_message ?? "—"}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedEvent(event)
                              }
                              className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/8 px-3 text-xs text-zinc-400 hover:text-white"
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

              <footer className="flex items-center justify-between gap-4 border-t border-white/6 p-5">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() =>
                    setPage((current) =>
                      Math.max(0, current - 1),
                    )
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400 disabled:opacity-30"
                >
                  <ChevronLeft size={15} />
                  Anterior
                </button>

                <span className="text-xs text-zinc-600">
                  Página {page + 1} de{" "}
                  {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page + 1 >= totalPages}
                  onClick={() =>
                    setPage(
                      (current) => current + 1,
                    )
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400 disabled:opacity-30"
                >
                  Siguiente
                  <ChevronRight size={15} />
                </button>
              </footer>
            </section>
          </>
        )}

      {selectedEvent && (
        <BillingEventDialog
          event={selectedEvent}
          onClose={() =>
            setSelectedEvent(null)
          }
          onUpdated={updateEvent}
        />
      )}
    </div>
  );
}
