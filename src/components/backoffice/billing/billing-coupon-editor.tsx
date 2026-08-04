"use client";

import { LoaderCircle, Save, X } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { BillingCouponCreate, BillingCouponResponse, BillingCouponUpdate, CouponDuration, FinancialProtectionReport } from "@/types/admin-pricing-coupons";

interface Props { coupon: BillingCouponResponse | null; onClose: () => void; onSaved: (coupon: BillingCouponResponse) => void; }

function toLocalInput(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export function BillingCouponEditor({ coupon, onClose, onSaved }: Props) {
  const isEditing = coupon !== null;
  const [code, setCode] = useState(coupon?.code ?? "");
  const [name, setName] = useState(coupon?.name ?? "");
  const [description, setDescription] = useState(coupon?.description ?? "");
  const [duration, setDuration] = useState<CouponDuration>(coupon?.duration ?? "once");
  const [durationMonths, setDurationMonths] = useState(coupon?.duration_in_months == null ? "" : String(coupon.duration_in_months));
  const [percentageOff, setPercentageOff] = useState(coupon?.percentage_off ?? "10");
  const [maxRedemptions, setMaxRedemptions] = useState(coupon?.max_redemptions == null ? "" : String(coupon.max_redemptions));
  const [minimumAmount, setMinimumAmount] = useState(coupon?.minimum_amount ?? "");
  const [validFrom, setValidFrom] = useState(toLocalInput(coupon?.valid_from ?? null));
  const [validUntil, setValidUntil] = useState(toLocalInput(coupon?.valid_until ?? null));
  const [firstTimeOnly, setFirstTimeOnly] = useState(coupon?.first_time_transaction_only ?? false);
  const [isActive, setIsActive] = useState(coupon?.is_active ?? true);
  const [appliesTo, setAppliesTo] = useState<"token_packages" | "free_token_purchase">(coupon?.applies_to ?? "token_packages");
  const [eligibleIds, setEligibleIds] = useState((coupon?.eligible_item_ids ?? []).join(", "));
  const [metadata, setMetadata] = useState(JSON.stringify(coupon?.metadata ?? {}, null, 2));
  const [report, setReport] = useState<FinancialProtectionReport | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void browserApiRequest<FinancialProtectionReport>("/api/admin/financial-protection").then(setReport).catch((error) => toast.error(error instanceof Error ? error.message : "No fue posible cargar la ganancia segura."));
  }, []);

  const percentage = Number(percentageOff || 0);
  const safeProfit = report?.safe_profit_usd ?? 0;
  const discountedProfit = Number.isFinite(percentage) ? safeProfit * percentage / 100 : 0;
  const remainingProfit = Math.max(0, safeProfit - discountedProfit);
  const loss = Math.max(0, percentage - 100) * safeProfit / 100;
  const isUnsafe = !Number.isFinite(percentage) || percentage <= 0 || percentage > 100;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isEditing && !/^[A-Za-z0-9_-]{2,100}$/.test(code)) return void toast.error("Código inválido.");
    if (name.trim().length < 2) return void toast.error("El nombre debe tener al menos 2 caracteres.");
    if (isUnsafe) return void toast.error(`No puedes superar 100% de la ganancia protegida. Pérdida potencial: $${loss.toFixed(6)} USD.`);

    let parsedMetadata: Record<string, unknown>;
    try { const raw = JSON.parse(metadata || "{}"); if (!raw || Array.isArray(raw) || typeof raw !== "object") throw new Error(); parsedMetadata = raw; }
    catch { return void toast.error("Metadata debe ser un objeto JSON válido."); }

    const parsedMax = maxRedemptions ? Number(maxRedemptions) : null;
    const parsedMinimum = minimumAmount ? Number(minimumAmount) : null;
    const parsedDuration = duration === "repeating" ? Number(durationMonths) : null;
    if (parsedMax !== null && (!Number.isInteger(parsedMax) || parsedMax < 1)) return void toast.error("El máximo de usos debe ser mayor que cero.");
    if (parsedMinimum !== null && (!Number.isFinite(parsedMinimum) || parsedMinimum < 0)) return void toast.error("La compra mínima debe ser cero o mayor.");
    if (duration === "repeating" && (!Number.isInteger(parsedDuration) || (parsedDuration ?? 0) < 1)) return void toast.error("Indica los meses de repetición.");

    const common: BillingCouponUpdate = {
      name: name.trim(), description: description.trim() || null, max_redemptions: parsedMax,
      first_time_transaction_only: firstTimeOnly, minimum_amount: parsedMinimum,
      valid_from: validFrom ? new Date(validFrom).toISOString() : null,
      valid_until: validUntil ? new Date(validUntil).toISOString() : null,
      is_active: isActive, applies_to: appliesTo,
      eligible_item_ids: eligibleIds.split(",").map((v) => Number(v.trim())).filter((v) => Number.isInteger(v) && v > 0),
      metadata: parsedMetadata,
    };
    const payload: BillingCouponCreate | BillingCouponUpdate = isEditing
      ? common
      : {
          ...common,
          code: code.trim().toUpperCase(),
          discount_type: "percentage" as const,
          duration,
          duration_in_months: parsedDuration,
          percentage_off: percentage,
        };

    setIsSaving(true);
    try {
      const response = await browserApiRequest<BillingCouponResponse>(isEditing ? `/api/admin/billing-coupons/${coupon.id}` : "/api/admin/billing-coupons", { method: isEditing ? "PATCH" : "POST", body: JSON.stringify(payload) });
      toast.success(isEditing ? "Cupón actualizado." : "Cupón creado."); onSaved(response);
    } catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible guardar el cupón."); }
    finally { setIsSaving(false); }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
    <form onSubmit={submit} className="luxia-panel max-h-[94vh] w-full max-w-5xl overflow-auto rounded-3xl">
      <header className="sticky top-0 z-10 flex items-start justify-between border-b border-white/6 bg-[#09090a]/95 p-6"><div><p className="text-[10px] font-semibold tracking-[.2em] text-red-500 uppercase">Cupones</p><h2 className="mt-2 text-xl font-semibold text-white">{isEditing ? "Editar cupón" : "Nuevo cupón porcentual"}</h2></div><button type="button" onClick={onClose} className="flex size-10 items-center justify-center rounded-xl border border-white/8 text-zinc-500"><X size={17}/></button></header>
      <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Código"><input value={code} disabled={isEditing} onChange={(e)=>setCode(e.target.value.toUpperCase())} className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"/></Field>
        <Field label="Nombre"><input value={name} onChange={(e)=>setName(e.target.value)} className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"/></Field>
        <Field label="Descuento sobre la ganancia (%)"><input type="number" min="0.01" max="100" step="0.01" disabled={isEditing} value={percentageOff} onChange={(e)=>setPercentageOff(e.target.value)} className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"/></Field>
        <Field label="Duración"><select value={duration} disabled={isEditing} onChange={(e)=>setDuration(e.target.value as CouponDuration)} className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"><option value="once">Una vez</option><option value="forever">Para siempre</option><option value="repeating">Repetitivo</option></select></Field>
        {duration === "repeating" && <Field label="Meses"><input type="number" min={1} disabled={isEditing} value={durationMonths} onChange={(e)=>setDurationMonths(e.target.value)} className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"/></Field>}
        <Field label="Aplica a"><select value={appliesTo} onChange={(e)=>setAppliesTo(e.target.value as typeof appliesTo)} className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"><option value="token_packages">Paquetes de tokens</option><option value="free_token_purchase">Compra libre de tokens</option></select></Field>
        <Field label="Máximo de usos"><input type="number" min={1} value={maxRedemptions} onChange={(e)=>setMaxRedemptions(e.target.value)} className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"/></Field>
        <Field label="Compra mínima"><input type="number" min={0} step="0.01" value={minimumAmount} onChange={(e)=>setMinimumAmount(e.target.value)} className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"/></Field>
        <Field label="IDs elegibles"><input value={eligibleIds} onChange={(e)=>setEligibleIds(e.target.value)} placeholder="1, 2, 3" className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"/></Field>
        <Field label="Válido desde"><input type="datetime-local" value={validFrom} onChange={(e)=>setValidFrom(e.target.value)} className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"/></Field>
        <Field label="Válido hasta"><input type="datetime-local" value={validUntil} onChange={(e)=>setValidUntil(e.target.value)} className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"/></Field>
      </div>
      <div className={`mx-6 rounded-2xl border p-5 ${isUnsafe ? "border-red-500/30 bg-red-950/15" : "border-emerald-500/20 bg-emerald-950/10"}`}>
        <p className="font-semibold text-white">Validación de ganancia</p>
        <div className="mt-3 grid gap-3 text-sm md:grid-cols-4"><Metric label="Ganancia segura" value={`$${safeProfit.toFixed(6)}`}/><Metric label="Se descuenta" value={`$${discountedProfit.toFixed(6)}`}/><Metric label="Ganancia restante" value={`$${remainingProfit.toFixed(6)}`}/><Metric label="Máximo" value="100%"/></div>
        {isUnsafe && <p className="mt-3 text-sm text-red-300">No puedes guardar este cupón. Superarías la ganancia protegida y perderías aproximadamente ${loss.toFixed(6)} USD.</p>}
      </div>
      <div className="p-6"><Field label="Descripción"><textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="min-h-24 w-full rounded-xl border border-white/8 bg-black/30 p-4 text-white"/></Field><Field label="Metadata JSON"><textarea value={metadata} onChange={(e)=>setMetadata(e.target.value)} className="mt-5 min-h-28 w-full rounded-xl border border-white/8 bg-black/30 p-4 font-mono text-sm text-white"/></Field><div className="mt-5 flex gap-6 text-sm text-zinc-400"><label><input type="checkbox" checked={firstTimeOnly} onChange={(e)=>setFirstTimeOnly(e.target.checked)}/> Solo primera compra</label><label><input type="checkbox" checked={isActive} onChange={(e)=>setIsActive(e.target.checked)}/> Activo</label></div></div>
      <footer className="flex justify-end gap-3 border-t border-white/6 p-5"><button type="button" onClick={onClose} className="rounded-xl border border-white/8 px-4 py-2 text-zinc-400">Cancelar</button><button disabled={isSaving || isUnsafe || !report} className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-2 font-semibold text-white disabled:opacity-50">{isSaving?<LoaderCircle size={16} className="animate-spin"/>:<Save size={16}/>}Guardar</button></footer>
    </form>
  </div>;
}

function Field({label,children}:{label:string;children:ReactNode}) { return <label><span className="mb-2 block text-sm text-zinc-500">{label}</span>{children}</label>; }
function Metric({label,value}:{label:string;value:string}) { return <div><p className="text-xs text-zinc-600">{label}</p><p className="mt-1 font-semibold text-white">{value}</p></div>; }
