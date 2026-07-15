"use client";

import {
  CalendarClock,
  Fingerprint,
  Globe2,
  MonitorSmartphone,
  UserRound,
  X,
} from "lucide-react";

import type {
  AuditLogResponse,
} from "@/types/admin-audit";

interface AuditLogDetailProps {
  log: AuditLogResponse;
  onClose: () => void;
}

function valueOrFallback(
  value: string | number | null,
): string {
  if (
    value === null ||
    value === ""
  ) {
    return "No disponible";
  }

  return String(value);
}

export function AuditLogDetail({
  log,
  onClose,
}: AuditLogDetailProps) {
  const rows = [
    {
      label: "ID",
      value: log.id,
      icon: Fingerprint,
    },
    {
      label: "Administrador",
      value: log.actor_user_id,
      icon: UserRound,
    },
    {
      label: "Entidad",
      value: log.entity_type,
      icon: Fingerprint,
    },
    {
      label: "ID de entidad",
      value: log.entity_id,
      icon: Fingerprint,
    },
    {
      label: "Dirección IP",
      value: log.ip_address,
      icon: Globe2,
    },
    {
      label: "Fecha",
      value: new Date(
        log.created_at,
      ).toLocaleString("es-MX"),
      icon: CalendarClock,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-detail-title"
    >
      <article className="luxia-panel max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/6 bg-[#09090a]/95 p-6 backdrop-blur">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Evento #{log.id}
            </p>

            <h2
              id="audit-detail-title"
              className="mt-2 text-xl font-semibold text-white"
            >
              {log.action}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/8 text-zinc-500 transition hover:text-white"
            aria-label="Cerrar detalle"
          >
            <X size={17} />
          </button>
        </header>

        <div className="p-6">
          <dl className="grid gap-4 sm:grid-cols-2">
            {rows.map((row) => {
              const Icon = row.icon;

              return (
                <div
                  key={row.label}
                  className="rounded-2xl border border-white/7 bg-black/20 p-4"
                >
                  <div className="flex items-center gap-2 text-zinc-600">
                    <Icon size={15} />
                    <dt className="text-xs">
                      {row.label}
                    </dt>
                  </div>

                  <dd className="mt-3 break-words text-sm text-zinc-300">
                    {valueOrFallback(
                      row.value,
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>

          <section className="mt-5 rounded-2xl border border-white/7 bg-black/20 p-5">
            <h3 className="text-sm font-medium text-white">
              Descripción
            </h3>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-500">
              {valueOrFallback(
                log.description,
              )}
            </p>
          </section>

          <section className="mt-5 rounded-2xl border border-white/7 bg-black/20 p-5">
            <div className="flex items-center gap-2">
              <MonitorSmartphone
                size={16}
                className="text-zinc-600"
              />

              <h3 className="text-sm font-medium text-white">
                User Agent
              </h3>
            </div>

            <p className="mt-3 break-all font-mono text-xs leading-6 text-zinc-500">
              {valueOrFallback(
                log.user_agent,
              )}
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
