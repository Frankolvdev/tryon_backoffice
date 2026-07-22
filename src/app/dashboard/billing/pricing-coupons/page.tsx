"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BadgePercent,
  CheckCircle2,
  CloudUpload,
  Coins,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Tags,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import { BillingCouponEditor } from "@/components/backoffice/billing/billing-coupon-editor";
import { CommercialEconomyCard } from "@/components/backoffice/billing/commercial-economy-card";
import { PricingRuleEditor } from "@/components/backoffice/billing/pricing-rule-editor";
import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  BillingCouponListResponse,
  BillingCouponResponse,
  BillingCouponSyncResponse,
  PricingRuleResponse,
} from "@/types/admin-pricing-coupons";

type BooleanFilter =
  | "all"
  | "true"
  | "false";

export default function PricingCouponsPage() {
  const [rules, setRules] =
    useState<PricingRuleResponse[]>([]);
  const [coupons, setCoupons] =
    useState<BillingCouponListResponse>({
      items: [],
      total: 0,
      skip: 0,
      limit: 100,
    });
  const [search, setSearch] =
    useState("");
  const [active, setActive] =
    useState<BooleanFilter>("all");
  const [editingRule, setEditingRule] =
    useState<
      PricingRuleResponse | null | undefined
    >(undefined);
  const [editingCoupon, setEditingCoupon] =
    useState<
      BillingCouponResponse | null | undefined
    >(undefined);
  const [actionId, setActionId] =
    useState<string | null>(null);
  const [isLoading, setIsLoading] =
    useState(true);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const couponQuery = useMemo(() => {
    const params = new URLSearchParams();

    params.set("skip", "0");
    params.set("limit", "200");

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (active !== "all") {
      params.set("is_active", active);
    }

    return params.toString();
  }, [active, search]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [rulesResponse, couponsResponse] =
        await Promise.all([
          browserApiRequest<PricingRuleResponse[]>(
            "/api/admin/pricing-rules",
          ),
          browserApiRequest<BillingCouponListResponse>(
            `/api/admin/billing-coupons?${couponQuery}`,
          ),
        ]);

      setRules(rulesResponse);
      setCoupons(couponsResponse);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar pricing y cupones.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [couponQuery]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const saveRule = (
    saved: PricingRuleResponse,
  ) => {
    setRules((current) => {
      const exists = current.some(
        (item) => item.id === saved.id,
      );

      return exists
        ? current.map((item) =>
            item.id === saved.id ? saved : item,
          )
        : [saved, ...current];
    });
    setEditingRule(undefined);
  };

  const deleteRule = async (rule: PricingRuleResponse) => {
    const confirmed = window.confirm(
      `¿Eliminar la regla "${rule.title}"? El módulo vinculado quedará sin regla e inactivo.`,
    );
    if (!confirmed) return;

    setActionId(`delete-rule-${rule.id}`);
    try {
      await browserApiRequest<void>(`/api/admin/pricing-rules/${rule.id}`, {
        method: "DELETE",
      });
      setRules((current) => current.filter((item) => item.id !== rule.id));
      toast.success("Regla eliminada. El módulo vinculado quedó inactivo.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible eliminar la regla.",
      );
    } finally {
      setActionId(null);
    }
  };

  const saveCoupon = (
    saved: BillingCouponResponse,
  ) => {
    setCoupons((current) => {
      const exists = current.items.some(
        (item) => item.id === saved.id,
      );

      return {
        ...current,
        total: exists
          ? current.total
          : current.total + 1,
        items: exists
          ? current.items.map((item) =>
              item.id === saved.id ? saved : item,
            )
          : [saved, ...current.items],
      };
    });
    setEditingCoupon(undefined);
  };

  const setCouponActive = async (
    coupon: BillingCouponResponse,
    nextActive: boolean,
  ) => {
    setActionId(`active-${coupon.id}`);

    try {
      const result =
        await browserApiRequest<BillingCouponResponse>(
          `/api/admin/billing-coupons/${coupon.id}/${
            nextActive ? "activate" : "deactivate"
          }`,
          {
            method: "POST",
          },
        );

      saveCoupon(result);
      toast.success(
        nextActive
          ? "Cupón activado."
          : "Cupón desactivado.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible cambiar el estado.",
      );
    } finally {
      setActionId(null);
    }
  };

  const syncCoupon = async (
    coupon: BillingCouponResponse,
  ) => {
    setActionId(`sync-${coupon.id}`);

    try {
      const result =
        await browserApiRequest<BillingCouponSyncResponse>(
          `/api/admin/billing-coupons/${coupon.id}/sync-stripe`,
          {
            method: "POST",
          },
        );

      saveCoupon(result.coupon);
      toast.success(result.message);
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

  const formatDiscount = (
    coupon: BillingCouponResponse,
  ): string => {
    if (coupon.discount_type === "percentage") {
      return `${coupon.percentage_off ?? "0"}%`;
    }

    const amount = Number(coupon.amount_off ?? 0);

    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: coupon.currency ?? "USD",
    }).format(amount);
  };

  return (
    <div>
      <section className="luxia-panel overflow-hidden rounded-3xl">
        <div className="border-b border-white/6 p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
                <BadgePercent size={24} />
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
                  Comercial
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-white">
                  Pricing y cupones
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                  Administra costos dinámicos de Try-On y
                  promociones sincronizables con Stripe.
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
                  isLoading ? "animate-spin" : undefined
                }
              />
              Actualizar
            </button>
          </div>
        </div>
      </section>

      <CommercialEconomyCard onUpdated={() => void loadData()} />

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

      {!isLoading && !errorMessage && (
        <>
          <section className="mt-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-white">
                  Reglas de pricing
                </h2>
                <p className="mt-1 text-xs text-zinc-600">
                  {rules.length} reglas registradas
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingRule(null)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-500/15 bg-red-950/15 px-4 text-sm text-red-300"
              >
                <Plus size={15} />
                Nueva regla
              </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
              {rules.map((rule) => (
                <article
                  key={rule.id}
                  className="luxia-panel rounded-3xl p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">
                        {rule.title}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        {rule.generation_module_id
                          ? `Módulo #${rule.generation_module_id}`
                          : "Sin módulo vinculado"}
                      </p>
                    </div>

                    <span
                      className={
                        rule.is_active
                          ? "rounded-full border border-emerald-500/15 bg-emerald-950/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-400"
                          : "rounded-full border border-white/8 bg-black/20 px-2.5 py-1 text-[10px] font-semibold text-zinc-500"
                      }
                    >
                      {rule.is_active
                        ? "ACTIVA"
                        : "INACTIVA"}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/6 bg-black/20 p-3">
                      <p className="text-[10px] text-zinc-700">
                        Tokens
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {rule.required_tokens}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/6 bg-black/20 p-3">
                      <p className="text-[10px] text-zinc-700">
                        Ganancia deseada
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {rule.desired_profit_percent}%
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/6 bg-black/20 p-3">
                      <p className="text-[10px] text-zinc-700">
                        Precio final
                      </p>
                      <p className="mt-1 text-sm font-semibold text-zinc-300">
                        {rule.final_price_usd.toFixed(2)} {rule.currency}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/6 bg-black/20 p-3">
                      <p className="text-[10px] text-zinc-700">
                        Costo promedio (USD)
                      </p>
                      <p className="mt-1 text-sm font-semibold text-zinc-300">
                        {rule.average_execution_cost_usd.toFixed(2)} USD
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingRule(rule)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/8 text-sm text-zinc-400 hover:text-white"
                    >
                      <Pencil size={15} />
                      Editar
                    </button>
                    <button
                      type="button"
                      disabled={actionId === `delete-rule-${rule.id}`}
                      onClick={() => void deleteRule(rule)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-500/15 text-sm text-red-300 disabled:opacity-50"
                    >
                      {actionId === `delete-rule-${rule.id}` ? (
                        <LoaderCircle size={15} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="luxia-panel mt-5 overflow-hidden rounded-3xl">
            <div className="border-b border-white/6 p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-3">
                  <Tags className="text-red-400" />
                  <div>
                    <h2 className="font-semibold text-white">
                      Cupones
                    </h2>
                    <p className="mt-1 text-xs text-zinc-600">
                      {coupons.total} cupones registrados
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="relative">
                    <Search
                      size={16}
                      className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-zinc-700"
                    />
                    <input
                      type="search"
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Buscar cupón..."
                      className="h-11 w-full rounded-xl border border-white/8 bg-black/30 pr-4 pl-11 text-sm text-white sm:w-64"
                    />
                  </label>

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

                  <button
                    type="button"
                    onClick={() => setEditingCoupon(null)}
                    className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white"
                  >
                    <Plus size={16} />
                    Nuevo cupón
                  </button>
                </div>
              </div>
            </div>

            {coupons.items.length === 0 ? (
              <div className="p-12 text-center text-sm text-zinc-600">
                No existen cupones que coincidan.
              </div>
            ) : (
              <div className="grid gap-5 p-5 lg:grid-cols-2 2xl:grid-cols-3">
                {coupons.items.map((coupon) => (
                  <article
                    key={coupon.id}
                    className="rounded-3xl border border-white/7 bg-black/20 p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-lg font-semibold text-white">
                          {coupon.code}
                        </p>
                        <p className="mt-1 text-xs text-zinc-600">
                          {coupon.name}
                        </p>
                      </div>

                      {coupon.stripe_configured && (
                        <CheckCircle2
                          size={17}
                          className="text-emerald-400"
                        />
                      )}
                    </div>

                    <p className="mt-5 text-3xl font-semibold text-red-300">
                      {formatDiscount(coupon)}
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      {coupon.duration}
                      {coupon.duration_in_months
                        ? ` · ${coupon.duration_in_months} meses`
                        : ""}
                    </p>

                    <dl className="mt-5 space-y-3 text-xs">
                      <div className="flex justify-between gap-4">
                        <dt className="text-zinc-700">
                          Canjes
                        </dt>
                        <dd className="text-zinc-300">
                          {coupon.redemption_count}
                          {coupon.max_redemptions
                            ? ` / ${coupon.max_redemptions}`
                            : ""}
                        </dd>
                      </div>

                      <div className="flex justify-between gap-4">
                        <dt className="text-zinc-700">
                          Estado
                        </dt>
                        <dd className="text-zinc-300">
                          {coupon.is_active
                            ? "Activo"
                            : "Inactivo"}
                        </dd>
                      </div>

                      <div className="flex justify-between gap-4">
                        <dt className="text-zinc-700">
                          Stripe
                        </dt>
                        <dd className="text-zinc-300">
                          {coupon.stripe_configured
                            ? "Configurado"
                            : "Pendiente"}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingCoupon(coupon)
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/8 text-sm text-zinc-400 hover:text-white"
                      >
                        <Pencil size={15} />
                        Editar
                      </button>

                      <button
                        type="button"
                        disabled={
                          actionId === `sync-${coupon.id}`
                        }
                        onClick={() =>
                          void syncCoupon(coupon)
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-500/15 text-sm text-blue-300 disabled:opacity-50"
                      >
                        {actionId ===
                        `sync-${coupon.id}` ? (
                          <LoaderCircle
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          <CloudUpload size={15} />
                        )}
                        Stripe
                      </button>

                      <button
                        type="button"
                        disabled={
                          actionId === `active-${coupon.id}`
                        }
                        onClick={() =>
                          void setCouponActive(
                            coupon,
                            !coupon.is_active,
                          )
                        }
                        className="col-span-2 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-amber-500/15 text-sm text-amber-300 disabled:opacity-50"
                      >
                        <Coins size={15} />
                        {coupon.is_active
                          ? "Desactivar"
                          : "Activar"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {editingRule !== undefined && (
        <PricingRuleEditor
          rule={editingRule}
          onClose={() => setEditingRule(undefined)}
          onSaved={saveRule}
        />
      )}

      {editingCoupon !== undefined && (
        <BillingCouponEditor
          coupon={editingCoupon}
          onClose={() =>
            setEditingCoupon(undefined)
          }
          onSaved={saveCoupon}
        />
      )}
    </div>
  );
}
