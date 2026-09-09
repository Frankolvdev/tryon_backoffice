import { BrandingSettings } from "@/components/backoffice/system/branding-settings";

export default function BrandingSettingsPage() {
  return (
    <div>
      <section className="luxia-panel overflow-hidden rounded-3xl">
        <div className="p-6"><p className="text-xs font-semibold tracking-[.28em] text-red-500 uppercase">Configuración</p><h1 className="mt-2 text-2xl font-semibold text-white">Logotipo y favicon</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">Branding centralizado para AppWeb y Backoffice. Las variantes se generan una sola vez al subir el archivo y después se sirven con caché inmutable para evitar trabajo en cada carga.</p></div>
      </section>
      <div className="mt-5"><BrandingSettings/></div>
    </div>
  );
}
