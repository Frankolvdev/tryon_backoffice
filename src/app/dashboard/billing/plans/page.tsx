"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  CircleDollarSign,
  CloudUpload,
  Eye,
  EyeOff,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Sparkles,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import { SubscriptionPlanEditor } from "@/components/backoffice/billing/subscription-plan-editor";
import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  BillingInterval,
  SubscriptionPlanListResponse,
  SubscriptionPlanResponse,
  SubscriptionPlanSeedResponse,
  SubscriptionPlanSyncResponse,
} from "@/types/admin-subscription-plans";

const PAGE_SIZE = 100;

type BooleanFilter =
  | "all"
  | "true"
  | "false";

export default function SubscriptionPlansPage() {
  const [response, setResponse] =
    useState<SubscriptionPlanListResponse>({
      items: [],
      total: 0,
      skip: 0,
      limit: PAGE_SIZE,
    });

  const [search, setSearch] =
    useState("");
  const [
    billingInterval,
    setBillingInterval,
  ] = useState<
    BillingInterval | "all"
  >("all");
  const [active, setActive] =
    useState<BooleanFilter>("all");
  const [isPublic, setIsPublic] =
    useState<BooleanFilter>("all");
  const [editingPlan, setEditingPlan] =
    useState<
      SubscriptionPlanResponse | null | undefined
    >(undefined);
  const [actionId, setActionId] =
    useState<string | null>(null);
  const [isLoading, setIsLoading] =
    useState(true);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const queryString = useMemo(() => {
    const params =
      new URLSearchParams();

    params.set("skip", "0");
    params.set(
      "limit",
      String(PAGE_SIZE),
    );

    if (search.trim()) {
      params.set(
        "search",
        search.trim(),
      );
    }

    if (
      billingInterval !== "all"
    ) {
      params.set(
        "billing_interval",
        billingInterval,
      );
    }

    if (active !== "all") {
      params.set(
        "is_active",
        active,
      );
    }

    if (isPublic !== "all") {
      params.set(
        "is_public",
        isPublic,
      );
    }

    return params.toString();
  }, [
    active,
    billingInterval,
    isPublic,
    search,
  ]);

  const loadPlans =
    useCallback(async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const result =
          await browserApiRequest<SubscriptionPlanListResponse>(
            `/api/admin/subscription-plans?${queryString}`,
          );

        setResponse(result);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No fue posible cargar los planes.",
        );
      } finally {
        setIsLoading(false);
      }
    }, [queryString]);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  const seedDefaults = async () => {
    setActionId("seed");

    try {
      const result =
        await browserApiRequest<SubscriptionPlanSeedResponse>(
          "/api/admin/subscription-plans/seed-defaults",
          {
            method: "POST",
          },
        );

      toast.success(
        `Planes listos: ${result.created} creados y ${result.skipped} existentes.`,
      );
      await loadPlans();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible crear los planes predeterminados.",
      );
    } finally {
      setActionId(null);
    }
  };

  const setPlanActive = async (
    plan: SubscriptionPlanResponse,
    nextActive: boolean,
  ) => {
    setActionId(
      `active-${plan.id}`,
    );

    try {
      const result =
        await browserApiRequest<SubscriptionPlanResponse>(
          `/api/admin/subscription-plans/${plan.id}/${
            nextActive
              ? "activate"
              : "deactivate"
          }`,
          {
            method: "POST",
          },
        );

      toast.success(
        nextActive
          ? "Plan activado."
          : "Plan desactivado.",
      );

      setResponse((current) => ({
        ...current,
        items: current.items.map(
          (item) =>
            item.id === result.id
              ? result
              : item,
        ),
      }));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible cambiar el estado del plan.",
      );
    } finally {
      setActionId(null);
    }
  };

  const syncStripe = async (
    plan: SubscriptionPlanResponse,
  ) => {
    setActionId(
      `stripe-${plan.id}`,
    );

    try {
      const result =
        await browserApiRequest<SubscriptionPlanSyncResponse>(
          `/api/admin/subscription-plans/${plan.id}/sync-stripe`,
          {
            method: "POST",
          },
        );

      toast.success(result.message);

      setResponse((current) => ({
        ...current,
        items: current.items.map(
          (item) =>
            item.id === result.plan.id
              ? result.plan
              : item,
        ),
      }));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible sincronizar con Stripe.",
      );
    } finally {
      setActionId(null);
    }
  };

  const deletePlan = async (
    plan: SubscriptionPlanResponse,
  ) => {
    const confirmed =
      window.confirm(
        `¿Eliminar permanentemente el plan "${plan.name}"?`,
      );

    if (!confirmed) return;

    setActionId(
      `delete-${plan.id}`,
    );

    try {
      await browserApiRequest(
        `/api/admin/subscription-plans/${plan.id}`,
        {
          method: "DELETE",
        },
      );

      toast.success(
        "Plan eliminado.",
      );
      await loadPlans();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible eliminar el plan.",
      );
    } finally {
      setActionId(null);
    }
  };

  const formatMoney = (
    plan: SubscriptionPlanResponse,
  ) =>
    new Intl.NumberFormat(
      "es-MX",
      {
        style: "currency",
        currency: plan.currency,
      },
    ).format(
      Number(plan.calculated_price_amount ?? plan.price_amount),
    );

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
                  Planes de suscripción
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                  Crea y administra el catálogo de planes, sus tokens, límites,
                  visibilidad y sincronización con Stripe. El precio se calcula
                  automáticamente desde la economía global.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  void seedDefaults()
                }
                disabled={Boolean(actionId)}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-500/15 bg-red-950/15 px-4 text-sm text-red-300 disabled:opacity-50"
              >
                {actionId === "seed" ? (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Sparkles
                    size={16}
                  />
                )}
                Crear defaults
              </button>

              <button
                type="button"
                onClick={() =>
                  setEditingPlan(null)
                }
                className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white"
              >
                <Plus size={16} />
                Nuevo plan
              </button>

              <button
                type="button"
                onClick={() =>
                  void loadPlans()
                }
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
        </div>
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
              placeholder="Buscar plan..."
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 pr-4 pl-11 text-sm text-white"
            />
          </label>

          <select
            value={billingInterval}
            onChange={(event) =>
              setBillingInterval(
                event.target.value as
                  | BillingInterval
                  | "all",
              )
            }
            className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
          >
            <option value="all">
              Todos los intervalos
            </option>
            <option value="month">
              Mensuales
            </option>
            <option value="year">
              Anuales
            </option>
          </select>

          <select
            value={active}
            onChange={(event) =>
              setActive(
                event.target
                  .value as BooleanFilter,
              )
            }
            className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
          >
            <option value="all">
              Cualquier estado
            </option>
            <option value="true">
              Activos
            </option>
            <option value="false">
              Inactivos
            </option>
          </select>

          <select
            value={isPublic}
            onChange={(event) =>
              setIsPublic(
                event.target
                  .value as BooleanFilter,
              )
            }
            className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
          >
            <option value="all">
              Cualquier visibilidad
            </option>
            <option value="true">
              Públicos
            </option>
            <option value="false">
              Privados
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
          <section className="mt-5 grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {response.items.map(
              (plan) => (
                <article
                  key={plan.id}
                  className="luxia-panel rounded-3xl p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">
                        {plan.name}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-zinc-700">
                        {plan.key}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-end gap-1.5">
                      <span
                        className={
                          plan.is_active
                            ? "rounded-full border border-emerald-500/15 bg-emerald-950/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-400"
                            : "rounded-full border border-white/8 bg-black/20 px-2.5 py-1 text-[10px] font-semibold text-zinc-500"
                        }
                      >
                        {plan.is_active
                          ? "ACTIVO"
                          : "INACTIVO"}
                      </span>

                      <span className="rounded-full border border-blue-500/15 bg-blue-950/15 px-2.5 py-1 text-[10px] font-semibold text-blue-400">
                        {plan.billing_interval ===
                        "month"
                          ? "MENSUAL"
                          : "ANUAL"}
                      </span>
                    </div>
                  </div>

                  <p className="mt-5 text-3xl font-semibold text-white">
                    {formatMoney(plan)}
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    por{" "}
                    {plan.billing_interval ===
                    "month"
                      ? "mes"
                      : "año"}
                  </p>

                  <p className="mt-5 min-h-12 text-sm leading-6 text-zinc-600">
                    {plan.description ??
                      "Sin descripción."}
                  </p>

                  <dl className="mt-5 space-y-3 text-xs">
                    <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
                      <dt className="text-zinc-700">
                        Tokens
                      </dt>
                      <dd className="text-zinc-300">
                        {plan.tokens_per_period.toLocaleString(
                          "es-MX",
                        )}
                      </dd>
                    </div>

                    <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
                      <dt className="text-zinc-700">
                        Generaciones
                      </dt>
                      <dd className="text-zinc-300">
                        {plan.max_generations_per_period ??
                          "Sin límite"}
                      </dd>
                    </div>

                    <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
                      <dt className="text-zinc-700">
                        Público
                      </dt>
                      <dd className="flex items-center gap-1.5 text-zinc-300">
                        {plan.is_public ? (
                          <Eye size={13} />
                        ) : (
                          <EyeOff
                            size={13}
                          />
                        )}
                        {plan.is_public
                          ? "Sí"
                          : "No"}
                      </dd>
                    </div>

                    <div className="flex justify-between gap-4">
                      <dt className="text-zinc-700">
                        Stripe
                      </dt>
                      <dd className="flex items-center gap-1.5 text-zinc-300">
                        {plan.stripe_configured ? (
                          <CheckCircle2
                            size={13}
                            className="text-emerald-400"
                          />
                        ) : null}
                        {plan.stripe_configured
                          ? "Sincronizado"
                          : "Sin configurar"}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingPlan(plan)
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/8 text-sm text-zinc-400 hover:text-white"
                    >
                      <Pencil size={15} />
                      Editar
                    </button>

                    <button
                      type="button"
                      disabled={
                        actionId ===
                        `stripe-${plan.id}`
                      }
                      onClick={() =>
                        void syncStripe(
                          plan,
                        )
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-500/15 bg-blue-950/10 text-sm text-blue-300 disabled:opacity-50"
                    >
                      {actionId ===
                      `stripe-${plan.id}` ? (
                        <LoaderCircle
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <CloudUpload
                          size={15}
                        />
                      )}
                      Stripe
                    </button>

                    <button
                      type="button"
                      disabled={
                        actionId ===
                        `active-${plan.id}`
                      }
                      onClick={() =>
                        void setPlanActive(
                          plan,
                          !plan.is_active,
                        )
                      }
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-amber-500/15 bg-amber-950/10 text-sm text-amber-300 disabled:opacity-50"
                    >
                      {plan.is_active
                        ? "Desactivar"
                        : "Activar"}
                    </button>

                    <button
                      type="button"
                      disabled={
                        actionId ===
                        `delete-${plan.id}`
                      }
                      onClick={() =>
                        void deletePlan(plan)
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-500/15 bg-red-950/10 text-sm text-red-300 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                      Eliminar
                    </button>
                  </div>
                </article>
              ),
            )}
          </section>
        )}

      {!isLoading &&
        !errorMessage &&
        response.items.length === 0 && (
          <section className="luxia-panel mt-5 rounded-3xl p-10 text-center text-sm text-zinc-600">
            No existen planes que coincidan con los filtros.
          </section>
        )}

      {!isLoading &&
        !errorMessage && (
          <p className="mt-5 text-right text-xs text-zinc-700">
            {response.total.toLocaleString(
              "es-MX",
            )}{" "}
            planes registrados
          </p>
        )}

      {editingPlan !==
        undefined && (
        <SubscriptionPlanEditor
          plan={editingPlan}
          onClose={() =>
            setEditingPlan(undefined)
          }
          onSaved={(saved) => {
            setEditingPlan(undefined);

            setResponse(
              (current) => {
                const exists =
                  current.items.some(
                    (item) =>
                      item.id ===
                      saved.id,
                  );

                return {
                  ...current,
                  total: exists
                    ? current.total
                    : current.total + 1,
                  items: exists
                    ? current.items.map(
                        (item) =>
                          item.id ===
                          saved.id
                            ? saved
                            : item,
                      )
                    : [
                        saved,
                        ...current.items,
                      ],
                };
              },
            );
          }}
        />
      )}
    </div>
  );
}
