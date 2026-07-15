import { TryOnEmptyState } from "@/components/backoffice/tryon/tryon-empty-state";
import { TryOnModuleHeader } from "@/components/backoffice/tryon/tryon-module-header";

export default function TryOnIntegrationsFoundationPage() {
  return (
    <div>
      <TryOnModuleHeader
        title="Motor IA"
        description="Área preparada para las integraciones operativas disponibles de ComfyUI y RunPod."
      />

      <div className="mt-7">
        <TryOnEmptyState
          title="Infraestructura de integraciones instalada"
          description="Los estados, métricas y acciones reales de ComfyUI y RunPod se incorporan en el paquete de integraciones."
        />
      </div>
    </div>
  );
}
