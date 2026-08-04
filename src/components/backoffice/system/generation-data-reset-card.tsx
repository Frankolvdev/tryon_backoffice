"use client";

import { useEffect, useState } from "react";
import { DatabaseZap, LoaderCircle, RefreshCcw, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";

type Preview = {
  confirmation_text: string;
  can_execute: boolean;
  active_execution_ids: string[];
  active_tryon_job_ids: number[];
  counts: Record<string, number>;
};

type Result = {
  success: boolean;
  deleted_storage_files: number;
  restored_tokens: number;
  restored_users: number;
};

const LABELS: Record<string, string> = {
  generation_module_executions: "Ejecuciones dinámicas",
  tryon_jobs: "Trabajos TryOn antiguos",
  generation_financial_records: "Registros financieros",
  token_consumption_allocations: "Asignaciones contables",
  generation_token_transactions: "Movimientos de tokens",
  external_ai_jobs: "Trabajos externos IA",
  background_jobs: "Trabajos en segundo plano",
  gallery_items: "Elementos de galería",
  storage_files: "Archivos en almacenamiento",
  tokens_to_restore: "Tokens que se restaurarán",
};

export function GenerationDataResetCard() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [deleteFiles, setDeleteFiles] = useState(true);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  const loadPreview = async () => {
    setLoading(true);
    try {
      setPreview(await browserApiRequest<Preview>("/api/admin/maintenance/generation-reset/preview"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo revisar el reinicio.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadPreview(); }, []);

  const execute = async () => {
    if (!preview || confirmation !== preview.confirmation_text) return;
    setExecuting(true);
    try {
      const result = await browserApiRequest<Result>("/api/admin/maintenance/generation-reset", {
        method: "POST",
        body: JSON.stringify({ confirmation, delete_storage_files: deleteFiles }),
      });
      toast.success(`Reinicio completado: ${result.restored_tokens} tokens restaurados y ${result.deleted_storage_files} archivos eliminados.`);
      setConfirmation("");
      await loadPreview();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo reiniciar la información de generaciones.");
    } finally {
      setExecuting(false);
    }
  };

  return (
    <section className="luxia-panel mt-5 overflow-hidden rounded-3xl border border-red-500/15">
      <div className="border-b border-red-500/10 bg-red-950/10 p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/30 text-red-400">
            <DatabaseZap size={22} />
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">Mantenimiento temporal</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Reiniciar datos de generaciones</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
              Borra ejecuciones, trabajos relacionados, registros financieros, galería e imágenes de entrada y resultado almacenadas. Conserva usuarios, módulos, pricing, planes, paquetes, cupones, proveedores y configuración.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex h-28 items-center justify-center"><LoaderCircle className="animate-spin text-red-400" /></div>
        ) : preview ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Object.entries(preview.counts).map(([key, value]) => (
                <div key={key} className="rounded-2xl border border-white/7 bg-black/20 p-4">
                  <p className="text-xs text-zinc-600">{LABELS[key] ?? key}</p>
                  <p className="mt-2 text-xl font-semibold text-white">{value.toLocaleString()}</p>
                </div>
              ))}
            </div>

            {!preview.can_execute && (
              <div className="mt-5 flex gap-3 rounded-2xl border border-amber-500/20 bg-amber-950/15 p-4 text-sm text-amber-200">
                <TriangleAlert className="shrink-0" size={18} />
                Hay generaciones activas. Debes terminarlas o cancelarlas antes de ejecutar el reinicio.
              </div>
            )}

            <label className="mt-5 flex items-start gap-3 rounded-2xl border border-white/7 bg-black/20 p-4">
              <input type="checkbox" checked={deleteFiles} onChange={(event) => setDeleteFiles(event.target.checked)} className="mt-1" />
              <span>
                <span className="block text-sm font-medium text-white">Eliminar también los archivos físicos</span>
                <span className="mt-1 block text-xs leading-5 text-zinc-600">Usa el proveedor de almacenamiento actualmente configurado, incluido S3 o almacenamiento local.</span>
              </span>
            </label>

            <div className="mt-5 rounded-2xl border border-red-500/15 bg-red-950/10 p-5">
              <p className="text-sm text-red-200">Escribe exactamente <strong>{preview.confirmation_text}</strong> para confirmar.</p>
              <input
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                className="mt-3 h-11 w-full rounded-xl border border-red-500/20 bg-black/30 px-4 text-sm text-white"
                placeholder={preview.confirmation_text}
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={() => void execute()} disabled={!preview.can_execute || confirmation !== preview.confirmation_text || executing} className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
                  {executing ? <LoaderCircle size={16} className="animate-spin" /> : <DatabaseZap size={16} />}
                  Borrar generaciones y restaurar tokens
                </button>
                <button type="button" onClick={() => void loadPreview()} disabled={loading || executing} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400 disabled:opacity-50">
                  <RefreshCcw size={16} /> Actualizar resumen
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
