import {
  LoaderCircle,
  Settings,
} from "lucide-react";

export default function SettingsLoading() {
  return (
    <section className="luxia-panel flex min-h-96 items-center justify-center rounded-3xl">
      <div className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-red-500/15 bg-red-950/20 text-red-400">
          <Settings size={23} />
        </div>

        <LoaderCircle className="mx-auto mt-6 animate-spin text-red-500" />

        <p className="mt-4 text-sm text-zinc-500">
          Cargando configuración...
        </p>
      </div>
    </section>
  );
}
