import Link from "next/link";

import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="luxia-grid-background flex min-h-screen items-center justify-center px-6 py-12">
      <section className="luxia-panel w-full max-w-xl rounded-3xl p-8 text-center sm:p-12">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/30 text-red-400">
          <FileQuestion size={30} strokeWidth={1.7} />
        </div>

        <p className="mt-8 text-xs font-semibold tracking-[0.28em] text-red-400 uppercase">
          Error 404
        </p>

        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
          Página no encontrada
        </h1>

        <p className="mx-auto mt-4 max-w-md leading-7 text-zinc-400">
          La dirección solicitada no existe o fue movida a otra
          sección del backoffice.
        </p>

        <Link
          href="/login"
          className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          <ArrowLeft size={17} />
          Volver al acceso
        </Link>
      </section>
    </main>
  );
}