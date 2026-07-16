"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  Clock3,
  Eye,
  LifeBuoy,
  LoaderCircle,
  RefreshCcw,
  Search,
  ShieldAlert,
  TicketCheck,
  Tickets,
} from "lucide-react";

import { SupportTicketEditor } from "@/components/backoffice/support/support-ticket-editor";
import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  SupportTicket,
} from "@/types/admin-support";

const LIMIT = 200;

function statusClass(
  status: string,
): string {
  if (
    status === "resolved" ||
    status === "closed"
  ) {
    return "border-emerald-500/15 bg-emerald-950/15 text-emerald-400";
  }

  if (status === "in_progress") {
    return "border-blue-500/15 bg-blue-950/15 text-blue-400";
  }

  return "border-amber-500/15 bg-amber-950/15 text-amber-400";
}

function priorityClass(
  priority: string,
): string {
  if (
    priority === "urgent" ||
    priority === "critical"
  ) {
    return "text-red-400";
  }

  if (priority === "high") {
    return "text-amber-400";
  }

  return "text-zinc-500";
}

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("es-MX");
}

export default function SupportDashboardPage() {
  const [tickets, setTickets] =
    useState<SupportTicket[]>([]);
  const [search, setSearch] =
    useState("");
  const [status, setStatus] =
    useState("");
  const [priority, setPriority] =
    useState("");
  const [selected, setSelected] =
    useState<SupportTicket | null>(
      null,
    );
  const [isLoading, setIsLoading] =
    useState(true);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response =
        await browserApiRequest<
          SupportTicket[]
        >(
          `/api/admin/support-tickets?skip=0&limit=${LIMIT}`,
        );

      setTickets(response);

      setSelected((current) => {
        if (!current) {
          return response[0] ?? null;
        }

        return (
          response.find(
            (item) =>
              item.id === current.id,
          ) ??
          response[0] ??
          null
        );
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar los tickets.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleTickets = useMemo(() => {
    const normalized =
      search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      if (
        status &&
        ticket.status !== status
      ) {
        return false;
      }

      if (
        priority &&
        ticket.priority !== priority
      ) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return [
        ticket.id,
        ticket.user_id ?? "",
        ticket.subject,
        ticket.message,
        ticket.status,
        ticket.priority,
        ticket.admin_notes ?? "",
      ].some((value) =>
        String(value)
          .toLowerCase()
          .includes(normalized),
      );
    });
  }, [
    priority,
    search,
    status,
    tickets,
  ]);

  const counters = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter(
        (ticket) =>
          ticket.status === "open",
      ).length,
      inProgress: tickets.filter(
        (ticket) =>
          ticket.status ===
          "in_progress",
      ).length,
      resolved: tickets.filter(
        (ticket) =>
          ticket.status === "resolved" ||
          ticket.status === "closed",
      ).length,
      urgent: tickets.filter(
        (ticket) =>
          ticket.priority === "urgent" ||
          ticket.priority === "critical",
      ).length,
    };
  }, [tickets]);

  return (
    <div>
      <section className="luxia-panel rounded-3xl p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
              <LifeBuoy size={24} />
            </div>

            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
                Administración
              </p>

              <h1 className="mt-2 text-2xl font-semibold text-white">
                Soporte
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                Consulta los tickets enviados por
                usuarios y prioriza los casos que
                necesitan atención.
              </p>
            </div>
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

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          [
            "Total",
            counters.total,
            Tickets,
          ],
          [
            "Abiertos",
            counters.open,
            LifeBuoy,
          ],
          [
            "En proceso",
            counters.inProgress,
            Clock3,
          ],
          [
            "Resueltos",
            counters.resolved,
            TicketCheck,
          ],
          [
            "Urgentes",
            counters.urgent,
            ShieldAlert,
          ],
        ].map(
          ([label, value, Icon]) => {
            const MetricIcon =
              Icon as typeof Tickets;

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
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Buscar ticket..."
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 pr-4 pl-11 text-sm text-white"
            />
          </label>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
          >
            <option value="">
              Cualquier estado
            </option>
            <option value="open">
              open
            </option>
            <option value="in_progress">
              in_progress
            </option>
            <option value="resolved">
              resolved
            </option>
            <option value="closed">
              closed
            </option>
          </select>

          <select
            value={priority}
            onChange={(event) =>
              setPriority(
                event.target.value,
              )
            }
            className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
          >
            <option value="">
              Cualquier prioridad
            </option>
            <option value="low">
              low
            </option>
            <option value="normal">
              normal
            </option>
            <option value="high">
              high
            </option>
            <option value="urgent">
              urgent
            </option>
          </select>
        </div>
      </section>

      {isLoading && (
        <section className="luxia-panel mt-5 flex min-h-80 items-center justify-center rounded-3xl">
          <LoaderCircle className="animate-spin text-red-500" />
        </section>
      )}

      {!isLoading &&
        errorMessage && (
          <section className="luxia-panel mt-5 rounded-3xl p-6">
            <div className="flex items-start gap-3 rounded-2xl border border-red-500/15 bg-red-950/15 p-5">
              <AlertTriangle
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
        !errorMessage && (
          <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_430px]">
            <div className="luxia-panel overflow-hidden rounded-3xl">
              {visibleTickets.length ===
              0 ? (
                <div className="p-12 text-center text-sm text-zinc-600">
                  No existen tickets que
                  coincidan.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[920px] text-left">
                    <thead className="border-b border-white/6 bg-black/20 text-[10px] tracking-[0.14em] text-zinc-700 uppercase">
                      <tr>
                        <th className="px-5 py-4">
                          Ticket
                        </th>
                        <th className="px-5 py-4">
                          Usuario
                        </th>
                        <th className="px-5 py-4">
                          Estado
                        </th>
                        <th className="px-5 py-4">
                          Prioridad
                        </th>
                        <th className="px-5 py-4">
                          Actualizado
                        </th>
                        <th className="px-5 py-4 text-right">
                          Acción
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                      {visibleTickets.map(
                        (ticket) => (
                          <tr
                            key={ticket.id}
                            className={
                              selected?.id ===
                              ticket.id
                                ? "bg-red-950/[0.08]"
                                : "hover:bg-white/[0.02]"
                            }
                          >
                            <td className="px-5 py-4">
                              <p className="max-w-xs truncate text-sm font-semibold text-white">
                                {ticket.subject}
                              </p>
                              <p className="mt-1 text-[10px] text-zinc-700">
                                #{ticket.id}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-sm text-zinc-400">
                              {ticket.user_id
                                ? `#${ticket.user_id}`
                                : "Sin usuario"}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClass(
                                  ticket.status,
                                )}`}
                              >
                                {ticket.status}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`text-xs font-semibold ${priorityClass(
                                  ticket.priority,
                                )}`}
                              >
                                {ticket.priority}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-xs text-zinc-600">
                              {formatDate(
                                ticket.updated_at,
                              )}
                            </td>

                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelected(
                                    ticket,
                                  )
                                }
                                className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/8 px-3 text-xs text-zinc-400 hover:text-white"
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
            </div>

            <aside className="luxia-panel rounded-3xl p-6">
              {!selected ? (
                <div className="flex min-h-72 flex-col items-center justify-center text-center">
                  <LifeBuoy className="text-zinc-800" />
                  <p className="mt-4 text-sm text-zinc-600">
                    Selecciona un ticket para
                    revisar su contenido.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.16em] text-red-500 uppercase">
                        Ticket #{selected.id}
                      </p>

                      <h2 className="mt-2 text-lg font-semibold text-white">
                        {selected.subject}
                      </h2>
                    </div>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClass(
                        selected.status,
                      )}`}
                    >
                      {selected.status}
                    </span>
                  </div>

                  <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-zinc-500">
                    {selected.message}
                  </p>

                  <dl className="mt-5 space-y-3 text-xs">
                    {[
                      [
                        "Usuario",
                        selected.user_id
                          ? `#${selected.user_id}`
                          : "No disponible",
                      ],
                      [
                        "Prioridad",
                        selected.priority,
                      ],
                      [
                        "Asignado",
                        selected.assigned_admin_user_id
                          ? `Admin #${selected.assigned_admin_user_id}`
                          : "Sin asignar",
                      ],
                      [
                        "Creado",
                        formatDate(
                          selected.created_at,
                        ),
                      ],
                      [
                        "Actualizado",
                        formatDate(
                          selected.updated_at,
                        ),
                      ],
                    ].map(
                      ([label, value]) => (
                        <div
                          key={label}
                          className="flex justify-between gap-4 border-b border-white/5 pb-3"
                        >
                          <dt className="text-zinc-700">
                            {label}
                          </dt>
                          <dd className="text-right text-zinc-300">
                            {value}
                          </dd>
                        </div>
                      ),
                    )}
                  </dl>

                  {selected.admin_notes && (
                    <section className="mt-5 rounded-2xl border border-amber-500/10 bg-amber-950/10 p-4">
                      <p className="text-xs font-semibold text-amber-300">
                        Notas internas
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-zinc-500">
                        {selected.admin_notes}
                      </p>
                    </section>
                  )}

                  <SupportTicketEditor
                    ticket={selected}
                    onUpdated={(updated) => {
                      setSelected(updated);
                      setTickets((current) =>
                        current.map((ticket) =>
                          ticket.id === updated.id
                            ? updated
                            : ticket,
                        ),
                      );
                    }}
                  />
                </>
              )}
            </aside>
          </section>
        )}
    </div>
  );
}
