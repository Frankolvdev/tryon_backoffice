"use client";

import {
  LoaderCircle,
  Save,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  BillingInterval,
  SubscriptionPlanCreate,
  SubscriptionPlanResponse,
  SubscriptionPlanUpdate,
} from "@/types/admin-subscription-plans";

interface SubscriptionPlanEditorProps {
  plan: SubscriptionPlanResponse | null;
  onClose: () => void;
  onSaved: (
    plan: SubscriptionPlanResponse,
  ) => void;
}

function parseFeatures(
  value: string,
): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(
      (item, index, values) =>
        Boolean(item) &&
        values.indexOf(item) === index,
    );
}

export function SubscriptionPlanEditor({
  plan,
  onClose,
  onSaved,
}: SubscriptionPlanEditorProps) {
  const isEditing = Boolean(plan);

  const [key, setKey] =
    useState(plan?.key ?? "");
  const [name, setName] =
    useState(plan?.name ?? "");
  const [description, setDescription] =
    useState(
      plan?.description ?? "",
    );
  const [
    billingInterval,
    setBillingInterval,
  ] = useState<BillingInterval>(
    plan?.billing_interval ??
      "month",
  );
  const [currency, setCurrency] =
    useState(
      plan?.currency ?? "USD",
    );
  const [priceAmount, setPriceAmount] =
    useState(
      plan?.price_amount ?? "0",
    );
  const [
    tokensPerPeriod,
    setTokensPerPeriod,
  ] = useState(
    String(
      plan?.tokens_per_period ??
        0,
    ),
  );
  const [
    maxGenerations,
    setMaxGenerations,
  ] = useState(
    plan?.max_generations_per_period ===
      null ||
      plan?.max_generations_per_period ===
        undefined
      ? ""
      : String(
          plan.max_generations_per_period,
        ),
  );
  const [priority, setPriority] =
    useState(
      String(plan?.priority ?? 10),
    );
  const [sortOrder, setSortOrder] =
    useState(
      String(plan?.sort_order ?? 0),
    );
  const [features, setFeatures] =
    useState(
      plan?.features.join("\n") ??
        "",
    );
  const [metadata, setMetadata] =
    useState(
      JSON.stringify(
        plan?.metadata ?? {},
        null,
        2,
      ),
    );
  const [isPublic, setIsPublic] =
    useState(
      plan?.is_public ?? true,
    );
  const [isActive, setIsActive] =
    useState(
      plan?.is_active ?? true,
    );
  const [isSaving, setIsSaving] =
    useState(false);

  useEffect(() => {
    setKey(plan?.key ?? "");
    setName(plan?.name ?? "");
    setDescription(
      plan?.description ?? "",
    );
    setBillingInterval(
      plan?.billing_interval ??
        "month",
    );
    setCurrency(
      plan?.currency ?? "USD",
    );
    setPriceAmount(
      plan?.price_amount ?? "0",
    );
    setTokensPerPeriod(
      String(
        plan?.tokens_per_period ??
          0,
      ),
    );
    setMaxGenerations(
      plan?.max_generations_per_period ===
        null ||
        plan?.max_generations_per_period ===
          undefined
        ? ""
        : String(
            plan.max_generations_per_period,
          ),
    );
    setPriority(
      String(
        plan?.priority ?? 10,
      ),
    );
    setSortOrder(
      String(
        plan?.sort_order ?? 0,
      ),
    );
    setFeatures(
      plan?.features.join("\n") ??
        "",
    );
    setMetadata(
      JSON.stringify(
        plan?.metadata ?? {},
        null,
        2,
      ),
    );
    setIsPublic(
      plan?.is_public ?? true,
    );
    setIsActive(
      plan?.is_active ?? true,
    );
  }, [plan]);

  const submit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !isEditing &&
      !/^[a-z0-9][a-z0-9_-]*$/.test(
        key,
      )
    ) {
      toast.error(
        "La clave solo admite minúsculas, números, guiones y guion bajo.",
      );
      return;
    }

    if (
      name.trim().length < 2
    ) {
      toast.error(
        "El nombre debe tener al menos 2 caracteres.",
      );
      return;
    }

    if (
      currency.trim().length !== 3
    ) {
      toast.error(
        "La moneda debe tener tres letras.",
      );
      return;
    }

    const parsedPrice =
      Number(priceAmount);
    const parsedTokens =
      Number(tokensPerPeriod);
    const parsedPriority =
      Number(priority);
    const parsedSortOrder =
      Number(sortOrder);

    if (
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0
    ) {
      toast.error(
        "El precio debe ser cero o mayor.",
      );
      return;
    }

    if (
      !Number.isInteger(
        parsedTokens,
      ) ||
      parsedTokens < 0
    ) {
      toast.error(
        "Los tokens deben ser un entero no negativo.",
      );
      return;
    }

    if (
      !Number.isInteger(
        parsedPriority,
      ) ||
      parsedPriority < 0 ||
      parsedPriority > 1000
    ) {
      toast.error(
        "La prioridad debe estar entre 0 y 1000.",
      );
      return;
    }

    if (
      !Number.isInteger(
        parsedSortOrder,
      ) ||
      parsedSortOrder < 0
    ) {
      toast.error(
        "El orden debe ser un entero no negativo.",
      );
      return;
    }

    let parsedMetadata:
      Record<string, unknown>;

    try {
      const raw = JSON.parse(
        metadata || "{}",
      ) as unknown;

      if (
        typeof raw !== "object" ||
        raw === null ||
        Array.isArray(raw)
      ) {
        throw new Error();
      }

      parsedMetadata =
        raw as Record<
          string,
          unknown
        >;
    } catch {
      toast.error(
        "Metadata debe ser un objeto JSON válido.",
      );
      return;
    }

    let parsedMax:
      number | null = null;

    if (maxGenerations.trim()) {
      parsedMax =
        Number(maxGenerations);

      if (
        !Number.isInteger(
          parsedMax,
        ) ||
        parsedMax < 1
      ) {
        toast.error(
          "El máximo de generaciones debe ser un entero mayor o igual a 1.",
        );
        return;
      }
    }

    const common = {
      name: name.trim(),
      description:
        description.trim() ||
        null,
      billing_interval:
        billingInterval,
      currency:
        currency
          .trim()
          .toUpperCase(),
      price_amount: parsedPrice,
      tokens_per_period:
        parsedTokens,
      max_generations_per_period:
        parsedMax,
      priority: parsedPriority,
      features:
        parseFeatures(features),
      metadata: parsedMetadata,
      is_public: isPublic,
      is_active: isActive,
      sort_order: parsedSortOrder,
    };

    const payload:
      | SubscriptionPlanCreate
      | SubscriptionPlanUpdate =
      isEditing
        ? common
        : {
            key: key.trim(),
            ...common,
          };

    setIsSaving(true);

    try {
      const response =
        await browserApiRequest<SubscriptionPlanResponse>(
          isEditing
            ? `/api/admin/subscription-plans/${plan?.id}`
            : "/api/admin/subscription-plans",
          {
            method: isEditing
              ? "PATCH"
              : "POST",
            body: JSON.stringify(
              payload,
            ),
          },
        );

      toast.success(
        isEditing
          ? "Plan actualizado."
          : "Plan creado.",
      );

      onSaved(response);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible guardar el plan.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscription-plan-editor-title"
    >
      <form
        onSubmit={submit}
        className="luxia-panel max-h-[94vh] w-full max-w-5xl overflow-auto rounded-3xl"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/6 bg-[#09090a]/95 p-6 backdrop-blur">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Comercial
            </p>

            <h2
              id="subscription-plan-editor-title"
              className="mt-2 text-xl font-semibold text-white"
            >
              {isEditing
                ? "Editar plan"
                : "Nuevo plan"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl border border-white/8 text-zinc-500 hover:text-white"
            aria-label="Cerrar editor"
          >
            <X size={17} />
          </button>
        </header>

        <div className="p-6">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Clave
              </span>

              <input
                value={key}
                disabled={isEditing}
                onChange={(event) =>
                  setKey(
                    event.target.value
                      .toLowerCase(),
                  )
                }
                placeholder="pro_monthly"
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm text-white disabled:opacity-50"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Nombre
              </span>

              <input
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Intervalo
              </span>

              <select
                value={
                  billingInterval
                }
                onChange={(event) =>
                  setBillingInterval(
                    event.target
                      .value as BillingInterval,
                  )
                }
                className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
              >
                <option value="month">
                  Mensual
                </option>
                <option value="year">
                  Anual
                </option>
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Moneda
              </span>

              <input
                value={currency}
                maxLength={3}
                onChange={(event) =>
                  setCurrency(
                    event.target.value
                      .toUpperCase(),
                  )
                }
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm uppercase text-white"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Precio
              </span>

              <input
                type="number"
                min={0}
                step="0.01"
                value={priceAmount}
                onChange={(event) =>
                  setPriceAmount(
                    event.target.value,
                  )
                }
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Tokens por periodo
              </span>

              <input
                type="number"
                min={0}
                value={
                  tokensPerPeriod
                }
                onChange={(event) =>
                  setTokensPerPeriod(
                    event.target.value,
                  )
                }
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Máximo de generaciones
              </span>

              <input
                type="number"
                min={1}
                value={maxGenerations}
                onChange={(event) =>
                  setMaxGenerations(
                    event.target.value,
                  )
                }
                placeholder="Vacío = sin límite"
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Prioridad
              </span>

              <input
                type="number"
                min={0}
                max={1000}
                value={priority}
                onChange={(event) =>
                  setPriority(
                    event.target.value,
                  )
                }
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Orden
              </span>

              <input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(
                    event.target.value,
                  )
                }
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
              />
            </label>
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm text-zinc-500">
              Descripción
            </span>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              className="min-h-28 w-full rounded-xl border border-white/8 bg-black/30 p-4 text-sm text-white"
            />
          </label>

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Características
              </span>

              <textarea
                value={features}
                onChange={(event) =>
                  setFeatures(
                    event.target.value,
                  )
                }
                placeholder="Una característica por línea"
                className="min-h-44 w-full rounded-xl border border-white/8 bg-black/30 p-4 text-sm text-white"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Metadata JSON
              </span>

              <textarea
                value={metadata}
                spellCheck={false}
                onChange={(event) =>
                  setMetadata(
                    event.target.value,
                  )
                }
                className="min-h-44 w-full rounded-xl border border-white/8 bg-[#050506] p-4 font-mono text-xs leading-6 text-zinc-300"
              />
            </label>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/7 bg-black/20 p-4 text-sm text-zinc-400">
              Visible públicamente
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(event) =>
                  setIsPublic(
                    event.target.checked,
                  )
                }
                className="size-4 accent-red-700"
              />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/7 bg-black/20 p-4 text-sm text-zinc-400">
              Plan activo
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) =>
                  setIsActive(
                    event.target.checked,
                  )
                }
                className="size-4 accent-red-700"
              />
            </label>
          </div>
        </div>

        <footer className="sticky bottom-0 flex justify-end border-t border-white/6 bg-[#09090a]/95 p-5 backdrop-blur">
          <button
            type="submit"
            disabled={isSaving}
            className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isSaving ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <Save size={16} />
            )}
            Guardar plan
          </button>
        </footer>
      </form>
    </div>
  );
}
