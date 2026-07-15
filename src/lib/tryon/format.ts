import type {
  TryOnJobStatus,
} from "@/types/admin-tryon";

export function formatTryOnDate(
  value: string | null | undefined,
): string {
  if (!value) {
    return "No disponible";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha inválida";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatTryOnMoneyFromCents(
  value: number | null | undefined,
): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "USD",
  }).format((value ?? 0) / 100);
}

export function formatTryOnDuration(
  seconds: number | null | undefined,
): string {
  if (
    seconds === null ||
    seconds === undefined
  ) {
    return "No disponible";
  }

  if (seconds < 60) {
    return `${seconds.toLocaleString("es-MX")} s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes} min ${remainingSeconds} s`;
}

export function getTryOnStatusLabel(
  status: TryOnJobStatus,
): string {
  const normalized = status.toLowerCase();

  const labels: Record<string, string> = {
    queued: "En cola",
    pending: "Pendiente",
    processing: "Procesando",
    running: "Ejecutando",
    completed: "Completado",
    failed: "Fallido",
    canceled: "Cancelado",
    cancelled: "Cancelado",
    retrying: "Reintentando",
  };

  return labels[normalized] ?? status;
}
