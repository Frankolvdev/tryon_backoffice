import {
  CheckCircle2,
  CircleOff,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import { getGoogleOAuthReadiness } from "@/lib/integrations/google";

import type { IntegrationConfigResponse } from "@/types/admin-integrations";

interface OAuthStatusProps {
  integration: IntegrationConfigResponse;
}

export function OAuthStatus({ integration }: OAuthStatusProps) {
  const readiness = getGoogleOAuthReadiness(integration);

  const status = readiness.available
    ? {
        icon: ShieldCheck,
        title: "Disponible para el AppWeb",
        description:
          "Google está habilitado y tiene todas las credenciales requeridas.",
        className:
          "border-emerald-500/20 bg-emerald-950/20 text-emerald-300",
      }
    : !readiness.configured
      ? {
          icon: TriangleAlert,
          title: "Configuración incompleta",
          description: `Falta: ${readiness.missing.join(", ")}.`,
          className:
            "border-amber-500/20 bg-amber-950/20 text-amber-300",
        }
      : !readiness.enabled
        ? {
            icon: CircleOff,
            title: "Configurado, pero deshabilitado",
            description:
              "Activa la integración para que el AppWeb pueda mostrar el acceso con Google.",
            className:
              "border-zinc-500/20 bg-zinc-950/30 text-zinc-300",
          }
        : {
            icon: CheckCircle2,
            title: "Configurado",
            description: "La configuración de Google OAuth está completa.",
            className:
              "border-emerald-500/20 bg-emerald-950/20 text-emerald-300",
          };

  const Icon = status.icon;

  return (
    <div className={`rounded-2xl border p-4 ${status.className}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 shrink-0" size={19} />

        <div>
          <p className="text-sm font-semibold">{status.title}</p>
          <p className="mt-1 text-xs leading-5 opacity-80">
            {status.description}
          </p>
        </div>
      </div>
    </div>
  );
}
