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
  BillingCouponCreate,
  BillingCouponResponse,
  BillingCouponUpdate,
  CouponDiscountType,
  CouponDuration,
} from "@/types/admin-pricing-coupons";

interface BillingCouponEditorProps {
  coupon: BillingCouponResponse | null;
  onClose: () => void;
  onSaved: (
    coupon: BillingCouponResponse,
  ) => void;
}

function toLocalInput(
  value: string | null,
): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset =
    date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16);
}

export function BillingCouponEditor({
  coupon,
  onClose,
  onSaved,
}: BillingCouponEditorProps) {
  const isEditing = coupon !== null;

  const [code, setCode] =
    useState(coupon?.code ?? "");
  const [name, setName] =
    useState(coupon?.name ?? "");
  const [description, setDescription] =
    useState(coupon?.description ?? "");
  const [discountType, setDiscountType] =
    useState<CouponDiscountType>(
      coupon?.discount_type ?? "percentage",
    );
  const [duration, setDuration] =
    useState<CouponDuration>(
      coupon?.duration ?? "once",
    );
  const [durationMonths, setDurationMonths] =
    useState(
      coupon?.duration_in_months === null ||
        coupon?.duration_in_months === undefined
        ? ""
        : String(coupon.duration_in_months),
    );
  const [percentageOff, setPercentageOff] =
    useState(coupon?.percentage_off ?? "10");
  const [amountOff, setAmountOff] =
    useState(coupon?.amount_off ?? "");
  const [currency, setCurrency] =
    useState(coupon?.currency ?? "USD");
  const [maxRedemptions, setMaxRedemptions] =
    useState(
      coupon?.max_redemptions === null ||
        coupon?.max_redemptions === undefined
        ? ""
        : String(coupon.max_redemptions),
    );
  const [minimumAmount, setMinimumAmount] =
    useState(coupon?.minimum_amount ?? "");
  const [validFrom, setValidFrom] =
    useState(toLocalInput(coupon?.valid_from ?? null));
  const [validUntil, setValidUntil] =
    useState(toLocalInput(coupon?.valid_until ?? null));
  const [firstTimeOnly, setFirstTimeOnly] =
    useState(
      coupon?.first_time_transaction_only ?? false,
    );
  const [isActive, setIsActive] =
    useState(coupon?.is_active ?? true);
  const [metadata, setMetadata] =
    useState(
      JSON.stringify(
        coupon?.metadata ?? {},
        null,
        2,
      ),
    );
  const [isSaving, setIsSaving] =
    useState(false);

  useEffect(() => {
    setCode(coupon?.code ?? "");
    setName(coupon?.name ?? "");
    setDescription(coupon?.description ?? "");
    setDiscountType(
      coupon?.discount_type ?? "percentage",
    );
    setDuration(coupon?.duration ?? "once");
    setDurationMonths(
      coupon?.duration_in_months === null ||
        coupon?.duration_in_months === undefined
        ? ""
        : String(coupon.duration_in_months),
    );
    setPercentageOff(
      coupon?.percentage_off ?? "10",
    );
    setAmountOff(coupon?.amount_off ?? "");
    setCurrency(coupon?.currency ?? "USD");
    setMaxRedemptions(
      coupon?.max_redemptions === null ||
        coupon?.max_redemptions === undefined
        ? ""
        : String(coupon.max_redemptions),
    );
    setMinimumAmount(
      coupon?.minimum_amount ?? "",
    );
    setValidFrom(
      toLocalInput(coupon?.valid_from ?? null),
    );
    setValidUntil(
      toLocalInput(coupon?.valid_until ?? null),
    );
    setFirstTimeOnly(
      coupon?.first_time_transaction_only ?? false,
    );
    setIsActive(coupon?.is_active ?? true);
    setMetadata(
      JSON.stringify(coupon?.metadata ?? {}, null, 2),
    );
  }, [coupon]);

  const submit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !isEditing &&
      !/^[A-Za-z0-9_-]{2,100}$/.test(code)
    ) {
      toast.error(
        "El código solo admite letras, números, guiones y guion bajo.",
      );
      return;
    }

    if (name.trim().length < 2) {
      toast.error(
        "El nombre debe tener al menos 2 caracteres.",
      );
      return;
    }

    let parsedMetadata: Record<string, unknown>;

    try {
      const raw = JSON.parse(metadata || "{}") as unknown;

      if (
        typeof raw !== "object" ||
        raw === null ||
        Array.isArray(raw)
      ) {
        throw new Error();
      }

      parsedMetadata =
        raw as Record<string, unknown>;
    } catch {
      toast.error(
        "Metadata debe ser un objeto JSON válido.",
      );
      return;
    }

    const parsedMax = maxRedemptions
      ? Number(maxRedemptions)
      : null;
    const parsedMinimum = minimumAmount
      ? Number(minimumAmount)
      : null;

    if (
      parsedMax !== null &&
      (!Number.isInteger(parsedMax) ||
        parsedMax < 1)
    ) {
      toast.error(
        "El máximo de usos debe ser un entero mayor que cero.",
      );
      return;
    }

    if (
      parsedMinimum !== null &&
      (!Number.isFinite(parsedMinimum) ||
        parsedMinimum < 0)
    ) {
      toast.error(
        "La compra mínima debe ser cero o mayor.",
      );
      return;
    }

    const updateCommon: BillingCouponUpdate = {
      name: name.trim(),
      description: description.trim() || null,
      max_redemptions: parsedMax,
      first_time_transaction_only: firstTimeOnly,
      minimum_amount: parsedMinimum,
      valid_from: validFrom
        ? new Date(validFrom).toISOString()
        : null,
      valid_until: validUntil
        ? new Date(validUntil).toISOString()
        : null,
      is_active: isActive,
      metadata: parsedMetadata,
    };

    let payload:
      | BillingCouponCreate
      | BillingCouponUpdate = updateCommon;

    if (!isEditing) {
      const parsedDuration =
        duration === "repeating"
          ? Number(durationMonths)
          : null;
      const parsedPercentage =
        discountType === "percentage"
          ? Number(percentageOff)
          : null;
      const parsedAmount =
        discountType === "fixed_amount"
          ? Number(amountOff)
          : null;

      if (
        discountType === "percentage" &&
        (!Number.isFinite(parsedPercentage) ||
          parsedPercentage === null ||
          parsedPercentage <= 0 ||
          parsedPercentage > 100)
      ) {
        toast.error(
          "El porcentaje debe estar entre 0 y 100.",
        );
        return;
      }

      if (
        discountType === "fixed_amount" &&
        (!Number.isFinite(parsedAmount) ||
          parsedAmount === null ||
          parsedAmount <= 0)
      ) {
        toast.error(
          "El importe fijo debe ser mayor que cero.",
        );
        return;
      }

      if (
        discountType === "fixed_amount" &&
        currency.trim().length !== 3
      ) {
        toast.error(
          "La moneda debe tener tres letras.",
        );
        return;
      }

      if (
        duration === "repeating" &&
        (!Number.isInteger(parsedDuration) ||
          parsedDuration === null ||
          parsedDuration < 1)
      ) {
        toast.error(
          "Indica cuántos meses se repite.",
        );
        return;
      }

      payload = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description.trim() || null,
        discount_type: discountType,
        duration,
        duration_in_months: parsedDuration,
        percentage_off: parsedPercentage,
        amount_off: parsedAmount,
        currency:
          discountType === "fixed_amount"
            ? currency.trim().toUpperCase()
            : null,
        max_redemptions: parsedMax,
        first_time_transaction_only: firstTimeOnly,
        minimum_amount: parsedMinimum,
        valid_from: validFrom
          ? new Date(validFrom).toISOString()
          : null,
        valid_until: validUntil
          ? new Date(validUntil).toISOString()
          : null,
        is_active: isActive,
        metadata: parsedMetadata,
      };
    }

    setIsSaving(true);

    try {
      const response =
        await browserApiRequest<BillingCouponResponse>(
          isEditing
            ? `/api/admin/billing-coupons/${coupon.id}`
            : "/api/admin/billing-coupons",
          {
            method: isEditing ? "PATCH" : "POST",
            body: JSON.stringify(payload),
          },
        );

      toast.success(
        isEditing
          ? "Cupón actualizado."
          : "Cupón creado.",
      );
      onSaved(response);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible guardar el cupón.",
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
    >
      <form
        onSubmit={submit}
        className="luxia-panel max-h-[94vh] w-full max-w-5xl overflow-auto rounded-3xl"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/6 bg-[#09090a]/95 p-6 backdrop-blur">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Cupones
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {isEditing
                ? "Editar cupón"
                : "Nuevo cupón"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl border border-white/8 text-zinc-500 hover:text-white"
          >
            <X size={17} />
          </button>
        </header>

        <div className="p-6">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Código
              </span>
              <input
                value={code}
                disabled={isEditing}
                onChange={(event) =>
                  setCode(event.target.value.toUpperCase())
                }
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
                  setName(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Tipo de descuento
              </span>
              <select
                value={discountType}
                disabled={isEditing}
                onChange={(event) =>
                  setDiscountType(
                    event.target
                      .value as CouponDiscountType,
                  )
                }
                className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300 disabled:opacity-50"
              >
                <option value="percentage">
                  Porcentaje
                </option>
                <option value="fixed_amount">
                  Importe fijo
                </option>
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Duración
              </span>
              <select
                value={duration}
                disabled={isEditing}
                onChange={(event) =>
                  setDuration(
                    event.target.value as CouponDuration,
                  )
                }
                className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300 disabled:opacity-50"
              >
                <option value="once">Una vez</option>
                <option value="forever">
                  Para siempre
                </option>
                <option value="repeating">
                  Repetitivo
                </option>
              </select>
            </label>

            {duration === "repeating" && (
              <label>
                <span className="mb-2 block text-sm text-zinc-500">
                  Meses
                </span>
                <input
                  type="number"
                  min={1}
                  disabled={isEditing}
                  value={durationMonths}
                  onChange={(event) =>
                    setDurationMonths(
                      event.target.value,
                    )
                  }
                  className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white disabled:opacity-50"
                />
              </label>
            )}

            {discountType === "percentage" ? (
              <label>
                <span className="mb-2 block text-sm text-zinc-500">
                  Porcentaje
                </span>
                <input
                  type="number"
                  min="0.01"
                  max={100}
                  step="0.01"
                  disabled={isEditing}
                  value={percentageOff}
                  onChange={(event) =>
                    setPercentageOff(
                      event.target.value,
                    )
                  }
                  className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white disabled:opacity-50"
                />
              </label>
            ) : (
              <>
                <label>
                  <span className="mb-2 block text-sm text-zinc-500">
                    Importe fijo
                  </span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    disabled={isEditing}
                    value={amountOff}
                    onChange={(event) =>
                      setAmountOff(event.target.value)
                    }
                    className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white disabled:opacity-50"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm text-zinc-500">
                    Moneda
                  </span>
                  <input
                    maxLength={3}
                    disabled={isEditing}
                    value={currency}
                    onChange={(event) =>
                      setCurrency(
                        event.target.value.toUpperCase(),
                      )
                    }
                    className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm text-white disabled:opacity-50"
                  />
                </label>
              </>
            )}

            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Máximo de usos
              </span>
              <input
                type="number"
                min={1}
                value={maxRedemptions}
                onChange={(event) =>
                  setMaxRedemptions(
                    event.target.value,
                  )
                }
                placeholder="Sin límite"
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Compra mínima
              </span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={minimumAmount}
                onChange={(event) =>
                  setMinimumAmount(event.target.value)
                }
                placeholder="Opcional"
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Válido desde
              </span>
              <input
                type="datetime-local"
                value={validFrom}
                onChange={(event) =>
                  setValidFrom(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-zinc-300"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Válido hasta
              </span>
              <input
                type="datetime-local"
                value={validUntil}
                onChange={(event) =>
                  setValidUntil(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-zinc-300"
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
                setDescription(event.target.value)
              }
              className="min-h-24 w-full rounded-xl border border-white/8 bg-black/30 p-4 text-sm text-white"
            />
          </label>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm text-zinc-500">
              Metadata JSON
            </span>
            <textarea
              value={metadata}
              spellCheck={false}
              onChange={(event) =>
                setMetadata(event.target.value)
              }
              className="min-h-36 w-full rounded-xl border border-white/8 bg-[#050506] p-4 font-mono text-xs leading-6 text-zinc-300"
            />
          </label>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/7 bg-black/20 p-4 text-sm text-zinc-400">
              Solo primera compra
              <input
                type="checkbox"
                checked={firstTimeOnly}
                onChange={(event) =>
                  setFirstTimeOnly(event.target.checked)
                }
                className="size-4 accent-red-700"
              />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/7 bg-black/20 p-4 text-sm text-zinc-400">
              Cupón activo
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) =>
                  setIsActive(event.target.checked)
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
            Guardar cupón
          </button>
        </footer>
      </form>
    </div>
  );
}
