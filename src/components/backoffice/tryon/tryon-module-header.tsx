import { Sparkles } from "lucide-react";

interface TryOnModuleHeaderProps {
  title: string;
  description: string;
}

/**
 * Encabezado común de las vistas del motor IA.
 *
 * La navegación entre pantallas vive únicamente en el sidebar. Este encabezado
 * no debe volver a renderizar barras, pestañas ni botones que redirijan a otras
 * vistas del módulo.
 */
export function TryOnModuleHeader({
  title,
  description,
}: TryOnModuleHeaderProps) {
  return (
    <header>
      <div className="flex items-start gap-4">
        <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
          <Sparkles size={25} />
        </div>

        <div>
          <p className="text-[10px] font-semibold tracking-[0.26em] text-red-500 uppercase">
            Motor de inteligencia artificial
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
            {description}
          </p>
        </div>
      </div>
    </header>
  );
}
