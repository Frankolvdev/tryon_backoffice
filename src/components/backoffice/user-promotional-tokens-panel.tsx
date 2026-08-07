"use client";

import { Gift, LoaderCircle, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  PromotionalCreditSummary,
  PromotionalGrantResult,
  TokenBagList,
} from "@/types/finance-cashbox";

interface Props {
  userId: number;
  onChanged?: () => void | Promise<void>;
}

const money = (value: number) =>
  `USD ${Number(value || 0).toFixed(6).replace(/0+$/, "").replace(/\.$/, "")}`;

const providerLabel = (provider: string) => {
  const key = provider.toLowerCase();
  if (key === "general") return "General";
  if (key === "modal") return "Modal";
  if (key === "runpod") return "RunPod";
  if (key === "beam") return "Beam";
  return provider;
};

export function UserPromotionalTokensPanel({ userId, onChanged }: Props) {
  const [summary, setSummary] = useState<PromotionalCreditSummary | null>(null);
  const [bags, setBags] = useState<TokenBagList | null>(null);
  const [provider, setProvider] = useState("general");
  const [tokens, setTokens] = useState("1");
  const [loading, setLoading] = useState(true);
  const [granting, setGranting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [promo, userBags] = await Promise.all([
        browserApiRequest<PromotionalCreditSummary>("/api/admin/finances/promotional-credits"),
        browserApiRequest<TokenBagList>(`/api/admin/finances/token-bags?user_id=${userId}&limit=200`),
      ]);
      setSummary(promo);
      setBags(userBags);
      const firstWithBalance = promo.provider_balances.find((item) => item.available_tokens > 0);
      if (firstWithBalance) setProvider(firstWithBalance.provider);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible cargar los tokens gratis.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  const promotionalBags = useMemo(
    () => (bags?.items ?? []).filter((bag) => bag.source === "promotional_credit"),
    [bags],
  );
  const availableForUser = promotionalBags.reduce((sum, bag) => sum + bag.remaining_tokens, 0);
  const grantedLifetime = promotionalBags.reduce((sum, bag) => sum + bag.original_tokens, 0);
  const selectedBalance = summary?.provider_balances.find((item) => item.provider === provider);

  async function grant() {
    const amount = Number(tokens);
    if (!Number.isInteger(amount) || amount <= 0) {
      toast.error("Escribe una cantidad válida de tokens.");
      return;
    }
    if (!summary) return;
    setGranting(true);
    try {
      const result = await browserApiRequest<PromotionalGrantResult>(
        "/api/admin/finances/promotional-credits/grants",
        {
          method: "POST",
          body: JSON.stringify({ user_id: userId, tokens: amount, provider }),
        },
      );
      toast.success(`${result.granted_tokens} token(s) gratis agregados al usuario.`);
      setTokens("1");
      await load();
      await onChanged?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible dar los tokens gratis.");
    } finally {
      setGranting(false);
    }
  }

  return (
    <section className="luxia-panel rounded-3xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-fuchsia-500/20 bg-fuchsia-950/20 text-fuchsia-300"><Gift size={19}/></div>
          <div>
            <h2 className="font-semibold text-white">Tokens gratis</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-600">
              Estos tokens salen de la caja promocional. El cliente no paga por ellos y no generan ganancia ni gastos del negocio.
            </p>
          </div>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/8 px-3 text-xs text-zinc-400 disabled:opacity-50">
          <RefreshCcw size={14} className={loading ? "animate-spin" : undefined}/>Actualizar
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-36 items-center justify-center"><LoaderCircle className="animate-spin text-fuchsia-300"/></div>
      ) : (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Metric label="Gratis que aún tiene" value={`${availableForUser} tokens`} />
            <Metric label="Gratis recibidos en total" value={`${grantedLifetime} tokens`} />
            <Metric label="Dinero promocional disponible" value={money(summary?.total_available_usd ?? 0)} />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="block">
              <span className="mb-2 block text-xs text-zinc-500">¿De qué fondo salen?</span>
              <select value={provider} onChange={(e) => setProvider(e.target.value)} className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-3 text-sm text-white">
                {(summary?.provider_balances ?? []).map((item) => (
                  <option key={item.provider} value={item.provider}>
                    {providerLabel(item.provider)} · {item.available_tokens} tokens disponibles
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs text-zinc-500">¿Cuántos quieres regalar?</span>
              <input value={tokens} onChange={(e) => setTokens(e.target.value)} inputMode="numeric" className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-3 text-sm text-white" />
            </label>
            <button type="button" onClick={() => void grant()} disabled={granting || !selectedBalance || selectedBalance.available_tokens <= 0} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-fuchsia-500/20 bg-fuchsia-950/20 px-5 text-sm font-semibold text-fuchsia-200 disabled:opacity-40">
              {granting ? <LoaderCircle size={16} className="animate-spin"/> : <Gift size={16}/>}Dar tokens gratis
            </button>
          </div>

          {promotionalBags.length > 0 && (
            <div className="mt-5 rounded-2xl border border-white/6 bg-black/20 p-4">
              <p className="text-xs font-semibold text-zinc-400">Bolsas gratis de este usuario</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {promotionalBags.slice(0, 20).map((bag) => (
                  <span key={bag.id} className="rounded-full border border-fuchsia-500/15 bg-fuchsia-950/10 px-3 py-1 text-xs text-fuchsia-200">
                    Bolsa #{bag.id} · {bag.remaining_tokens}/{bag.original_tokens} disponibles
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function Metric({label,value}:{label:string;value:string}) {
  return <div className="rounded-2xl border border-white/6 bg-black/20 p-4"><p className="text-[10px] uppercase tracking-[.12em] text-zinc-600">{label}</p><p className="mt-2 text-lg font-semibold text-white">{value}</p></div>;
}
