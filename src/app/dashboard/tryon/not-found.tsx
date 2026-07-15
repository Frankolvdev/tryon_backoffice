import Link from "next/link";

import {
  ArrowLeft,
  SearchX,
} from "lucide-react";

export default function TryOnNotFound() {
  return (
    <section className="luxia-panel rounded-3xl p-8">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-white/8 bg-black/30 text-zinc-500">
          <SearchX size={24} />
        </div>

        <p className="mt-5 text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
          Recurso no encontrado
        </p>

        <h1 className="mt-3 text-2xl font-semibold text-white">
          Esta sección de Try-On no existe
        </h1>

        <p className="mt-4 text-sm leading-7 text-zinc-500">
          La ruta solicitada no está disponible o el
          recurso fue eliminado.
        </p>

        <Link
          href="/dashboard/tryon"
          className="luxia-red-glow mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          <ArrowLeft size={16} />
          Volver a Try-On
        </Link>
      </div>
    </section>
  );
}
