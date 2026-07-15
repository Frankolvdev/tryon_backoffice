"use client";

import { useEffect } from "react";

import { AlertTriangle, RotateCcw } from "lucide-react";

interface GlobalErrorPageProps {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}

export default function GlobalErrorPage({
  error,
  reset,
}: GlobalErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="luxia-grid-background flex min-h-screen items-center justify-center px-6 py-12">
      <section className="luxia-panel w-full max-w-xl rounded-3xl p-8 text-center sm:p-12">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/30 text-red-400">
          <AlertTriangle size={30} strokeWidth={1.7} />
        </div>

        <p className="mt-8 text-xs font-semibold tracking-[0.28em] text-red-400 uppercase">
          Error inesperado
        </p>

        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
          Algo salió mal
        </h1>

        <p className="mx-auto mt-4 max-w-md leading-7 text-zinc-400">
          El backoffice encontró un problema al procesar esta
          pantalla. Puedes intentar cargarla nuevamente.
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          <RotateCcw size={17} />
          Intentar nuevamente
        </button>
      </section>
    </main>
  );
}