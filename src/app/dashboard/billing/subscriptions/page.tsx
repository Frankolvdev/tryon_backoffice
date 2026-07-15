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
  CircleDollarSign,
  LoaderCircle,
  Pencil,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  SubscriptionActionDialog,
  type SubscriptionAction,
} from "@/components/backoffice/billing/subscription-action-dialog";
import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  AdminSubscriptionListResponse,
  SubscriptionStatus,
  UserSubscriptionResponse,
} from "@/types/admin-subscriptions";

const PAGE_SIZE = 100;

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "No disponible";
  }

  const parsed = new Date(value);

  if (
    Number.isNaN(parsed.getTime())
  ) {
    return value;
  }

  return parsed.toLocaleString(
    "es-MX",
  );
}

function statusClass(
  status: SubscriptionStatus,
): string {
  if (
    status === "active" ||
    status === "trialing"
  ) {
    return "border-emerald-500/15 bg-emerald-950/15 text-emerald-400";
  }

  if (
    status === "past_due" ||
    status === "unpaid" ||
    status === "incomplete"
  ) {
    return "border-amber-500/15 bg-amber-950/15 text-amber-400";
  }

  return "border-red-500/15 bg-red-950/15 text-red-400";
}

export default function SubscriptionsPage() {
  const [response, setResponse] =
    useState<AdminSubscriptionListResponse>({
      items: [],
      total: 0,
      skip: 0,
      limit: PAGE_SIZE,
    });

  const [page, setPage] =
    useState(0);

  const [userId, setUserId] =
    useState("");

  const [planId, setPlanId] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [selected, setSelected] =
    useState<{
      subscription: UserSubscriptionResponse;
      action: SubscriptionAction;
    } | null>(null);

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

    if (userId.trim()) {
      params.set(
        "user_id",
        userId.trim(),
      );
    }

    if (planId.trim()) {
      params.set(
        "plan_id",
        planId.trim(),
      );
    }

    if (status) {
      params.set(
        "status",
        status,
      );
    }

    return params.toString();
  }, [
    page,
    planId,
    status,
    userId,
  ]);

  const loadSubscriptions =
    useCallback(async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const result =
          await browserApiRequest<AdminSubscriptionListResponse>(
            `/api/admin/subscriptions?${queryString}`,
          );

        setResponse(result);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No fue posible cargar las suscripciones.",
        );
      } finally {
        setIsLoading(false);
      }
    }, [queryString]);

  useEffect(() => {
    void loadSubscriptions();
  }, [loadSubscriptions]);

  const visibleItems = useMemo(() => {
    const normalized =
      search.trim().toLowerCase();

    if (!normalized) {
      return response.items;
    }

    return response.items.filter(
      (subscription) =>
        [
          subscription.user_id,
          subscription.id,
          subscription.plan_key,
          subscription.plan_name,
          subscription.status,
          subscription.provider_subscription_id ??
            "",
        ].some((value) =>
          String(value)
            .toLowerCase()
            .includes(normalized),
        ),
    );
  }, [
    response.items,
    search,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      response.total / PAGE_SIZE,
    ),
  );

  const metrics = useMemo(
    () => ({
      active: response.items.filter(
        (item) =>
          item.status === "active",
      ).length,
      trialing: response.items.filter(
        (item) =>
          item.status === "trialing",
      ).length,
      attention: response.items.filter(
        (item) =>
          item.status === "past_due" ||
          item.status === "unpaid" ||
          item.status === "incomplete",
      ).length,
      canceling: response.items.filter(
        (item) =>
          item.cancel_at_period_end,
      ).length,
    }),
    [response.items],
  );

  const updateSubscription = (
    updated: UserSubscriptionResponse,
  ) => {
    setResponse((current) => ({
      ...current,
      items: current.items.map(
        (item) =>
          item.id === updated.id
            ? updated
            : item,
      ),
    }));

    setSelected(null);
  };

  return (
    <div>
      <section className="luxia-panel overflow-hidden rounded-3xl">
        <div className="border-b border-white/6 p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
                <CircleDollarSign
                  size={24}
                />
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
                  Comercial
                </p>

                <h1 className="mt-2 text-2xl font-semibold text-white">
                  Suscripciones
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                  Consulta suscripciones y ejecuta las
                  operaciones administrativas soportadas:
                  cambiar plan, cancelar, reactivar y
                  sincronizar.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadSubscriptions()
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
          [
            "Activas en página",
            metrics.active,
            ShieldCheck,
          ],
          [
            "En prueba",
            metrics.trialing,
            UserRound,
          ],
          [
            "Requieren atención",
            metrics.attention,
            ShieldAlert,
          ],
          [
            "Cancelación programada",
            metrics.canceling,
            CalendarClock,
          ],
        ].map(([label, value, Icon]) => {
          const MetricIcon =
            Icon as typeof ShieldCheck;

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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
            type="number"
            min={1}
            value={userId}
            onChange={(event) => {
              setUserId(
                event.target.value,
              );
              setPage(0);
            }}
            placeholder="User ID"
            className="h-11 rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
          />

          <input
            type="number"
            min={1}
            value={planId}
            onChange={(event) => {
              setPlanId(
                event.target.value,
              );
              setPage(0);
            }}
            placeholder="Plan ID"
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
            <option value="trialing">
              trialing
            </option>
            <option value="active">
              active
            </option>
            <option value="past_due">
              past_due
            </option>
            <option value="canceled">
              canceled
            </option>
            <option value="unpaid">
              unpaid
            </option>
            <option value="incomplete">
              incomplete
            </option>
            <option value="incomplete_expired">
              incomplete_expired
            </option>
            <option value="paused">
              paused
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
        !errorMessage && (
          <section className="luxia-panel mt-5 overflow-hidden rounded-3xl">
            {visibleItems.length === 0 ? (
              <div className="p-12 text-center text-sm text-zinc-600">
                No existen suscripciones que coincidan.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1280px] text-left">
                  <thead className="border-b border-white/6 bg-black/20 text-[10px] tracking-[0.14em] text-zinc-700 uppercase">
                    <tr>
                      <th className="px-5 py-4">
                        Usuario
                      </th>
                      <th className="px-5 py-4">
                        Plan
                      </th>
                      <th className="px-5 py-4">
                        Estado
                      </th>
                      <th className="px-5 py-4">
                        Periodo
                      </th>
                      <th className="px-5 py-4">
                        Tokens
                      </th>
                      <th className="px-5 py-4">
                        Proveedor
                      </th>
                      <th className="px-5 py-4 text-right">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {visibleItems.map(
                      (subscription) => (
                        <tr
                          key={subscription.id}
                          className="hover:bg-white/[0.02]"
                        >
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-white">
                              Usuario #
                              {
                                subscription.user_id
                              }
                            </p>
                            <p className="mt-1 font-mono text-[10px] text-zinc-700">
                              Subscription #
                              {subscription.id}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm text-zinc-300">
                              {
                                subscription.plan_name
                              }
                            </p>
                            <p className="mt-1 font-mono text-[10px] text-zinc-700">
                              {
                                subscription.plan_key
                              }
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClass(
                                subscription.status,
                              )}`}
                            >
                              {
                                subscription.status
                              }
                            </span>

                            {subscription.cancel_at_period_end && (
                              <p className="mt-2 text-[10px] text-amber-400">
                                Cancelará al final
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-xs text-zinc-500">
                              {formatDate(
                                subscription.current_period_start,
                              )}
                            </p>
                            <p className="mt-1 text-xs text-zinc-600">
                              hasta{" "}
                              {formatDate(
                                subscription.current_period_end,
                              )}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-zinc-300">
                            {subscription.tokens_per_period.toLocaleString(
                              "es-MX",
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm text-zinc-400">
                              {
                                subscription.provider
                              }
                            </p>
                            <p className="mt-1 max-w-xs truncate font-mono text-[10px] text-zinc-700">
                              {subscription.provider_subscription_id ??
                                "Sin ID"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelected({
                                    subscription,
                                    action:
                                      "change-plan",
                                  })
                                }
                                className="flex size-9 items-center justify-center rounded-xl border border-white/8 text-zinc-500 hover:text-white"
                                title="Cambiar plan"
                              >
                                <Pencil
                                  size={14}
                                />
                              </button>

                              {subscription.cancel_at_period_end ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelected({
                                      subscription,
                                      action:
                                        "reactivate",
                                    })
                                  }
                                  className="flex size-9 items-center justify-center rounded-xl border border-emerald-500/15 text-emerald-400"
                                  title="Reactivar"
                                >
                                  <RotateCcw
                                    size={14}
                                  />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelected({
                                      subscription,
                                      action:
                                        "cancel-period-end",
                                    })
                                  }
                                  className="flex size-9 items-center justify-center rounded-xl border border-amber-500/15 text-amber-400"
                                  title="Cancelar al final"
                                >
                                  <CalendarClock
                                    size={14}
                                  />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  setSelected({
                                    subscription,
                                    action:
                                      "cancel-immediately",
                                  })
                                }
                                className="flex size-9 items-center justify-center rounded-xl border border-red-500/15 text-red-400"
                                title="Cancelar ahora"
                              >
                                <XCircle
                                  size={14}
                                />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setSelected({
                                    subscription,
                                    action:
                                      "sync",
                                  })
                                }
                                className="flex size-9 items-center justify-center rounded-xl border border-blue-500/15 text-blue-400"
                                title="Sincronizar"
                              >
                                <RefreshCcw
                                  size={14}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
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
                suscripciones
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
          </section>
        )}

      {selected && (
        <SubscriptionActionDialog
          subscription={
            selected.subscription
          }
          action={selected.action}
          onClose={() =>
            setSelected(null)
          }
          onCompleted={
            updateSubscription
          }
        />
      )}
    </div>
  );
}
