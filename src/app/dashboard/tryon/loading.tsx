import {
  LoaderCircle,
  Sparkles,
} from "lucide-react";

export default function TryOnLoading() {
  return (
    <div className="space-y-6">
      <section className="luxia-panel overflow-hidden rounded-3xl">
        <div className="border-b border-white/6 p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/15 bg-red-950/20 text-red-400">
              <Sparkles size={20} />
            </div>

            <div className="flex-1">
              <div className="h-3 w-36 animate-pulse rounded-full bg-white/7" />
              <div className="mt-4 h-8 w-64 max-w-full animate-pulse rounded-xl bg-white/7" />
              <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded-full bg-white/5" />
            </div>
          </div>
        </div>

        <div className="flex min-h-72 items-center justify-center">
          <div className="text-center">
            <LoaderCircle className="mx-auto animate-spin text-red-500" />

            <p className="mt-4 text-sm text-zinc-500">
              Cargando módulo Try-On...
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="luxia-panel h-32 animate-pulse rounded-2xl"
          />
        ))}
      </section>
    </div>
  );
}
