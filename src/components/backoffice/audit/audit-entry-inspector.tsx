"use client";

import {
  Braces,
  Clock3,
  History,
  LoaderCircle,
  ShieldCheck,
  ShieldX,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  AuditDiffResponse,
  AuditEntryResponse,
  AuditEntityHistoryResponse,
} from "@/types/admin-audit-entries";

interface AuditEntryInspectorProps {
  entry: AuditEntryResponse;
  onClose: () => void;
}

function JsonBlock({
  title,
  value,
}: {
  title: string;
  value: unknown;
}) {
  return (
    <section className="rounded-2xl border border-white/7 bg-black/20 p-5">
      <div className="flex items-center gap-2">
        <Braces
          size={15}
          className="text-zinc-600"
        />
        <h3 className="text-sm font-medium text-white">
          {title}
        </h3>
      </div>

      <pre className="mt-4 max-h-80 overflow-auto rounded-xl border border-white/6 bg-[#050506] p-4 font-mono text-xs leading-6 text-zinc-400">
        {JSON.stringify(
          value ?? {},
          null,
          2,
        )}
      </pre>
    </section>
  );
}

export function AuditEntryInspector({
  entry,
  onClose,
}: AuditEntryInspectorProps) {
  const [diff, setDiff] =
    useState<AuditDiffResponse | null>(
      null,
    );

  const [history, setHistory] =
    useState<AuditEntityHistoryResponse | null>(
      null,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInspectorData() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const requests: Promise<unknown>[] = [
          browserApiRequest<AuditDiffResponse>(
            `/api/admin/audit-entries/${entry.id}/diff`,
          ),
        ];

        if (entry.entity_id) {
          requests.push(
            browserApiRequest<AuditEntityHistoryResponse>(
              `/api/admin/audit-entries/entity/${encodeURIComponent(
                entry.entity_type,
              )}/${encodeURIComponent(
                entry.entity_id,
              )}?limit=100`,
            ),
          );
        }

        const results =
          await Promise.all(requests);

        if (cancelled) return;

        setDiff(
          results[0] as AuditDiffResponse,
        );

        setHistory(
          entry.entity_id &&
            results.length > 1
            ? (results[1] as AuditEntityHistoryResponse)
            : null,
        );
      } catch (error) {
        if (cancelled) return;

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No fue posible cargar el detalle avanzado.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadInspectorData();

    return () => {
      cancelled = true;
    };
  }, [entry]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-entry-inspector-title"
    >
      <article className="luxia-panel max-h-[94vh] w-full max-w-6xl overflow-auto rounded-3xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/6 bg-[#09090a]/95 p-6 backdrop-blur">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/8 bg-black/30 px-2.5 py-1 font-mono text-[10px] text-zinc-500">
                #{entry.id}
              </span>

              <span
                className={
                  entry.success
                    ? "inline-flex items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-950/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-400"
                    : "inline-flex items-center gap-1.5 rounded-full border border-red-500/15 bg-red-950/15 px-2.5 py-1 text-[10px] font-semibold text-red-400"
                }
              >
                {entry.success ? (
                  <ShieldCheck size={12} />
                ) : (
                  <ShieldX size={12} />
                )}
                {entry.success
                  ? "EXITOSA"
                  : "FALLIDA"}
              </span>

              {entry.is_restorable && (
                <span className="rounded-full border border-blue-500/15 bg-blue-950/15 px-2.5 py-1 text-[10px] font-semibold text-blue-400">
                  RESTAURABLE
                </span>
              )}
            </div>

            <h2
              id="audit-entry-inspector-title"
              className="mt-3 text-xl font-semibold text-white"
            >
              {entry.action}
            </h2>

            <p className="mt-2 text-sm text-zinc-600">
              {entry.entity_type}
              {entry.entity_id
                ? ` · ${entry.entity_id}`
                : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/8 text-zinc-500 hover:text-white"
            aria-label="Cerrar inspector"
          >
            <X size={17} />
          </button>
        </header>

        <div className="p-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              [
                "Actor",
                entry.actor_email ??
                  entry.actor_user_id ??
                  entry.actor_type,
              ],
              [
                "Fecha",
                new Date(
                  entry.created_at,
                ).toLocaleString("es-MX"),
              ],
              [
                "Correlation ID",
                entry.correlation_id ??
                  "No disponible",
              ],
              [
                "Request ID",
                entry.request_id ??
                  "No disponible",
              ],
            ].map(([label, value]) => (
              <article
                key={String(label)}
                className="rounded-2xl border border-white/7 bg-black/20 p-4"
              >
                <p className="text-xs text-zinc-600">
                  {String(label)}
                </p>
                <p className="mt-2 break-all text-sm text-zinc-300">
                  {String(value)}
                </p>
              </article>
            ))}
          </section>

          {entry.error_message && (
            <section className="mt-5 rounded-2xl border border-red-500/15 bg-red-950/10 p-5">
              <p className="text-xs font-semibold text-red-400">
                {entry.error_type ??
                  "Error"}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-300/80">
                {entry.error_message}
              </p>
            </section>
          )}

          {isLoading && (
            <div className="mt-6 flex min-h-48 items-center justify-center">
              <LoaderCircle className="animate-spin text-red-500" />
            </div>
          )}

          {!isLoading &&
            errorMessage && (
              <section className="mt-5 rounded-2xl border border-red-500/15 bg-red-950/10 p-5 text-sm text-red-300">
                {errorMessage}
              </section>
            )}

          {!isLoading &&
            !errorMessage && (
              <>
                {diff && (
                  <section className="mt-5 luxia-panel rounded-3xl p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-white">
                          Diferencias
                        </h3>
                        <p className="mt-1 text-xs text-zinc-600">
                          {diff.total_changes} cambios detectados.
                        </p>
                      </div>

                      <span className="rounded-full border border-red-500/15 bg-red-950/15 px-3 py-1 text-xs font-semibold text-red-300">
                        {diff.total_changes}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      {[
                        [
                          "Agregados",
                          diff.added_fields,
                        ],
                        [
                          "Modificados",
                          diff.changed_fields,
                        ],
                        [
                          "Eliminados",
                          diff.removed_fields,
                        ],
                      ].map(([label, values]) => (
                        <div
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
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 overflow-x-auto">
                      <table className="w-full min-w-[760px] text-left">
                        <thead className="border-b border-white/6 text-[10px] tracking-[0.14em] text-zinc-700 uppercase">
                          <tr>
                            <th className="px-4 py-3">
                              Campo
                            </th>
                            <th className="px-4 py-3">
                              Tipo
                            </th>
                            <th className="px-4 py-3">
                              Antes
                            </th>
                            <th className="px-4 py-3">
                              Después
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {diff.changes.map(
                            (change) => (
                              <tr
                                key={`${change.field}-${change.change_type}`}
                              >
                                <td className="px-4 py-3 font-mono text-xs text-white">
                                  {change.field}
                                </td>
                                <td className="px-4 py-3 text-xs text-zinc-500">
                                  {change.change_type}
                                </td>
                                <td className="max-w-xs px-4 py-3">
                                  <pre className="overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-zinc-500">
                                    {JSON.stringify(
                                      change.before,
                                      null,
                                      2,
                                    )}
                                  </pre>
                                </td>
                                <td className="max-w-xs px-4 py-3">
                                  <pre className="overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-zinc-300">
                                    {JSON.stringify(
                                      change.after,
                                      null,
                                      2,
                                    )}
                                  </pre>
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                <div className="mt-5 grid gap-5 xl:grid-cols-2">
                  <JsonBlock
                    title="Snapshot anterior"
                    value={
                      entry.before_data
                    }
                  />
                  <JsonBlock
                    title="Snapshot posterior"
                    value={
                      entry.after_data
                    }
                  />
                  <JsonBlock
                    title="Diff persistido"
                    value={
                      entry.diff_data
                    }
                  />
                  <JsonBlock
                    title="Metadata"
                    value={
                      entry.metadata
                    }
                  />
                </div>

                {history && (
                  <section className="mt-5 luxia-panel rounded-3xl p-6">
                    <div className="flex items-center gap-3">
                      <History className="text-red-400" />
                      <div>
                        <h3 className="font-semibold text-white">
                          Historial de la entidad
                        </h3>
                        <p className="mt-1 text-xs text-zinc-600">
                          {history.total} entradas para{" "}
                          {history.entity_type} /{" "}
                          {history.entity_id}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {history.items.map(
                        (item) => (
                          <article
                            key={item.id}
                            className="flex flex-col gap-3 rounded-2xl border border-white/7 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="text-sm font-medium text-white">
                                {item.action}
                              </p>
                              <p className="mt-1 text-xs text-zinc-600">
                                {item.actor_email ??
                                  item.actor_type}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                              <Clock3 size={14} />
                              {new Date(
                                item.created_at,
                              ).toLocaleString(
                                "es-MX",
                              )}
                            </div>
                          </article>
                        ),
                      )}
                    </div>
                  </section>
                )}
              </>
            )}
        </div>
      </article>
    </div>
  );
}
