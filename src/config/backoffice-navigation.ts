import type { LucideIcon } from "lucide-react";

import {
  Activity,
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
        icon: Sparkles,
        disabled: true,
      },
      {
        label: "Trabajos de IA",
        icon: Workflow,
        disabled: true,
      },
      {
        label: "Colas y procesos",
        icon: ListRestart,
        disabled: true,
      },
      {
        label: "RunPod",
        icon: Cpu,
        disabled: true,
      },
      {
        label: "ComfyUI",
        icon: Boxes,
        disabled: true,
      },
      {
        label: "Workflows",
        icon: ClipboardList,
        disabled: true,
      },
    ],
  },
  {
    label: "Comercial",
    items: [
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
        icon: FileClock,
        disabled: true,
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
        icon: Gauge,
        disabled: true,
      },
      {
        label: "Almacenamiento",
        icon: Database,
        disabled: true,
      },
      {
        label: "Internacionalización",
        icon: Languages,
        disabled: true,
      },
      {
        label: "Integraciones",
        icon: Globe2,
        disabled: true,
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
        icon: Settings,
        disabled: true,
      },
      {
        label: "Tickets",
        icon: Tickets,
        disabled: true,
      },
    ],
  },
];