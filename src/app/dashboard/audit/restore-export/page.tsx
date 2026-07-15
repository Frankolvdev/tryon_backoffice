import {
  FileArchive,
  RotateCcw,
} from "lucide-react";

import { AuditExportPanel } from "@/components/backoffice/audit/audit-export-panel";
import { AuditRestorePanel } from "@/components/backoffice/audit/audit-restore-panel";

export default function AuditRestoreExportPage() {
  return (
    <div>
      <section className="luxia-panel overflow-hidden rounded-3xl">
        <div className="border-b border-white/6 p-6">
          <div className="flex items-start gap-4">
            <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
              <FileArchive size={24} />
            </div>

            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
                Auditoría
              </p>

              <h1 className="mt-2 text-2xl font-semibold text-white">
                Restaurar y exportar
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                Descarga entradas avanzadas en JSON o CSV
                y restaura versiones auditadas mediante una
                vista previa segura.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-5">
        <AuditExportPanel />
      </div>

      <div className="mt-5">
        <AuditRestorePanel />
      </div>

      <section className="mt-5 rounded-2xl border border-amber-500/10 bg-amber-950/10 p-4">
        <div className="flex items-start gap-3">
          <RotateCcw
            size={18}
            className="mt-0.5 shrink-0 text-amber-400"
          />

          <p className="text-xs leading-6 text-amber-300/80">
            Una restauración modifica datos reales. El
            backend nunca restaura IDs, contraseñas,
            tokens, claves privadas, secretos ni otros
            campos protegidos.
          </p>
        </div>
      </section>
    </div>
  );
}
