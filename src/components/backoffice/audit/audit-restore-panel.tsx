"use client";

import {
  AlertTriangle,
  LoaderCircle,
  RotateCcw,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  AuditRestorePreviewResponse,
  AuditRestoreRequest,
  AuditRestoreResponse,
} from "@/types/admin-audit-restore-export";

function JsonPreview({
  title,
  value,
}: {
  title: string;
  value: unknown;
}) {
  return (
    <section className="rounded-2xl border border-white/7 bg-black/20 p-4">
      <h3 className="text-sm font-medium text-white">
        {title}
      </h3>

      <pre className="mt-3 max-h-80 overflow-auto rounded-xl border border-white/6 bg-[#050506] p-4 font-mono text-xs leading-6 text-zinc-400">
        {JSON.stringify(
          value ?? {},
          null,
          2,
        )}
      </pre>
    </section>
  );
}

export function AuditRestorePanel() {
  const [entityTypes, setEntityTypes] =
    useState<string[]>([]);
  const [entryId, setEntryId] =
    useState("");
  const [
    restoreNullValues,
    setRestoreNullValues,
  ] = useState(true);
  const [reason, setReason] =
    useState("");
  const [
    expectedUpdatedAt,
    setExpectedUpdatedAt,
  ] = useState("");
  const [preview, setPreview] =
    useState<AuditRestorePreviewResponse | null>(
      null,
    );
  const [result, setResult] =
    useState<AuditRestoreResponse | null>(
      null,
    );
  const [isPreviewing, setIsPreviewing] =
    useState(false);
  const [isRestoring, setIsRestoring] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadEntityTypes() {
      try {
        const response =
          await browserApiRequest<string[]>(
            "/api/admin/audit-restorations/entity-types",
          );

        if (!cancelled) {
          setEntityTypes(response);
        }
      } catch {
        if (!cancelled) {
          setEntityTypes([]);
        }
      }
    }

    void loadEntityTypes();

    return () => {
      cancelled = true;
    };
  }, []);

  const parsedEntryId =
    Number(entryId);

  const previewRestore = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !Number.isInteger(
        parsedEntryId,
      ) ||
      parsedEntryId < 1
    ) {
      toast.error(
        "Ingresa un Audit Entry ID válido.",
      );
      return;
    }

    setIsPreviewing(true);
    setPreview(null);
    setResult(null);

    try {
      const response =
        await browserApiRequest<AuditRestorePreviewResponse>(
          `/api/admin/audit-entries/${parsedEntryId}/restore-preview?restore_null_values=${restoreNullValues}`,
        );

      setPreview(response);

      if (response.can_restore) {
        toast.success(
          "Vista previa de restauración cargada.",
        );
      } else {
        toast.warning(
          response.reason ??
            "La entrada no puede restaurarse.",
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible cargar la vista previa.",
      );
    } finally {
      setIsPreviewing(false);
    }
  };

  const restore = async () => {
    if (
      !preview ||
      !preview.can_restore
    ) {
      toast.error(
        "Primero carga una vista previa restaurable.",
      );
      return;
    }

    if (
      reason.trim().length < 3
    ) {
      toast.error(
        "La razón debe tener al menos 3 caracteres.",
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Se restaurará ${preview.entity_type} / ${preview.entity_id} usando la entrada #${preview.audit_entry_id}. Esta acción modifica datos reales. ¿Deseas continuar?`,
      );

    if (!confirmed) {
      return;
    }

    const payload:
      AuditRestoreRequest = {
        reason: reason.trim(),
        expected_updated_at:
          expectedUpdatedAt.trim() ||
          null,
        restore_null_values:
          restoreNullValues,
      };

    setIsRestoring(true);
    setResult(null);

    try {
      const response =
        await browserApiRequest<AuditRestoreResponse>(
          `/api/admin/audit-entries/${preview.audit_entry_id}/restore`,
          {
            method: "POST",
            body: JSON.stringify(
              payload,
            ),
          },
        );

      setResult(response);
      toast.success(response.message);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible restaurar la entidad.",
      );
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <section className="luxia-panel rounded-3xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/15 bg-amber-950/15 text-amber-400">
          <RotateCcw size={21} />
        </div>

        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-amber-400 uppercase">
            Restauración
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Restaurar una versión auditada
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
            Primero genera una vista previa. El backend
            filtra campos protegidos, valida concurrencia,
            registra la restauración e invalida cachés.
          </p>
        </div>
      </div>

      <form
        onSubmit={previewRestore}
        className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]"
      >
        <label>
          <span className="mb-2 block text-sm text-zinc-500">
            Audit Entry ID
          </span>

          <input
            type="number"
            min={1}
            value={entryId}
            onChange={(event) => {
              setEntryId(
                event.target.value,
              );
              setPreview(null);
              setResult(null);
            }}
            placeholder="Ejemplo: 125"
            className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
          />
        </label>

        <button
          type="submit"
          disabled={isPreviewing}
          className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/8 px-5 text-sm text-zinc-300 disabled:opacity-50"
        >
          {isPreviewing ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          ) : (
            <Search size={16} />
          )}
          Vista previa
        </button>
      </form>

      <label className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-white/7 bg-black/20 p-4 text-sm text-zinc-400">
        Restaurar valores nulos
        <input
          type="checkbox"
          checked={restoreNullValues}
          onChange={(event) => {
            setRestoreNullValues(
              event.target.checked,
            );
            setPreview(null);
            setResult(null);
          }}
          className="size-4 accent-red-700"
        />
      </label>

      {entityTypes.length > 0 && (
        <div className="mt-4 rounded-2xl border border-blue-500/10 bg-blue-950/10 p-4">
          <p className="text-xs font-semibold text-blue-300">
            Tipos registrados para restauración
          </p>

          <p className="mt-2 break-words text-xs leading-6 text-blue-300/70">
            {entityTypes.join(", ")}
          </p>
        </div>
      )}

      {preview && (
        <div className="mt-6">
          <div
            className={
              preview.can_restore
                ? "flex items-start gap-3 rounded-2xl border border-emerald-500/15 bg-emerald-950/10 p-4"
                : "flex items-start gap-3 rounded-2xl border border-red-500/15 bg-red-950/10 p-4"
            }
          >
            {preview.can_restore ? (
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-emerald-400"
              />
            ) : (
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0 text-red-400"
              />
            )}

            <div>
              <p
                className={
                  preview.can_restore
                    ? "font-medium text-emerald-300"
                    : "font-medium text-red-300"
                }
              >
                {preview.can_restore
                  ? "La entrada puede restaurarse"
                  : "La entrada no puede restaurarse"}
              </p>

              <p className="mt-2 text-xs leading-6 text-zinc-500">
                {preview.reason ??
                  `${preview.changed_fields.length} campos cambiarán.`}
              </p>
            </div>
          </div>

          <section className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              [
                "Campos a cambiar",
                preview.changed_fields,
              ],
              [
                "Campos ignorados",
                preview.ignored_fields,
              ],
              [
                "Campos ausentes",
                preview.missing_fields,
              ],
            ].map(([label, values]) => (
              <article
                key={String(label)}
                className="rounded-2xl border border-white/7 bg-black/20 p-4"
              >
                <p className="text-xs text-zinc-600">
                  {String(label)}
                </p>

                <p className="mt-2 break-words text-sm text-zinc-300">
                  {(values as string[])
                    .join(", ") ||
                    "Ninguno"}
                </p>
              </article>
            ))}
          </section>

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <JsonPreview
              title="Estado actual"
              value={
                preview.current_data
              }
            />

            <JsonPreview
              title="Estado que se restaurará"
              value={
                preview.restore_data
              }
            />
          </div>

          {preview.can_restore && (
            <section className="mt-5 rounded-2xl border border-white/7 bg-black/20 p-5">
              <div className="grid gap-5 xl:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm text-zinc-500">
                    Razón de la restauración
                  </span>

                  <textarea
                    value={reason}
                    maxLength={5000}
                    onChange={(event) =>
                      setReason(
                        event.target.value,
                      )
                    }
                    placeholder="Explica por qué debe restaurarse esta versión."
                    className="min-h-32 w-full rounded-xl border border-white/8 bg-black/30 p-4 text-sm text-white"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm text-zinc-500">
                    expected_updated_at
                  </span>

                  <input
                    value={
                      expectedUpdatedAt
                    }
                    onChange={(event) =>
                      setExpectedUpdatedAt(
                        event.target.value,
                      )
                    }
                    placeholder="Opcional, fecha ISO para control de concurrencia"
                    className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-xs text-white"
                  />

                  <p className="mt-3 text-xs leading-6 text-zinc-600">
                    Déjalo vacío para omitir la validación
                    de concurrencia. Cuando se use, debe
                    coincidir con el updated_at actual de la
                    entidad.
                  </p>
                </label>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    void restore()
                  }
                  disabled={isRestoring}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-950/15 px-5 text-sm font-semibold text-amber-300 disabled:opacity-50"
                >
                  {isRestoring ? (
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <RotateCcw
                      size={16}
                    />
                  )}
                  Confirmar restauración
                </button>
              </div>
            </section>
          )}
        </div>
      )}

      {result && (
        <section className="mt-6 rounded-2xl border border-emerald-500/15 bg-emerald-950/10 p-5">
          <h3 className="font-semibold text-emerald-300">
            Restauración completada
          </h3>

          <p className="mt-2 text-sm leading-6 text-emerald-300/75">
            {result.message}
          </p>

          <dl className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <dt className="text-xs text-zinc-600">
                Entidad
              </dt>
              <dd className="mt-1 text-sm text-zinc-300">
                {result.restored_entity_type} /{" "}
                {result.restored_entity_id}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-zinc-600">
                Entrada de restauración
              </dt>
              <dd className="mt-1 text-sm text-zinc-300">
                {result.restoration_audit_entry_id ??
                  "No disponible"}
              </dd>
            </div>
          </dl>
        </section>
      )}
    </section>
  );
}
