import {
  CircleOff,
  Globe2,
  LockKeyhole,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import type {
  SystemSettingResponse,
  SystemStatusResponse,
} from "@/types/admin-system-settings";

interface PublicConfigPreviewProps {
  settings: SystemSettingResponse[];
  status: SystemStatusResponse;
}

function displayValue(
  value: unknown,
  sensitive: boolean,
): string {
  if (sensitive) {
    return "Oculto";
  }

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Sin valor";
  }

  if (typeof value === "boolean") {
    return value
      ? "Habilitado"
      : "Deshabilitado";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export function PublicConfigPreview({
  settings,
  status,
}: PublicConfigPreviewProps) {
  return (
    <section className="luxia-panel rounded-3xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/15 bg-blue-950/15 text-blue-400">
          <Globe2 size={21} />
        </div>

        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-blue-400 uppercase">
            Vista administrativa
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Datos públicos de la plataforma
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
            Resume los valores marcados por el backend
            como públicos. No expone secretos ni sustituye
            al endpoint público consumido por el frontend
            de usuarios.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-white/7 bg-black/20 p-4">
          <Wrench
            size={17}
            className={
              status.maintenance_mode
                ? "text-amber-400"
                : "text-zinc-600"
            }
          />

          <p className="mt-3 text-xs text-zinc-600">
            Mantenimiento
          </p>

          <p className="mt-1 font-semibold text-white">
            {status.maintenance_mode
              ? "Activo"
              : "Inactivo"}
          </p>
        </article>

        <article className="rounded-2xl border border-white/7 bg-black/20 p-4">
          {status.registration_enabled ? (
            <ShieldCheck
              size={17}
              className="text-emerald-400"
            />
          ) : (
            <CircleOff
              size={17}
              className="text-red-400"
            />
          )}

          <p className="mt-3 text-xs text-zinc-600">
            Registro
          </p>

          <p className="mt-1 font-semibold text-white">
            {status.registration_enabled
              ? "Habilitado"
              : "Deshabilitado"}
          </p>
        </article>

        <article className="rounded-2xl border border-white/7 bg-black/20 p-4">
          {status.tryon_enabled ? (
            <ShieldCheck
              size={17}
              className="text-emerald-400"
            />
          ) : (
            <CircleOff
              size={17}
              className="text-red-400"
            />
          )}

          <p className="mt-3 text-xs text-zinc-600">
            Try-On
          </p>

          <p className="mt-1 font-semibold text-white">
            {status.tryon_enabled
              ? "Habilitado"
              : "Deshabilitado"}
          </p>
        </article>
      </div>

      {status.public_message && (
        <div className="mt-5 rounded-2xl border border-amber-500/10 bg-amber-950/10 p-4">
          <p className="text-[10px] font-semibold tracking-[0.15em] text-amber-400 uppercase">
            Mensaje público
          </p>

          <p className="mt-2 text-sm leading-6 text-amber-200/80">
            {status.public_message}
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {settings.map((setting) => (
          <article
            key={setting.id}
            className="rounded-2xl border border-white/7 bg-black/20 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {setting.label}
                </p>

                <p className="mt-1 truncate font-mono text-[10px] text-zinc-700">
                  {setting.key}
                </p>
              </div>

              {setting.is_sensitive && (
                <LockKeyhole
                  size={14}
                  className="shrink-0 text-zinc-600"
                />
              )}
            </div>

            <p className="mt-4 break-words text-sm text-zinc-400">
              {displayValue(
                setting.value,
                setting.is_sensitive,
              )}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
