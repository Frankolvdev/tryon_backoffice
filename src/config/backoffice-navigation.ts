import type { LucideIcon } from "lucide-react";

import {
  Activity,
  BadgeDollarSign,
  Bell,
  Boxes,
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardList,
  Cpu,
  CreditCard,
  Database,
  FileClock,
  Gauge,
  Globe2,
  KeyRound,
  Languages,
  LayoutDashboard,
  LifeBuoy,
  ListRestart,
  PackageOpen,
  ReceiptText,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tags,
  Tickets,
  Users,
  Workflow,
} from "lucide-react";

export interface BackofficeNavigationItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
}

export interface BackofficeNavigationGroup {
  label: string;
  items: BackofficeNavigationItem[];
}

export const backofficeNavigation: BackofficeNavigationGroup[] = [
  {
    label: "Principal",
    items: [
      {
        label: "Centro de control",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Analítica",
        icon: ChartNoAxesCombined,
        disabled: true,
      },
    ],
  },
  {
    label: "Operación",
    items: [
      {
        label: "Usuarios",
        href: "/dashboard/users",
        icon: Users,
      },
      {
        label: "Try-On",
        href: "/dashboard/tryon",
        icon: Sparkles,
      },
      {
        label: "Trabajos de IA",
        href: "/dashboard/tryon/jobs",
        icon: Workflow,
      },
      {
        label: "Colas y procesos",
        icon: ListRestart,
        disabled: true,
      },
      {
        label: "RunPod",
        href: "/dashboard/tryon/integrations/runpod",
        icon: Cpu,
      },
      {
        label: "ComfyUI",
        href: "/dashboard/tryon/integrations",
        icon: Boxes,
      },
      {
        label: "Workflows",
        href: "/dashboard/tryon/workflows",
        icon: ClipboardList,
      },
    ],
  },
  {
    label: "Comercial",
    items: [
      {
        label: "Dashboard comercial",
        href: "/dashboard/billing",
        icon: BadgeDollarSign,
      },
      {
        label: "Pagos",
        icon: CreditCard,
        disabled: true,
      },
      {
        label: "Facturas",
        icon: ReceiptText,
        disabled: true,
      },
      {
        label: "Planes",
        href: "/dashboard/billing/plans",
        icon: CircleDollarSign,
      },
      {
        label: "Suscripciones",
        icon: CircleDollarSign,
        disabled: true,
      },
      {
        label: "Tokens",
        icon: PackageOpen,
        disabled: true,
      },
      {
        label: "Cupones",
        icon: Tags,
        disabled: true,
      },
    ],
  },
  {
    label: "Administración",
    items: [
      {
        label: "Notificaciones",
        icon: Bell,
        disabled: true,
      },
      {
        label: "Soporte",
        icon: LifeBuoy,
        disabled: true,
      },
      {
        label: "Auditoría",
        href: "/dashboard/audit",
        icon: FileClock,
      },
      {
        label: "Eventos operativos",
        icon: Activity,
        disabled: true,
      },
      {
        label: "Seguridad",
        icon: ShieldCheck,
        disabled: true,
      },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        label: "Monitoreo",
        href: "/dashboard/tryon/integrations/monitoring",
        icon: Gauge,
      },
      {
        label: "Almacenamiento",
        href: "/dashboard/tryon/integrations/storage",
        icon: Database,
      },
      {
        label: "Internacionalización",
        icon: Languages,
        disabled: true,
      },
      {
        label: "Integraciones",
        href: "/dashboard/integrations",
        icon: Globe2,
      },
      {
        label: "Feature flags",
        icon: SlidersHorizontal,
        disabled: true,
      },
      {
        label: "MFA",
        icon: KeyRound,
        disabled: true,
      },
      {
        label: "Configuración",
        href: "/dashboard/settings",
        icon: Settings,
      },
      {
        label: "Tickets",
        icon: Tickets,
        disabled: true,
      },
    ],
  },
];
