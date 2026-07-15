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
  TokenPackageCreate,
  TokenPackageResponse,
  TokenPackageUpdate,
} from "@/types/admin-token-commerce";

interface TokenPackageEditorProps {
  tokenPackage: TokenPackageResponse | null;
  onClose: () => void;
  onSaved: (
    tokenPackage: TokenPackageResponse,
  ) => void;
}

export function TokenPackageEditor({
  tokenPackage,
  onClose,
  onSaved,
}: TokenPackageEditorProps) {
  const isEditing =
    tokenPackage !== null;

  const [name, setName] =
    useState(tokenPackage?.name ?? "");
  const [description, setDescription] =
    useState(
      tokenPackage?.description ?? "",
    );
  const [tokensAmount, setTokensAmount] =
    useState(
      String(
        tokenPackage?.tokens_amount ??
          100,
      ),
    );
  const [priceCents, setPriceCents] =
    useState(
      String(
        tokenPackage?.price_cents ??
          999,
      ),
    );
  const [currency, setCurrency] =
    useState(
      tokenPackage?.currency ??
        "usd",
    );
  const [
    stripePriceId,
    setStripePriceId,
  ] = useState(
    tokenPackage?.stripe_price_id ??
      "",
  );
  const [isActive, setIsActive] =
    useState(
      tokenPackage?.is_active ??
        true,
    );
  const [isSaving, setIsSaving] =
    useState(false);

  useEffect(() => {
    setName(
      tokenPackage?.name ?? "",
    );
    setDescription(
      tokenPackage?.description ?? "",
    );
    setTokensAmount(
      String(
        tokenPackage?.tokens_amount ??
          100,
      ),
    );
    setPriceCents(
      String(
        tokenPackage?.price_cents ??
          999,
      ),
    );
    setCurrency(
      tokenPackage?.currency ??
        "usd",
    );
    setStripePriceId(
      tokenPackage?.stripe_price_id ??
        "",
    );
    setIsActive(
      tokenPackage?.is_active ??
        true,
    );
  }, [tokenPackage]);

  const submit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const parsedTokens =
      Number(tokensAmount);
    const parsedPrice =
      Number(priceCents);

    if (
      name.trim().length < 2
    ) {
      toast.error(
        "El nombre debe tener al menos 2 caracteres.",
      );
      return;
    }

    if (
      !Number.isInteger(
        parsedTokens,
      ) ||
      parsedTokens <= 0
    ) {
      toast.error(
        "La cantidad de tokens debe ser un entero mayor que cero.",
      );
      return;
    }

    if (
      !Number.isInteger(
        parsedPrice,
      ) ||
      parsedPrice <= 0
    ) {
      toast.error(
        "El precio en centavos debe ser un entero mayor que cero.",
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

    const common = {
      name: name.trim(),
      description:
        description.trim() || null,
      tokens_amount: parsedTokens,
      price_cents: parsedPrice,
      currency:
        currency
          .trim()
          .toLowerCase(),
      stripe_price_id:
        stripePriceId.trim() ||
        null,
      is_active: isActive,
    };

    const payload:
      | TokenPackageCreate
      | TokenPackageUpdate =
      common;

    setIsSaving(true);

    try {
      const response =
        await browserApiRequest<TokenPackageResponse>(
          isEditing
            ? `/api/admin/token-packages/${tokenPackage.id}`
            : "/api/admin/token-packages",
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
          ? "Paquete actualizado."
          : "Paquete creado.",
      );
      onSaved(response);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible guardar el paquete.",
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
      aria-labelledby="token-package-editor-title"
    >
      <form
        onSubmit={submit}
        className="luxia-panel w-full max-w-3xl rounded-3xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-white/6 p-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Comercial
            </p>

            <h2
              id="token-package-editor-title"
              className="mt-2 text-xl font-semibold text-white"
            >
              {isEditing
                ? "Editar paquete"
                : "Nuevo paquete de tokens"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl border border-white/8 text-zinc-500 hover:text-white"
            aria-label="Cerrar"
          >
            <X size={17} />
          </button>
        </header>

        <div className="p-6">
          <div className="grid gap-5 md:grid-cols-2">
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
                Tokens
              </span>

              <input
                type="number"
                min={1}
                value={tokensAmount}
                onChange={(event) =>
                  setTokensAmount(
                    event.target.value,
                  )
                }
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Precio en centavos
              </span>

              <input
                type="number"
                min={1}
                value={priceCents}
                onChange={(event) =>
                  setPriceCents(
                    event.target.value,
                  )
                }
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
              />
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
                      .toLowerCase(),
                  )
                }
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm text-white"
              />
            </label>
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm text-zinc-500">
              Stripe Price ID
            </span>

            <input
              value={stripePriceId}
              onChange={(event) =>
                setStripePriceId(
                  event.target.value,
                )
              }
              placeholder="price_..."
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm text-white"
            />
          </label>

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

          <label className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-white/7 bg-black/20 p-4 text-sm text-zinc-400">
            Paquete activo
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

        <footer className="flex justify-end border-t border-white/6 p-5">
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

            Guardar paquete
          </button>
        </footer>
      </form>
    </div>
  );
}
