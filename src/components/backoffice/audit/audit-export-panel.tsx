"use client";

import {
  Download,
  FileJson,
  FileSpreadsheet,
  LoaderCircle,
} from "lucide-react";
import {
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import {
  downloadAuditExport,
  type AuditExportFormat,
} from "@/lib/audit/download-audit-export";

import type {
  AuditExportRequest,
} from "@/types/admin-audit-restore-export";

type BooleanFilter =
  | "all"
  | "true"
  | "false";

export function AuditExportPanel() {
  const [search, setSearch] =
    useState("");
  const [actorEmail, setActorEmail] =
    useState("");
  const [actorType, setActorType] =
    useState("");
  const [action, setAction] =
    useState("");
  const [entityType, setEntityType] =
    useState("");
  const [entityId, setEntityId] =
    useState("");
  const [success, setSuccess] =
    useState<BooleanFilter>("all");
  const [restorable, setRestorable] =
    useState<BooleanFilter>("all");
  const [createdFrom, setCreatedFrom] =
    useState("");
  const [createdTo, setCreatedTo] =
    useState("");
  const [maxRecords, setMaxRecords] =
    useState("10000");
  const [format, setFormat] =
    useState<AuditExportFormat>("json");
  const [isExporting, setIsExporting] =
    useState(false);

  const submit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const parsedMax =
      Number(maxRecords);

    if (
      !Number.isInteger(parsedMax) ||
      parsedMax < 1 ||
      parsedMax > 100000
    ) {
      toast.error(
        "El máximo de registros debe estar entre 1 y 100000.",
      );
      return;
    }

    const payload: AuditExportRequest = {
      max_records: parsedMax,
      search: search.trim() || null,
      actor_email:
        actorEmail.trim() || null,
      actor_type:
        actorType.trim() || null,
      action: action.trim() || null,
      entity_type:
        entityType.trim() || null,
      entity_id:
        entityId.trim() || null,
      success:
        success === "all"
          ? null
          : success === "true",
      is_restorable:
        restorable === "all"
          ? null
          : restorable === "true",
      created_from: createdFrom
        ? new Date(
            `${createdFrom}T00:00:00`,
          ).toISOString()
        : null,
      created_to: createdTo
        ? new Date(
            `${createdTo}T23:59:59`,
          ).toISOString()
        : null,
    };

    setIsExporting(true);

    try {
      const count =
        await downloadAuditExport(
          format,
          payload,
        );

      toast.success(
        count === null
          ? "Exportación descargada."
          : `Exportación descargada con ${count} registros.`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible exportar la auditoría.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="luxia-panel rounded-3xl p-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/15 bg-red-950/20 text-red-400">
          <Download size={21} />
        </div>

        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
            Exportación
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Descargar auditoría
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
            Genera archivos JSON o CSV usando los filtros
            y límites admitidos por el backend.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
          placeholder="Búsqueda global"
          className="h-11 rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
        />

        <input
          type="email"
          value={actorEmail}
          onChange={(event) =>
            setActorEmail(
              event.target.value,
            )
          }
          placeholder="Email del actor"
          className="h-11 rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
        />

        <input
          value={actorType}
          onChange={(event) =>
            setActorType(
              event.target.value,
            )
          }
          placeholder="Tipo de actor"
          className="h-11 rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
        />

        <input
          value={action}
          onChange={(event) =>
            setAction(
              event.target.value,
            )
          }
          placeholder="Acción"
          className="h-11 rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
        />

        <input
          value={entityType}
          onChange={(event) =>
            setEntityType(
              event.target.value,
            )
          }
          placeholder="Tipo de entidad"
          className="h-11 rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
        />

        <input
          value={entityId}
          onChange={(event) =>
            setEntityId(
              event.target.value,
            )
          }
          placeholder="ID de entidad"
          className="h-11 rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
        />

        <select
          value={success}
          onChange={(event) =>
            setSuccess(
              event.target
                .value as BooleanFilter,
            )
          }
          className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
        >
          <option value="all">
            Cualquier resultado
          </option>
          <option value="true">
            Exitosas
          </option>
          <option value="false">
            Fallidas
          </option>
        </select>

        <select
          value={restorable}
          onChange={(event) =>
            setRestorable(
              event.target
                .value as BooleanFilter,
            )
          }
          className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
        >
          <option value="all">
            Cualquier restaurabilidad
          </option>
          <option value="true">
            Restaurables
          </option>
          <option value="false">
            No restaurables
          </option>
        </select>

        <label>
          <span className="mb-2 block text-xs text-zinc-600">
            Fecha inicial
          </span>

          <input
            type="date"
            value={createdFrom}
            onChange={(event) =>
              setCreatedFrom(
                event.target.value,
              )
            }
            className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-zinc-300"
          />
        </label>

        <label>
          <span className="mb-2 block text-xs text-zinc-600">
            Fecha final
          </span>

          <input
            type="date"
            value={createdTo}
            onChange={(event) =>
              setCreatedTo(
                event.target.value,
              )
            }
            className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-zinc-300"
          />
        </label>

        <label>
          <span className="mb-2 block text-xs text-zinc-600">
            Máximo de registros
          </span>

          <input
            type="number"
            min={1}
            max={100000}
            value={maxRecords}
            onChange={(event) =>
              setMaxRecords(
                event.target.value,
              )
            }
            className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
          />
        </label>

        <label>
          <span className="mb-2 block text-xs text-zinc-600">
            Formato
          </span>

          <select
            value={format}
            onChange={(event) =>
              setFormat(
                event.target
                  .value as AuditExportFormat,
              )
            }
            className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
          >
            <option value="json">
              JSON
            </option>
            <option value="csv">
              CSV
            </option>
          </select>
        </label>
      </div>

      <div className="mt-6 flex justify-end border-t border-white/6 pt-5">
        <button
          type="submit"
          disabled={isExporting}
          className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isExporting ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          ) : format === "json" ? (
            <FileJson size={16} />
          ) : (
            <FileSpreadsheet
              size={16}
            />
          )}

          Descargar {format.toUpperCase()}
        </button>
      </div>
    </form>
  );
}
