import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  BadgeDollarSign,
  BadgePercent,
  Bell,
  Boxes,
  ChartNoAxesCombined,
  CircleDollarSign,
  Calculator,
  WalletCards,
  Cpu,
  CreditCard,
  Database,
  FileClock,
  Gauge,
  HardDrive,
  Globe2,
  Languages,
  LayoutDashboard,
  LifeBuoy,
  PackageOpen,
  ReceiptText,
  ServerCog,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Workflow,
  WandSparkles,
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
        href: "/dashboard/analytics",
        icon: ChartNoAxesCombined,
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
        label: "Trabajos IA",
        href: "/dashboard/tryon/jobs",
        icon: Workflow,
      },
      {
        label: "Motor IA",
        href: "/dashboard/tryon/integrations/providers",
        icon: Cpu,
      },
      {
        label: "Proveedores de infraestructura",
        href: "/dashboard/tryon/integrations/infrastructure-providers",
        icon: ServerCog,
      },
      {
        label: "Módulos de generación",
        href: "/dashboard/tryon/generation-modules",
        icon: Boxes,
      },
      {
        label: "Runtime Builder",
        href: "/dashboard/runtime-builder",
        icon: ServerCog,
      },
      {
        label: "Docker File Manager",
        href: "/dashboard/docker-file-manager",
        icon: HardDrive,
      },
    ],
  },
  {
    label: "Tools Generation",
    items: [
      {
        label: "Generador de proporciones",
        href: "/dashboard/tools-generation/body-proportions",
        icon: WandSparkles,
      },
      {
        label: "Ascendencias de rostro",
        href: "/dashboard/tools-generation/ancestry-assets",
        icon: Globe2,
      },
    ],
  },
  {
    label: "Sistema legal",
    items: [{ label: "Políticas legales", href: "/dashboard/system/legal-policies", icon: BookOpen }],
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
        label: "Finanzas por generación",
        href: "/dashboard/finances/generations",
        icon: BadgeDollarSign,
      },
      {
        label: "Caja y bolsas",
        href: "/dashboard/finances/cashbox",
        icon: WalletCards,
      },
      {
        label: "Pagos",
        href: "/dashboard/billing/payments",
        icon: CreditCard,
      },
      {
        label: "Facturas",
        href: "/dashboard/billing/invoices",
        icon: ReceiptText,
      },
      {
        label: "Planes",
        href: "/dashboard/billing/plans",
        icon: CircleDollarSign,
      },
      {
        label: "Suscripciones",
        href: "/dashboard/billing/subscriptions",
        icon: CircleDollarSign,
      },
      {
        label: "Movimientos de tokens",
        href: "/dashboard/billing/tokens",
        icon: PackageOpen,
      },
      {
        label: "Paquetes de tokens",
        href: "/dashboard/billing/token-packages",
        icon: PackageOpen,
      },
      {
        label: "Pricing",
        href: "/dashboard/billing/pricing",
        icon: BadgePercent,
      },
      {
        label: "Simulador de ganancias",
        href: "/dashboard/finances/profit-simulator",
        icon: Calculator,
      },
      {
        label: "Cupones",
        href: "/dashboard/billing/coupons",
        icon: BadgePercent,
      },
      {
        label: "Configuración de facturación",
        href: "/dashboard/billing/settings",
        icon: Settings,
      },
      {
        label: "Operaciones billing",
        href: "/dashboard/billing/operations",
        icon: ServerCog,
      },
    ],
  },
  {
    label: "Administración",
    items: [
      {
        label: "Notificaciones",
        href: "/dashboard/notifications",
        icon: Bell,
      },
      {
        label: "Soporte",
        href: "/dashboard/support",
        icon: LifeBuoy,
      },
      {
        label: "Auditoría",
        href: "/dashboard/audit",
        icon: FileClock,
      },
      {
        label: "Seguridad",
        href: "/dashboard/settings/security",
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        label: "Monitoreo",
        href: "/dashboard/monitoring",
        icon: Gauge,
      },
      {
        label: "Almacenamiento",
        href: "/dashboard/tryon/integrations/storage",
        icon: Database,
      },
      {
        label: "Internacionalización",
        href: "/dashboard/internationalization",
        icon: Languages,
      },
      {
        label: "Integraciones",
        href: "/dashboard/integrations",
        icon: Globe2,
      },
      {
        label: "Feature flags",
        href: "/dashboard/feature-flags",
        icon: SlidersHorizontal,
      },
      {
        label: "Configuración",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];
