import Link from "next/link";
import {
  ArrowLeft,
  Construction,
} from "lucide-react";

import { TryOnModuleHeader } from "@/components/backoffice/tryon/tryon-module-header";

interface TryOnJobDetailFoundationPageProps {
  params: Promise<{
    jobId: string;
  }>;
}

export default async function TryOnJobDetailFoundationPage({
  params,
}: Readonly<TryOnJobDetailFoundationPageProps>) {
  const { jobId } = await params;

  return (
    <div>
      <TryOnModuleHeader
        title={`Job #${jobId}`}
        description="La ruta del detalle ya está preparada. El visor completo, edición administrativa y acciones se incorporan en el paquete 02B."
      />

      <section className="luxia-panel mt-7 rounded-3xl p-8 text-center">
        <Construction
          size={38}
          className="mx-auto text-red-500"
        />

        <h2 className="mt-5 text-xl font-semibold text-white">
          Detalle preparado
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zinc-600">
          El listado ya enlaza correctamente con este job.
          El siguiente paquete conectará el endpoint
          GET /api/v1/admin/tryon-jobs/{`{job_id}`}
          y mostrará todos los campos reales.
        </p>

        <Link
          href="/dashboard/tryon/jobs"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white"
        >
          <ArrowLeft size={16} />
          Volver al listado
        </Link>
      </section>
    </div>
  );
}
