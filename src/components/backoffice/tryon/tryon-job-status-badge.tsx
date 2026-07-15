import {
  Ban,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";

import { getTryOnStatusLabel } from "@/lib/tryon/format";
import { cn } from "@/lib/utils";

import type {
  TryOnJobStatus,
} from "@/types/admin-tryon";

interface TryOnJobStatusBadgeProps {
  status: TryOnJobStatus;
}

export function TryOnJobStatusBadge({
  status,
}: TryOnJobStatusBadgeProps) {
  const normalized = status.toLowerCase();

  const isSuccess =
    normalized === "completed";

  const isFailure =
    normalized === "failed";

  const isCanceled =
    normalized === "canceled" ||
    normalized === "cancelled";

  const isProcessing =
    normalized === "processing" ||
    normalized === "running";

  const isRetrying =
    normalized === "retrying";

  const Icon = isSuccess
    ? CheckCircle2
    : isFailure
      ? TriangleAlert
      : isCanceled
        ? Ban
        : isProcessing
          ? LoaderCircle
          : isRetrying
            ? RotateCcw
            : Clock3;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase",
        isSuccess &&
          "border-emerald-500/15 bg-emerald-950/20 text-emerald-400",
        isFailure &&
          "border-red-500/15 bg-red-950/20 text-red-400",
        isCanceled &&
          "border-zinc-500/15 bg-zinc-900/40 text-zinc-400",
        (isProcessing || isRetrying) &&
          "border-blue-500/15 bg-blue-950/20 text-blue-400",
        !isSuccess &&
          !isFailure &&
          !isCanceled &&
          !isProcessing &&
          !isRetrying &&
          "border-amber-500/15 bg-amber-950/20 text-amber-400",
      )}
    >
      <Icon
        size={13}
        className={
          isProcessing || isRetrying
            ? "animate-spin"
            : undefined
        }
      />

      {getTryOnStatusLabel(status)}
    </span>
  );
}
