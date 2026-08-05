"use client";

import { LoaderCircle, Save, Search, X } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { BillingCouponCreate, BillingCouponResponse, BillingCouponUpdate, FinancialProtectionReport } from "@/types/admin-pricing-coupons";
import type { AdminUser } from "@/types/admin-users";

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
  const [percentageOff, setPercentageOff] = useState(coupon?.percentage_off ?? "10");
  const [maxRedemptions, setMaxRedemptions] = useState(coupon?.max_redemptions == null ? "" : String(coupon.max_redemptions));
  const [validFrom, setValidFrom] = useState(toLocalInput(coupon?.valid_from ?? null));
  const [validUntil, setValidUntil] = useState(toLocalInput(coupon?.valid_until ?? null));
  const [firstTimeOnly, setFirstTimeOnly] = useState(coupon?.first_time_transaction_only ?? false);
  const [isActive, setIsActive] = useState(coupon?.is_active ?? true);
  const [appliesTo, setAppliesTo] = useState<("token_packages" | "free_token_purchase")[]>(coupon?.applies_to?.length ? coupon.applies_to : ["token_packages"]);
  const [maxPerUser, setMaxPerUser] = useState(coupon?.max_redemptions_per_user == null ? "" : String(coupon.max_redemptions_per_user));
  const [eligibleUserIds, setEligibleUserIds] = useState<number[]>(coupon?.eligible_user_ids ?? []);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [metadata, setMetadata] = useState(JSON.stringify(coupon?.metadata ?? {}, null, 2));
  const [report, setReport] = useState<FinancialProtectionReport | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void browserApiRequest<AdminUser[]>("/api/admin/users?skip=0&limit=100&include_deleted=false").then(setUsers).catch(()=>toast.error("No fue posible cargar los usuarios."));
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
    if (appliesTo.length === 0) return void toast.error("Selecciona al menos un tipo de compra.");
    if (isUnsafe) return void toast.error(`No puedes superar 100% de la ganancia protegida. Pérdida potencial: $${loss.toFixed(6)} USD.`);

    let parsedMetadata: Record<string, unknown>;
    try { const raw = JSON.parse(metadata || "{}"); if (!raw || Array.isArray(raw) || typeof raw !== "object") throw new Error(); parsedMetadata = raw; }
    catch { return void toast.error("Metadata debe ser un objeto JSON válido."); }

    const parsedMax = maxRedemptions ? Number(maxRedemptions) : null;
    const parsedPerUser = maxPerUser ? Number(maxPerUser) : null;
    if (parsedMax !== null && (!Number.isInteger(parsedMax) || parsedMax < 1)) return void toast.error("El máximo de usos debe ser mayor que cero.");
    if (parsedPerUser !== null && (!Number.isInteger(parsedPerUser) || parsedPerUser < 1)) return void toast.error("El máximo por usuario debe ser mayor que cero.");

    const common: BillingCouponUpdate = {
      name: name.trim(), description: description.trim() || null, max_redemptions: parsedMax,
      first_time_transaction_only: firstTimeOnly,
      valid_from: validFrom ? new Date(validFrom).toISOString() : null,
      valid_until: validUntil ? new Date(validUntil).toISOString() : null,
      is_active: isActive, applies_to: appliesTo,
      eligible_user_ids: eligibleUserIds, max_redemptions_per_user: parsedPerUser,
      metadata: parsedMetadata,
    };
    const payload: BillingCouponCreate | BillingCouponUpdate = isEditing
      ? common
      : {
          ...common,
          code: code.trim().toUpperCase(),
          discount_type: "percentage" as const,
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
        <Field label="Aplica a"><div className="flex min-h-11 flex-col justify-center gap-2 rounded-xl border border-white/8 bg-black/30 px-4 py-3 text-sm text-zinc-300"><label className="flex items-center gap-2"><input type="checkbox" checked={appliesTo.includes("token_packages")} onChange={(e)=>setAppliesTo((current)=>e.target.checked ? [...new Set([...current, "token_packages" as const])] : current.filter((item)=>item!=="token_packages"))}/> Paquetes de tokens</label><label className="flex items-center gap-2"><input type="checkbox" checked={appliesTo.includes("free_token_purchase")} onChange={(e)=>setAppliesTo((current)=>e.target.checked ? [...new Set([...current, "free_token_purchase" as const])] : current.filter((item)=>item!=="free_token_purchase"))}/> Compra libre de tokens</label></div></Field>
        <Field label="Máximo de usos totales"><input type="number" min={1} value={maxRedemptions} onChange={(e)=>setMaxRedemptions(e.target.value)} placeholder="Sin límite" className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"/></Field>
        <Field label="Máximo de usos por usuario"><input type="number" min={1} value={maxPerUser} onChange={(e)=>setMaxPerUser(e.target.value)} placeholder="Sin límite" className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"/></Field>
        <div className="md:col-span-2 xl:col-span-3"><span className="mb-2 block text-sm text-zinc-500">Usuarios permitidos</span><div className="rounded-2xl border border-white/8 bg-black/30 p-4"><div className="relative"><Search className="absolute left-3 top-3 size-4 text-zinc-600"/><input value={userSearch} onChange={(e)=>setUserSearch(e.target.value)} placeholder="Buscar por nombre o correo" className="h-10 w-full rounded-xl border border-white/8 bg-black/30 pl-10 pr-4 text-sm text-white"/></div><p className="mt-2 text-xs text-zinc-600">Sin usuarios seleccionados, el cupón será válido para todos.</p><div className="mt-3 max-h-52 space-y-2 overflow-auto">{users.filter((u)=>`${u.full_name ?? ""} ${u.email}`.toLowerCase().includes(userSearch.toLowerCase())).map((u)=><label key={u.id} className="flex items-center justify-between rounded-xl border border-white/6 px-3 py-2 text-sm"><span><span className="text-white">{u.full_name || "Sin nombre"}</span><span className="ml-2 text-zinc-600">{u.email}</span></span><input type="checkbox" checked={eligibleUserIds.includes(u.id)} onChange={(e)=>setEligibleUserIds((current)=>e.target.checked?[...current,u.id]:current.filter((id)=>id!==u.id))}/></label>)}</div></div></div>
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
