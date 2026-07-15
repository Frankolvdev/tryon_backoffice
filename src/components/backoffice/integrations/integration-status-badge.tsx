import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  XCircle,
} from "lucide-react";

import type {
  IntegrationHealthStatus,
  IntegrationStatus,
} from "@/types/admin-integrations";

interface IntegrationStatusBadgeProps {
  status: IntegrationStatus;
  health: IntegrationHealthStatus | null;
}

export function IntegrationStatusBadge({
  status,
  health,
}: IntegrationStatusBadgeProps) {
  if (health === "healthy") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-950/20 px-2.5 py-1 text-[10px] font-semibold uppercase text-emerald-400">
        <CheckCircle2 size={12} />
        Saludable
      </span>
    );
  }

  if (
    health === "down" ||
    status === "error"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/15 bg-red-950/20 px-2.5 py-1 text-[10px] font-semibold uppercase text-red-400">
        <XCircle size={12} />
        Error
      </span>
    );
  }

  if (health === "degraded") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/15 bg-amber-950/20 px-2.5 py-1 text-[10px] font-semibold uppercase text-amber-400">
        <AlertTriangle size={12} />
        Degradada
      </span>
    );
  }

  if (status === "enabled") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/15 bg-blue-950/20 px-2.5 py-1 text-[10px] font-semibold uppercase text-blue-400">
        <CircleHelp size={12} />
        Sin comprobar
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-500/15 bg-zinc-900/40 px-2.5 py-1 text-[10px] font-semibold uppercase text-zinc-500">
      <XCircle size={12} />
      Deshabilitada
    </span>
  );
}
