import {
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
    key: "integrations",
    label: "Motor IA",
    description:
      "Proveedores disponibles y orden de respaldo del motor de inteligencia artificial.",
    href: "/dashboard/tryon/integrations/providers",
    icon: Cpu,
  },
];
