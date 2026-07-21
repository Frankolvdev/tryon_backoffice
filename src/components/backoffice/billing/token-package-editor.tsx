"use client";

import {
  Coins,
  LoaderCircle,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";

import type { CommercialSettingsResponse } from "@/types/admin-pricing-coupons";
import type {
  TokenPackageCreate,
  TokenPackageResponse,
  TokenPackageUpdate,
} from "@/types/admin-token-commerce";

interface TokenPackageEditorProps {
  tokenPackage: TokenPackageResponse | null;
  onClose: () => void;
  onSaved: (tokenPackage: TokenPackageResponse) => void;
}

export function TokenPackageEditor({
  tokenPackage,
  onClose,
  onSaved,
}: TokenPackageEditorProps) {
  const isEditing = tokenPackage !== null;

  const [name, setName] = useState(tokenPackage?.name ?? "");
  const [description, setDescription] = useState(
    tokenPackage?.description ?? "",
  );
  const [tokensAmount, setTokensAmount] = useState(
    String(tokenPackage?.tokens_amount ?? 100),
  );
  const [stripePriceId, setStripePriceId] = useState(
    tokenPackage?.stripe_price_id ?? "",
  );
  const [isActive, setIsActive] = useState(
    tokenPackage?.is_active ?? true,
  );
  const [commercialSettings, setCommercialSettings] =
    useState<CommercialSettingsResponse | null>(null);
  const [isLoadingEconomy, setIsLoadingEconomy] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(tokenPackage?.name ?? "");
    setDescription(tokenPackage?.description ?? "");
    setTokensAmount(String(tokenPackage?.tokens_amount ?? 100));
    setStripePriceId(tokenPackage?.stripe_price_id ?? "");
    setIsActive(tokenPackage?.is_active ?? true);
  }, [tokenPackage]);

  useEffect(() => {
    const loadCommercialSettings = async () => {
      try {
        const result = await browserApiRequest<CommercialSettingsResponse>(
          "/api/admin/commercial-settings",
        );
        setCommercialSettings(result);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No fue posible cargar la economía global.",
        );
      } finally {
        setIsLoadingEconomy(false);
      }
    };

    void loadCommercialSettings();
  }, []);

  const calculatedPrice = useMemo(() => {
    const tokens = Number(tokensAmount);
    const tokenValue = commercialSettings?.token_value_usd;

    if (
      !Number.isFinite(tokens) ||
      tokens <= 0 ||
      !tokenValue ||
      tokenValue <= 0
    ) {
      return null;
    }

    return tokens * tokenValue;
  }, [commercialSettings, tokensAmount]);

  const formattedPrice = useMemo(() => {
    if (calculatedPrice === null || !commercialSettings) {
      return "—";
    }

    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: commercialSettings.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(calculatedPrice);
  }, [calculatedPrice, commercialSettings]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedTokens = Number(tokensAmount);

    if (name.trim().length < 2) {
      toast.error("El nombre debe tener al menos 2 caracteres.");
      return;
    }

    if (!Number.isInteger(parsedTokens) || parsedTokens <= 0) {
      toast.error(
        "La cantidad de tokens debe ser un entero mayor que cero.",
      );
      return;
    }

    const common = {
      name: name.trim(),
      description: description.trim() || null,
      tokens_amount: parsedTokens,
      stripe_price_id: stripePriceId.trim() || null,
      is_active: isActive,
    };

    const payload: TokenPackageCreate | TokenPackageUpdate = common;

    setIsSaving(true);

    try {
      const response = await browserApiRequest<TokenPackageResponse>(
        isEditing
          ? `/api/admin/token-packages/${tokenPackage.id}`
          : "/api/admin/token-packages",
        {
          method: isEditing ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        },
      );

      toast.success(
        isEditing ? "Paquete actualizado." : "Paquete creado.",
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
        className="luxia-panel max-h-[94vh] w-full max-w-3xl overflow-auto rounded-3xl"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/6 bg-[#09090a]/95 p-6 backdrop-blur">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Comercial
            </p>
            <h2
              id="token-package-editor-title"
              className="mt-2 text-xl font-semibold text-white"
            >
              {isEditing ? "Editar paquete" : "Nuevo paquete de tokens"}
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
              <span className="mb-2 block text-sm text-zinc-500">Nombre</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-500">Tokens</span>
              <input
                type="number"
                min={1}
                value={tokensAmount}
                onChange={(event) => setTokensAmount(event.target.value)}
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
              />
            </label>
          </div>

          <section className="mt-5 rounded-2xl border border-red-500/15 bg-red-950/10 p-5">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-950/30 text-red-400">
                <Sparkles size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold tracking-[0.16em] text-red-400 uppercase">
                  Precio automático
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {isLoadingEconomy ? (
                    <LoaderCircle size={20} className="animate-spin" />
                  ) : (
                    formattedPrice
                  )}
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  El backend calcula el precio usando el valor global del token.
                  No se guarda un precio manual.
                </p>
                {commercialSettings ? (
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500">
                    <span className="rounded-lg border border-white/7 bg-black/20 px-3 py-2">
                      1 token = {commercialSettings.token_value_usd}{" "}
                      {commercialSettings.currency}
                    </span>
                    <span className="rounded-lg border border-white/7 bg-black/20 px-3 py-2">
                      {tokensAmount || 0} tokens
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm text-zinc-500">
              Stripe Price ID
            </span>
            <input
              value={stripePriceId}
              onChange={(event) => setStripePriceId(event.target.value)}
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
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-28 w-full rounded-xl border border-white/8 bg-black/30 p-4 text-sm text-white"
            />
          </label>

          <label className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-white/7 bg-black/20 p-4 text-sm text-zinc-400">
            <span className="flex items-center gap-2">
              <Coins size={16} className="text-red-400" />
              Paquete activo
            </span>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="size-4 accent-red-700"
            />
          </label>
        </div>

        <footer className="flex justify-end border-t border-white/6 p-5">
          <button
            type="submit"
            disabled={isSaving || isLoadingEconomy}
            className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isSaving ? (
              <LoaderCircle size={16} className="animate-spin" />
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
