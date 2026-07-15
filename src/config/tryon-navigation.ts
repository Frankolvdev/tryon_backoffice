import {
  Boxes,
  Cpu,
  LayoutDashboard,
  Workflow,
} from "lucide-react";

import type { TryOnModuleSection } from "@/types/admin-tryon";

export const tryOnSections: Array<
  TryOnModuleSection & {
    icon: typeof LayoutDashboard;
  }
> = [
  {
    key: "overview",
    label: "Resumen",
    description:
      "Estado operativo y métricas generales del motor Try-On.",
    href: "/dashboard/tryon",
    icon: LayoutDashboard,
  },
  {
    key: "jobs",
    label: "Trabajos",
    description:
      "Cola, ejecuciones, resultados, errores y acciones de jobs.",
    href: "/dashboard/tryon/jobs",
    icon: Workflow,
  },
  {
    key: "workflows",
    label: "Workflows",
    description:
      "Administración de definiciones y versiones de workflows.",
    href: "/dashboard/tryon/workflows",
    icon: Boxes,
  },
  {
    key: "integrations",
    label: "Motor IA",
    description:
      "Estado y configuración disponible de ComfyUI y RunPod.",
    href: "/dashboard/tryon/integrations",
    icon: Cpu,
  },
];
