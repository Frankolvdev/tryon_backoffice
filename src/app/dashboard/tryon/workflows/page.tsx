import { TryOnEmptyState } from "@/components/backoffice/tryon/tryon-empty-state";
import { TryOnModuleHeader } from "@/components/backoffice/tryon/tryon-module-header";

export default function TryOnWorkflowsFoundationPage() {
  return (
    <div>
      <TryOnModuleHeader
        title="Workflows"
        description="Área preparada para administrar definiciones, versiones, validaciones y estado de workflows."
      />

      <div className="mt-7">
        <TryOnEmptyState
          title="Infraestructura de workflows instalada"
          description="La administración completa de workflows se incorpora en un paquete posterior del mismo módulo."
        />
      </div>
    </div>
  );
}
