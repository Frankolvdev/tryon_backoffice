import {
  Apple,
  BadgeInfo,
  Boxes,
  Cloud,
  HardDrive,
  Mail,
  Server,
  WalletCards,
} from "lucide-react";

import type {
  IntegrationProvider,
} from "@/types/admin-integrations";

export interface IntegrationCatalogItem {
  provider: IntegrationProvider;
  label: string;
  description: string;
  category:
    | "ai"
    | "storage"
    | "payments"
    | "communications"
    | "authentication";
  icon: typeof Server;
}

export const integrationCatalog: IntegrationCatalogItem[] = [
  {
    provider: "comfyui",
    label: "ComfyUI",
    description:
      "Motor local de workflows para generación y procesamiento Try-On.",
    category: "ai",
    icon: Boxes,
  },
  {
    provider: "runpod",
    label: "RunPod",
    description:
      "Ejecución Serverless de trabajos de inteligencia artificial.",
    category: "ai",
    icon: Server,
  },
  {
    provider: "s3",
    label: "S3 Compatible Storage",
    description:
      "Amazon S3, Cloudflare R2, MinIO u otro proveedor compatible.",
    category: "storage",
    icon: HardDrive,
  },
  {
    provider: "stripe",
    label: "Stripe",
    description:
      "Cobros, webhooks y operación comercial mediante Stripe.",
    category: "payments",
    icon: WalletCards,
  },
  {
    provider: "smtp",
    label: "SMTP",
    description:
      "Servidor de correo para mensajes transaccionales.",
    category: "communications",
    icon: Mail,
  },
  {
    provider: "google_oauth",
    label: "Google OAuth",
    description:
      "Inicio de sesión mediante cuentas de Google.",
    category: "authentication",
    icon: Cloud,
  },
  {
    provider: "apple_oauth",
    label: "Apple OAuth",
    description:
      "Inicio de sesión mediante Sign in with Apple.",
    category: "authentication",
    icon: Apple,
  },
  {
    provider: "facebook_oauth",
    label: "Facebook OAuth",
    description:
      "Inicio de sesión mediante cuentas de Facebook.",
    category: "authentication",
    icon: BadgeInfo,
  },
];

export function getIntegrationCatalogItem(
  provider: IntegrationProvider,
): IntegrationCatalogItem {
  return (
    integrationCatalog.find(
      (item) => item.provider === provider,
    ) ?? {
      provider,
      label: provider,
      description: "Integración del sistema.",
      category: "communications",
      icon: Server,
    }
  );
}
