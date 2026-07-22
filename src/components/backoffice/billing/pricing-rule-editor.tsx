"use client";

import { Calculator, LoaderCircle, Save, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import type { CommercialPricePreviewResponse, PricingRuleCreate, PricingRuleResponse, PricingRuleUpdate } from "@/types/admin-pricing-coupons";

interface PricingRuleEditorProps {
  rule: PricingRuleResponse | null;
  onClose: () => void;
  onSaved: (rule: PricingRuleResponse) => void;
}

export function PricingRuleEditor({ rule, onClose, onSaved }: PricingRuleEditorProps) {
  const isEditing = rule !== null;
  const [title, setTitle] = useState(rule?.title ?? "");
  const [averageCost, setAverageCost] = useState(String(rule?.average_execution_cost_usd ?? 0.1));
  const [profit, setProfit] = useState(String(rule?.desired_profit_percent ?? 70));
  const [isActive, setIsActive] = useState(rule?.is_active ?? true);
  const [preview, setPreview] = useState<CommercialPricePreviewResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(rule?.title ?? "");
    setAverageCost(String(rule?.average_execution_cost_usd ?? 0.1));
    setProfit(String(rule?.desired_profit_percent ?? 70));
    setIsActive(rule?.is_active ?? true);
  }, [rule]);

  useEffect(() => {
    const cost = Number(averageCost);
    const desired = Number(profit);
    if (!Number.isFinite(cost) || cost < 0 || !Number.isFinite(desired) || desired < 0) {
      setPreview(null);
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        const result = await browserApiRequest<CommercialPricePreviewResponse>(
          "/api/admin/commercial-price-preview",
          { method: "POST", body: JSON.stringify({ average_execution_cost_usd: cost, desired_profit_percent: desired }) },
        );
        setPreview(result);
      } catch {
        setPreview(null);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [averageCost, profit]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedTitle = title.trim();
    const cost = Number(averageCost);
    const desired = Number(profit);
    if (normalizedTitle.length < 2) {
      toast.error("Escribe un título de al menos 2 caracteres.");
      return;
    }
    if (!Number.isFinite(cost) || cost < 0 || !Number.isFinite(desired) || desired < 0) {
      toast.error("Costo y ganancia deben ser valores válidos no negativos.");
      return;
    }
    const payload: PricingRuleCreate | PricingRuleUpdate = {
      title: normalizedTitle,
      average_execution_cost_usd: cost,
      desired_profit_percent: desired,
      is_active: isActive,
    };
    setIsSaving(true);
    try {
      const response = await browserApiRequest<PricingRuleResponse>(
        isEditing ? `/api/admin/pricing-rules/${rule.id}` : "/api/admin/pricing-rules",
        { method: isEditing ? "PATCH" : "POST", body: JSON.stringify(payload) },
      );
      toast.success(isEditing ? "Regla actualizada." : "Regla creada.");
      onSaved(response);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible guardar la regla.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="luxia-panel w-full max-w-3xl rounded-3xl">
        <header className="flex items-start justify-between gap-4 border-b border-white/6 p-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">Regla comercial</p>
            <h2 className="mt-2 text-xl font-semibold text-white">{isEditing ? "Editar regla" : "Nueva regla"}</h2>
          </div>
          <button type="button" onClick={onClose} className="flex size-10 items-center justify-center rounded-xl border border-white/8 text-zinc-500 hover:text-white"><X size={17} /></button>
        </header>
        <div className="grid gap-5 p-6 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm text-zinc-500">Título</span>
            <input value={title} maxLength={255} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Try-On estándar" className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white" />
          </label>
          <label>
            <span className="mb-2 block text-sm text-zinc-500">Costo promedio de ejecución (USD)</span>
            <input type="number" min="0" step="0.01" value={averageCost} onChange={(event) => setAverageCost(event.target.value)} className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white" />
          </label>
          <label>
            <span className="mb-2 block text-sm text-zinc-500">Ganancia deseada (%)</span>
            <input type="number" min="0" step="1" value={profit} onChange={(event) => setProfit(event.target.value)} className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white" />
          </label>
          <label className="flex items-end md:col-span-2">
            <span className="flex h-11 w-full items-center justify-between rounded-xl border border-white/8 bg-black/20 px-4 text-sm text-zinc-400">Regla activa<input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="size-4 accent-red-600" /></span>
          </label>
          <div className="md:col-span-2 rounded-2xl border border-red-500/15 bg-red-950/10 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-white"><Calculator size={17} className="text-red-400" /> Cálculo automático</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div><p className="text-xs text-zinc-600">Precio final</p><p className="mt-1 text-lg font-semibold text-white">{preview ? `${preview.final_price_usd.toFixed(2)} ${preview.currency}` : "—"}</p></div>
              <div><p className="text-xs text-zinc-600">Tokens requeridos</p><p className="mt-1 text-lg font-semibold text-white">{preview?.required_tokens ?? "—"}</p></div>
              <div><p className="text-xs text-zinc-600">Margen efectivo</p><p className="mt-1 text-lg font-semibold text-white">{preview ? `${preview.effective_margin_percent.toFixed(2)}%` : "—"}</p></div>
            </div>
          </div>
        </div>
        <footer className="flex justify-end gap-3 border-t border-white/6 p-6">
          <button type="button" onClick={onClose} className="h-11 rounded-xl border border-white/8 px-5 text-sm text-zinc-400">Cancelar</button>
          <button type="submit" disabled={isSaving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white disabled:opacity-50">{isSaving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />} Guardar</button>
        </footer>
      </form>
    </div>
  );
}
