import Link from "next/link";
import {
  ArrowLeft,
  Construction,
} from "lucide-react";

import { TryOnModuleHeader } from "@/components/backoffice/tryon/tryon-module-header";

interface WorkflowDetailPlaceholderProps {
  params: Promise<{
    workflowId: string;
  }>;
}

export default async function WorkflowDetailPlaceholder({
  params,
}: Readonly<WorkflowDetailPlaceholderProps>) {
  const { workflowId } = await params;

  return (
    <div>
      <TryOnModuleHeader
        title={`Workflow #${workflowId}`}
        description="La ruta de detalle está preparada para el siguiente paquete."
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
          El siguiente ZIP conectará el endpoint
          individual, mostrará JSON, parámetros,
          metadata y acciones del workflow.
        </p>

        <Link
          href="/dashboard/tryon/workflows"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white"
        >
          <ArrowLeft size={16} />
          Volver a workflows
        </Link>
      </section>
    </div>
  );
}
