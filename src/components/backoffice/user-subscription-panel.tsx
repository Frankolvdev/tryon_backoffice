"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  RefreshCcw,
  Repeat2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import { cn } from "@/lib/utils";

import type {
  AdminSubscriptionListResponse,
  SubscriptionActionResponse,
  SubscriptionChangePlanRequest,
  SubscriptionPlanListResponse,
  SubscriptionPlanResponse,
  SubscriptionSyncResponse,
  UserSubscriptionResponse,
} from "@/types/admin-users";

interface UserSubscriptionPanelProps {
  userId: number;
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "No disponible";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha inválida";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatMoney(
  amount: string,
  currency: string,
): string {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return `${amount} ${currency}`;
  }

  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(numericAmount);
  } catch {
    return `${numericAmount.toFixed(2)} ${currency.toUpperCase()}`;
  }
}

function normalizePlansResponse(
  response:
    | SubscriptionPlanListResponse
    | SubscriptionPlanResponse[],
): SubscriptionPlanResponse[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    response &&
    Array.isArray(response.items)
  ) {
    return response.items;
  }

  return [];
}

function normalizeSubscriptionsResponse(
  response:
    | AdminSubscriptionListResponse
    | UserSubscriptionResponse[],
): UserSubscriptionResponse[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    response &&
    Array.isArray(response.items)
  ) {
    return response.items;
  }

  return [];
}

export function UserSubscriptionPanel({
  userId,
}: UserSubscriptionPanelProps) {
  const [subscription, setSubscription] =
    useState<UserSubscriptionResponse | null>(
      null,
    );

  const [plans, setPlans] = useState<
    SubscriptionPlanResponse[]
  >([]);

  const [selectedPlan, setSelectedPlan] =
    useState("");

  const [proration, setProration] =
    useState<
      SubscriptionChangePlanRequest["proration_behavior"]
    >("create_prorations");

  const [isLoading, setIsLoading] =
    useState(true);

  const [action, setAction] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [
        subscriptionsResponse,
        plansResponse,
      ] = await Promise.all([
        browserApiRequest<
          | AdminSubscriptionListResponse
          | UserSubscriptionResponse[]
        >(
          `/api/admin/subscriptions?user_id=${userId}&skip=0&limit=10`,
        ),

        browserApiRequest<
          | SubscriptionPlanListResponse
          | SubscriptionPlanResponse[]
        >(
          "/api/admin/subscription-plans?is_active=true&skip=0&limit=200",
        ),
      ]);

      const subscriptions =
        normalizeSubscriptionsResponse(
          subscriptionsResponse,
        );

      const normalizedPlans =
        normalizePlansResponse(
          plansResponse,
        );

      const currentSubscription =
        subscriptions[0] ?? null;

      const activePlans =
        normalizedPlans.filter(
          (plan) => plan.is_active,
        );

      setSubscription(
        currentSubscription,
      );

      setPlans(activePlans);

      setSelectedPlan(
        currentSubscription?.plan_key ?? "",
      );
    } catch (error) {
      setSubscription(null);
      setPlans([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar la suscripción.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const availablePlans = useMemo(
    () =>
      plans.filter(
        (plan) =>
          plan.key !== subscription?.plan_key,
      ),
    [plans, subscription],
  );

  const runAction = async (
    actionName: string,
    request: () => Promise<
      | SubscriptionActionResponse
      | SubscriptionSyncResponse
    >,
  ) => {
    setAction(actionName);

    try {
      const response = await request();

      setSubscription(
        response.subscription,
      );

      setSelectedPlan(
        response.subscription.plan_key,
      );

      toast.success(response.message);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible completar la acción.",
      );
    } finally {
      setAction(null);
    }
  };

  const changePlan = async () => {
    if (!subscription) {
      toast.error(
        "El usuario no tiene una suscripción que pueda cambiarse.",
      );

      return;
    }

    if (
      !selectedPlan ||
      selectedPlan === subscription.plan_key
    ) {
      toast.error(
        "Selecciona un plan diferente.",
      );

      return;
    }

    const payload: SubscriptionChangePlanRequest =
      {
        new_plan_key: selectedPlan,
        proration_behavior: proration,
      };

    await runAction(
      "change-plan",
      () =>
        browserApiRequest<SubscriptionActionResponse>(
          `/api/admin/subscriptions/users/${userId}/change-plan`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        ),
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-72 items-center justify-center">
        <div className="text-center">
          <LoaderCircle className="mx-auto animate-spin text-red-500" />

          <p className="mt-4 text-sm text-zinc-500">
            Cargando suscripción...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="p-6">
        <AlertTriangle className="text-red-500" />

        <h2 className="mt-4 text-lg font-semibold text-white">
          No se pudo cargar la suscripción
        </h2>

        <p className="mt-3 text-sm text-red-300">
          {errorMessage}
        </p>

        <button
          type="button"
          onClick={() => void loadData()}
          className="mt-5 flex h-10 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
        >
          <RefreshCcw size={16} />
          Intentar nuevamente
        </button>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="p-8 text-center">
        <CreditCard
          size={36}
          className="mx-auto text-zinc-700"
        />

        <h2 className="mt-5 text-xl font-semibold text-white">
          El usuario no tiene suscripción
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zinc-600">
          No existe una suscripción registrada para
          esta cuenta. El cambio de plan aparece
          únicamente cuando el usuario ya tiene una
          suscripción creada.
        </p>

        <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-white/7 bg-black/20 p-5 text-left">
          <p className="text-sm font-medium text-zinc-300">
            Planes activos disponibles
          </p>

          {plans.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              No existen planes activos. Se crearán
              y administrarán desde el módulo global
              de Suscripciones.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/6 bg-black/20 p-3"
                >
                  <div>
                    <p className="text-sm text-zinc-300">
                      {plan.name}
                    </p>

                    <p className="mt-1 font-mono text-[10px] text-zinc-700">
                      {plan.key}
                    </p>
                  </div>

                  <p className="text-sm text-zinc-400">
                    {formatMoney(
                      plan.price_amount,
                      plan.currency,
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const isCanceled =
    subscription.status === "canceled";

  const isCancelable =
    !isCanceled &&
    subscription.status !==
      "incomplete_expired";

  return (
    <div className="space-y-6 p-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
          <p className="text-xs text-zinc-600">
            Plan actual
          </p>

          <p className="mt-2 text-xl font-semibold text-white">
            {subscription.plan_name}
          </p>

          <p className="mt-1 font-mono text-xs text-zinc-700">
            {subscription.plan_key}
          </p>
        </article>

        <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
          <p className="text-xs text-zinc-600">
            Estado
          </p>

          <p
            className={cn(
              "mt-2 text-xl font-semibold",
              subscription.status === "active"
                ? "text-emerald-400"
                : subscription.status ===
                    "canceled"
                  ? "text-red-400"
                  : "text-amber-400",
            )}
          >
            {subscription.status}
          </p>
        </article>

        <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
          <p className="text-xs text-zinc-600">
            Precio
          </p>

          <p className="mt-2 text-xl font-semibold text-white">
            {formatMoney(
              subscription.price_amount,
              subscription.currency,
            )}
          </p>

          <p className="mt-1 text-xs text-zinc-700">
            por {subscription.billing_interval}
          </p>
        </article>

        <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
          <p className="text-xs text-zinc-600">
            Tokens por periodo
          </p>

          <p className="mt-2 text-xl font-semibold text-white">
            {subscription.tokens_per_period.toLocaleString(
              "es-MX",
            )}
          </p>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
          <h3 className="font-semibold text-white">
            Periodo y proveedor
          </h3>

          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between gap-4 border-b border-white/5 pb-4">
              <dt className="text-zinc-600">
                Inicio del periodo
              </dt>

              <dd className="text-right text-zinc-300">
                {formatDate(
                  subscription.current_period_start,
                )}
              </dd>
            </div>

            <div className="flex justify-between gap-4 border-b border-white/5 pb-4">
              <dt className="text-zinc-600">
                Fin del periodo
              </dt>

              <dd className="text-right text-zinc-300">
                {formatDate(
                  subscription.current_period_end,
                )}
              </dd>
            </div>

            <div className="flex justify-between gap-4 border-b border-white/5 pb-4">
              <dt className="text-zinc-600">
                Proveedor
              </dt>

              <dd className="text-zinc-300">
                {subscription.provider}
              </dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-zinc-600">
                ID del proveedor
              </dt>

              <dd className="max-w-[60%] break-all text-right font-mono text-xs text-zinc-400">
                {subscription.provider_subscription_id ??
                  "No disponible"}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
          <h3 className="font-semibold text-white">
            Cambiar plan
          </h3>

          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Selecciona un plan distinto y define el
            comportamiento del prorrateo en Stripe.
          </p>

          <div className="mt-5 space-y-4">
            <select
              value={selectedPlan}
              onChange={(event) =>
                setSelectedPlan(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-white outline-none"
            >
              <option
                value={subscription.plan_key}
              >
                {subscription.plan_name} — actual
              </option>

              {availablePlans.map((plan) => (
                <option
                  key={plan.id}
                  value={plan.key}
                >
                  {plan.name} —{" "}
                  {formatMoney(
                    plan.price_amount,
                    plan.currency,
                  )}
                </option>
              ))}
            </select>

            <select
              value={proration}
              onChange={(event) =>
                setProration(
                  event.target
                    .value as SubscriptionChangePlanRequest["proration_behavior"],
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-white outline-none"
            >
              <option value="create_prorations">
                Crear prorrateos
              </option>

              <option value="always_invoice">
                Facturar inmediatamente
              </option>

              <option value="none">
                Sin prorrateo
              </option>
            </select>

            <button
              type="button"
              disabled={
                Boolean(action) ||
                !selectedPlan ||
                selectedPlan ===
                  subscription.plan_key
              }
              onClick={() =>
                void changePlan()
              }
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-700 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {action === "change-plan" ? (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Repeat2 size={16} />
              )}

              Cambiar plan
            </button>
          </div>
        </article>
      </section>

      {subscription.cancel_at_period_end && (
        <div className="rounded-2xl border border-amber-500/15 bg-amber-950/15 p-5 text-sm text-amber-300">
          La suscripción está programada para
          cancelarse al finalizar el periodo.
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          disabled={Boolean(action)}
          onClick={() =>
            void runAction(
              "sync",
              () =>
                browserApiRequest<SubscriptionSyncResponse>(
                  `/api/admin/subscriptions/users/${userId}/sync`,
                  {
                    method: "POST",
                  },
                ),
            )
          }
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] text-sm text-zinc-300 disabled:opacity-50"
        >
          {action === "sync" ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          ) : (
            <RefreshCcw size={16} />
          )}

          Sincronizar Stripe
        </button>

        <button
          type="button"
          disabled={
            Boolean(action) || !isCancelable
          }
          onClick={() =>
            void runAction(
              "cancel-period",
              () =>
                browserApiRequest<SubscriptionActionResponse>(
                  `/api/admin/subscriptions/users/${userId}/cancel-at-period-end`,
                  {
                    method: "POST",
                  },
                ),
            )
          }
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-500/15 bg-amber-950/15 text-sm text-amber-300 disabled:opacity-40"
        >
          <Ban size={16} />
          Cancelar al finalizar
        </button>

        <button
          type="button"
          disabled={
            Boolean(action) || !isCancelable
          }
          onClick={() => {
            const confirmed =
              window.confirm(
                "¿Cancelar la suscripción inmediatamente?",
              );

            if (!confirmed) {
              return;
            }

            void runAction(
              "cancel-now",
              () =>
                browserApiRequest<SubscriptionActionResponse>(
                  `/api/admin/subscriptions/users/${userId}/cancel-immediately`,
                  {
                    method: "POST",
                  },
                ),
            );
          }}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-red-500/15 bg-red-950/20 text-sm text-red-300 disabled:opacity-40"
        >
          <Ban size={16} />
          Cancelar ahora
        </button>

        <button
          type="button"
          disabled={
            Boolean(action) || !isCanceled
          }
          onClick={() =>
            void runAction(
              "reactivate",
              () =>
                browserApiRequest<SubscriptionActionResponse>(
                  `/api/admin/subscriptions/users/${userId}/reactivate`,
                  {
                    method: "POST",
                  },
                ),
            )
          }
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-500/15 bg-emerald-950/15 text-sm text-emerald-300 disabled:opacity-40"
        >
          {action === "reactivate" ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          ) : (
            <RotateCcw size={16} />
          )}

          Reactivar
        </button>
      </section>

      <div className="flex items-center gap-3 rounded-2xl border border-white/6 bg-black/20 p-4 text-xs text-zinc-600">
        <CheckCircle2
          size={16}
          className="text-emerald-400"
        />

        Suscripción #{subscription.id} ·
        actualizada{" "}
        {formatDate(subscription.updated_at)}
      </div>
    </div>
  );
}