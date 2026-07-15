import { TryOnEmptyState } from "@/components/backoffice/tryon/tryon-empty-state";
import { TryOnModuleHeader } from "@/components/backoffice/tryon/tryon-module-header";

export default function TryOnJobsFoundationPage() {
  return (
    <div>
      <TryOnModuleHeader
        title="Trabajos Try-On"
        description="Área preparada para el listado, filtros, detalle y acciones operativas de jobs."
      />

      <div className="mt-7">
        <TryOnEmptyState
          title="Infraestructura de trabajos instalada"
          description="El listado operativo completo se incorpora en el siguiente paquete del mismo módulo Try-On."
        />
      </div>
    </div>
  );
}
