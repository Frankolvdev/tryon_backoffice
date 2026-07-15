"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  FlaskConical,
  LoaderCircle,
  RefreshCcw,
  ShieldCheck,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import { AuditRetentionForm } from "@/components/backoffice/audit/audit-retention-form";
import { AuditStatisticsPanel } from "@/components/backoffice/audit/audit-statistics-panel";
import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  AuditAdvancedStatisticsResponse,
  AuditRetentionResponse,
  AuditSelfTestResponse,
} from "@/types/admin-audit-operations";

export default function AuditOperationsPage() {
  const [periodDays, setPeriodDays] =
    useState("30");
  const [topLimit, setTopLimit] =
    useState("10");
  const [statistics, setStatistics] =
    useState<AuditAdvancedStatisticsResponse | null>(
      null,
    );
  const [selfTest, setSelfTest] =
    useState<AuditSelfTestResponse | null>(
      null,
    );
  const [retention, setRetention] =
    useState<AuditRetentionResponse | null>(
      null,
    );
  const [isLoading, setIsLoading] =
    useState(true);
  const [isTesting, setIsTesting] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadStatistics =
    useCallback(async () => {
      const days = Number(periodDays);
      const limit = Number(topLimit);

      if (
        !Number.isInteger(days) ||
        days < 1 ||
        days > 3650 ||
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 100
      ) {
        toast.error(
          "Revisa el periodo y el límite superior.",
        );
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response =
          await browserApiRequest<AuditAdvancedStatisticsResponse>(
            `/api/admin/audit-operations/statistics?period_days=${days}&top_limit=${limit}`,
          );

        setStatistics(response);
      } catch (error) {
        setStatistics(null);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No fue posible cargar las estadísticas.",
        );
      } finally {
        setIsLoading(false);
      }
    }, [periodDays, topLimit]);

  useEffect(() => {
    void loadStatistics();
  }, [loadStatistics]);

  const runSelfTest = async () => {
    setIsTesting(true);

    try {
      const response =
        await browserApiRequest<AuditSelfTestResponse>(
          "/api/admin/audit-operations/self-test",
          {
            method: "POST",
          },
        );

      setSelfTest(response);

      if (response.success) {
        toast.success(
          "La auditoría superó el autodiagnóstico.",
        );
      } else {
        toast.warning(
          "El autodiagnóstico detectó fallos.",
        );
      }

      await loadStatistics();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible ejecutar el autodiagnóstico.",
      );
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div>
      <section className="luxia-panel overflow-hidden rounded-3xl">
        <div className="border-b border-white/6 p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
                <Wrench size={24} />
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
                  Auditoría
                </p>

                <h1 className="mt-2 text-2xl font-semibold text-white">
                  Operaciones y mantenimiento
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                  Estadísticas avanzadas, autodiagnóstico y
                  retención de entradas mediante los
                  endpoints administrativos reales.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  void runSelfTest()
                }
                disabled={isTesting}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-emerald-500/15 bg-emerald-950/15 px-4 text-sm text-emerald-300 disabled:opacity-50"
              >
                {isTesting ? (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <FlaskConical size={16} />
                )}
                Autodiagnóstico
              </button>

              <button
                type="button"
                onClick={() =>
                  void loadStatistics()
                }
                disabled={isLoading}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400 disabled:opacity-50"
              >
                <RefreshCcw
                  size={16}
                  className={
                    isLoading
                      ? "animate-spin"
                      : undefined
                  }
                />
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="luxia-panel mt-5 rounded-3xl p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:max-w-xl">
          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Periodo en días
            </span>
            <input
              type="number"
              min={1}
              max={3650}
              value={periodDays}
              onChange={(event) =>
                setPeriodDays(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Máximo por ranking
            </span>
            <input
              type="number"
              min={1}
              max={100}
              value={topLimit}
              onChange={(event) =>
                setTopLimit(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
            />
          </label>
        </div>
      </section>

      {isLoading && (
        <section className="luxia-panel mt-5 flex min-h-64 items-center justify-center rounded-3xl">
          <LoaderCircle className="animate-spin text-red-500" />
        </section>
      )}

      {!isLoading &&
        errorMessage && (
          <section className="luxia-panel mt-5 rounded-3xl p-6">
            <div className="flex items-start gap-3 rounded-2xl border border-red-500/15 bg-red-950/15 p-5">
              <TriangleAlert
                size={19}
                className="mt-0.5 shrink-0 text-red-400"
              />
              <p className="text-sm leading-6 text-red-300">
                {errorMessage}
              </p>
            </div>
          </section>
        )}

      {!isLoading &&
        !errorMessage &&
        statistics && (
          <div className="mt-5">
            <AuditStatisticsPanel
              statistics={statistics}
            />
          </div>
        )}

      {selfTest && (
        <section className="luxia-panel mt-5 rounded-3xl p-6">
          <div className="flex items-center gap-3">
            {selfTest.success ? (
              <CheckCircle2 className="text-emerald-400" />
            ) : (
              <TriangleAlert className="text-amber-400" />
            )}

            <div>
              <h2 className="font-semibold text-white">
                Resultado del autodiagnóstico
              </h2>
              <p className="mt-1 text-xs text-zinc-600">
                {new Date(
                  selfTest.checked_at,
                ).toLocaleString("es-MX")}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[
              ["Snapshot", selfTest.snapshot_test],
              ["Redacción", selfTest.redaction_test],
              ["Diferencias", selfTest.diff_test],
              [
                "Crear en base de datos",
                selfTest.database_create_test,
              ],
              [
                "Leer de base de datos",
                selfTest.database_read_test,
              ],
              [
                "Eliminar de base de datos",
                selfTest.database_delete_test,
              ],
            ].map(([label, success]) => (
              <div
                key={String(label)}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/7 bg-black/20 p-4"
              >
                <span className="text-sm text-zinc-500">
                  {String(label)}
                </span>
                <span
                  className={
                    success
                      ? "text-xs font-semibold text-emerald-400"
                      : "text-xs font-semibold text-red-400"
                  }
                >
                  {success
                    ? "CORRECTO"
                    : "FALLO"}
                </span>
              </div>
            ))}
          </div>

          <pre className="mt-5 max-h-80 overflow-auto rounded-2xl border border-white/7 bg-[#060607] p-4 font-mono text-xs leading-6 text-zinc-500">
            {JSON.stringify(
              selfTest.details,
              null,
              2,
            )}
          </pre>
        </section>
      )}

      <div className="mt-5">
        <AuditRetentionForm
          onCompleted={(response) => {
            setRetention(response);
            void loadStatistics();
          }}
        />
      </div>

      {retention && (
        <section className="luxia-panel mt-5 rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-red-400" />
            <h2 className="font-semibold text-white">
              Última ejecución de retención
            </h2>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              [
                "Exitosas eliminadas",
                retention.successful_deleted,
              ],
              [
                "Fallidas eliminadas",
                retention.failed_deleted,
              ],
              [
                "Eventos leídos",
                retention.read_events_deleted,
              ],
              [
                "Total eliminado",
                retention.total_deleted,
              ],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-2xl border border-white/7 bg-black/20 p-4"
              >
                <p className="text-xs text-zinc-600">
                  {String(label)}
                </p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {Number(value)}
                </p>
              </div>
            ))}
          </div>

          {retention.errors.length > 0 && (
            <div className="mt-5 rounded-2xl border border-red-500/10 bg-red-950/10 p-4 text-xs leading-6 text-red-300">
              {retention.errors.join(
                "\n",
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
