"use client";

import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, PackageOpen, Pencil, Plus, RefreshCcw, TriangleAlert } from "lucide-react";
import { TokenPackageEditor } from "@/components/backoffice/billing/token-package-editor";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { TokenPackageResponse } from "@/types/admin-token-commerce";

export default function TokenPackagesPage() {
  const [packages, setPackages] = useState<TokenPackageResponse[]>([]);
  const [editingPackage, setEditingPackage] = useState<TokenPackageResponse | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      setPackages(await browserApiRequest<TokenPackageResponse[]>("/api/admin/token-packages"));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No fue posible cargar los paquetes de tokens.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const savePackage = (saved: TokenPackageResponse) => {
    setPackages((current) => current.some((item) => item.id === saved.id)
      ? current.map((item) => item.id === saved.id ? saved : item)
      : [saved, ...current]);
    setEditingPackage(undefined);
  };

  const formatPrice = (item: TokenPackageResponse) => new Intl.NumberFormat("es-MX", {
    style: "currency", currency: item.currency.toUpperCase(),
  }).format(item.price_cents / 100);

  return <div>
    <section className="luxia-panel overflow-hidden rounded-3xl">
      <div className="border-b border-white/6 p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400"><PackageOpen size={24}/></div>
            <div><p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">Comercial</p><h1 className="mt-2 text-2xl font-semibold text-white">Paquetes de tokens</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">Crea y edita los paquetes que los usuarios pueden comprar. Los movimientos y consumos se consultan en Movimientos de tokens.</p></div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setEditingPackage(null)} className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white"><Plus size={16}/>Nuevo paquete</button>
            <button type="button" onClick={() => void loadData()} disabled={isLoading} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400 disabled:opacity-50"><RefreshCcw size={16} className={isLoading ? "animate-spin" : undefined}/>Actualizar</button>
          </div>
        </div>
      </div>
    </section>

    {isLoading && <section className="luxia-panel mt-5 flex min-h-80 items-center justify-center rounded-3xl"><LoaderCircle className="animate-spin text-red-500"/></section>}
    {!isLoading && errorMessage && <section className="luxia-panel mt-5 rounded-3xl p-6"><div className="flex items-start gap-3 rounded-2xl border border-red-500/15 bg-red-950/15 p-5"><TriangleAlert size={19} className="mt-0.5 shrink-0 text-red-400"/><p className="text-sm leading-6 text-red-300">{errorMessage}</p></div></section>}
    {!isLoading && !errorMessage && <section className="mt-5">
      <div className="mb-4"><h2 className="font-semibold text-white">Catálogo</h2><p className="mt-1 text-xs text-zinc-600">{packages.length} paquetes registrados</p></div>
      {packages.length === 0 ? <div className="luxia-panel rounded-3xl p-12 text-center text-sm text-zinc-600">Todavía no existen paquetes de tokens.</div> : <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">{packages.map((item) => <article key={item.id} className="luxia-panel rounded-3xl p-6">
        <div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-white">{item.name}</p><p className="mt-1 text-xs text-zinc-600">#{item.id}</p></div><span className={item.is_active ? "rounded-full border border-emerald-500/15 bg-emerald-950/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-400" : "rounded-full border border-white/8 bg-black/20 px-2.5 py-1 text-[10px] font-semibold text-zinc-500"}>{item.is_active ? "ACTIVO" : "INACTIVO"}</span></div>
        <p className="mt-5 text-3xl font-semibold text-white">{item.tokens_amount.toLocaleString("es-MX")}</p><p className="mt-1 text-xs text-zinc-600">tokens</p>
        <p className="mt-4 text-xl font-semibold text-red-300">{formatPrice(item)}</p>
        <p className="mt-4 min-h-10 text-sm leading-6 text-zinc-600">{item.description ?? "Sin descripción."}</p>
        <p className="mt-4 truncate font-mono text-[10px] text-zinc-700">{item.stripe_price_id ?? "Sin Stripe Price ID"}</p>
        <button type="button" onClick={() => setEditingPackage(item)} className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/8 text-sm text-zinc-400 hover:text-white"><Pencil size={15}/>Editar</button>
      </article>)}</div>}
    </section>}

    {editingPackage !== undefined && <TokenPackageEditor tokenPackage={editingPackage} onClose={() => setEditingPackage(undefined)} onSaved={savePackage}/>} 
  </div>;
}
