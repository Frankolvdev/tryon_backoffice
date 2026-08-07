"use client";

import { CircleHelp, Coins, LoaderCircle, RefreshCcw, Save } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import type { CommercialRepriceResponse } from "@/types/admin-simulated-engine";
import type { CommercialSettingsResponse } from "@/types/admin-pricing-coupons";

interface CommercialEconomyCardProps {
  onUpdated?: () => void;
}

function HelpTip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex align-middle">
      <span
        tabIndex={0}
        role="note"
        aria-label={text}
        className="ml-1 inline-flex cursor-help items-center text-zinc-600 outline-none transition hover:text-zinc-300 focus:text-zinc-300"
      >
        <CircleHelp size={14} />
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-64 -translate-x-1/2 rounded-xl border border-white/10 bg-zinc-950 p-3 text-left text-xs font-normal leading-5 text-zinc-300 shadow-2xl group-hover:block group-focus-within:block">
        {text}
      </span>
    </span>
  );
}

export function CommercialEconomyCard({ onUpdated }: CommercialEconomyCardProps) {
  const [tokenValue, setTokenValue] = useState("0.10");
  const [operationalReserve, setOperationalReserve] = useState("0");
  const [commercialSaleValue, setCommercialSaleValue] = useState("0.10");
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
        setOperationalReserve(String(result.operational_reserve_per_token_usd ?? 0));
        setCommercialSaleValue(String(result.commercial_sale_value_per_token_usd ?? result.token_value_usd));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No fue posible cargar la configuración de tokens.");
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
    } finally {
      setIsRepricing(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = Number(tokenValue);
    const parsedOperational = Number(operationalReserve);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("El valor base del token debe ser mayor que cero.");
      return;
    }
    if (!Number.isFinite(parsedOperational) || parsedOperational < 0) {
      toast.error("El extra para gastos del negocio no puede ser negativo.");
      return;
    }
    setIsSaving(true);
    try {
      const result = await browserApiRequest<CommercialSettingsResponse>(
        "/api/admin/commercial-settings",
        {
          method: "PATCH",
          body: JSON.stringify({
            token_value_usd: parsed,
            operational_reserve_per_token_usd: parsedOperational,
          }),
        },
      );
      setTokenValue(String(result.token_value_usd));
      setOperationalReserve(String(result.operational_reserve_per_token_usd ?? 0));
      setCommercialSaleValue(String(result.commercial_sale_value_per_token_usd ?? result.token_value_usd));
      toast.success("Precio de los tokens actualizado. Recalcula el catálogo para aplicarlo a ventas futuras.");
      onUpdated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible guardar la configuración de tokens.");
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
          <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">Configuración de tokens</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Cómo se forma el precio de cada token</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
            Define el valor base del token y, si quieres, agrega una cantidad extra para pagar hosting, correo, dominios y otros gastos del negocio.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 flex h-24 items-center justify-center"><LoaderCircle className="animate-spin text-red-500" /></div>
      ) : (
        <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2 md:items-end">
          <label>
            <span className="mb-2 flex items-center text-sm text-zinc-500">
              Valor base del token
              <HelpTip text="Incluye el dinero reservado para la IA y tu ganancia. Este es el valor que participa en el cálculo de cuántos tokens cuesta una generación." />
            </span>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-xs font-semibold text-zinc-600">USD</span>
              <input type="number" min="0.000001" step="0.000001" value={tokenValue} onChange={(e) => setTokenValue(e.target.value)} className="h-11 w-full rounded-xl border border-white/8 bg-black/30 pr-4 pl-14 text-sm text-white" />
            </div>
            <small className="mt-1 block text-zinc-700">IA + ganancia. No incluye gastos del negocio.</small>
          </label>

          <label>
            <span className="mb-2 flex items-center text-sm text-zinc-500">
              Extra por gastos del negocio
              <HelpTip text="Cantidad adicional que cobras por cada token para formar la Caja Operativa. Puede usarse para hosting, correo, dominios, software y otros gastos. No cambia el costo en tokens de una generación." />
            </span>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-xs font-semibold text-zinc-600">USD</span>
              <input type="number" min="0" step="0.000001" value={operationalReserve} onChange={(e) => setOperationalReserve(e.target.value)} className="h-11 w-full rounded-xl border border-white/8 bg-black/30 pr-4 pl-14 text-sm text-white" />
            </div>
            <small className="mt-1 block text-zinc-700">Se guarda por separado en cada bolsa nueva y no cambia las bolsas anteriores.</small>
          </label>

          <div className="md:col-span-2 rounded-xl border border-sky-500/15 bg-sky-950/10 p-4 text-sm text-sky-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>Precio por token antes de descuentos</span>
              <b className="text-base">USD {Number(commercialSaleValue || 0).toFixed(6)}</b>
            </div>
            <p className="mt-2 text-xs leading-5 text-sky-200/60">Los descuentos siguen saliendo únicamente de tu ganancia; no reducen el dinero de IA ni el extra para gastos del negocio.</p>
          </div>

          <div className="flex flex-wrap gap-2 md:col-span-2">
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
