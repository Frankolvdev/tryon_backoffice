import {
  Boxes,
  Cpu,
  LayoutDashboard,
  Workflow,
} from "lucide-react";

import type {
  TryOnModuleSection,
} from "@/types/admin-tryon";

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
      "Cola, ejecuciones, resultados, errores y acciones administrativas.",
    href: "/dashboard/tryon/jobs",
    icon: Workflow,
  },
  {
    key: "workflows",
    label: "Workflows",
    description:
      "Definiciones, versiones, validación y administración de workflows.",
    href: "/dashboard/tryon/workflows",
    icon: Boxes,
  },
  {
    key: "integrations",
    label: "Motor IA",
    description:
      "ComfyUI, RunPod, Storage y monitoreo operativo del motor.",
    href: "/dashboard/tryon/integrations",
    icon: Cpu,
  },
];
