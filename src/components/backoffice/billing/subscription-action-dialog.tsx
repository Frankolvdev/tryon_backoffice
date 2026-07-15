"use client";

import {
  AlertTriangle,
  LoaderCircle,
  RefreshCcw,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import {
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  ProrationBehavior,
  SubscriptionActionResponse,
  SubscriptionChangePlanRequest,
  SubscriptionSyncResponse,
  UserSubscriptionResponse,
} from "@/types/admin-subscriptions";

export type SubscriptionAction =
  | "change-plan"
  | "cancel-period-end"
  | "cancel-immediately"
  | "reactivate"
  | "sync";

interface SubscriptionActionDialogProps {
  subscription: UserSubscriptionResponse;
  action: SubscriptionAction;
  onClose: () => void;
  onCompleted: (
    subscription: UserSubscriptionResponse,
  ) => void;
}

const actionLabels: Record<
  SubscriptionAction,
  {
    title: string;
    description: string;
    button: string;
  }
> = {
  "change-plan": {
    title: "Cambiar plan",
    description:
      "Actualiza el plan en Stripe y en la suscripción local usando la política de prorrateo seleccionada.",
    button: "Cambiar plan",
  },
  "cancel-period-end": {
    title: "Cancelar al final del periodo",
    description:
      "La suscripción seguirá activa hasta que termine el periodo de facturación actual.",
    button: "Programar cancelación",
  },
  "cancel-immediately": {
    title: "Cancelar inmediatamente",
    description:
      "La suscripción será cancelada inmediatamente. Esta operación afecta la suscripción real.",
    button: "Cancelar ahora",
  },
  reactivate: {
    title: "Reactivar suscripción",
    description:
      "Elimina la cancelación programada al final del periodo.",
    button: "Reactivar",
  },
  sync: {
    title: "Sincronizar suscripción",
    description:
      "Consulta Stripe y actualiza el estado local de esta suscripción.",
    button: "Sincronizar",
  },
};

export function SubscriptionActionDialog({
  subscription,
  action,
  onClose,
  onCompleted,
}: SubscriptionActionDialogProps) {
  const [planKey, setPlanKey] =
    useState(subscription.plan_key);

  const [
    prorationBehavior,
    setProrationBehavior,
  ] = useState<ProrationBehavior>(
    "create_prorations",
  );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const labels = actionLabels[action];

  const submit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      action === "change-plan" &&
      planKey.trim().length < 2
    ) {
      toast.error(
        "Ingresa la clave del nuevo plan.",
      );
      return;
    }

    if (
      action === "cancel-immediately"
    ) {
      const confirmed =
        window.confirm(
          `La suscripción del usuario ${subscription.user_id} será cancelada inmediatamente. ¿Deseas continuar?`,
        );

      if (!confirmed) {
        return;
      }
    }

    const endpoint =
      action === "change-plan"
        ? `/api/admin/subscriptions/users/${subscription.user_id}/change-plan`
        : action === "cancel-period-end"
          ? `/api/admin/subscriptions/users/${subscription.user_id}/cancel-at-period-end`
          : action === "cancel-immediately"
            ? `/api/admin/subscriptions/users/${subscription.user_id}/cancel-immediately`
            : action === "reactivate"
              ? `/api/admin/subscriptions/users/${subscription.user_id}/reactivate`
              : `/api/admin/subscriptions/users/${subscription.user_id}/sync`;

    const body:
      | SubscriptionChangePlanRequest
      | undefined =
      action === "change-plan"
        ? {
            new_plan_key:
              planKey.trim(),
            proration_behavior:
              prorationBehavior,
          }
        : undefined;

    setIsSubmitting(true);

    try {
      if (action === "sync") {
        const response =
          await browserApiRequest<SubscriptionSyncResponse>(
            endpoint,
            {
              method: "POST",
            },
          );

        toast.success(response.message);
        onCompleted(
          response.subscription,
        );
      } else {
        const response =
          await browserApiRequest<SubscriptionActionResponse>(
            endpoint,
            {
              method: "POST",
              body: body
                ? JSON.stringify(body)
                : undefined,
            },
          );

        toast.success(response.message);
        onCompleted(
          response.subscription,
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible completar la operación.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscription-action-title"
    >
      <form
        onSubmit={submit}
        className="luxia-panel w-full max-w-2xl rounded-3xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-white/6 p-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Usuario #{subscription.user_id}
            </p>

            <h2
              id="subscription-action-title"
              className="mt-2 text-xl font-semibold text-white"
            >
              {labels.title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-600">
              {labels.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/8 text-zinc-500 hover:text-white"
            aria-label="Cerrar"
          >
            <X size={17} />
          </button>
        </header>

        <div className="p-6">
          <section className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/7 bg-black/20 p-4">
              <p className="text-xs text-zinc-600">
                Plan actual
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {subscription.plan_name}
              </p>
              <p className="mt-1 font-mono text-[10px] text-zinc-700">
                {subscription.plan_key}
              </p>
            </div>

            <div className="rounded-2xl border border-white/7 bg-black/20 p-4">
              <p className="text-xs text-zinc-600">
                Estado
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {subscription.status}
              </p>
            </div>
          </section>

          {action === "change-plan" && (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm text-zinc-500">
                  Clave del nuevo plan
                </span>

                <input
                  value={planKey}
                  onChange={(event) =>
                    setPlanKey(
                      event.target.value,
                    )
                  }
                  placeholder="pro_monthly"
                  className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm text-white"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm text-zinc-500">
                  Prorrateo
                </span>

                <select
                  value={
                    prorationBehavior
                  }
                  onChange={(event) =>
                    setProrationBehavior(
                      event.target
                        .value as ProrationBehavior,
                    )
                  }
                  className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
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
              </label>
            </div>
          )}

          {(action ===
            "cancel-immediately" ||
            action ===
              "cancel-period-end") && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-500/15 bg-amber-950/10 p-4">
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0 text-amber-400"
              />

              <p className="text-xs leading-6 text-amber-300/80">
                Esta operación se ejecuta contra el
                proveedor de facturación y queda registrada
                en la auditoría administrativa.
              </p>
            </div>
          )}
        </div>

        <footer className="flex justify-end border-t border-white/6 p-5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isSubmitting ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : action === "sync" ? (
              <RefreshCcw size={16} />
            ) : action ===
              "reactivate" ? (
              <RotateCcw size={16} />
            ) : (
              <Save size={16} />
            )}

            {labels.button}
          </button>
        </footer>
      </form>
    </div>
  );
}
