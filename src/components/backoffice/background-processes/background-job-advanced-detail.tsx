"use client";

import {
  Download,
  FileJson,
} from "lucide-react";

import type {
  BackgroundJobDetailResponse,
} from "@/types/admin-background-jobs";

interface Props {
  detail: BackgroundJobDetailResponse;
}

function JsonBlock({
  title,
  value,
}: {
  title: string;
  value: unknown;
}) {
  return (
    <section className="rounded-2xl border border-white/7 bg-black/20 p-4">
      <div className="flex items-center gap-2">
        <FileJson
          size={15}
          className="text-red-400"
        />
        <h3 className="text-xs font-semibold text-white">
          {title}
        </h3>
      </div>

      <pre className="mt-3 max-h-72 overflow-auto rounded-xl bg-[#050506] p-4 font-mono text-[11px] leading-6 text-zinc-400">
        {JSON.stringify(
          value ?? {},
          null,
          2,
        )}
      </pre>
    </section>
  );
}

export function BackgroundJobAdvancedDetail({
  detail,
}: Props) {
  const exportJson = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          detail,
          null,
          2,
        ),
      ],
      {
        type: "application/json",
      },
    );

    const url =
      URL.createObjectURL(blob);
    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download =
      `background-job-${detail.job.id}.json`;
    anchor.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-5 space-y-4">
      <button
        type="button"
        onClick={exportJson}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400"
      >
        <Download size={15} />
        Exportar JSON
      </button>

      <JsonBlock
        title="Payload"
        value={detail.job.payload}
      />

      <JsonBlock
        title="Resultado"
        value={detail.job.result}
      />

      <JsonBlock
        title="Metadata"
        value={detail.job.metadata}
      />

      <JsonBlock
        title="Detalles del error"
        value={detail.job.error_details}
      />

      <section className="rounded-2xl border border-white/7 bg-black/20 p-4">
        <h3 className="text-xs font-semibold text-white">
          Historial de intentos
        </h3>

        <div className="mt-3 space-y-3">
          {detail.attempts.length === 0 ? (
            <p className="text-xs text-zinc-600">
              No existen intentos.
            </p>
          ) : (
            detail.attempts.map((attempt) => (
              <article
                key={attempt.id}
                className="rounded-xl border border-white/6 p-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-semibold text-white">
                    Intento #{attempt.attempt_number}
                  </p>
                  <span className="text-[10px] text-zinc-500">
                    {attempt.status}
                  </span>
                </div>

                <p className="mt-2 text-[10px] text-zinc-700">
                  Worker: {attempt.worker_name ?? "—"} · Duración:{" "}
                  {attempt.duration_seconds ?? "—"} s
                </p>

                {attempt.error_message && (
                  <p className="mt-2 text-xs leading-5 text-red-300">
                    {attempt.error_message}
                  </p>
                )}
              </article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/7 bg-black/20 p-4">
        <h3 className="text-xs font-semibold text-white">
          Dependencias
        </h3>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-[10px] text-zinc-700">
              Este proceso depende de
            </p>
            <div className="mt-2 space-y-2">
              {detail.dependencies.length === 0 ? (
                <p className="text-xs text-zinc-600">
                  Ninguna
                </p>
              ) : (
                detail.dependencies.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-white/6 p-2 text-xs text-zinc-400"
                  >
                    Job #{item.depends_on_job_id} ·{" "}
                    {item.dependency_type}
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <p className="text-[10px] text-zinc-700">
              Procesos dependientes
            </p>
            <div className="mt-2 space-y-2">
              {detail.dependents.length === 0 ? (
                <p className="text-xs text-zinc-600">
                  Ninguno
                </p>
              ) : (
                detail.dependents.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-white/6 p-2 text-xs text-zinc-400"
                  >
                    Job #{item.background_job_id} ·{" "}
                    {item.dependency_type}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
