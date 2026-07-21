"use client";

import { Coins, LoaderCircle, RefreshCcw, Save } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import type { CommercialRepriceResponse } from "@/types/admin-simulated-engine";

import type { CommercialSettingsResponse } from "@/types/admin-pricing-coupons";

interface CommercialEconomyCardProps {
  onUpdated?: () => void;
}

export function CommercialEconomyCard({ onUpdated }: CommercialEconomyCardProps) {
  const [tokenValue, setTokenValue] = useState("0.10");
  const [currency, setCurrency] = useState("USD");
  const [isLoading, setIsLoading] = useState(true);
  const [isRepricing, setIsRepricing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await browserApiRequest<CommercialSettingsResponse>(
          "/api/admin/commercial-settings",
        );
        setTokenValue(String(result.token_value_usd));
        setCurrency(result.currency);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No fue posible cargar la economía global.");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const repriceCatalog = async () => {
    setIsRepricing(true);
    try {
      const result = await browserApiRequest<CommercialRepriceResponse>("/api/admin/commercial-reprice", { method: "POST" });
      toast.success(`${result.plans_updated} planes y ${result.packages_updated} paquetes recalculados.`);
      onUpdated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible recalcular el catálogo.");
    } finally { setIsRepricing(false); }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = Number(tokenValue);
    const normalizedCurrency = currency.trim().toUpperCase();
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("El valor del token debe ser mayor que cero.");
      return;
    }
    if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
      toast.error("La moneda debe usar un código ISO de tres letras.");
      return;
    }
    setIsSaving(true);
    try {
      const result = await browserApiRequest<CommercialSettingsResponse>(
        "/api/admin/commercial-settings",
        { method: "PATCH", body: JSON.stringify({ token_value_usd: parsed, currency: normalizedCurrency }) },
      );
      setTokenValue(String(result.token_value_usd));
      setCurrency(result.currency);
      toast.success("Economía global actualizada.");
      onUpdated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible guardar la economía global.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="luxia-panel mt-5 rounded-3xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
          <Coins size={21} />
        </div>
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">Economía global</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Una sola fuente de verdad</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
            El valor global del token se usa para calcular automáticamente el precio y los tokens requeridos por cada servicio.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 flex h-24 items-center justify-center"><LoaderCircle className="animate-spin text-red-500" /></div>
      ) : (
        <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
          <label>
            <span className="mb-2 block text-sm text-zinc-500">Valor de 1 Token (USD)</span>
            <input type="number" min="0.000001" step="0.000001" value={tokenValue} onChange={(e) => setTokenValue(e.target.value)} className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white" />
          </label>
          <label>
            <span className="mb-2 block text-sm text-zinc-500">Moneda comercial</span>
            <input maxLength={3} value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm uppercase text-white" />
          </label>
          <div className="flex flex-wrap gap-2 md:col-span-3">
            <button type="button" onClick={() => void repriceCatalog()} disabled={isSaving || isRepricing} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/8 px-5 text-sm font-semibold text-zinc-300 disabled:opacity-50">
              {isRepricing ? <LoaderCircle size={16} className="animate-spin" /> : <RefreshCcw size={16} />} Recalcular catálogo
            </button>
            <button type="submit" disabled={isSaving || isRepricing} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white disabled:opacity-50">
              {isSaving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />} Guardar
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
