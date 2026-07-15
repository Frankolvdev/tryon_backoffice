"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Eye,
  LoaderCircle,
  PackageOpen,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  TriangleAlert,
} from "lucide-react";

import { TokenPackageEditor } from "@/components/backoffice/billing/token-package-editor";
import { TokenPurchaseDialog } from "@/components/backoffice/billing/token-purchase-dialog";
import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  TokenPackageResponse,
  TokenPurchaseListResponse,
  TokenPurchaseResponse,
} from "@/types/admin-token-commerce";

const PAGE_SIZE = 100;

export default function TokenCommercePage() {
  const [packages, setPackages] =
    useState<TokenPackageResponse[]>([]);
  const [purchases, setPurchases] =
    useState<TokenPurchaseListResponse>({
      items: [],
      total: 0,
      skip: 0,
      limit: PAGE_SIZE,
    });
  const [userId, setUserId] =
    useState("");
  const [status, setStatus] =
    useState("");
  const [search, setSearch] =
    useState("");
  const [editingPackage, setEditingPackage] =
    useState<
      TokenPackageResponse | null | undefined
    >(undefined);
  const [selectedPurchase, setSelectedPurchase] =
    useState<TokenPurchaseResponse | null>(
      null,
    );
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

    if (userId.trim()) {
      params.set(
        "user_id",
        userId.trim(),
      );
    }

    if (status) {
      params.set(
        "status",
        status,
      );
    }

    return params.toString();
  }, [status, userId]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [
        packageResponse,
        purchaseResponse,
      ] = await Promise.all([
        browserApiRequest<TokenPackageResponse[]>(
          "/api/admin/token-packages",
        ),
        browserApiRequest<TokenPurchaseListResponse>(
          `/api/admin/token-purchases?${queryString}`,
        ),
      ]);

      setPackages(packageResponse);
      setPurchases(purchaseResponse);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar el módulo de tokens.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const visiblePurchases = useMemo(() => {
    const normalized =
      search.trim().toLowerCase();

    if (!normalized) {
      return purchases.items;
    }

    return purchases.items.filter(
      (purchase) =>
        [
          purchase.id,
          purchase.user_id,
          purchase.token_package_id,
          purchase.status,
          purchase.provider_checkout_session_id ??
            "",
          purchase.provider_payment_intent_id ??
            "",
        ].some((value) =>
          String(value)
            .toLowerCase()
            .includes(normalized),
        ),
    );
  }, [
    purchases.items,
    search,
  ]);

  const savePackage = (
    saved: TokenPackageResponse,
  ) => {
    setPackages((current) => {
      const exists = current.some(
        (item) =>
          item.id === saved.id,
      );

      return exists
        ? current.map((item) =>
            item.id === saved.id
              ? saved
              : item,
          )
        : [saved, ...current];
    });

    setEditingPackage(undefined);
  };

  const updatePurchase = (
    updated: TokenPurchaseResponse,
  ) => {
    setPurchases((current) => ({
      ...current,
      items: current.items.map(
        (item) =>
          item.id === updated.id
            ? updated
            : item,
      ),
    }));

    setSelectedPurchase(updated);
  };

  const formatPackagePrice = (
    tokenPackage: TokenPackageResponse,
  ) =>
    new Intl.NumberFormat(
      "es-MX",
      {
        style: "currency",
        currency:
          tokenPackage.currency.toUpperCase(),
      },
    ).format(
      tokenPackage.price_cents /
        100,
    );

  return (
    <div>
      <section className="luxia-panel overflow-hidden rounded-3xl">
        <div className="border-b border-white/6 p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
                <PackageOpen size={24} />
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
                  Comercial
                </p>

                <h1 className="mt-2 text-2xl font-semibold text-white">
                  Tokens y compras
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                  Administra paquetes de tokens y revisa,
                  concilia o reembolsa compras registradas.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  setEditingPackage(null)
                }
                className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white"
              >
                <Plus size={16} />
                Nuevo paquete
              </button>

              <button
                type="button"
                onClick={() =>
                  void loadData()
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
        !errorMessage && (
          <>
            <section className="mt-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-white">
                    Paquetes
                  </h2>
                  <p className="mt-1 text-xs text-zinc-600">
                    {packages.length} paquetes registrados
                  </p>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
                {packages.map(
                  (tokenPackage) => (
                    <article
                      key={tokenPackage.id}
                      className="luxia-panel rounded-3xl p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">
                            {tokenPackage.name}
                          </p>
                          <p className="mt-1 text-xs text-zinc-600">
                            #{tokenPackage.id}
                          </p>
                        </div>

                        <span
                          className={
                            tokenPackage.is_active
                              ? "rounded-full border border-emerald-500/15 bg-emerald-950/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-400"
                              : "rounded-full border border-white/8 bg-black/20 px-2.5 py-1 text-[10px] font-semibold text-zinc-500"
                          }
                        >
                          {tokenPackage.is_active
                            ? "ACTIVO"
                            : "INACTIVO"}
                        </span>
                      </div>

                      <p className="mt-5 text-3xl font-semibold text-white">
                        {tokenPackage.tokens_amount.toLocaleString(
                          "es-MX",
                        )}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        tokens
                      </p>

                      <p className="mt-4 text-xl font-semibold text-red-300">
                        {formatPackagePrice(
                          tokenPackage,
                        )}
                      </p>

                      <p className="mt-4 min-h-10 text-sm leading-6 text-zinc-600">
                        {tokenPackage.description ??
                          "Sin descripción."}
                      </p>

                      <p className="mt-4 truncate font-mono text-[10px] text-zinc-700">
                        {tokenPackage.stripe_price_id ??
                          "Sin Stripe Price ID"}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setEditingPackage(
                            tokenPackage,
                          )
                        }
                        className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/8 text-sm text-zinc-400 hover:text-white"
                      >
                        <Pencil size={15} />
                        Editar
                      </button>
                    </article>
                  ),
                )}
              </div>
            </section>

            <section className="luxia-panel mt-5 overflow-hidden rounded-3xl">
              <div className="border-b border-white/6 p-5">
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
                      placeholder="Buscar en la página..."
                      className="h-11 w-full rounded-xl border border-white/8 bg-black/30 pr-4 pl-11 text-sm text-white"
                    />
                  </label>

                  <input
                    type="number"
                    min={1}
                    value={userId}
                    onChange={(event) =>
                      setUserId(
                        event.target.value,
                      )
                    }
                    placeholder="User ID"
                    className="h-11 rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
                  />

                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(
                        event.target.value,
                      )
                    }
                    className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
                  >
                    <option value="">
                      Cualquier estado
                    </option>
                    <option value="pending">
                      pending
                    </option>
                    <option value="processing">
                      processing
                    </option>
                    <option value="completed">
                      completed
                    </option>
                    <option value="failed">
                      failed
                    </option>
                    <option value="canceled">
                      canceled
                    </option>
                    <option value="refunded">
                      refunded
                    </option>
                  </select>
                </div>
              </div>

              {visiblePurchases.length ===
              0 ? (
                <div className="p-12 text-center text-sm text-zinc-600">
                  No existen compras que coincidan.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1120px] text-left">
                    <thead className="border-b border-white/6 bg-black/20 text-[10px] tracking-[0.14em] text-zinc-700 uppercase">
                      <tr>
                        <th className="px-5 py-4">
                          Compra
                        </th>
                        <th className="px-5 py-4">
                          Usuario
                        </th>
                        <th className="px-5 py-4">
                          Estado
                        </th>
                        <th className="px-5 py-4">
                          Tokens
                        </th>
                        <th className="px-5 py-4">
                          Importe
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
                      {visiblePurchases.map(
                        (purchase) => (
                          <tr
                            key={purchase.id}
                            className="hover:bg-white/[0.02]"
                          >
                            <td className="px-5 py-4">
                              <p className="text-sm font-medium text-white">
                                #{purchase.id}
                              </p>
                              <p className="mt-1 font-mono text-[10px] text-zinc-700">
                                Package #
                                {
                                  purchase.token_package_id
                                }
                              </p>
                            </td>

                            <td className="px-5 py-4 text-sm text-zinc-400">
                              #{purchase.user_id}
                            </td>

                            <td className="px-5 py-4">
                              <span className="rounded-full border border-white/8 bg-black/20 px-2.5 py-1 text-[10px] font-semibold text-zinc-400">
                                {purchase.status}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-sm text-zinc-300">
                              {purchase.total_tokens.toLocaleString(
                                "es-MX",
                              )}
                            </td>

                            <td className="px-5 py-4 text-sm text-zinc-300">
                              {purchase.amount}{" "}
                              {purchase.currency.toUpperCase()}
                            </td>

                            <td className="px-5 py-4 text-xs text-zinc-500">
                              {new Date(
                                purchase.created_at,
                              ).toLocaleString(
                                "es-MX",
                              )}
                            </td>

                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedPurchase(
                                    purchase,
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

              <footer className="border-t border-white/6 p-5 text-right text-xs text-zinc-600">
                {purchases.total.toLocaleString(
                  "es-MX",
                )}{" "}
                compras registradas
              </footer>
            </section>
          </>
        )}

      {editingPackage !==
        undefined && (
        <TokenPackageEditor
          tokenPackage={
            editingPackage
          }
          onClose={() =>
            setEditingPackage(
              undefined,
            )
          }
          onSaved={savePackage}
        />
      )}

      {selectedPurchase && (
        <TokenPurchaseDialog
          purchase={
            selectedPurchase
          }
          onClose={() =>
            setSelectedPurchase(null)
          }
          onUpdated={updatePurchase}
        />
      )}
    </div>
  );
}
