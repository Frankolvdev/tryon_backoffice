"use client";

import {
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";

interface TryOnErrorProps {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}

export default function TryOnError({
  error,
  reset,
}: Readonly<TryOnErrorProps>) {
  return (
    <section className="luxia-panel rounded-3xl p-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/20 text-red-400">
          <AlertTriangle size={24} />
        </div>

        <p className="mt-5 text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
          Error del módulo
        </p>

        <h1 className="mt-3 text-2xl font-semibold text-white">
          No fue posible mostrar Try-On
        </h1>

        <p className="mt-4 text-sm leading-7 text-zinc-500">
          Ocurrió un error inesperado al cargar esta
          sección. Puedes volver a intentarlo sin salir
          del BackOffice.
        </p>

        {error.message && (
          <p className="mt-5 rounded-2xl border border-red-500/10 bg-red-950/10 p-4 text-left font-mono text-xs leading-6 text-red-300">
            {error.message}
          </p>
        )}

        <button
          type="button"
          onClick={reset}
          className="luxia-red-glow mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          <RefreshCcw size={16} />
          Reintentar
        </button>
      </div>
    </section>
  );
}
